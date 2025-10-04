'use client';

import { ChevronDown, HelpCircle } from 'lucide-react';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
  allowMultipleOpen?: boolean;
  defaultOpenItems?: string[];
  showCategories?: boolean;
  title?: string;
  description?: string;
}

/**
 * FAQAccordion Component - Expandable FAQ sections
 *
 * Features:
 * - Expandable/collapsible FAQ items
 * - Single or multiple item expansion modes
 * - Keyboard navigation support
 * - Screen reader friendly
 * - SEO structured data ready
 * - Category grouping support
 */
export function FAQAccordion({
  items,
  className,
  allowMultipleOpen = false,
  defaultOpenItems = [],
  showCategories = false,
  title = 'Frequently Asked Questions',
  description,
}: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpenItems));

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (allowMultipleOpen) {
        // Toggle this item
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
      } else {
        // Only one item can be open at a time
        if (newSet.has(itemId)) {
          newSet.clear();
        } else {
          newSet.clear();
          newSet.add(itemId);
        }
      }
      return newSet;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent, itemId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleItem(itemId);
    }
  };

  // Group items by category if categories are enabled
  const groupedItems = showCategories
    ? items.reduce(
        (acc, item) => {
          const category = item.category || 'General';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        },
        {} as Record<string, FAQItem[]>
      )
    : { '': items };

  const categories = Object.keys(groupedItems);

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <HelpCircle className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
        {description && <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {categories.map((category, categoryIndex) => (
          <div key={category}>
            {/* Category Header */}
            {showCategories && category && (
              <h3 className="text-lg font-semibold text-foreground mb-3 mt-6 first:mt-0">
                {category}
              </h3>
            )}

            {/* Category Items */}
            <div
              className={cn(
                'space-y-3',
                showCategories && category && 'border-l-2 border-primary/20 pl-4'
              )}
            >
              {groupedItems[category].map((item, itemIndex) => {
                const isOpen = openItems.has(item.id);
                const isLastItem =
                  categoryIndex === categories.length - 1 &&
                  itemIndex === groupedItems[category].length - 1;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'bg-card border rounded-lg overflow-hidden',
                      'transition-all duration-200',
                      isOpen && 'shadow-md border-primary/30'
                    )}
                  >
                    {/* Question Button */}
                    <button
                      onClick={() => toggleItem(item.id)}
                      onKeyDown={(e) => handleKeyDown(e, item.id)}
                      className={cn(
                        'w-full text-left p-4 flex items-center justify-between gap-4',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
                        'hover:bg-muted/50 transition-colors',
                        isOpen && 'bg-muted/30'
                      )}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${item.id}`}
                    >
                      <h3 className="font-semibold text-foreground pr-2 leading-tight">
                        {item.question}
                      </h3>
                      <ChevronDown
                        className={cn(
                          'w-5 h-5 text-muted-foreground transition-transform duration-200 flex-shrink-0',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </button>

                    {/* Answer */}
                    <div
                      id={`faq-answer-${item.id}`}
                      className={cn(
                        'overflow-hidden transition-all duration-300 ease-in-out',
                        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      )}
                    >
                      <div className="px-4 pb-4 text-muted-foreground leading-relaxed">
                        <div className="border-t border-border pt-4">{item.answer}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }),
        }}
      />
    </div>
  );
}

/**
 * Single FAQ item for use in other contexts
 */
export function FAQItem({
  question,
  answer,
  defaultOpen = false,
  className,
}: {
  question: string;
  answer: string;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('bg-card border rounded-lg overflow-hidden', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors"
        aria-expanded={isOpen}
      >
        <h3 className="font-semibold text-foreground">{question}</h3>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 pb-4 text-muted-foreground leading-relaxed border-t border-border pt-4">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default FAQAccordion;
