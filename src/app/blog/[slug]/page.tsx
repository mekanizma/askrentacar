import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createSeedDatabase } from "@/mock/seed";
import { Card } from "@/components/ui/primitives";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return createSeedDatabase().blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = createSeedDatabase().blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Blog" };
  return {
    title: post.seoTitle.tr,
    description: post.seoDescription.tr,
    openGraph: {
      title: post.title.tr,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = createSeedDatabase().blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title.tr,
    datePublished: post.publishedAt,
    author: post.author,
    image: post.coverImage,
  };
  const category =
    {
      Travel: "Seyahat",
      Guides: "Rehberler",
      Tips: "İpuçları",
      News: "Haberler",
    }[post.category] ?? post.category;

  return (
    <article className="container-premium space-y-6 pb-20 pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative h-64 overflow-hidden rounded-3xl md:h-96">
        <Image
          src={post.coverImage}
          alt={post.title.tr}
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="text-sm uppercase tracking-wide text-gold">{category}</div>
      <h1 className="text-3xl font-semibold md:text-5xl">{post.title.tr}</h1>
      <p className="text-slate-400">
        {post.author} · {post.readingMinutes} dk okuma ·{" "}
        {new Date(post.publishedAt).toLocaleDateString("tr-TR")}
      </p>
      <Card className="prose prose-invert max-w-none space-y-4 text-slate-200">
        <p>{post.content.tr}</p>
      </Card>
    </article>
  );
}
