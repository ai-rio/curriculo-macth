import { notFound } from 'next/navigation';

import BlogContent from '@/components/blog/blog-content';
import BlogPostHeader from '@/components/blog/blog-post-header';
import PremiumContentGate from '@/components/blog/premium-content-gate';
import RelatedPosts from '@/components/blog/related-posts';
import SocialSharing from '@/components/blog/social-sharing';
import { FloatingShareButtons } from '@/components/blog/social-sharing';
import { BlogPost, getBlogPostBySlug, getRelatedPosts } from '@/lib/blog-data';
import BlogSEOGenerator from '@/lib/blog-seo';

interface BlogPostPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const post = getBlogPostBySlug(slug, locale);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  const seoData = BlogSEOGenerator.generateBlogPostSEO(post, locale);

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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const post = getBlogPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post, 3);
  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://resume-matcher.com'}/${locale}/blog/${slug}`;

  // Check if post is premium (for demo, using featured flag)
  const isPremium = post.featured;

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Share Buttons */}
      <FloatingShareButtons
        url={postUrl}
        title={post.title}
        description={post.description}
        locale={locale}
        tags={post.tags}
        visible={true}
      />

      <article className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <BlogPostHeader
          title={post.title}
          description={post.description}
          date={post.date}
          readingTime={post.readingTime}
          category={post.category}
          author={post.author}
        />

        {/* Social Sharing */}
        <div className="mb-8">
          <SocialSharing
            url={postUrl}
            title={post.title}
            description={post.description}
            locale={locale}
            tags={post.tags}
          />
        </div>

        {/* Blog Content */}
        <BlogContent content={post.content} />

        {/* Premium Content Gate (if premium content) */}
        {isPremium && (
          <div className="mt-12">
            <PremiumContentGate
              locale={locale}
              previewContent={post.content.substring(0, 500)}
              contentTitle={post.title}
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              {locale === 'pt-br' ? 'Tags' : 'Tags'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social Sharing (Bottom) */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <SocialSharing
            url={postUrl}
            title={post.title}
            description={post.description}
            locale={locale}
            tags={post.tags}
            className="mb-8"
          />
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <RelatedPosts currentPost={post} locale={locale} maxPosts={3} />
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <a
            href={`/${locale}/blog`}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {locale === 'pt-br' ? '← Voltar ao Blog' : '← Back to Blog'}
          </a>
        </div>
      </article>
    </div>
  );
}
