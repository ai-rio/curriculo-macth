'use client';

import { useEffect, useState } from 'react';

import { processMarkdownContentSync } from '@/lib/markdown-processor';

interface BlogContentProps {
  content: string;
  className?: string;
}

export default function BlogContent({ content, className = '' }: BlogContentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Show a placeholder during hydration to avoid mismatch
    return (
      <div className={`prose prose-lg max-w-none ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <div
        dangerouslySetInnerHTML={{
          __html: processMarkdownContentSync(content),
        }}
      />
    </div>
  );
}
