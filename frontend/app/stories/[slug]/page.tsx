// app/stories/[slug]/page.tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { getUpdatePostBySlug } from "@/lib/api"; 
import ArticleBody from "@/components/ArticleBody";
export const revalidate = 60;

const urlFromAsset = (asset?: any) => {
  const u = asset?.fields?.file?.url;
  return u ? (u.startsWith("//") ? `https:${u}` : u) : "";
};

export default async function StoryDetail({ params }: { params: { slug: string } }) {
  const post = await getUpdatePostBySlug(params.slug);
  if (!post) return notFound();

  const img = urlFromAsset(post.fields.coverImage);

  return (
    <main className="pt-20 bg-[#fffcec] min-h-screen">
      <article className="max-w-3xl mx-auto px-6 pb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-[#006e34] mb-4">
          {post.fields.title}
        </h1>

        {img && (
          <div className="relative w-full h-64 md:h-96 mb-6">
            <Image
              src={`${img}?w=1600&fit=fill&fm=jpg&q=85`}
              alt={post.fields.title}
              fill
              className="object-cover rounded"
              priority
            />
          </div>
        )}

        <ArticleBody document={post.fields.content} />

      </article>
    </main>
  );
}