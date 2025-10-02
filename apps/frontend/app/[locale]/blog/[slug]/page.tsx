import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/lib/blog-data';
import BlogPostHeader from '@/components/blog/blog-post-header';

interface BlogPostPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const post = getBlogPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <BlogPostHeader
          title={post.title}
          description={post.description}
          date={post.date}
          readingTime={post.readingTime}
          category={post.category}
          author={post.author}
        />

        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <a
            href={`/${locale}/blog`}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Blog
          </a>
        </div>
      </article>
    </div>
  );
}