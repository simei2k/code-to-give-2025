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
      <main className="pt-20 bg-[#fffcec] min-h-screen">
        <section className="text-center mb-10 px-6">
          <h1 className="text-4xl font-bold text-[#006e34]">Stories &amp; Updates</h1>
          <p className="text-gray-700 mt-2 max-w-2xl mx-auto">
            Real stories from our students and schools across Hong Kong.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-[#006e34] mb-2">
            Explore Hong Kong districts
          </h2>
          <p className="text-sm text-[#1f2937] mb-4">
            Tap any region to see details.
          </p>
          <HKMapbox geojsonUrl="/hk-districts.geojson" />
        </section>

  <section className="px-6 mt-12 pb-16">
          <div className="max-w-7xl mx-auto space-y-12">
            {COLUMNS.map((col) => (
              <div key={col} id={SECTION_IDS[col]} className="scroll-mt-24">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-semibold text-[#006e34]">{col}</h2>
                  <a
                    href="#top"
                    className="text-sm text-[#006e34] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#006e34] sr-only"
                  >
                    Back to top
                  </a>
                </div>

                {grouped[col]?.length ? (
                  <StoriesCarousel posts={grouped[col]} />
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                    No stories yet.
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      </GlassCard>
    </StyledContainer>
  );
}