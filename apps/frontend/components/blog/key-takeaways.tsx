import { CheckCircle } from 'lucide-react';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface KeyTakeawaysProps {
  children?: ReactNode;
  title?: string;
  className?: string;
  icon?: ReactNode;
  items?: string[];
}

/**
 * KeyTakeaways Component - Displays highlighted TL;DR section
 *
 * Features:
 * - Visually distinct summary section
 * - Check icons for visual appeal
 * - Semantic HTML for SEO
 * - Accessible and responsive design
 * - Can be used with children prop or items array
 */
export function KeyTakeaways({
  children,
  title = 'Key Takeaways',
  className,
  icon,
  items,
}: KeyTakeawaysProps) {
  const defaultIcon = icon || <CheckCircle className="w-5 h-5" />;

  return (
    <section
      className={cn(
        'bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 my-8',
        'dark:from-primary/10 dark:to-primary/15 dark:border-primary/30',
        className
      )}
      aria-labelledby="key-takeaways-title"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="text-primary">{defaultIcon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <h2
            id="key-takeaways-title"
            className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"
          >
            {title}
            <span className="text-sm font-normal text-muted-foreground">(TL;DR)</span>
          </h2>

          {items ? (
            <ul className="space-y-3">
              {items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-foreground/90 leading-relaxed"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                  </div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-foreground/90 leading-relaxed prose prose-sm max-w-none">
              {children}
            </div>
          )}
        </div>
      </div>

      {/* SEO structured data hint */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': typeof window !== 'undefined' ? window.location.href : '',
            },
            headline: title,
            description: items
              ? items.join('. ')
              : 'Key takeaways and summary points from this article',
          }),
        }}
      />
    </section>
  );
}

/**
 * Simplified version for inline usage
 */
export function TLDR({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'border-l-4 border-primary bg-primary/5 px-4 py-3 my-6 rounded-r-lg',
        'dark:bg-primary/10',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-bold text-primary uppercase tracking-wide">TL;DR</span>
      </div>
      <div className="text-sm text-foreground/90 leading-relaxed">{children}</div>
    </div>
  );
}

export default KeyTakeaways;
