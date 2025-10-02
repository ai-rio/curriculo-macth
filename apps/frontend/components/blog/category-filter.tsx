'use client';

import { useTranslations } from 'next-intl';

import { Button } from '../ui/button';

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  locale: string;
}

const CATEGORIES = [
  'all',
  'resumeWriting',
  'atsOptimization',
  'interviewPrep',
  'careerAdvice',
  'jobSearch',
  'marketTrends',
] as const;

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
  locale,
}: CategoryFilterProps) {
  const t = useTranslations('blog');

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {CATEGORIES.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(category)}
          className={
            activeCategory === category
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'
          }
        >
          {t(`categories.${category}`)}
        </Button>
      ))}
    </div>
  );
}
