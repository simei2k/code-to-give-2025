// app/stories/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getUpdatePosts } from "@/lib/api"; 
import HKMapbox from "@/components/HKMapbox";
import { GlassCard, StyledContainer } from "../donate/page";
import StoriesCarousel from "@/components/StoriesCarousel";

export const revalidate = 60;

const COLUMNS = ["General", "Kwai Tsing", "Sham Shui Po", "Kwun Tong"] as const;

const SECTION_IDS: Record<(typeof COLUMNS)[number], string> = {
  General: "general",
  "Kwai Tsing": "kwai-tsing",
  "Sham Shui Po": "sham-shui-po",
  "Kwun Tong": "kwun-tong",
};

const urlFromAsset = (asset?: any) => {
  const u = asset?.fields?.file?.url;
  return u ? (u.startsWith("//") ? `https:${u}` : u) : "";
};

export default async function Stories() {
  const items = (await getUpdatePosts()) ?? [];

  const grouped: Record<string, typeof items> = {};
  COLUMNS.forEach((loc) => (grouped[loc] = items.filter(p => p.fields.location === loc)));

  return (
    <StyledContainer>
      <GlassCard>
      <main className="pt-20 min-h-screen">
        <section className="text-center mb-10 px-6">
          <span className="inline-flex items-center justify-center rounded-full border border-[#006e34]/20 bg-white/60 px-3 py-1 text-xs font-medium text-[#006e34] shadow-sm">
            🌱 Our impact in Hong Kong
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-secondary sm:text-5xl">
            Stories &amp; Updates
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-gray-700">
            Real stories from our students and schools across Hong Kong.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-semibold text-secondary mb-2">
            Discover the districts we support
          </h2>
          <p className="text-sm text-[#1f2937] mb-4">
            Click on a district to explore the schools and communities we support.
          </p>
          <HKMapbox geojsonUrl="/hk-districts.geojson" />
        </section>

  <section className="px-6 mt-12 pb-16">
          <div className="max-w-7xl mx-auto space-y-12">
          {COLUMNS.map((col) => {
              const count = grouped[col]?.length ?? 0;

              return (
                <section
                  key={col}
                  id={SECTION_IDS[col]}
                  className="scroll-mt-28 mb-10"
                  aria-labelledby={`${SECTION_IDS[col]}-heading`}
                >
                  <div className={`rounded-2xl border border-[#7CC243]/30 bg-white/80 shadow-sm overflow-hidden`}>
                    {/* Header strip */}
                    <div className={`flex items-center justify-between gap-4 px-4 py-3 bg-[#f4ffe8] border-b border-[#7CC243]/30`}>
                      <div className="flex items-center gap-2">
                        <h2
                          id={`${SECTION_IDS[col]}-heading`}
                          className={`text-2xl font-semibold text-[#0f5132]`}
                        >
                          {col}
                        </h2>
                        <span className={`ml-1 rounded-full bg-[#ecffd6] border border-[#7CC243]/30 px-2 py-0.5 text-xs text-[#0f5132]`}>
                          {count} {count === 1 ? "story" : "stories"}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4">
                      {count ? (
                        <StoriesCarousel posts={grouped[col]} />
                      ) : (
                        <div className="rounded-xl border border-gray-300 bg-white p-8 text-center">
                          <p className="text-sm text-gray-600">
                            No stories in <span className="font-medium">{col}</span> yet.
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Check back soon—we’re updating regularly.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}

          </div>
        </section>
      </main>
      </GlassCard>
    </StyledContainer>
  );
}