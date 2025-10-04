'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';

interface TOCHeading {
  id: string;
  text: string;
  level: number;
  description?: string;
}

interface TOCSection {
  id: string;
  title: string;
  description: string;
}

interface TableOfContentsProps {
  // For blog posts: dynamic headings extracted from DOM
  headings?: TOCHeading[];
  // For legal pages: static predefined sections
  sections?: TOCSection[];
  title?: string;
  subtitle?: string;
  className?: string;
  // Enable scroll tracking for blog posts
  enableScrollTracking?: boolean;
  // Show numbered indicators (legal pages style)
  showNumbers?: boolean;
}

/**
 * Enhanced TableOfContents Component with Hierarchical Accordion Structure
 *
 * Features:
 * - Hierarchical accordion: H2 headings with collapsible H3+ subheadings
 * - Individual section toggles for better content organization
 * - Smart auto-expand: active section automatically opens
 * - Full accessibility support with keyboard navigation
 * - Smooth animations and visual feedback
 */
export default function TableOfContents({
  headings: propHeadings,
  sections: propSections,
  title = 'Table of Contents',
  subtitle,
  className = '',
  enableScrollTracking = true,
  showNumbers = false,
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCHeading[]>(propHeadings || []);
  const [activeId, setActiveId] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Determine if we're using sections (legal pages) or headings (blog posts)
  const usingSections = propSections && propSections.length > 0;

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);

      // Keep all sections collapsed initially on both desktop and mobile
      // Users can choose which section to explore
      setExpandedSections(new Set());
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [headings]);

  // Auto-extract headings from DOM if not provided via props and not using sections
  useEffect(() => {
    if (!usingSections && (!propHeadings || propHeadings.length === 0)) {
      const extractedHeadings: TOCHeading[] = [];
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

      headingElements.forEach((element) => {
        const level = parseInt(element.tagName.charAt(1));
        let id = element.id;

        // Generate ID if missing
        if (!id) {
          id =
            element.textContent
              ?.toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .trim() || '';
          element.id = id;
        }

        if (element.textContent && id) {
          extractedHeadings.push({
            id,
            text: element.textContent,
            level,
          });
        }
      });

      setHeadings(extractedHeadings);
    }
  }, [propHeadings, usingSections]);

  // Track scroll position and update active heading (only for blog posts)
  useEffect(() => {
    if (!enableScrollTracking || usingSections) return;

    const handleScroll = () => {
      const headingElements = headings
        .map((heading) => ({
          id: heading.id,
          element: document.getElementById(heading.id),
        }))
        .filter((item) => item.element);

      // Find the current active heading based on scroll position
      let currentActiveId = '';
      const scrollPosition = window.scrollY + 120; // Offset for sticky header

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i].element;
        if (element && element.offsetTop <= scrollPosition) {
          currentActiveId = headingElements[i].id;
          break;
        }
      }

      setActiveId(currentActiveId);

      // Auto-expand section containing active heading (collapse all others)
      if (currentActiveId) {
        const activeHeading = headings.find((h) => h.id === currentActiveId);
        if (activeHeading) {
          if (activeHeading.level === 2) {
            // If it's an H2, expand only this section
            setExpandedSections(new Set([activeHeading.id]));
          } else if (activeHeading.level > 2) {
            // If it's a subheading, find and expand only its parent H2
            const parentH2 = findParentH2(headings, activeHeading);
            if (parentH2) {
              setExpandedSections(new Set([parentH2.id]));
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Set initial active heading

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings, enableScrollTracking, usingSections]);

  // Type guard to check if item is a grouped heading
  const isGroupedHeading = (
    item: TOCSection | { id: string; text: string; level: number; children: TOCHeading[] }
  ): item is { id: string; text: string; level: number; children: TOCHeading[] } => {
    return 'text' in item && 'level' in item && 'children' in item;
  };

  // Group headings into hierarchical structure
  const groupedHeadings = useMemo(() => {
    if (usingSections) return propSections || [];

    const groups: Array<{
      id: string;
      text: string;
      level: number;
      children: TOCHeading[];
    }> = [];

    let currentGroup: (typeof groups)[0] | null = null;

    headings.forEach((heading) => {
      if (heading.level === 2) {
        // Start new group for H2
        currentGroup = {
          id: heading.id,
          text: heading.text,
          level: heading.level,
          children: [],
        };
        groups.push(currentGroup);
      } else if (heading.level > 2 && currentGroup) {
        // Add subheading to current group
        currentGroup.children.push(heading);
      } else if (heading.level === 1) {
        // H1 gets its own group without children
        groups.push({
          id: heading.id,
          text: heading.text,
          level: heading.level,
          children: [],
        });
      }
    });

    return groups;
  }, [headings, usingSections, propSections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Calculate offset for sticky header and padding
      const headerOffset = 120;
      const elementPosition = element.offsetTop - headerOffset;

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      if (prev.has(sectionId)) {
        // If clicking on already expanded section, collapse it
        return new Set();
      } else {
        // If clicking on collapsed section, expand only this one (collapse all others)
        return new Set([sectionId]);
      }
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      scrollToSection(id);
    }
  };

  const handleToggleKeyDown = (event: React.KeyboardEvent, sectionId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleSection(sectionId);
    }
  };

  if (!groupedHeadings || groupedHeadings.length === 0) {
    return null;
  }

  return (
    <div className={cn('bg-card border rounded-lg shadow-lg', className)}>
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}

        {/* Reading progress indicator */}
        {enableScrollTracking && !usingSections && activeId && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span>
                Reading: {headings.find((h) => h.id === activeId)?.text || 'Unknown section'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <nav className="space-y-2" aria-labelledby="toc-title">
          {groupedHeadings.map((group, groupIndex) => {
            const isExpanded = expandedSections.has(group.id);
            const hasChildren = 'children' in group && group.children && group.children.length > 0;
            const isActive = enableScrollTracking && activeId === group.id;
            const hasActiveChild =
              enableScrollTracking &&
              'children' in group &&
              group.children?.some((child) => child.id === activeId);
            const shouldHighlight = isActive || hasActiveChild;

            return (
              <div key={group.id} className="border rounded-lg overflow-hidden">
                {/* Main heading button */}
                <div className="flex">
                  <button
                    onClick={() => scrollToSection(group.id)}
                    onKeyDown={(e) => handleKeyDown(e, group.id)}
                    className={cn(
                      'flex-1 text-left p-4 transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
                      shouldHighlight
                        ? 'bg-primary/5 text-primary'
                        : 'hover:bg-primary/5 hover:text-primary text-foreground/80'
                    )}
                    aria-label={`Navigate to ${isGroupedHeading(group) ? group.text : (group as TOCSection).title}`}
                  >
                    <div className="flex items-center gap-3">
                      {showNumbers && (
                        <span
                          className={cn(
                            'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
                            'text-sm font-bold transition-colors',
                            shouldHighlight
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-primary/10 text-primary'
                          )}
                        >
                          {groupIndex + 1}
                        </span>
                      )}

                      {!showNumbers && (
                        <div
                          className={cn(
                            'flex-shrink-0 w-2 h-2 rounded-full transition-colors',
                            shouldHighlight ? 'bg-primary' : 'bg-muted'
                          )}
                        />
                      )}

                      <div className="flex-1">
                        <h3
                          className={cn(
                            'font-semibold leading-tight',
                            isGroupedHeading(group) && group.level === 1 ? 'text-lg' : 'text-base'
                          )}
                        >
                          {isGroupedHeading(group) ? group.text : (group as TOCSection).title}
                        </h3>
                        {hasChildren && 'children' in group && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {group.children.length} subsection
                            {group.children.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Accordion toggle button for sections with children */}
                  {hasChildren && (
                    <button
                      onClick={() => toggleSection(group.id)}
                      onKeyDown={(e) => handleToggleKeyDown(e, group.id)}
                      className={cn(
                        'flex items-center justify-center w-12 border-l',
                        'transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
                        shouldHighlight
                          ? 'bg-primary/5 text-primary'
                          : 'hover:bg-primary/5 hover:text-primary text-muted-foreground'
                      )}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${isGroupedHeading(group) ? group.text : (group as TOCSection).title} subsections`}
                      aria-expanded={isExpanded}
                    >
                      <svg
                        className={cn(
                          'w-4 h-4 transition-transform duration-200',
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Collapsible children */}
                {hasChildren && (
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-300 ease-in-out',
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    )}
                  >
                    <div className="bg-muted/30 border-t">
                      {'children' in group &&
                        group.children.map((child, childIndex) => {
                          const isChildActive = enableScrollTracking && activeId === child.id;

                          return (
                            <button
                              key={child.id}
                              onClick={() => scrollToSection(child.id)}
                              onKeyDown={(e) => handleKeyDown(e, child.id)}
                              className={cn(
                                'w-full text-left p-3 pl-8 transition-all duration-200',
                                'border-l-4 border-l-transparent',
                                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
                                isChildActive
                                  ? 'border-l-primary bg-primary/5 text-primary'
                                  : 'hover:border-l-primary/50 hover:bg-primary/5 hover:text-primary text-muted-foreground',
                                childIndex === group.children.length - 1 ? '' : 'border-b'
                              )}
                              aria-label={`Navigate to ${child.text}`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    'flex-shrink-0 w-1.5 h-1.5 rounded-full transition-colors',
                                    isChildActive ? 'bg-primary' : 'bg-muted-foreground/40'
                                  )}
                                />

                                <h4
                                  className={cn(
                                    'font-medium text-sm leading-tight',
                                    child.level === 3 ? '' : 'text-xs'
                                  )}
                                >
                                  {child.text}
                                </h4>

                                {/* Navigation arrow for active child */}
                                {isChildActive && (
                                  <div className="ml-auto">
                                    <svg
                                      className="w-3 h-3 text-primary"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer with reading progress */}
        {enableScrollTracking && !usingSections && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{groupedHeadings.length} sections</span>
              <span>
                {activeId
                  ? `Reading section ${
                      groupedHeadings.findIndex(
                        (g) =>
                          g.id === activeId ||
                          (isGroupedHeading(g) &&
                            g.children?.some((c: TOCHeading) => c.id === activeId))
                      ) + 1
                    } of ${groupedHeadings.length}`
                  : 'Start reading'}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-2 w-full bg-muted rounded-full h-1">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{
                  width: activeId
                    ? `${
                        ((groupedHeadings.findIndex(
                          (g) =>
                            g.id === activeId ||
                            (isGroupedHeading(g) &&
                              g.children?.some((c: TOCHeading) => c.id === activeId))
                        ) +
                          1) /
                          groupedHeadings.length) *
                        100
                      }%`
                    : '0%',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to find parent H2 for a subheading
function findParentH2(headings: TOCHeading[], subheading: TOCHeading): TOCHeading | null {
  const subheadingIndex = headings.findIndex((h) => h.id === subheading.id);

  // Look backwards for the nearest H2
  for (let i = subheadingIndex - 1; i >= 0; i--) {
    if (headings[i].level === 2) {
      return headings[i];
    }
  }

  return null;
}
