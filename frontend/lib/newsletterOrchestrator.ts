import puppeteer from 'puppeteer';
import { fetchNewsletterByMonth, NEWSLETTER_CATEGORIES } from './contentful';
import { generateGeneralDonationMessage, generateStudentOfMonthMessage, generateStudentAchievementMessage } from './mistral';
import { sendNewsletterToDonors } from './email';
import { NEWSLETTER_TEMPLATE, injectTemplate } from './newsletterTemplate';

interface GeneratedSection {
  category: string;
  title: string;
  bodyHtml: string;
  images: string[];
}

interface GenerateNewsletterOptions {
  year?: number;
  month?: number; // 1-12
  dryRun?: boolean; // if true, skip sending email
  skipPdf?: boolean; // for fast preview
  useTemplate?: boolean; // if true, build html from template file
}

export interface NewsletterGenerationResult {
  subject: string;
  html: string;
  pdfBuffer: Buffer;
  sections: GeneratedSection[];
  sent?: { success: boolean; count?: number; error?: any };
}

// Basic HTML shell (inline styles for email compatibility)
function buildHtml(subject: string, sections: GeneratedSection[]): string {
  const styles = `body{font-family:Arial,Helvetica,sans-serif;margin:0;padding:0;background:#f5f7fa;color:#222;}\n.container{max-width:720px;margin:0 auto;padding:24px;background:#ffffff;}\n.header{border-bottom:4px solid #0d6efd;padding-bottom:12px;margin-bottom:24px;}\nh1{font-size:26px;margin:0 0 4px;}\n.section{margin-bottom:40px;}\n.section h2{font-size:20px;margin:0 0 12px;color:#0d6efd;}\n.section img{max-width:100%;border-radius:6px;margin:8px 0;}\n.footer{font-size:12px;color:#666;margin-top:48px;text-align:center;}\n.hr{height:1px;background:#e2e8f0;border:0;margin:32px 0;}\n.p{line-height:1.5;white-space:pre-wrap;}\n.badge{display:inline-block;padding:4px 8px;border-radius:4px;background:#0d6efd;color:#fff;font-size:12px;margin-bottom:8px;}`;
  const body = sections.map(s => `\n<section class="section">\n  <div class="badge">${s.category}</div>\n  <h2>${s.title}</h2>\n  ${s.bodyHtml}\n  ${s.images.map(src => `<img src="${src}" alt="${s.category} image" />`).join('\n')}\n</section>`).join('\n');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${subject}</title><style>${styles}</style></head><body><div class="container"><header class="header"><h1>${subject}</h1><p class="p">Monthly highlights and impact stories from Project REACH.</p></header>${body}<div class="footer">You are receiving this because you subscribed to updates from Project REACH.<br/>Thank you for your continued support.</div></div></body></html>`;
}

// Simple in-memory cache for generated snippets (resets on server restart)
const generationCache = new Map<string, string>();

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const RATE_DELAY = parseInt(process.env.MISTRAL_RATE_DELAY_MS || '1200', 10); // ms between LLM calls

export async function generateNewsletter(options: GenerateNewsletterOptions = {}): Promise<NewsletterGenerationResult> {
  const now = new Date();
  const year = options.year ?? now.getFullYear();
  const month = options.month ?? (now.getMonth() + 1);
  const monthName = new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', { month: 'long' });
  const subject = `Project REACH Newsletter – ${monthName} ${year}`;

  const grouped = await fetchNewsletterByMonth(year, month);


  const sections: GeneratedSection[] = [];

  // Student of the month (priority)
  const studentItems = grouped['Student of the month'] || [];
  if (studentItems.length) {
    const item = studentItems[0];
    const studentNameMatch = item.title.match(/([A-Z][a-z]+\s?[A-Z]?[a-z]*)/); // naive name grab
    const studentName = studentNameMatch ? studentNameMatch[1] : 'our featured student';
    const cacheKey = `student:${item.id}`;
    let enhanced = generationCache.get(cacheKey);
    if (!enhanced) {
      try {
        enhanced = await generateStudentOfMonthMessage(item.description || item.title, studentName);
        generationCache.set(cacheKey, enhanced);
        await delay(RATE_DELAY);
      } catch {
        enhanced = item.description || item.title;
      }
    }
    sections.push({
      category: 'Student of the month',
      title: item.title || 'Student of the Month',
  bodyHtml: wrapFormatted(enhanced),
      images: item.photos || [],
    });
  }

  // Other categories
  const categoryOrder = NEWSLETTER_CATEGORIES.filter(c => c !== 'Student of the month');
  for (const cat of categoryOrder) {
    const items = grouped[cat] || [];
    if (!items.length) continue;
    // Limit LLM calls: only first item per category uses generation, others reuse description.
    let first = true;
    let generatedCategoryText: string | null = null;
    for (const item of items) {
      let content: string;
      if (first) {
        const cacheKey = `cat:${cat}:${item.id}`;
        let cached = generationCache.get(cacheKey);
        if (!cached) {
          try {
            if (cat === 'General') {
              cached = await generateGeneralDonationMessage();
            } else {
              cached = await generateStudentAchievementMessage(item.description || item.title);
            }
            generationCache.set(cacheKey, cached);
            await delay(RATE_DELAY);
          } catch {
            cached = item.description || item.title;
          }
        }
        generatedCategoryText = cached;
        content = cached;
        first = false;
      } else {
        // Secondary items: use original description (avoid extra API calls)
        content = item.description || item.title;
      }
      sections.push({
        category: cat,
        title: item.title || cat,
  bodyHtml: wrapFormatted(content),
        images: item.photos || [],
      });
    }
  }

  // Fallback if no sections
  if (!sections.length) {
    sections.push({
      category: 'General',
      title: 'Updates',
      bodyHtml: '<p class="p">No new updates this month, but your support continues to make a difference. Thank you!</p>',
      images: [],
    });
  }

  const html = options.useTemplate ? buildFromTemplate(subject, sections) : buildHtml(subject, sections);
  const pdfBuffer = options.skipPdf ? Buffer.from('') : await renderPdf(html);

  let sent: NewsletterGenerationResult['sent'];
  if (!options.dryRun) {
    sent = await sendNewsletterToDonors(subject, html, pdfBuffer);
  }

  return { subject, html, pdfBuffer, sections, sent };
}

async function renderPdf(html: string): Promise<Buffer> {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 1280 });
    page.setDefaultNavigationTimeout(0);
    // Use domcontentloaded to avoid long waits on external images; then small delay
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await delay(500); // give images a moment (best-effort)
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    return Buffer.from(pdf);
  } catch (e) {
    console.error('PDF generation failed, returning empty buffer', e);
    return Buffer.from('');
  }
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

// Build using external template with placeholder injection
function buildFromTemplate(subject: string, sections: GeneratedSection[]): string {
  const byCat: Record<string, GeneratedSection[]> = {};
  for (const s of sections) {
    if (!byCat[s.category]) byCat[s.category] = [];
    byCat[s.category].push(s);
  }
  const formatMarkdown = (html: string) => html
    .replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\s)\*([^*][^*]*?)\*(?=\s|[.,!?:;]|<|$)/g, '$1<em>$2</em>')
    .replace(/\*\*/g, ''); // strip any remaining pairs
  const sectionToHtml = (sec: GeneratedSection) => {
    const cleaned = formatMarkdown(sec.bodyHtml);
    const imgs = sec.images.length ? `<div class=\"media-grid\">${sec.images.map(i=>`<img src=\"${i}\" alt=\"${escapeHtml(sec.category)} image\"/>`).join('')}</div>` : '';
    return `\n<section class=\"section\"><div class=\"badge\">${escapeHtml(sec.category)}</div><h2>${escapeHtml(sec.title)}</h2><div class=\"body\">${cleaned}</div>${imgs}</section>`;
  };
  const makeBlock = (cat: string) => (byCat[cat]||[]).map(sectionToHtml).join('\n') || '';
  const studentBlock = makeBlock('Student of the month');
  const festBlock = makeBlock('Festive Season');
  const eventBlock = makeBlock('Other Event');
  const generalBlock = makeBlock('General');
  // Extra categories (not in core list)
  const core = new Set(['Student of the month','Festive Season','Other Event','General']);
  const extraSections = Object.keys(byCat)
    .filter(k => !core.has(k))
    .map(k => byCat[k].map(sectionToHtml).join('\n'))
    .filter(Boolean)
    .join('\n');
  return injectTemplate(NEWSLETTER_TEMPLATE, {
    SUBJECT: escapeHtml(subject),
    STUDENT_SECTION: studentBlock,
    FESTIVE_BLOCK: festBlock,
    EVENT_BLOCK: eventBlock,
    GENERAL_BLOCK: generalBlock,
    EXTRA_BLOCK: extraSections,
    STUDENT_TITLE: '', STUDENT_BODY: '', STUDENT_IMAGES: '',
  }).replace(/\*\*/g, '');
}

// Format raw text -> safe HTML paragraph(s) with markdown (**bold**, *italic*) converted.
function wrapFormatted(text: string): string {
  const escaped = escapeHtml(text);
  const converted = escaped
    .replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\s)\*([^*][^*]*?)\*(?=\s|[.,!?:;]|$)/g, '$1<em>$2</em>')
    .replace(/\*\*/g, '');
  const paragraphs = converted.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  if (!paragraphs.length) return '<p class="p"></p>';
  return paragraphs.map(p => `<p class=\"p\">${p}</p>`).join('');
}
