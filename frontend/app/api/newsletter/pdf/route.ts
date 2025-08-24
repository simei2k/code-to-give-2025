import { NextResponse } from 'next/server';
import { generateNewsletter } from '@/lib/newsletterOrchestrator';

// GET /api/newsletter/pdf?year=2025&month=8&template=1
// Streams the generated PDF (no emails sent). If generation fails, returns JSON error.
export const maxDuration = 120; // allow longer runtime for PDF generation if platform supports

export async function GET(request: Request) {
  const url = new URL(request.url);
  const yearParam = url.searchParams.get('year');
  const monthParam = url.searchParams.get('month');
  const useTemplate = url.searchParams.get('template') === '1';

  const year = yearParam ? parseInt(yearParam, 10) : undefined;
  const month = monthParam ? parseInt(monthParam, 10) : undefined;

  try {
    const result = await generateNewsletter({ year, month, dryRun: true, skipPdf: false, useTemplate });

    if (!result.pdfBuffer || result.pdfBuffer.length === 0) {
      return NextResponse.json({ error: 'PDF generation returned empty output' }, { status: 500 });
    }

    // Derive a filename
    const now = new Date();
    const y = year ?? now.getFullYear();
    const m = (month ?? (now.getMonth() + 1)).toString().padStart(2, '0');
    const filename = `newsletter-${y}-${m}.pdf`;

  // Convert Node Buffer to Uint8Array for Web Response compatibility
  const uint8 = new Uint8Array(result.pdfBuffer);
  return new Response(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (e) {
    console.error('Newsletter PDF generation failed', e);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
