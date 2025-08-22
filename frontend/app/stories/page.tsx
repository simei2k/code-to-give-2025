// app/stories/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getUpdatePosts } from "@/lib/api"; 
export const revalidate = 60;

const COLUMNS = ["General", "East", "West", "South", "North"] as const;

const urlFromAsset = (asset?: any) => {
  const u = asset?.fields?.file?.url;
  return u ? (u.startsWith("//") ? `https:${u}` : u) : "";
};

export default async function Stories() {
  const items = (await getUpdatePosts()) ?? [];

  const grouped: Record<string, typeof items> = {};
  COLUMNS.forEach((loc) => (grouped[loc] = items.filter(p => p.fields.location === loc)));

  return (
    <main className="pt-20 bg-[#fffcec] min-h-screen">
      <section className="text-center mb-10 px-6">
        <h1 className="text-4xl font-bold text-[#006e34]">Stories &amp; Updates</h1>
        <p className="text-gray-700 mt-2 max-w-2xl mx-auto">
          Real stories from our students and schools across Hong Kong.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
        {COLUMNS.map((col) => (
          <div key={col}>
            <h2 className="text-2xl font-semibold text-[#006e34] mb-4">{col}</h2>
            <ul className="space-y-5">
              {grouped[col]?.length ? (
                grouped[col].map((post) => {
                  const href = `/stories/${post.fields.slug}`;
                  const img = urlFromAsset(post.fields.coverImage);
                  return (
                    <li key={post.sys.id} className="p-4 border rounded bg-white shadow-sm">
                      <Link href={href} className="block">
                        {img && (
                          <div className="relative w-full h-48 mb-3">
                            <Image
                              src={`${img}?w=800&h=500&fit=fill&fm=jpg&q=80`}
                              alt={post.fields.title}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <h3 className="font-medium text-lg">{post.fields.title}</h3>
                      </Link>
                    </li>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">No stories yet.</p>
              )}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}