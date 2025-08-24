import { NextResponse } from 'next/server';
import { generateNewsletter } from '@/lib/newsletterOrchestrator';

// GET /api/newsletter/preview?year=2025&month=8&format=html
// Returns JSON by default or raw HTML if format=html
export async function GET(request: Request) {
  const url = new URL(request.url);
  const year = url.searchParams.get('year');
  const month = url.searchParams.get('month');
  const format = url.searchParams.get('format');
  const useTemplate = url.searchParams.get('template') === '1';

  const yNum = year ? parseInt(year, 10) : undefined;
  const mNum = month ? parseInt(month, 10) : undefined;

  try {
  const result = await generateNewsletter({ year: yNum, month: mNum, dryRun: true, skipPdf: true, useTemplate });

    if (format === 'html') {
      return new Response(result.html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    return NextResponse.json({
      subject: result.subject,
      sections: result.sections,
      html: result.html,
      pdfBase64: result.pdfBuffer.toString('base64'),
    });
  } catch (e) {
    console.error('Preview generation failed', e);
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
  }
}
