import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type CalloutVariant =
  | 'info'
  | 'warning'
  | 'success'
  | 'error'
  | 'tip'
  | 'celebration'
  | 'challenge'
  | 'motivation'
  | 'quest'
  | 'reward';

interface BaseCalloutProps {
  children: ReactNode;
  variant?: CalloutVariant;
  title?: string;
  className?: string;
  icon?: ReactNode;
}

const variantStyles = {
  info: {
    container: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800',
    icon: 'text-indigo-600 dark:text-indigo-400',
    title: 'text-indigo-900 dark:text-indigo-100',
    content: 'text-indigo-800 dark:text-indigo-200',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    title: 'text-amber-900 dark:text-amber-100',
    content: 'text-amber-800 dark:text-amber-200',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800',
    icon: 'text-emerald-600 dark:text-emerald-400',
    title: 'text-emerald-900 dark:text-emerald-100',
    content: 'text-emerald-800 dark:text-emerald-200',
  },
  error: {
    container: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-900 dark:text-red-100',
    content: 'text-red-800 dark:text-red-200',
  },
  tip: {
    container: 'bg-violet-50 border-violet-200 dark:bg-violet-950 dark:border-violet-800',
    icon: 'text-violet-600 dark:text-violet-400',
    title: 'text-violet-900 dark:text-violet-100',
    content: 'text-violet-800 dark:text-violet-200',
  },
  celebration: {
    container: 'bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800',
    icon: 'text-pink-600 dark:text-pink-400',
    title: 'text-pink-900 dark:text-pink-100',
    content: 'text-pink-800 dark:text-pink-200',
  },
  challenge: {
    container: 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
    icon: 'text-orange-600 dark:text-orange-400',
    title: 'text-orange-900 dark:text-orange-100',
    content: 'text-orange-800 dark:text-orange-200',
  },
  motivation: {
    container: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950 dark:border-cyan-800',
    icon: 'text-cyan-600 dark:text-cyan-400',
    title: 'text-cyan-900 dark:text-cyan-100',
    content: 'text-cyan-800 dark:text-cyan-200',
  },
  quest: {
    container: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
    title: 'text-purple-900 dark:text-purple-100',
    content: 'text-purple-800 dark:text-purple-200',
  },
  reward: {
    container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
    icon: 'text-yellow-600 dark:text-yellow-400',
    title: 'text-yellow-900 dark:text-yellow-100',
    content: 'text-yellow-800 dark:text-yellow-200',
  },
};

const defaultTitles = {
  info: 'Info',
  warning: 'Warning',
  success: 'Success',
  error: 'Error',
  tip: 'Pro Tip',
  celebration: 'Celebration',
  challenge: 'Challenge',
  motivation: 'Motivation',
  quest: 'Quest',
  reward: 'Reward',
};

export function BaseCallout({
  children,
  variant = 'info',
  title,
  className,
  icon,
}: BaseCalloutProps) {
  const styles = variantStyles[variant];
  const defaultTitle = defaultTitles[variant];

  return (
    <div
      className={cn('relative rounded-lg border p-6 my-6', styles.container, className)}
      role="note"
      aria-label={`${variant} callout${title ? `: ${title}` : ''}`}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 mt-0.5">
            <div className={cn('w-5 h-5', styles.icon)}>{icon}</div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && <h3 className={cn('font-semibold mb-2 text-lg', styles.title)}>{title}</h3>}
          <div className={cn('text-sm leading-relaxed', styles.content)}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Callout({
  variant = 'info',
  title,
  children,
  className,
}: Omit<BaseCalloutProps, 'icon'>) {
  const defaultTitle = title || defaultTitles[variant];

  return (
    <BaseCallout
      variant={variant}
      title={defaultTitle}
      className={className}
      icon={
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          {variant === 'info' && (
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          )}
          {variant === 'warning' && (
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          )}
          {variant === 'success' && (
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          )}
          {variant === 'error' && (
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          )}
          {variant === 'tip' && (
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          )}
          {variant === 'celebration' && (
            <path
              fillRule="evenodd"
              d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
              clipRule="evenodd"
            />
          )}
          {variant === 'challenge' && (
            <path
              fillRule="evenodd"
              d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z"
              clipRule="evenodd"
            />
          )}
          {variant === 'motivation' && (
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          )}
          {variant === 'quest' && (
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2 1 1 0 100-2 2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
          )}
          {variant === 'reward' && (
            <path
              fillRule="evenodd"
              d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z"
              clipRule="evenodd"
            />
          )}
        </svg>
      }
    >
      {children}
    </BaseCallout>
  );
}

export default Callout;
