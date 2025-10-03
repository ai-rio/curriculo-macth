'use client';

import { useEffect, useState } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import { processMarkdownContentSync } from '@/lib/markdown-processor';
import { cn } from '@/lib/utils';

interface EnhancedBlogContentProps {
  content: string;
  className?: string;
  enableTableOfContents?: boolean;
  enableCodeHighlight?: boolean;
  enableMath?: boolean;
}

// Custom MDX components with enhanced styling
const mdxComponents = {
  // Enhanced typography with better hierarchy
  h1: ({ children, id, ...props }: any) => (
    <h1
      id={id}
      className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 mt-12 first:mt-0 scroll-mt-24"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, id, ...props }: any) => (
    <h2
      id={id}
      className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 mt-10 scroll-mt-24 border-b border-gray-200 pb-2"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, id, ...props }: any) => (
    <h3
      id={id}
      className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4 mt-8 scroll-mt-24"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, id, ...props }: any) => (
    <h4
      id={id}
      className="text-xl md:text-2xl font-semibold text-gray-900 mb-3 mt-6 scroll-mt-24"
      {...props}
    >
      {children}
    </h4>
  ),

  // Enhanced paragraphs with better readability
  p: ({ children, ...props }: any) => (
    <p className="text-lg leading-relaxed text-gray-700 mb-6" {...props}>
      {children}
    </p>
  ),

  // Enhanced lists with better spacing
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-inside text-lg text-gray-700 mb-6 space-y-2 ml-6" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-inside text-lg text-gray-700 mb-6 space-y-2 ml-6" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),

  // Enhanced blockquotes with better styling
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      className="
        border-l-4 
        border-blue-500 
        pl-6 
        py-4 
        mb-6 
        bg-blue-50 
        italic 
        text-lg 
        text-gray-700
        rounded-r-lg
        my-8
      "
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Enhanced inline code
  code: ({ children, className, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return !match ? (
      <code
        className="
          bg-gray-100 
          px-2 
          py-1 
          rounded 
          text-sm 
          font-mono 
          text-gray-800
          border
          border-gray-300
        "
        {...props}
      >
        {children}
      </code>
    ) : (
      <code className={cn('hljs', className)} {...props}>
        {children}
      </code>
    );
  },

  // Enhanced pre blocks with better styling
  pre: ({ children, ...props }: any) => (
    <pre
      className="
        bg-gray-900 
        text-gray-100 
        p-6 
        rounded-lg 
        mb-6 
        overflow-x-auto
        border
        border-gray-700
        shadow-lg
        text-sm
        leading-relaxed
      "
      {...props}
    >
      {children}
    </pre>
  ),

  // Enhanced links with better hover states
  a: ({ href, children, ...props }: any) => (
    <a
      href={href}
      className="
        text-blue-600 
        hover:text-blue-800
        focus:text-blue-800
        focus:outline-2
        focus:outline-blue-600
        focus:outline-offset-2
        underline 
        transition-colors 
        duration-200
        font-medium
        decoration-2
        underline-offset-2
      "
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),

  // Enhanced images with better styling
  img: ({ src, alt, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      className="
        w-full 
        rounded-lg 
        mb-6 
        shadow-md 
        border 
        border-gray-200
        max-w-none
        h-auto
      "
      {...props}
    />
  ),

  // Enhanced horizontal rule
  hr: ({ ...props }) => (
    <hr
      className="
        border-gray-300 
        my-12
        border-t-2
      "
      {...props}
    />
  ),

  // Enhanced strong and em tags
  strong: ({ children, ...props }: any) => (
    <strong className="font-bold text-gray-900" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: any) => (
    <em className="italic text-gray-800" {...props}>
      {children}
    </em>
  ),

  // Enhanced tables
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full bg-white" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead className="bg-gray-50 border-b border-gray-200" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: any) => (
    <th
      className="
      text-left 
      p-4 
      text-lg 
      font-semibold 
      text-gray-900
      border-b 
      border-gray-200
    "
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td
      className="
      p-4 
      text-lg 
      text-gray-700 
      border-b 
      border-gray-100 
      last:border-b-0
    "
      {...props}
    >
      {children}
    </td>
  ),
};

export default function EnhancedBlogContent({
  content,
  className = '',
  enableTableOfContents = true,
  enableCodeHighlight = true,
  enableMath = false,
}: EnhancedBlogContentProps) {
  const [mounted, setMounted] = useState(false);
  const [serializedContent, setSerializedContent] = useState<any>(null);
  const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!content) return;

    const processContent = async () => {
      try {
        // Configure remark and rehype plugins with proper typing
        const remarkPlugins: any[] = [remarkGfm];
        const rehypePlugins: any[] = [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]];

        if (enableCodeHighlight) {
          rehypePlugins.push(rehypeHighlight as any);
        }

        if (enableMath) {
          remarkPlugins.push(remarkMath as any);
          rehypePlugins.push(rehypeKatex as any);
        }

        // Serialize the content
        const serialized = await serialize(content, {
          mdxOptions: {
            remarkPlugins,
            rehypePlugins,
          },
        });

        setSerializedContent(serialized);

        // Extract headings for table of contents
        if (enableTableOfContents) {
          const headingRegex = /^(#{1,6})\s+(.+)$/gm;
          const extractedHeadings: Array<{ id: string; text: string; level: number }> = [];
          let match;

          while ((match = headingRegex.exec(content)) !== null) {
            const level = match[1].length;
            const text = match[2].trim();
            const id = text
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-');

            extractedHeadings.push({ id, text, level });
          }

          setHeadings(extractedHeadings);
        }
      } catch (error) {
        console.error('Error processing MDX content:', error);
        // Fallback to basic markdown processing
        setSerializedContent(null);
      }
    };

    processContent();
  }, [content, enableTableOfContents, enableCodeHighlight, enableMath]);

  if (!mounted) {
    // Show a placeholder during hydration to avoid mismatch
    return (
      <div className={cn('prose prose-lg max-w-none', className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // If MDX serialization failed, fallback to basic markdown processing
  if (!serializedContent) {
    return (
      <div
        className={cn('prose prose-lg max-w-none', className)}
        dangerouslySetInnerHTML={{
          __html: processMarkdownContentSync(content),
        }}
      />
    );
  }

  return (
    <div className={cn('max-w-none', className)}>
      {/* Table of Contents */}
      {enableTableOfContents && headings.length > 0 && (
        <nav className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h3>
          <ul className="space-y-2">
            {headings.map((heading) => (
              <li
                key={heading.id}
                className={cn(
                  'text-gray-700 hover:text-gray-900 transition-colors',
                  heading.level === 1 && 'font-semibold',
                  heading.level === 2 && 'font-medium ml-4',
                  heading.level === 3 && 'ml-8',
                  heading.level === 4 && 'ml-12',
                  heading.level >= 5 && 'ml-16'
                )}
              >
                <a
                  href={`#${heading.id}`}
                  className="block py-1 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(heading.id);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* MDX Content */}
      <div className="prose prose-lg max-w-none">
        {serializedContent && <MDXRemote {...serializedContent} components={mdxComponents} />}
      </div>
    </div>
  );
}
