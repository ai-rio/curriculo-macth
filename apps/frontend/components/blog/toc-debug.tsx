'use client';

import React, { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

interface TOCDebugProps {
  className?: string;
}

interface HeadingInfo {
  id: string;
  text: string;
  level: number;
  hasId: boolean;
}

/**
 * TOCDebug Component - Development tool for debugging Table of Contents
 *
 * This component helps developers:
 * - See all headings found on the page
 * - Identify headings missing IDs
 * - Understand the heading structure
 * - Test TOC functionality during development
 *
 * Should only be used in development environments.
 */
export function TOCDebug({ className }: TOCDebugProps) {
  const [headings, setHeadings] = useState<HeadingInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const extractHeadings = () => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const extractedHeadings: HeadingInfo[] = [];

      headingElements.forEach((element) => {
        const level = parseInt(element.tagName.charAt(1));
        const id = element.id;
        const text = element.textContent || '';

        extractedHeadings.push({
          id,
          text,
          level,
          hasId: !!id,
        });
      });

      setHeadings(extractedHeadings);
    };

    // Initial extraction
    extractHeadings();

    // Set up MutationObserver to detect changes
    const observer = new MutationObserver(() => {
      extractHeadings();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const headingCounts = headings.reduce(
    (acc, heading) => {
      acc[heading.level] = (acc[heading.level] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  const headingsWithoutIds = headings.filter((h) => !h.hasId);

  return (
    <div className={cn('fixed bottom-4 right-4 z-50', className)}>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={cn(
          'bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg',
          'text-sm font-medium transition-all duration-200',
          'hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary',
          isVisible && 'rounded-b-none'
        )}
      >
        TOC Debug ({headings.length})
      </button>

      {/* Debug panel */}
      {isVisible && (
        <div className="bg-card border border-border rounded-t-lg shadow-lg w-96 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground mb-2">Table of Contents Debug</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Total headings: {headings.length}</div>
              <div className="flex gap-4">
                <span>H1: {headingCounts[1] || 0}</span>
                <span>H2: {headingCounts[2] || 0}</span>
                <span>H3: {headingCounts[3] || 0}</span>
                <span>
                  H4+:{' '}
                  {Object.entries(headingCounts)
                    .filter(([level]) => parseInt(level) > 3)
                    .reduce((sum, [, count]) => sum + count, 0)}
                </span>
              </div>
              {headingsWithoutIds.length > 0 && (
                <div className="text-destructive">
                  ⚠️ {headingsWithoutIds.length} headings missing IDs
                </div>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-64">
            {headings.length === 0 ? (
              <div className="p-4 text-muted-foreground text-sm">
                No headings found on this page.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {headings.map((heading, index) => (
                  <div
                    key={index}
                    className={cn('p-3 text-sm', !heading.hasId && 'bg-destructive/10')}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
                          heading.level === 1 && 'bg-blue-100 text-blue-800',
                          heading.level === 2 && 'bg-green-100 text-green-800',
                          heading.level === 3 && 'bg-yellow-100 text-yellow-800',
                          heading.level >= 4 && 'bg-gray-100 text-gray-800'
                        )}
                      >
                        H{heading.level}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{heading.text}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {heading.hasId ? (
                            <span className="text-green-600">ID: {heading.id}</span>
                          ) : (
                            <span className="text-destructive">
                              No ID (auto-generated: "
                              {heading.text
                                .toLowerCase()
                                .replace(/[^\w\s-]/g, '')
                                .replace(/\s+/g, '-')
                                .trim()}
                              ")
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-3 border-t border-border bg-muted/30">
            <div className="text-xs text-muted-foreground">
              <div className="mb-2">Quick actions:</div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    headings.forEach((heading) => {
                      if (!heading.hasId) {
                        const element = Array.from(
                          document.querySelectorAll('h1, h2, h3, h4, h5, h6')
                        ).find((el) => el.textContent === heading.text);
                        if (element) {
                          const id = heading.text
                            .toLowerCase()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/\s+/g, '-')
                            .trim();
                          element.id = id;
                        }
                      }
                    });
                    window.location.reload();
                  }}
                  className="text-primary hover:underline"
                >
                  → Add missing IDs and reload
                </button>
                <div>
                  <button
                    onClick={() => {
                      const tocElement = document.querySelector(
                        '[data-testid="table-of-contents"]'
                      );
                      if (tocElement) {
                        tocElement.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        alert('Table of Contents not found on page');
                      }
                    }}
                    className="text-primary hover:underline"
                  >
                    → Jump to Table of Contents
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TOCDebug;
