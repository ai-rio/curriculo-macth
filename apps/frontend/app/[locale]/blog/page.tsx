import BlogClient from '@/components/blog/blog-client';
import { getAllBlogPosts } from '@/lib/blog-data';
import BlogSEOGenerator from '@/lib/blog-seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const seoData = BlogSEOGenerator.generateBlogListingSEO(locale);

  return {
    title: seoData.title,
    description: seoData.description,
    openGraph: seoData.openGraph,
    twitter: seoData.twitter,
    alternates: seoData.alternates,
    robots: seoData.robots,
    other: {
      'structured-data': JSON.stringify(seoData.structuredData),
    },
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const posts = getAllBlogPosts(locale);

  return <BlogClient posts={posts} locale={locale} />;
}
