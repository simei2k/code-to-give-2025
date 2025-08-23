// app/stories/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getUpdatePostBySlug } from "@/lib/api";
import ArticleBody from "@/components/ArticleBody";
import { GlassCard, StyledContainer } from "@/app/donate/page";
import ShareRow from "@/components/ShareRow";
import type { Document } from '@contentful/rich-text-types';

export const revalidate = 60;

const urlFromAsset = (asset?: any) => {
  const u = asset?.fields?.file?.url;
  return u ? (u.startsWith("//") ? `https:${u}` : u) : "";
};

function extractPlainText(doc: Document | undefined, max = 180): string {
  if (!doc) return "";
  const out: string[] = [];
  const walk = (node: any) => {
    if (!node) return;
    if (node.nodeType === 'text' && node.value) out.push(node.value);
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(doc);
  return out.join(' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function formatDate(d?: string | Date) {
  if (!d) return null;
  try {
    const dt = typeof d === "string" ? new Date(d) : d;
    return new Intl.DateTimeFormat("en-HK", { year: "numeric", month: "long", day: "numeric" }).format(dt);
  } catch { return null; }
}

async function absoluteURL(path: string) {
  const host = (await headers()).get("host") || "localhost:3000";
  const proto = host.includes("localhost") ? "http" : "https";
  return `${proto}://${host}${path}`;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getUpdatePostBySlug(params.slug);
  if (!post) return {};
  const img = urlFromAsset(post.fields.coverImage);
  const description = extractPlainText(post.fields.content, 180) || post.fields.title;
  const title = post.fields.title;
  const canonical = await absoluteURL(`/stories/${params.slug}`);
  const images = img ? [{ url: `${img}?w=1200&h=630&fit=fill&fm=jpg&q=85`, width: 1200, height: 630, alt: title }] : [];
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      images,
      siteName: 'Project REACH'
    },
    twitter: {
      card: images.length ? 'summary_large_image' : 'summary',
      title,
      description,
      images: images.map(i => i.url),
    }
  } as any;
}

export default async function StoryDetail({ params }: { params: { slug: string } }) {
  const post = await getUpdatePostBySlug(params.slug);
  if (!post) return notFound();

  const img = urlFromAsset(post.fields.coverImage);
  const caption = post.fields?.coverImage?.fields?.description || "";
  const date = formatDate(post.sys?.updatedAt);
  const location = post.fields?.location as string | undefined;
  const canonical = await absoluteURL(`/stories/${params.slug}`);
  const description = extractPlainText(post.fields.content, 180) || post.fields.title;

  return (
    <StyledContainer>
      <GlassCard>
        <main id="top" className="min-h-screen">
          {/* breadcrumb */}
          <nav className="mx-auto mt-10 mb-4 max-w-4xl px-6 text-sm">
            <Link
              href="/stories"
              className="inline-flex items-center gap-1 rounded-full border border-[#006e34]/20 bg-white px-3 py-1 text-[#0f5132] hover:bg-[#f7ffe9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006e34]"
            >
              ← Back to Stories
            </Link>
          </nav>

          <article className="mx-auto max-w-4xl px-6 pb-20">
            {/* title & meta */}
            <header className="mb-6">
              <div className="flex flex-wrap items-center gap-2">
                {location && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#006e34]/20 bg-[#f4ffe8] px-3 py-1 text-xs font-medium text-[#0f5132]">
                    {location}
                  </span>
                )}
                {date && (
                  <time
                    dateTime={date}
                    className="rounded-full border border-[#006e34]/15 bg-white px-3 py-1 text-xs text-[#355e4c]"
                  >
                    {date}
                  </time>
                )}
              </div>

              <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-[#064d2a]">
                {post.fields.title}
              </h1>
            </header>

            {/* cover */}
            {img && (
              <figure className="mb-8 overflow-hidden rounded-xl border border-[#006e34]/10 bg-white shadow-sm">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={`${img}?w=1600&h=900&fit=fill&fm=jpg&q=85`}
                    alt={post.fields.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 960px"
                  />
                </div>
              </figure>
            )}

            {/* body */}
            <div className="prose prose-sm md:prose-base max-w-none prose-headings:text-[#0b3a26] prose-a:text-[#0f5132] hover:prose-a:underline prose-img:rounded-lg prose-figcaption:text-gray-500">
              <ArticleBody document={post.fields.content} />
            </div>

            {/* actions */}
            <ShareRow canonical={canonical} title={post.fields.title} description={description} image={img ? `${img}?w=1200&h=630&fit=fill&fm=jpg&q=85` : undefined} />
          </article>
        </main>
      </GlassCard>
    </StyledContainer>
  );
}
