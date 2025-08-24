// app/stories/page.tsx
import Link from "next/link";
import { getUpdatePosts } from "@/lib/api"; 
import HKMapbox from "@/components/HKMapbox";
import { GlassCard, StyledContainer } from "../donate/page";
import StoriesPageClient from "@/components/StoriesPageClient";

export const revalidate = 60;

export default async function Stories() {
  const items = (await getUpdatePosts()) ?? [];

  return (
    <StyledContainer>

      <main className="pt-20 min-h-screen">
        <section className="text-center mb-10 px-6">
          <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium text-[#006e34]">
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
        <StoriesPageClient posts={items as any} />
      </main>

    </StyledContainer>
  );
}