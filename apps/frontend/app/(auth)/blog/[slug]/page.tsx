import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import BlogPostHeader from '@/components/blog/blog-post-header';
import EnhancedBlogContent from '@/components/blog/enhanced-blog-content';
import RelatedPosts from '@/components/blog/related-posts';
import SocialSharing from '@/components/blog/social-sharing';
import StructuredData from '@/components/blog/structured-data';
import { getAllBlogPosts, getBlogPostBySlug } from '@/lib/blog-data';
import { BlogPost } from '@/lib/blog-utils';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export async function generateStaticParams(): Promise<{ slug: string; locale: string }[]> {
  const posts = getAllBlogPosts('en'); // Get posts for default locale
  const params: { slug: string; locale: string }[] = [];

  posts.forEach((post: BlogPost) => {
    params.push({
      slug: post.slug,
      locale: post.locale || 'en',
    });
  });

  return params;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug, resolvedParams.locale);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const t = await getTranslations({ locale: resolvedParams.locale });

  return {
    title: `${post.title} - ${t('blog.title')}`,
    description: post.description,
    keywords: post.tags?.join(', ') || `${post.category}, resume, career`,
    authors: [{ name: post.author?.name || 'Resume-Matcher Team' }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author?.name || 'Resume-Matcher Team'],
      images: [
        {
          url: '/images/blog-default.jpg',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: ['/images/blog-default.jpg'],
    },
    alternates: {
      canonical: `/${resolvedParams.locale}/blog/${post.slug}`,
      languages: {
        en: `/en/blog/${post.slug}`,
        'pt-br': `/pt-br/blog/${post.slug}`,
      },
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug, resolvedParams.locale);

  if (!post) {
    notFound();
  }

  const t = await getTranslations({ locale: resolvedParams.locale });

  // Get related posts
  const relatedPosts = getAllBlogPosts(resolvedParams.locale)
    .filter((p: BlogPost) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  return (
    <>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.lastModified || post.date,
          author: post.author
            ? [
                {
                  '@type': 'Person',
                  name: post.author.name,
                },
              ]
            : [],
          publisher: {
            '@type': 'Organization',
            name: 'Resume-Matcher',
          },
        }}
      />

      <article className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Blog Post Header */}
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
              title={post.title}
              description={post.description}
              url={`/${resolvedParams.locale}/blog/${post.slug}`}
              locale={resolvedParams.locale}
            />
          </div>

          {/* Main Content */}
          <div
            className="
            bg-white 
            rounded-2xl 
            shadow-lg 
            p-8 
            mb-12
            border
            border-gray-200
          "
          >
            <EnhancedBlogContent
              content={post.content}
              enableTableOfContents={true}
              enableCodeHighlight={true}
              enableMath={false}
              className="prose-headings:scroll-mt-24"
            />
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('blog.relatedPosts')}</h2>
              <RelatedPosts
                currentPost={post}
                locale={resolvedParams.locale}
                relatedPosts={relatedPosts}
              />
            </section>
          )}

          {/* Back to Blog */}
          <div className="text-center">
            <a
              href={`/${resolvedParams.locale}/blog`}
              className="
                inline-flex 
                items-center 
                gap-2 
                px-6 
                py-3 
                bg-blue-600 
                text-white 
                rounded-lg 
                hover:bg-blue-700 
                transition-colors 
                font-medium
              "
            >
              ← {t('blog.backToBlog')}
            </a>
          </div>
        </div>
      </article>
    </>
  );
}
