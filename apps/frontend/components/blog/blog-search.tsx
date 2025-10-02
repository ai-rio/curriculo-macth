'use client';

import { Calendar, Clock, Filter, Search, User, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { BlogPost } from '@/lib/blog-utils';

interface BlogSearchProps {
  posts: BlogPost[];
  onFilteredPostsChange: (posts: BlogPost[]) => void;
  locale: string;
}

interface SearchFilters {
  query: string;
  category: string;
  tags: string[];
  dateRange: 'all' | 'week' | 'month' | 'year';
  author: string;
  minReadingTime: number;
  maxReadingTime: number;
  featured: boolean;
}

export default function BlogSearch({ posts, onFilteredPostsChange, locale }: BlogSearchProps) {
  const t = useTranslations('blog');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    tags: [],
    dateRange: 'all',
    author: 'all',
    minReadingTime: 0,
    maxReadingTime: 30,
    featured: false,
  });

  // Get available filters from posts
  const availableFilters = useMemo(() => {
    const categories = [...new Set(posts.map((post) => post.category))];
    const tags = [...new Set(posts.flatMap((post) => post.tags || []))];
    const authors = [...new Set(posts.map((post) => post.author?.name).filter(Boolean))];
    const maxReadingTime = Math.max(...posts.map((post) => post.readingTime), 30);

    return { categories, tags, authors, maxReadingTime };
  }, [posts]);

  // Filter posts based on search criteria
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Text search
      const searchText = searchQuery.toLowerCase();
      const titleMatch = post.title.toLowerCase().includes(searchText);
      const descriptionMatch = post.description.toLowerCase().includes(searchText);
      const contentMatch = post.content.toLowerCase().includes(searchText);
      const tagsMatch = post.tags?.some((tag) => tag.toLowerCase().includes(searchText));

      if (!titleMatch && !descriptionMatch && !contentMatch && !tagsMatch) {
        return false;
      }

      // Category filter
      if (filters.category !== 'all' && post.category !== filters.category) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const postTags = post.tags || [];
        const hasMatchingTag = filters.tags.some((tag) => postTags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const postDate = new Date(post.date);
        const now = new Date();
        let cutoffDate: Date;

        switch (filters.dateRange) {
          case 'week':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
          case 'year':
            cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
          default:
            cutoffDate = new Date(0);
        }

        if (postDate < cutoffDate) return false;
      }

      // Author filter
      if (filters.author !== 'all' && post.author?.name !== filters.author) {
        return false;
      }

      // Reading time filter
      if (post.readingTime < filters.minReadingTime || post.readingTime > filters.maxReadingTime) {
        return false;
      }

      // Featured filter
      if (filters.featured && !post.featured) {
        return false;
      }

      return true;
    });
  }, [posts, searchQuery, filters]);

  // Update parent component with filtered posts
  useEffect(() => {
    onFilteredPostsChange(filteredPosts);
  }, [filteredPosts, onFilteredPostsChange]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      tags: [],
      dateRange: 'all',
      author: 'all',
      minReadingTime: 0,
      maxReadingTime: availableFilters.maxReadingTime,
      featured: false,
    });
    setSearchQuery('');
  };

  // Toggle tag filter
  const toggleTag = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.tags.length > 0,
    filters.dateRange !== 'all',
    filters.author !== 'all',
    filters.featured,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder') || 'Buscar posts...'}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
          />
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors relative"
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">{t('filters') || 'Filtros'}</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {(searchQuery || activeFiltersCount > 0) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="font-medium">{t('clear') || 'Limpar'}</span>
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {isFilterOpen && (
        <div className="border-t pt-6 space-y-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('categories') || 'Categorias'}
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">{t('allCategories') || 'Todas as Categorias'}</option>
              {availableFilters.categories.map((category) => (
                <option key={category} value={category}>
                  {t(`categories.${category}`) || category}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          {availableFilters.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('tags') || 'Tags'}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableFilters.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.tags.includes(tag)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('dateRange') || 'Período'}
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dateRange: e.target.value as any }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">{t('allTime') || 'Todo o Período'}</option>
              <option value="week">{t('lastWeek') || 'Última Semana'}</option>
              <option value="month">{t('lastMonth') || 'Último Mês'}</option>
              <option value="year">{t('lastYear') || 'Último Ano'}</option>
            </select>
          </div>

          {/* Author Filter */}
          {availableFilters.authors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('author') || 'Autor'}
              </label>
              <select
                value={filters.author}
                onChange={(e) => setFilters((prev) => ({ ...prev, author: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">{t('allAuthors') || 'Todos os Autores'}</option>
                {availableFilters.authors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reading Time Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('readingTime') || 'Tempo de Leitura'}: {filters.minReadingTime}-
              {filters.maxReadingTime} min
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500">Mínimo</label>
                <input
                  type="range"
                  min="0"
                  max={availableFilters.maxReadingTime}
                  value={filters.minReadingTime}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      minReadingTime: parseInt(e.target.value),
                      maxReadingTime: Math.max(prev.maxReadingTime, parseInt(e.target.value)),
                    }))
                  }
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{filters.minReadingTime} min</span>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">Máximo</label>
                <input
                  type="range"
                  min="0"
                  max={availableFilters.maxReadingTime}
                  value={filters.maxReadingTime}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxReadingTime: parseInt(e.target.value),
                      minReadingTime: Math.min(prev.minReadingTime, parseInt(e.target.value)),
                    }))
                  }
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{filters.maxReadingTime} min</span>
              </div>
            </div>
          </div>

          {/* Featured Filter */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => setFilters((prev) => ({ ...prev, featured: e.target.checked }))}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {t('featuredOnly') || 'Apenas Posts em Destaque'}
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {searchQuery && (
              <span>
                {t('searchingFor') || 'Buscando por'} &quot;<strong>{searchQuery}</strong>&quot; -
              </span>
            )}
            <span>
              {filteredPosts.length} {t('resultsFound') || 'resultados encontrados'}
              {filteredPosts.length !== posts.length && (
                <span>
                  {' '}
                  {t('of') || 'de'} {posts.length}
                </span>
              )}
            </span>
          </div>

          {filteredPosts.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                {filteredPosts.filter((p) => p.featured).length} {t('featured') || 'destaque'}
              </span>
              <span>
                {Math.round(
                  filteredPosts.reduce((sum, p) => sum + p.readingTime, 0) / filteredPosts.length
                )}{' '}
                {t('avgReadingTime') || 'min leitura média'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
