'use client';

import { useTranslations } from 'next-intl';

interface BlogPostHeaderProps {
  title: string;
  description: string;
  date: string;
  readingTime: number;
  category: string;
  author?: {
    name: string;
    avatar?: string;
    bio?: string;
  };
}

export default function BlogPostHeader({
  title,
  description,
  date,
  readingTime,
  category,
  author,
}: BlogPostHeaderProps) {
  const t = useTranslations('blog');

  return (
    <header className="text-center mb-12">
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
          {t(`categories.${category}`)}
        </span>
        <span>•</span>
        <span>
          {readingTime} {t('meta.readingTime')}
        </span>
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl mb-4">
        {title}
      </h1>

      <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">{description}</p>

      <div className="flex items-center justify-center gap-4 text-sm text-gray-500 border-t border-b border-gray-200 py-4">
        <time>
          {t('meta.publishedOn')}{' '}
          {new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>

        {author && (
          <>
            <span>•</span>
            <span>
              {t('author')}: {author.name}
            </span>
          </>
        )}
      </div>
    </header>
  );
}
