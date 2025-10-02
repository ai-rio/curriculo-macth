'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { BlogPost } from '@/lib/blog-data';

import BlogGrid from './blog-grid';
import BlogSearch from './blog-search';
import CategoryFilter from './category-filter';

interface BlogClientProps {
  posts: BlogPost[];
  locale: string;
}

export default function BlogClient({ posts, locale }: BlogClientProps) {
  const t = useTranslations('blog');
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(posts);

  // Apply category filter
  useEffect(() => {
    const categoryFiltered =
      activeCategory === 'all' ? posts : posts.filter((post) => post.category === activeCategory);
    setFilteredPosts(categoryFiltered);
  }, [activeCategory, posts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{t('title')}</h1>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">{t('subtitle')}</p>
        </div>

        {/* Search and Filters */}
        <BlogSearch posts={posts} onFilteredPostsChange={setFilteredPosts} locale={locale} />

        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            locale={locale}
          />
        </div>

        {/* Blog Posts Grid */}
        <div className="mt-8">
          {filteredPosts.length > 0 ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">
                  {t('showingResults', { count: filteredPosts.length }) ||
                    `Mostrando ${filteredPosts.length} resultados`}
                </p>
                {filteredPosts.length !== posts.length && (
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setFilteredPosts(posts);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                  >
                    {t('clearFilters') || 'Limpar Filtros'}
                  </button>
                )}
              </div>
              <BlogGrid posts={filteredPosts} locale={locale} />
            </>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('noResultsFound') || 'Nenhum resultado encontrado'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('noResultsDescription') || 'Tente ajustar seus filtros ou termos de busca.'}
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setFilteredPosts(posts);
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {t('viewAllPosts') || 'Ver Todos os Posts'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
