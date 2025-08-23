"use client";
import React, { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface PostItem {
  sys: { id: string };
  fields: { slug: string; title: string; coverImage?: any };
}

const urlFromAsset = (asset?: any) => {
  const u = asset?.fields?.file?.url;
  return u ? (u.startsWith("//") ? `https:${u}` : u) : "";
};

interface StoriesCarouselProps {
  posts: PostItem[];
  intervalMs?: number;
  onSelect?: (post: PostItem) => void;
}

export default function StoriesCarousel({ posts, intervalMs = 4000, onSelect }: StoriesCarouselProps) {
  const listRef = useRef<HTMLUListElement | null>(null);
  const cardWidthRef = useRef(0);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  const scrollByCards = useCallback((dir: 1 | -1) => {
    const el = listRef.current;
    if (!el) return;
    const w = cardWidthRef.current || el.clientWidth;
    el.scrollTo({ left: el.scrollLeft + dir * (w + 24 /* gap */), behavior: "smooth" });
  }, []);

  // Measure the first slide width and update on resize/breakpoints
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const measure = () => {
      const firstSlide = el.querySelector<HTMLElement>("li[data-slide]");
      if (firstSlide) {
        const rect = firstSlide.getBoundingClientRect();
        cardWidthRef.current = Math.round(rect.width);
      }
    };

    // initial
    measure();

    // keep in sync with responsive width changes
    roRef.current = new ResizeObserver(measure);
    roRef.current.observe(el);

    // also re-measure on window resize (safety)
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
      roRef.current?.disconnect();
      roRef.current = null;
    };
  }, [posts]);

  // Auto-advance
  useEffect(() => {
    if (!posts?.length) return;
    const el = listRef.current;
    if (!el) return;

    autoTimer.current = setInterval(() => {
      const w = cardWidthRef.current || el.clientWidth;
      const max = el.scrollWidth - el.clientWidth;
      const step = w + 24; // include gap
      if (el.scrollLeft + w + 8 >= max) {
        // Reached (or nearly) the end: stop auto-scrolling instead of looping back.
        if (autoTimer.current) {
          clearInterval(autoTimer.current);
          autoTimer.current = null;
        }
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, intervalMs);

    return () => {
      if (autoTimer.current) clearInterval(autoTimer.current);
    };
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
      </button>

      {/* Right Arrow */}
      <button
        type="button"
        aria-label="Next"
        onClick={() => scrollByCards(1)}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/80 border border-[#006e34]/30 text-[#006e34] shadow hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#006e34]"
      >
        <span className="sr-only">Next</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
      </button>

      {/* Scroller */}
      <ul
        ref={listRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-2 px-2 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {posts.map((post) => {
          const img = urlFromAsset(post.fields.coverImage);
          const href = `/stories/${post.fields.slug}`;
          return (
            <li
              key={post.sys.id}
              data-slide
              className="flex-none snap-start w-[300px] sm:w-[360px] lg:w-[420px]"
            >
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(post)}
                  className="text-left w-full group block h-full overflow-hidden rounded-xl border border-[#006e34]/10 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#006e34]"
                >
                  {img ? (
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src={`${img}?w=1200&h=675&fit=fill&fm=jpg&q=80`}
                        alt={post.fields.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[16/9] items-center justify-center bg-[#f7ffe9] text-sm text-[#527e6a]">
                      Photo coming soon
                    </div>
                  )}
                  <div className="p-4 flex flex-col">
                    <h4 className="line-clamp-2 text-lg font-semibold leading-snug text-gray-900">
                      {post.fields.title}
                    </h4>
                    <div className="mt-3 flex items-center justify-between">
                      <span aria-hidden className="translate-x-0 text-[#0f5132] transition-all">Open story →</span>
                    </div>
                  </div>
                </button>
              ) : (
                <Link
                  href={href}
                  className="group block h-full overflow-hidden rounded-xl border border-[#006e34]/10 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#006e34]"
                >
                  {img ? (
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src={`${img}?w=1200&h=675&fit=fill&fm=jpg&q=80`}
                        alt={post.fields.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[16/9] items-center justify-center bg-[#f7ffe9] text-sm text-[#527e6a]">
                      Photo coming soon
                    </div>
                  )}
                  <div className="p-4 flex flex-col">
                    <h4 className="line-clamp-2 text-lg font-semibold leading-snug text-gray-900">
                      {post.fields.title}
                    </h4>
                    <div className="mt-3 flex items-center justify-between">
                      <span aria-hidden className="translate-x-0 text-[#0f5132] transition-all">Read more →</span>
                    </div>
                  </div>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
