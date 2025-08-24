import { createClient } from 'contentful';

// Create a client for fetching content
const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

// Interface for contentful posts
export interface ContentfulPost {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

// Fetch content from the last month
export const fetchLatestContentfulPosts = async (limit = 10): Promise<ContentfulPost[]> => {
  try {
    const response = await client.getEntries({
      content_type: 'teacherPost', // Adjust to match your content type
      order: ['-sys.createdAt'] as any,
      limit,
    });

    return response.items.map(item => ({
      id: item.sys.id,
      title: item.fields.title as string,
      description: item.fields.description as string,
      imageUrl: (item.fields.image as any)?.fields?.file?.url 
        ? `https:${(item.fields.image as any).fields.file.url}` 
        : '/placeholder.jpg',
      createdAt: item.sys.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching posts from Contentful:', error);
    return [];
  }
};

// Fetch a specific post for "student of the month"
export const fetchStudentOfMonthPost = async (): Promise<ContentfulPost | null> => {
  try {
    const response = await client.getEntries({
      content_type: 'Title', // Adjust to match your content type
      // If you need to filter by a field value, use fields.<fieldId>
      // 'fields.description': 'Photos',
      order: ['-sys.createdAt'] as any,
      limit: 1,
    });

    if (response.items.length === 0) {
      // If no specific student of the month, just get the most recent post
      return (await fetchLatestContentfulPosts(1))[0];
    }

    const item = response.items[0];
    return {
      id: item.sys.id,
      title: item.fields.title as string,
      description: item.fields.description as string,
      imageUrl: (item.fields.image as any)?.fields?.file?.url 
        ? `https:${(item.fields.image as any).fields.file.url}` 
        : '/placeholder.jpg',
      createdAt: item.sys.createdAt,
    };
  } catch (error) {
    console.error('Error fetching student of the month from Contentful:', error);
    return null;
  }
};

// -----------------------------------------------------------------------------
// Newsletter helpers
// -----------------------------------------------------------------------------

// Adjust if your content type ID differs (check Contentful -> Content model -> API ID)
const NEWSLETTER_CONTENT_TYPE_ID = 'newsletter';

// Categories expected in ContentInNewsletter
export const NEWSLETTER_CATEGORIES = [
  'Student of the month',
  'Festive Season',
  'Other Event',
  'General',
] as const;
export type NewsletterCategory = typeof NEWSLETTER_CATEGORIES[number];

export interface NewsletterItem {
  id: string;
  title: string;            // plain text extracted from rich text Title field
  rawTitle: any;            // original rich text document (if needed for rendering)
  description: string;      // long text
  photos: string[];         // absolute URLs
  category: NewsletterCategory | string; // keep string to avoid runtime issues if new category appears
  createdAt: string;
}

// Extract plain text from a Contentful rich text document (very lightweight)
function richTextToPlainText(doc: any): string {
  if (!doc) return '';
  if (Array.isArray(doc)) return doc.map(richTextToPlainText).join('');
  if (typeof doc === 'object' && doc.nodeType && doc.content) {
    return doc.content.map(richTextToPlainText).join('');
  }
  if (doc.nodeType === 'text' && typeof doc.value === 'string') return doc.value;
  if (typeof doc.value === 'string') return doc.value;
  return '';
}

function mapNewsletterEntry(entry: any): NewsletterItem {
  const titleDoc = entry.fields.title;
  const photosField = entry.fields.photos as any[] | undefined;
  // Category field may be: undefined | string | string[] depending on model (short text vs list of short text)
  const rawCat = entry.fields.ContentInNewsletter
    ?? entry.fields.contentInNewsletter
    ?? entry.fields.contentInnewsletter;

  const normalized = normalizeCategory(rawCat);

  return {
    id: entry.sys.id,
    title: richTextToPlainText(titleDoc).trim(),
    rawTitle: titleDoc,
    description: entry.fields.description || '',
    photos: (photosField || []).map(a => {
      const url = a?.fields?.file?.url; return url ? (url.startsWith('//') ? `https:${url}` : url) : '/placeholder.jpg';
    }),
    category: normalized,
    createdAt: entry.sys.createdAt,
  };
}

// Normalize category value into one of known constants or fall back to General
function normalizeCategory(input: any): string {
  if (!input) return 'General';
  const values: string[] = Array.isArray(input) ? input : [input];
  // Flatten, trim, dedupe; then find first recognized category
  for (const vRaw of values) {
    if (!vRaw) continue;
    const v = String(vRaw).trim();
    const lower = v.toLowerCase();
    const match = NEWSLETTER_CATEGORIES.find(c => c.toLowerCase() === lower);
    if (match) return match; // exact case-insensitive match
    // Partial heuristic: if contains 'student' & 'month'
    if (lower.includes('student') && lower.includes('month')) return 'Student of the month';
    if (lower.includes('festive')) return 'Festive Season';
    if (lower.includes('event')) return 'Other Event';
    if (lower.includes('general')) return 'General';
  }
  // If nothing matched, use first non-empty raw trimmed value or General
  const first = values.find(v => v && String(v).trim());
  return first ? String(first).trim() : 'General';
}

/**
 * Fetch newsletter items for a specific month (default: current month) grouped by category.
 * @param year e.g. 2025
 * @param month 1-12
 */
export async function fetchNewsletterByMonth(year?: number, month?: number): Promise<Record<string, NewsletterItem[]>> {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ? month - 1 : now.getMonth(); // JS month index
  const monthStart = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(y, m + 1, 1, 0, 0, 0)); // exclusive

  try {
    const response = await client.getEntries({
      content_type: NEWSLETTER_CONTENT_TYPE_ID,
      limit: 200, // adjust if you expect more
      order: ['-sys.createdAt'] as any,
      'sys.createdAt[gte]': monthStart.toISOString() as any,
      'sys.createdAt[lte]': new Date(monthEnd.getTime() - 1000).toISOString() as any,
    });

    const grouped: Record<string, NewsletterItem[]> = {};
    for (const item of response.items) {
      const mapped = mapNewsletterEntry(item);
      if (!grouped[mapped.category]) grouped[mapped.category] = [];
      grouped[mapped.category].push(mapped);
    }

    // Ensure all known categories exist (even if empty)
    for (const cat of NEWSLETTER_CATEGORIES) {
      if (!grouped[cat]) grouped[cat] = [];
    }

    return grouped;
  } catch (e) {
    console.error('Error fetching newsletter entries', e);
    return {};
  }
}

/** Convenience wrapper for current month */
export async function fetchCurrentMonthNewsletter() {
  return fetchNewsletterByMonth();
}

/** Fetch raw flat list (without grouping) for current month. */
export async function fetchCurrentMonthNewsletterFlat(): Promise<NewsletterItem[]> {
  const grouped = await fetchNewsletterByMonth();
  return Object.values(grouped).flat();
}
