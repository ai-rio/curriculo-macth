'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import BlogGrid from './blog-grid';
import CategoryFilter from './category-filter';

interface BlogClientProps {
  posts: any[];
  locale: string;
}

export default function BlogClient({ posts, locale }: BlogClientProps) {
  const t = useTranslations('blog');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter(post => post.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            {t('subtitle')}
          </p>
        </div>

        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          locale={locale}
        />

        <div className="mt-8">
          {filteredPosts.length > 0 ? (
            <BlogGrid posts={filteredPosts} locale={locale} />
          ) : (
            <div className="text-center text-gray-500">
              {t('comingSoon')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}