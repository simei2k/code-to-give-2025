"use client";
import React, { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface PostItem {
  sys: { id: string };
  fields: {
    slug: string;
    title: string;
    coverImage?: any;
  };
}

const urlFromAsset = (asset?: any) => {
  const u = asset?.fields?.file?.url; return u ? (u.startsWith("//") ? `https:${u}` : u) : "";
};

interface StoriesCarouselProps {
  posts: PostItem[];
  intervalMs?: number;
}

// Lightweight auto-advancing horizontal carousel preserving existing card styles.
export default function StoriesCarousel({ posts, intervalMs = 4000 }: StoriesCarouselProps) {
  const listRef = useRef<HTMLUListElement | null>(null);
  const cardWidthRef = useRef(0);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollByCards = useCallback((dir: 1 | -1) => {
    const el = listRef.current; if (!el) return;
    const w = cardWidthRef.current || el.clientWidth;
    const target = el.scrollLeft + dir * w;
    el.scrollTo({ left: target, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const measure = () => {
      if (listRef.current?.firstElementChild) {
        cardWidthRef.current = (listRef.current.firstElementChild as HTMLElement).offsetWidth;
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [posts]);

  useEffect(() => {
    if (!posts?.length) return;
    const el = listRef.current; if (!el) return;
    autoTimer.current = setInterval(() => {
      const w = cardWidthRef.current || el.clientWidth;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft + w + 8 >= max) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: w, behavior: 'smooth' });
      }
    }, intervalMs);
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, [posts, intervalMs]);

  if (!posts?.length) return null;

  return (
    <div className="mt-8 relative" aria-label="Latest stories carousel" role="region">
      {/* Left Arrow */}
      <button
        type="button"
        aria-label="Previous"
        onClick={() => scrollByCards(-1)}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/80 border border-[#006e34]/30 text-[#006e34] shadow hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#006e34]"
      >
        <span className="sr-only">Previous</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
      </button>
      {/* Right Arrow */}
      <button
        type="button"
        aria-label="Next"
        onClick={() => scrollByCards(1)}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/80 border border-[#006e34]/30 text-[#006e34] shadow hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#006e34]"
      >
        <span className="sr-only">Next</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
      </button>
      <ul
        ref={listRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [&::-webkit-scrollbar]:hidden -mx-2 px-2" style={{ scrollbarWidth: 'none' }}
      >
        {posts.map(p => {
          const img = urlFromAsset(p.fields.coverImage);
          const href = `/stories/${p.fields.slug}`;
          return (
            <li key={p.sys.id} className="snap-start flex-shrink-0 w-72 md:w-[28rem]">
              <Link href={href} className="group block rounded-xl border border-[#006e34]/10 bg-white shadow-sm hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#006e34] h-full">
                <div className="p-4">
                  {img && (
                    <div className="relative w-full aspect-[16/9] mb-3 overflow-hidden rounded-lg">
                      <Image
                        src={`${img}?w=1200&h=675&fit=fill&fm=jpg&q=80`}
                        alt={p.fields.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 80vw, 600px"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-lg leading-snug text-gray-900">{p.fields.title}</h3>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
