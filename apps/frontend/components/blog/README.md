# Blog Components

Professional blog content components adapted from QuoteKit with Resume-Matcher branding and design system.

## Overview

This directory contains enhanced blog components that improve the reading experience, content organization, and accessibility of the Resume-Matcher blog system.

## Components

### Callout Components (`/callouts/`)

Visual emphasis components for highlighting important information.

#### Available Variants:

- **InfoCallout** - General information and contextual details
- **WarningCallout** - Alerts and important considerations
- **SuccessCallout** - Positive outcomes and achievements
- **ErrorCallout** - Problems and critical issues
- **TipCallout** - Pro tips and best practices
- **CelebrationCallout** - Achievements and milestones
- **ChallengeCallout** - Obstacles and challenges
- **MotivationCallout** - Inspirational content
- **QuestCallout** - Learning journeys and processes
- **RewardCallout** - Benefits and positive outcomes

#### Usage:

```tsx
import { InfoCallout, WarningCallout, TipCallout } from '@/components/blog/callouts';

<InfoCallout>
  This is important information for readers to know.
</InfoCallout>

<TipCallout title="Pro Tip">
  Custom title for your tip callout.
</TipCallout>
```

### Table of Contents

Automatic navigation generation for long-form content.

#### Features:

- Extracts headings automatically from DOM
- Hierarchical accordion structure (H2 with collapsible H3+)
- Smooth scroll navigation
- Reading progress tracking
- Mobile responsive

#### Usage:

```tsx
import TableOfContents from '@/components/blog/table-of-contents';

<TableOfContents
  title="Article Navigation"
  subtitle="Jump to any section"
  enableScrollTracking={true}
/>;
```

### Key Takeaways

Highlighted summary sections for quick understanding.

#### Features:

- Visual distinction with gradient background
- Check icons for visual appeal
- SEO structured data
- Can use children or items array

#### Usage:

```tsx
import { KeyTakeaways, TLDR } from '@/components/blog/key-takeaways';

<KeyTakeaways
  items={[
    "First key point from the article",
    "Second important takeaway",
    "Third critical insight"
  ]}
/>

<TLDR>
  Quick inline summary for readers.
</TLDR>
```

### FAQ Accordion

Expandable FAQ sections with structured data.

#### Features:

- Single or multiple item expansion modes
- Category grouping support
- Keyboard navigation
- Screen reader friendly
- SEO structured data

#### Usage:

```tsx
import { FAQAccordion } from '@/components/blog/faq';

<FAQAccordion
  items={[
    {
      id: 'faq-1',
      question: 'What is Resume-Matcher?',
      answer: 'An AI-powered platform for optimizing résumés...',
    },
  ]}
  allowMultipleOpen={true}
  showCategories={true}
/>;
```

## Design System

All components follow the Resume-Matcher design system:

- **Colors**: Uses primary CSS variables (indigo-based theme)
- **Typography**: Geist font family
- **Spacing**: Consistent Tailwind spacing
- **Dark Mode**: Full dark mode support
- **Accessibility**: WCAG AAA compliant

## Development

### Testing Components

Use the test component to verify functionality:

```tsx
import BlogComponentsTest from '@/components/blog/test-components';

// In development only
<BlogComponentsTest />;
```

### TOC Debug Component

Development tool for debugging Table of Contents:

```tsx
import { TOCDebug } from '@/components/blog/toc-debug';

// Only renders in development
<TOCDebug />;
```

## File Structure

```
components/blog/
├── callouts/           # Callout variants
│   ├── callout.tsx    # Base callout component
│   ├── info-callout.tsx
│   ├── warning-callout.tsx
│   └── ...
├── faq/               # FAQ components
│   ├── faq-accordion.tsx
│   └── index.ts
├── table-of-contents.tsx
├── key-takeaways.tsx
├── toc-debug.tsx      # Development tool
├── test-components.tsx # Testing component
├── index.ts          # Main exports
└── README.md         # This file
```

## Integration

All components are:

- **TypeScript**: Fully typed with proper interfaces
- **Next.js 15**: Compatible with app router and server components
- **Responsive**: Mobile-first design
- **Accessible**: ARIA attributes and keyboard navigation
- **SEO Optimized**: Structured data where applicable

## Examples

### Complete Blog Post Structure

```tsx
import { InfoCallout, TableOfContents, KeyTakeaways, FAQAccordion } from '@/components/blog';

export default function BlogPost({ content }) {
  return (
    <article>
      <TableOfContents />

      <InfoCallout>This article covers advanced résumé optimization techniques.</InfoCallout>

      {/* Article content */}

      <KeyTakeaways
        items={[
          'Use action verbs in bullet points',
          'Quantify achievements with numbers',
          'Tailor content to job descriptions',
        ]}
      />

      <FAQAccordion items={faqData} />
    </article>
  );
}
```

## Brand Adaptation

Components have been adapted from QuoteKit to use Resume-Matcher branding:

- **Colors**: Indigo-based primary colors instead of forest green
- **Icons**: Lucide React icons for consistency
- **Typography**: Geist font family
- **Layout**: Optimized for career advice content

All components maintain the same functionality and accessibility features as the original QuoteKit components while fitting seamlessly into the Resume-Matcher design system.
