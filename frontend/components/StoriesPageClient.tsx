
"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from 'react-dom';
import StoriesCarousel from "@/components/StoriesCarousel";
import ArticleBody from "@/components/ArticleBody";
import type { updatePostEntry } from "@/lib/types";
import { FaFacebookF, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import type { Document } from '@contentful/rich-text-types';
// helper to wrap canvas text
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(/\s+/);
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trimEnd(), x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line.trimEnd(), x, y);
}

// Extract plain text from a Contentful rich text Document
function extractPlainText(doc: Document | undefined, max = 220): string {
  if (!doc) return '';
  const out: string[] = [];
  const walk = (node: any) => {
    if (!node) return;
    if (node.nodeType === 'text' && node.value) out.push(node.value);
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(doc as any);
  return out.join(' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

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

interface StoriesPageClientProps { posts: updatePostEntry[]; }

export default function StoriesPageClient({ posts }: StoriesPageClientProps) {
  const [activePost, setActivePost] = useState<updatePostEntry | null>(null);
  const [progress, setProgress] = useState(0); // scroll progress inside modal
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const grouped: Record<string, updatePostEntry[]> = {};
  COLUMNS.forEach((loc) => (grouped[loc] = posts.filter((p) => p.fields.location === loc)));

  const close = useCallback(() => {
    setActivePost(null);
    document.body.style.overflow = ""; // restore scroll
  }, []);

  // prevent body scroll when modal open
  useEffect(() => {
    if (activePost) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // attach key handlers & scroll progress
      const onKey = (e: KeyboardEvent) => {
        if (!activePost) return;
        if (e.key === 'Escape') { close(); }
        if (e.key === 'ArrowRight') { navigate(1); }
        if (e.key === 'ArrowLeft') { navigate(-1); }
      };
      window.addEventListener('keydown', onKey);
      const el = scrollRef.current;
      const onScroll = () => {
        if (!el) return;
        const max = el.scrollHeight - el.clientHeight;
        setProgress(max > 0 ? (el.scrollTop / max) : 0);
      };
      if (el) el.addEventListener('scroll', onScroll, { passive: true });
      return () => { document.body.style.overflow = prev; };
    }
  }, [activePost]);

  // navigate within same location group
  const navigate = useCallback((dir: 1 | -1) => {
    if (!activePost) return;
    const loc = activePost.fields.location as (typeof COLUMNS)[number];
    const list = grouped[loc];
    if (!list) return;
    const idx = list.findIndex(p => p.fields.slug === activePost.fields.slug);
    if (idx === -1) return;
    const next = list[idx + dir];
    if (next) setActivePost(next);
  }, [activePost, grouped]);

  return (
    <>
      <section className="px-6 mt-12 pb-16 max-w-6xl">
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
                <div className="rounded-2xl border border-[#7CC243]/30 bg-white/80 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between gap-4 px-4 py-3 bg-[#f4ffe8] border-b border-[#7CC243]/30">
                    <div className="flex items-center gap-2">
                      <h2
                        id={`${SECTION_IDS[col]}-heading`}
                        className="text-2xl font-semibold text-[#0f5132]"
                      >
                        {col}
                      </h2>
                      <span className="ml-1 rounded-full bg-[#ecffd6] border border-[#7CC243]/30 px-2 py-0.5 text-xs text-[#0f5132]">
                        {count} {count === 1 ? "story" : "stories"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    {count ? (
                      <StoriesCarousel posts={grouped[col] as any} onSelect={(p:any)=> setActivePost(p)} />
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

      {activePost && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 md:px-8 pt-16 pb-8 bg-black/45 backdrop-blur-sm"
          aria-modal="true" role="dialog" onClick={close}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl border border-[#006e34]/25 flex flex-col animate-fadeIn overflow-hidden"
            style={{
              width: 'min(88vw, 820px, calc(100vh - 6rem))',
              height: 'min(88vw, 820px, calc(100vh - 6rem))'
            }}
            onClick={(e)=> e.stopPropagation()}
          >
            {/* scroll progress bar */}
            {activePost && (
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#7CC243] via-[#22c55e] to-[#0f5132]" style={{ transform: `scaleX(${progress})`, transformOrigin: '0 50%' }} />
            )}
            <button

              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#006e34]/20 bg-white text-[#0f5132] shadow-sm hover:bg-[#f4ffe8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006e34]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <div ref={scrollRef} className="flex-1 px-6 pb-8 pt-8 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <article>
                <header className="mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {activePost.fields.location && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#006e34]/20 bg-[#f4ffe8] px-3 py-1 text-xs font-medium text-[#0f5132]">
                        {activePost.fields.location}
                      </span>
                    )}
                  </div>
          <h1 className="mt-2 text-xl md:text-2xl font-extrabold tracking-tight text-[#064d2a] leading-snug">
                    {activePost.fields.title}
                  </h1>
                </header>
                {(() => {
                  const img = urlFromAsset(activePost.fields.coverImage);
                  if (img) {
                    return (
            <figure className="mb-4 overflow-hidden rounded-lg border border-[#006e34]/10 bg-white shadow-sm aspect-video max-h-48 mx-auto w-full">
                        <div className="relative w-full h-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`${img}?w=1200&h=675&fit=fill&fm=jpg&q=80`}
                            alt={activePost.fields.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </figure>
                    );
                  }
                  return null;
                })()}
                {activePost.fields.content ? (
                  <div className="prose prose-sm md:prose-sm max-w-none prose-headings:text-[#0b3a26] prose-a:text-[#0f5132] hover:prose-a:underline prose-img:rounded-lg prose-figcaption:text-gray-500 leading-snug text-[11px] md:text-[12px] prose-p:my-1 prose-li:my-0">
                    <ArticleBody document={activePost.fields.content as any} />
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Loading content…</div>
                )}
                {/* Share row */}
                <div className="mt-6 pt-4 border-t border-[#006e34]/15 flex items-center justify-between flex-wrap gap-4">
                  <div className="text-xs text-[#355e4c]">Enjoyed this story? Share it.</div>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const origin = typeof window !== 'undefined' ? window.location.origin : '';
                      const url = `${origin}/stories/${activePost.fields.slug}`;
                      const encodedUrl = encodeURIComponent(url);
                      const text = encodeURIComponent(activePost.fields.title || '');
                      const description = extractPlainText(activePost.fields.content as any, 220);
          const shareMessage = `${activePost.fields.title}\ncheck it out! ${description}\n\ncheck it out at ${url}`;
                      return (
                        <>
                          <button
                            type="button"
                            onClick={() => {
            // Facebook does not allow prefilling the user message; copy text instead
            try { navigator.clipboard.writeText(shareMessage); } catch {}
            const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;                              
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1877F2]"
                            aria-label="Share on Facebook"
                          >
                            <FaFacebookF />
                            <span>Facebook</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
            const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
                              window.open(shareUrl, '_blank', 'noopener,noreferrer');
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]"
                            aria-label="Share on WhatsApp"
                          >
                            <FaWhatsapp />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
            const shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(shareMessage)}`;
                              window.open(shareUrl, '_blank', 'noopener,noreferrer');
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#229ED9]"
                            aria-label="Share on Telegram"
                          >
                            <FaTelegramPlane />
                            <span>Telegram</span>
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </article>
            </div>
            {/* navigation arrows */}
            {activePost && (
              <>
                <button
                  onClick={()=> navigate(-1)}
                  aria-label="Previous story"
                  className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 border border-[#006e34]/20 text-[#0f5132] shadow hover:bg-[#f4ffe8] disabled:opacity-30"
                  disabled={!(() => { const loc = activePost.fields.location as (typeof COLUMNS)[number]; const list = grouped[loc]; const idx = list.findIndex(p=>p.fields.slug===activePost.fields.slug); return idx>0; })()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button
                  onClick={()=> navigate(1)}
                  aria-label="Next story"
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 border border-[#006e34]/20 text-[#0f5132] shadow hover:bg-[#f4ffe8] disabled:opacity-30"
                  disabled={!(() => { const loc = activePost.fields.location as (typeof COLUMNS)[number]; const list = grouped[loc]; const idx = list.findIndex(p=>p.fields.slug===activePost.fields.slug); return idx < list.length-1; })()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
                </button>
              </>
            )}
          </div>
        </div>, document.body)
      }
    </>
  );
}

// simple fade-in animation
// Tailwind doesn't include by default; rely on utility via custom layer or inline style fallback.
// If not defined, you can add this to globals.css:
// .animate-fadeIn { animation: fadeIn .25s ease; }
// @keyframes fadeIn { from { opacity:0; transform: translateY(4px);} to { opacity:1; transform:translateY(0);} }