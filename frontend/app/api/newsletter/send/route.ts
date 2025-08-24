import { NextResponse } from 'next/server';
import { generateNewsletter } from '@/lib/newsletterOrchestrator';

export const maxDuration = 120; // allow long running (if supported)

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
  const { year, month, dryRun, useTemplate } = body || {};

  const result = await generateNewsletter({ year, month, dryRun, useTemplate });

    // Return everything except the raw pdf buffer (convert to base64 for transport)
    return NextResponse.json({
      subject: result.subject,
      sections: result.sections,
      sent: result.sent,
      pdfBase64: result.pdfBuffer.toString('base64'),
    });
  } catch (e: any) {
    console.error('Newsletter send API error', e);
    return NextResponse.json({ error: 'Failed to generate newsletter' }, { status: 500 });
  }
}
