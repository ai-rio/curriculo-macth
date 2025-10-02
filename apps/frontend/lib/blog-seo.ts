import { BlogPost } from './blog-utils';

export interface StructuredData {
  '@context': string;
  '@type': string;
  headline?: string;
  description?: string;
  image?: string[];
  datePublished?: string;
  dateModified?: string;
  author?: {
    '@type': string;
    name: string;
    url?: string;
  }[];
  publisher?: {
    '@type': string;
    name: string;
    logo?: {
      '@type': string;
      url: string;
    };
  };
  mainEntityOfPage?: {
    '@type': string;
    '@id': string;
  };
  url?: string;
  articleBody?: string;
  keywords?: string[];
  articleSection?: string;
  wordCount?: number;
  timeRequired?: string;
  about?: string[];
  educationalLevel?: string;
  teaches?: string[];
  learningResourceType?: string;
  audience?: {
    '@type': string;
    audienceType: string;
  };
  inLanguage?: string;
  isAccessibleForFree?: boolean;
  offers?: {
    '@type': string;
    priceCurrency: string;
    price: string;
    availability: string;
    validFrom: string;
  };
}

export interface BlogPageSEO {
  title: string;
  description: string;
  canonical: string;
  openGraph: {
    title: string;
    description: string;
    url: string;
    type: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
    locale: string;
    siteName: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    images: string[];
    creator: string;
    site: string;
  };
  structuredData: StructuredData;
  alternates: {
    canonical: string;
    languages: Record<string, string>;
  };
  robots: {
    index: boolean;
    follow: boolean;
    googleBot: {
      index: boolean;
      follow: boolean;
      'max-video-preview': number;
      'max-image-preview': string;
      'max-snippet': number;
    };
  };
}

export class BlogSEOGenerator {
  private static readonly SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://resume-matcher.com';
  private static readonly SITE_NAME = 'Resume-Matcher';
  private static readonly TWITTER_HANDLE = '@resumematcher';
  private static readonly DEFAULT_IMAGE = '/images/blog-default-og.jpg';

