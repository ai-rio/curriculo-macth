import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import ContentAnalytics from '@/components/blog/content-analytics-simple';
import { getAllBlogPosts } from '@/lib/blog-utils';

interface AnalyticsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: AnalyticsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  return {
    title: `${t('analytics') || 'Blog Analytics'} - Resume-Matcher`,
    description:
      t('analyticsDescription') || 'View detailed analytics and insights for your blog content',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function BlogAnalyticsPage({ params }: AnalyticsPageProps) {
  const { locale } = await params;
  const posts = getAllBlogPosts(locale);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Blog Analytics</h1>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            Monitor your blog performance and content engagement
          </p>
        </div>

        <ContentAnalytics posts={posts} locale={locale} />
      </div>
    </div>
  );
}
