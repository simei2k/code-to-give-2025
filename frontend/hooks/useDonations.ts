// hooks/useDonations.ts
"use client";
import { useEffect, useMemo, useState } from "react";
import { Donation, fetchDonations } from "@/lib/donations";

type Stats = {
  total: number;
  count: number;
  largest: number;
  byMonth: { label: string; monthKey: string; total: number; cumulative: number }[];
  byDistrict: { district: string; total: number; count: number }[];
  byRegion: { region: string; total: number; count: number }[];
  bySchool: { school: string; total: number; count: number }[];
  monthlyStreak: number; // consecutive months up to most recent month with >=1 donation
};

// handles Firestore Timestamp, ISO string, ms epoch, Date
function parseDateSafe(input: any): Date {
    if (!input) return new Date(NaN);
    if (input instanceof Date) return input;
    if (typeof input === "string" || typeof input === "number") return new Date(input);
    if (typeof input === "object") {
      // Firestore Timestamp
      if ("seconds" in input && typeof input.seconds === "number") {
        return new Date(input.seconds * 1000);
      }
      // Firestore Timestamp-like (toDate exists)
      if (typeof (input as any).toDate === "function") {
        try { return (input as any).toDate(); } catch {}
      }
    }
    return new Date(NaN);
  }
  
  // month key as YYYY-MM (safe for lexicographic sort)
  function fmtMonthKeySafe(d: Date) {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    return `${y}-${String(m).padStart(2, "0")}`;
  }
  
  // nicer label (shows year if multiple years appear)
  function humanMonth(monthKey: string, includeYear = false) {
    const [y, m] = monthKey.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, 1).toLocaleString("en-SG", {
      month: "short",
      ...(includeYear ? { year: "numeric" } : {}),
    });
  }
  
export function useDonations(email?: string) {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;
    let mounted = true;
    setLoading(true);
    fetchDonations({ email })
      .then(({ donations }) => {
        if (!mounted) return;
        // sort oldest→newest
        donations.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setDonations(donations);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [email]);

  const stats: Stats = useMemo(() => {
    if (donations.length === 0)
      return { total: 0, count: 0, largest: 0, byMonth: [], byDistrict: [], byRegion: [], bySchool: [], monthlyStreak: 0 };

    const total = donations.reduce((s, d) => s + Number(d.amount || 0), 0);
    const count = donations.length;
    const largest = donations.reduce((m, d) => Math.max(m, Number(d.amount || 0)), 0);

    // group by month
    const perMonth = new Map<string, number>();

    donations.forEach((d) => {
    const dt = parseDateSafe(d.createdAt);
    if (isNaN(dt.getTime())) return; // skip bad dates
    const k = fmtMonthKeySafe(dt);
    perMonth.set(k, (perMonth.get(k) ?? 0) + Number(d.amount || 0));
    });

    const monthKeys = Array.from(perMonth.keys()).sort();

    // decide if we need the year in labels (spans >1 year)
    const firstY = monthKeys[0]?.slice(0, 4);
    const needYear = monthKeys.some((k) => k.slice(0, 4) !== firstY);

    let running = 0;
    const byMonth = monthKeys.map((k) => {
    const v = perMonth.get(k)!;
    running += v;
    return {
        label: humanMonth(k, needYear),
        monthKey: k,
        total: v,
        cumulative: running,
    };
    });

    console.log("byMonth", byMonth);


    // streak: consecutive months ending at the most-recent month in data
    const toIndex = (k: string) => {
      const [y, m] = k.split("-").map(Number);
      return y * 12 + m;
    };
    let streak = 1;
    for (let i = monthKeys.length - 1; i > 0; i--) {
      if (toIndex(monthKeys[i]) - toIndex(monthKeys[i - 1]) === 1) streak++;
      else break;
    }

    // by district
    const distMap = new Map<string, { total: number; count: number }>();
    donations.forEach((d) => {
      const key = (d.district || "Unspecified").toString();
      const cur = distMap.get(key) ?? { total: 0, count: 0 };
      cur.total += Number(d.amount || 0);
      cur.count += 1;
      distMap.set(key, cur);
    });
    const byDistrict = Array.from(distMap.entries()).map(([district, v]) => ({
      district,
      ...v,
    }));

    // by region (using district as region for now, since we don't have separate region field)
    const regionMap = new Map<string, { total: number; count: number }>();
    donations.forEach((d) => {
      const key = (d.district || "Unspecified").toString();
      const cur = regionMap.get(key) ?? { total: 0, count: 0 };
      cur.total += Number(d.amount || 0);
      cur.count += 1;
      regionMap.set(key, cur);
    });
    const byRegion = Array.from(regionMap.entries()).map(([region, v]) => ({
      region,
      ...v,
    }));

    // by school
    const schoolMap = new Map<string, { total: number; count: number }>();
    donations.forEach((d) => {
      const key = (d.school || "Unspecified").toString();
      const cur = schoolMap.get(key) ?? { total: 0, count: 0 };
      cur.total += Number(d.amount || 0);
      cur.count += 1;
      schoolMap.set(key, cur);
    });
    const bySchool = Array.from(schoolMap.entries()).map(([school, v]) => ({
      school,
      ...v,
    }));

    return { total, count, largest, byMonth, byDistrict, byRegion, bySchool, monthlyStreak: streak };
  }, [donations]);

  return { loading, error, donations, stats };
}
