import { NextResponse } from 'next/server';
import { fetchNewsletterByMonth, fetchCurrentMonthNewsletter } from '@/lib/contentful';

// Cache revalidation (ISR) – adjust if needed
export const revalidate = 300; // 5 minutes

export async function GET(request: Request) {
  const url = new URL(request.url);
  const yearParam = url.searchParams.get('year'); // optional e.g. 2025
  const monthParam = url.searchParams.get('month'); // optional 1-12

  let year: number | undefined;
  let month: number | undefined; // 1-12

  if (yearParam) {
    const y = parseInt(yearParam, 10);
    if (isNaN(y) || y < 2000 || y > 3000) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
    }
    year = y;
  }
  if (monthParam) {
    const m = parseInt(monthParam, 10);
    if (isNaN(m) || m < 1 || m > 12) {
      return NextResponse.json({ error: 'Invalid month (1-12)' }, { status: 400 });
    }
    month = m;
  }

  try {
    const now = new Date();
    const effectiveYear = year ?? now.getFullYear();
    const effectiveMonth = month ?? (now.getMonth() + 1);

    const grouped = (year || month)
      ? await fetchNewsletterByMonth(effectiveYear, effectiveMonth)
      : await fetchCurrentMonthNewsletter();

    const total = Object.values(grouped).reduce((acc, arr) => acc + arr.length, 0);

    return NextResponse.json({
      year: effectiveYear,
      month: effectiveMonth,
      total,
      categories: grouped,
    });
  } catch (e) {
    console.error('Newsletter API error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
