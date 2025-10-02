'use client';

import { StructuredData } from '@/lib/blog-seo';

interface StructuredDataProps {
  data: StructuredData;
}

export default function StructuredDataComponent({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2),
      }}
    />
  );
}

// For multiple structured data objects
interface MultipleStructuredDataProps {
  data: StructuredData[];
}

export function MultipleStructuredData({ data }: MultipleStructuredDataProps) {
  return (
    <>
      {data.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item, null, 2),
          }}
        />
      ))}
    </>
  );
}
