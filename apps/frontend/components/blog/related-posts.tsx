'use client';

import { ArrowRight, BookOpen, Calendar, Clock, Tag } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { BlogPost } from '@/lib/blog-utils';

interface RelatedPostsProps {
  currentPost: BlogPost;
  locale: string;
  relatedPosts: BlogPost[];
  maxPosts?: number;
}

interface RelatedPostCardProps {
  post: BlogPost;
  locale: string;
  relationType: 'category' | 'tag' | 'similar';
}

function RelatedPostCard({ post, locale, relationType }: RelatedPostCardProps) {
  const t = useTranslations('blog');

  const relationColors = {
    category: 'bg-blue-100 text-blue-800',
    tag: 'bg-green-100 text-green-800',
    similar: 'bg-purple-100 text-purple-800',
  };

  const relationLabels = {
    category: t('sameCategory') || 'Mesma Categoria',
    tag: t('sameTag') || 'Mesma Tag',
    similar: t('similarContent') || 'Conteúdo Similar',
  };

  return (
    <Link href={`/${locale}/blog/${post.slug}`} className="block group">
      <article className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
        {/* Relation Badge */}
        <div className="mb-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${relationColors[relationType]}`}
          >
            {relationLabels[relationType]}
          </span>
        </div>

        {/* Post Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {post.title}
        </h3>

        {/* Post Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.description}</p>

        {/* Post Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(post.date).toLocaleDateString(locale === 'pt-br' ? 'pt-BR' : 'en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{post.readingTime} min</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs font-medium">{t('readMore') || 'Leia Mais'}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex items-center gap-1">
            <Tag className="w-3 h-3 text-gray-400" />
            <div className="flex gap-1">
              {post.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs text-gray-500">
                  #{tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{post.tags.length - 2}</span>
              )}
            </div>
          </div>
        )}

        {/* Featured Badge */}
        {post.featured && (
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
              <BookOpen className="w-3 h-3" />
              {t('featured') || 'Destaque'}
            </span>
          </div>
        )}
      </article>
    </Link>
  );
}

export default function RelatedPosts({
  currentPost,
  locale,
  relatedPosts,
  maxPosts = 3,
}: RelatedPostsProps) {
  const t = useTranslations('blog');

  // Categorize related posts
  const categoryPosts = relatedPosts.filter((post) => post.category === currentPost.category);
  const tagPosts = relatedPosts.filter(
    (post) =>
      post.tags && currentPost.tags && post.tags.some((tag) => currentPost.tags!.includes(tag))
  );
  const similarPosts = relatedPosts.filter(
    (post) =>
      post.category !== currentPost.category &&
      (!post.tags || !currentPost.tags || !post.tags.some((tag) => currentPost.tags!.includes(tag)))
  );

  // Build display list with priority order
  const displayList: Array<{
    post: BlogPost;
    relationType: 'category' | 'tag' | 'similar';
  }> = [];

  // Add category posts (highest priority)
  categoryPosts.slice(0, Math.ceil(maxPosts * 0.5)).forEach((post) => {
    displayList.push({ post, relationType: 'category' });
  });

  // Add tag posts (medium priority)
  const remainingSlots = maxPosts - displayList.length;
  tagPosts.slice(0, Math.ceil(remainingSlots * 0.6)).forEach((post) => {
    displayList.push({ post, relationType: 'tag' });
  });

  // Fill with similar posts (lowest priority)
  const finalSlots = maxPosts - displayList.length;
  similarPosts.slice(0, finalSlots).forEach((post) => {
    displayList.push({ post, relationType: 'similar' });
  });

  const displayPosts = displayList.slice(0, maxPosts);

  if (displayPosts.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('noRelatedPosts') || 'Nenhum Post Relacionado'}
        </h3>
        <p className="text-gray-600">
          {t('noRelatedPostsDescription') ||
            'Em breve teremos mais conteúdo relacionado para você.'}
        </p>
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <span>{t('browseAllPosts') || 'Ver Todos os Posts'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('relatedPosts') || 'Posts Relacionados'}
        </h2>
        <p className="text-gray-600">
          {t('relatedPostsDescription') || 'Continue aprendendo com estes posts relacionados'}
        </p>
      </div>

      {/* Related Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayPosts.map(({ post, relationType }) => (
          <RelatedPostCard
            key={post.slug}
            post={post}
            locale={locale}
            relationType={relationType}
          />
        ))}
      </div>

      {/* View All Posts Link */}
      <div className="mt-8 text-center">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <span>{t('browseAllPosts') || 'Ver Todos os Posts'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Related Topics */}
      {(categoryPosts.length > 0 || tagPosts.length > 0) && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('exploreTopics') || 'Explore Tópicos Relacionados'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {currentPost.category && (
              <Link
                href={`/${locale}/blog?category=${currentPost.category}`}
                className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                {t(`categories.${currentPost.category}`) || currentPost.category}
              </Link>
            )}
            {currentPost.tags?.map((tag) => (
              <Link
                key={tag}
                href={`/${locale}/blog?tag=${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