  /**
   * Generates complete SEO metadata for a blog post
   */
  static generateBlogPostSEO(post: BlogPost, locale: string): BlogPageSEO {
    const postUrl = `${this.SITE_URL}/${locale}/blog/${post.slug}`;
    const canonicalUrl = `${this.SITE_URL}/blog/${post.slug}`; // Default to Portuguese canonical
    const isPremium = post.featured; // Assuming featured posts are premium for now

    const title = this.optimizeTitle(post.title, locale);
    const description = this.optimizeDescription(post.description, locale);

    return {
      title,
      description,
      canonical: canonicalUrl,
      openGraph: {
        title,
        description,
        url: postUrl,
        type: 'article',
        images: [
          {
            url: this.generatePostImage(post, locale),
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        locale: locale,
        siteName: this.SITE_NAME,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [this.generatePostImage(post, locale)],
        creator: this.TWITTER_HANDLE,
        site: this.TWITTER_HANDLE,
      },
      structuredData: this.generateStructuredData(post, locale, postUrl),
      alternates: {
        canonical: canonicalUrl,
        languages: {
          'pt-br': `${this.SITE_URL}/pt-br/blog/${post.slug}`,
          en: `${this.SITE_URL}/en/blog/${post.slug}`,
        },
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }

  /**
   * Generates SEO metadata for blog listing page
   */
  static generateBlogListingSEO(locale: string, page: number = 1): BlogPageSEO {
    const isPaginated = page > 1;
    const listUrl =
      page > 1 ? `${this.SITE_URL}/${locale}/blog?page=${page}` : `${this.SITE_URL}/${locale}/blog`;
    const canonicalUrl = page > 1 ? `${this.SITE_URL}/blog?page=${page}` : `${this.SITE_URL}/blog`;

    const title = this.generateListingTitle(locale, isPaginated, page);
    const description = this.generateListingDescription(locale);

    return {
      title,
      description,
      canonical: canonicalUrl,
      openGraph: {
        title,
        description,
        url: listUrl,
        type: 'website',
        images: [
          {
            url: `${this.SITE_URL}${this.DEFAULT_IMAGE}`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: locale,
        siteName: this.SITE_NAME,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${this.SITE_URL}${this.DEFAULT_IMAGE}`],
        creator: this.TWITTER_HANDLE,
        site: this.TWITTER_HANDLE,
      },
      structuredData: this.generateBlogListingStructuredData(locale, listUrl),
      alternates: {
        canonical: canonicalUrl,
        languages: {
          'pt-br': `${this.SITE_URL}/pt-br/blog${page > 1 ? `?page=${page}` : ''}`,
          en: `${this.SITE_URL}/en/blog${page > 1 ? `?page=${page}` : ''}`,
        },
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }

  /**
   * Generates structured data for blog posts
   */
  private static generateStructuredData(
    post: BlogPost,
    locale: string,
    url: string
  ): StructuredData {
    const baseData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.lastModified || post.date,
      author: [
        {
          '@type': 'Organization',
          name: post.author?.name || this.SITE_NAME,
          url: this.SITE_URL,
        },
      ],
      publisher: {
        '@type': 'Organization',
        name: this.SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${this.SITE_URL}/images/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
      url,
      articleBody: post.content.replace(/<[^>]*>/g, '').substring(0, 500),
      keywords: post.tags,
      articleSection: this.getCategoryName(post.category, locale),
      wordCount: post.content.split(/\s+/).length,
      timeRequired: `PT${post.readingTime}M`,
      inLanguage: locale,
      isAccessibleForFree: !post.featured,
    };

    // Add educational context for career-related content
    if (this.isCareerRelatedContent(post.category)) {
      baseData.about = [
        'https://schema.org/Career',
        'https://schema.org/Education',
        'https://schema.org/JobPosting',
      ];
      baseData.audience = {
        '@type': 'EducationalAudience',
        audienceType: 'Job Seekers and Career Professionals',
      };
    }

    // Add premium content pricing
    if (post.featured) {
      baseData.offers = {
        '@type': 'Offer',
        priceCurrency: 'BRL',
        price: '29.00',
        availability: 'https://schema.org/InStock',
        validFrom: post.date,
      };
    }

    return baseData;
  }

  /**
   * Generates structured data for blog listing pages
   */
  private static generateBlogListingStructuredData(locale: string, url: string): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      description: this.generateListingDescription(locale),
      url,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: 0, // This would be populated with actual count
        itemListElement: [], // This would be populated with actual posts
      },
      inLanguage: locale,
      isAccessibleForFree: true,
    } as any;
  }

  /**
   * Optimizes title for SEO
   */
  private static optimizeTitle(title: string, locale: string): string {
    // Add SEO modifiers based on locale
    const seoAddons =
      locale === 'pt-br'
        ? [' - Guia Completo', ' - Dicas Essenciais', ' - Aprenda Agora']
        : [' - Complete Guide', ' - Essential Tips', ' - Learn Now'];

    const currentLength = title.length;

    // If title is too short, add SEO modifier
    if (currentLength < 40) {
      const modifier = seoAddons[Math.floor(Math.random() * seoAddons.length)];
      return title + modifier;
    }

    // If title is too long, truncate it
    if (currentLength > 60) {
      return title.substring(0, 57) + '...';
    }

    return title;
  }

  /**
   * Optimizes description for SEO
   */
  private static optimizeDescription(description: string, locale: string): string {
    // Ensure description has call-to-action
    const callToAction =
      locale === 'pt-br'
        ? ' Aprenda como otimizar seu currículo e conseguir mais entrevistas.'
        : ' Learn how to optimize your resume and land more interviews.';

    const currentLength = description.length;

    if (currentLength < 120) {
      return description + callToAction;
    }

    if (currentLength > 160) {
      return description.substring(0, 157) + '...';
    }

    return description;
  }

  /**
   * Generates blog post image URL
   */
  private static generatePostImage(post: BlogPost, locale: string): string {
    // In a real implementation, this would generate dynamic images
    // For now, return a default image
    return `${this.SITE_URL}${this.DEFAULT_IMAGE}`;
  }

  /**
   * Gets category name in the specified locale
   */
  private static getCategoryName(category: string, locale: string): string {
    const categories: Record<string, Record<string, string>> = {
      'pt-br': {
        atsOptimization: 'Otimização para ATS',
        resumeWriting: 'Elaboração de Currículos',
        interviewPrep: 'Preparação para Entrevistas',
        careerAdvice: 'Conselhos de Carreira',
        jobSearch: 'Busca de Emprego',
        marketTrends: 'Tendências do Mercado',
      },
      en: {
        atsOptimization: 'ATS Optimization',
        resumeWriting: 'Resume Writing',
        interviewPrep: 'Interview Preparation',
        careerAdvice: 'Career Advice',
        jobSearch: 'Job Search',
        marketTrends: 'Market Trends',
      },
    };

    return categories[locale]?.[category] || category;
  }

  /**
   * Checks if content is career-related
   */
  private static isCareerRelatedContent(category: string): boolean {
    return [
      'atsOptimization',
      'resumeWriting',
      'interviewPrep',
      'careerAdvice',
      'jobSearch',
    ].includes(category);
  }

  /**
   * Generates listing page title
   */
  private static generateListingTitle(
    locale: string,
    isPaginated: boolean = false,
    page: number = 1
  ): string {
    const baseTitle =
      locale === 'pt-br' ? 'Blog de Carreiras - Resume-Matcher' : 'Career Blog - Resume-Matcher';

    if (isPaginated && page > 1) {
      return locale === 'pt-br'
        ? `Blog de Carreiras - Página ${page} - Resume-Matcher`
        : `Career Blog - Page ${page} - Resume-Matcher`;
    }

    return baseTitle;
  }

  /**
   * Generates listing page description
   */
  private static generateListingDescription(locale: string): string {
    return locale === 'pt-br'
      ? 'Dicas, guias e estratégias para otimizar seu currículo, passar em entrevistas e alavancar sua carreira. Conteúdo especializado para o mercado brasileiro.'
      : 'Tips, guides, and strategies to optimize your resume, ace interviews, and boost your career. Specialized content for job seekers.';
  }

  /**
   * Generates sitemap entries for blog content
   */
  static generateSitemapEntries(
    posts: BlogPost[],
    locale: string
  ): Array<{
    url: string;
    lastModified: string;
    changeFrequency: string;
    priority: string;
  }> {
    return posts.map((post) => ({
      url: `${this.SITE_URL}/${locale}/blog/${post.slug}`,
      lastModified: post.lastModified || post.date,
      changeFrequency: post.featured ? 'weekly' : 'monthly',
      priority: post.featured ? '0.8' : '0.6',
    }));
  }

  /**
   * Generates breadcrumb structured data
   */
  static generateBreadcrumbStructuredData(
    breadcrumbs: Array<{
      name: string;
      url: string;
    }>
  ): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((breadcrumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: breadcrumb.name,
        item: breadcrumb.url,
      })),
    } as any;
  }

  /**
   * Generates FAQ structured data for FAQ content
   */
  static generateFAQStructuredData(
    faqs: Array<{
      question: string;
      answer: string;
    }>
  ): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    } as any;
  }
}

export default BlogSEOGenerator;
