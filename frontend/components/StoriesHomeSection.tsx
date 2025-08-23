import Link from "next/link";
import Image from "next/image";
import { getUpdatePosts } from "@/lib/api";
import type { updatePostEntry } from "@/lib/types";

const urlFromAsset = (asset?: any) => {
  const u = asset?.fields?.file?.url;
  return u ? (u.startsWith("//") ? `https:${u}` : u) : "";
};

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

export default async function StoriesHomeSection() {
  const items = (await getUpdatePosts()) ?? [];
  // Sort by sys.createdAt (most recent first)
  const sorted = [...items].sort((a, b) => {
    const aDate = new Date(a.sys.createdAt || 0).getTime();
    const bDate = new Date(b.sys.createdAt || 0).getTime();
    return bDate - aDate;
  });
  // Show up to 6 most recent
  const posts = sorted.slice(0, 6);

  if (!posts.length) return <div className="text-center text-gray-500">No stories yet.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {posts.map((post) => {
        const img = urlFromAsset(post.fields.coverImage);
        const href = `/stories/${post.fields.slug}`;
        return (
          <Link
            key={post.sys.id}
            href={href}
            className="group block h-full rounded-2xl border border-gray-200 bg-white/80 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
          >
            <div className="relative w-full aspect-[16/9] bg-gradient-to-tr from-yellow-100 via-white to-green-100 overflow-hidden">
              {img ? (
                <Image
                  src={`${img}?w=800&h=450&fit=fill&fm=jpg&q=80`}
                  alt={post.fields.title}
                  width={400}
                  height={225}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No image</div>
              )}
              <span className="absolute top-3 left-3 bg-yellow-400/90 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow">{post.fields.location}</span>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-[var(--color-secondary)] transition-colors line-clamp-2">{post.fields.title}</h3>
              <span className="text-xs text-gray-500 mb-3">{post.sys.createdAt ? formatDate(post.sys.createdAt) : ""}</span>
              <span className="mt-auto inline-flex items-center gap-1 text-green-700 font-semibold text-sm group-hover:underline transition-all">Read more <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></span>
            </div>
            <div className="absolute inset-0 pointer-events-none rounded-2xl group-hover:ring-4 group-hover:ring-yellow-200/60 transition-all duration-300" />
          </Link>
        );
      })}
    </div>
  );
}
