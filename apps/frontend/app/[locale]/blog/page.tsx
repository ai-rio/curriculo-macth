import { getAllBlogPosts } from '@/lib/blog-data';
import BlogClient from '@/components/blog/blog-client';

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const posts = getAllBlogPosts(locale);

  return <BlogClient posts={posts} locale={locale} />;
}