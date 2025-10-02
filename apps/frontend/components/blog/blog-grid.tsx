'use client';

import { useTranslations } from 'next-intl';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: number;
  category: string;
  featured?: boolean;
}

interface BlogGridProps {
  posts: BlogPost[];
  locale: string;
}

export default function BlogGrid({ posts, locale }: BlogGridProps) {
  const t = useTranslations('blog');

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <article
          key={post.slug}
          className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                {t(`categories.${post.category}`)}
              </span>
              <span>•</span>
              <span>
                {post.readingTime} {t('meta.readingTime')}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
              <a href={`/${locale}/blog/${post.slug}`}>{post.title}</a>
            </h3>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.description}</p>

            <div className="flex items-center justify-between">
              <time className="text-xs text-gray-500">
                {t('meta.publishedOn')}{' '}
                {new Date(post.date).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>

              <a
                href={`/${locale}/blog/${post.slug}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                {t('navigation.readMore')} →
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
