const fs = require('fs');
const path = require('path');
const matter = 'gray-matter';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://resume-matcher.com';
const CONTENT_PATH = path.join(process.cwd(), 'content', 'blog');

/**
 * Generates sitemap for blog content
 */
class BlogSitemapGenerator {
  constructor() {
    this.locales = ['pt-br', 'en'];
    this.posts = new Map();
  }

  /**
   * Reads all blog posts from content directory
   */
  async readAllPosts() {
    console.log('📖 Reading blog content...');

    for (const locale of this.locales) {
      const localePath = path.join(CONTENT_PATH, locale);
      this.posts.set(locale, []);

      if (fs.existsSync(localePath)) {
        const fileNames = fs.readdirSync(localePath).filter((name) => name.endsWith('.mdx'));

        for (const fileName of fileNames) {
          try {
            const slug = fileName.replace(/\.mdx$/, '');
            const fullPath = path.join(localePath, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const matterResult = matter(fileContents);

            const post = {
              slug,
              title: matterResult.data.title || slug,
              description: matterResult.data.description || '',
              date: matterResult.data.date || new Date().toISOString(),
              lastModified: matterResult.data.lastModified || matterResult.data.date,
              category: matterResult.data.category || 'careerAdvice',
              featured: matterResult.data.featured || false,
              locale,
            };

            this.posts.get(locale).push(post);
          } catch (error) {
            console.error(`Error reading file ${fileName}:`, error);
          }
        }

        // Sort posts by date (newest first)
        this.posts.set(
          locale,
          this.posts.get(locale).sort((a, b) => (a.date < b.date ? 1 : -1))
        );

        console.log(`  ✓ ${locale}: ${this.posts.get(locale).length} posts`);
      } else {
        console.log(`  ⚠️  ${locale}: No directory found`);
      }
    }
  }

  /**
   * Generates XML sitemap for blog content
   */
  generateSitemap() {
    console.log('\n🗺️  Generating sitemap...');

    const sitemapStart = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    const sitemapEnd = '</urlset>';

    const urls = [];

    // Generate URLs for each post
    for (const locale of this.locales) {
      const posts = this.posts.get(locale) || [];

      for (const post of posts) {
        const url = this.generatePostURL(post);
        urls.push(url);
      }
    }

    // Add blog listing pages
    urls.push(this.generateBlogListingURL('pt-br'));
    urls.push(this.generateBlogListingURL('en'));

    // Add category pages
    const categories = [
      'atsOptimization',
      'resumeWriting',
      'interviewPrep',
      'careerAdvice',
      'jobSearch',
      'marketTrends',
    ];
    for (const locale of this.locales) {
      for (const category of categories) {
        urls.push(this.generateCategoryURL(category, locale));
      }
    }

    const sitemapContent = sitemapStart + urls.join('\n') + sitemapEnd;

    return sitemapContent;
  }

  /**
   * Generates URL entry for a blog post
   */
  generatePostURL(post) {
    const url = `${SITE_URL}/${post.locale}/blog/${post.slug}`;
    const changeFrequency = post.featured ? 'weekly' : 'monthly';
    const priority = post.featured ? '0.8' : '0.6';

    // Get alternate language versions
    const alternatePosts = [];
    for (const locale of this.locales) {
      if (locale !== post.locale) {
        const alternatePost = this.findAlternatePost(post.slug, locale);
        if (alternatePost) {
          alternatePosts.push(`
    <xhtml:link rel="alternate" hreflang="${locale}" href="${SITE_URL}/${locale}/blog/${alternatePost.slug}" />`);
        }
      }
    }

    // Add canonical link
    const canonicalLink =
      post.locale === 'pt-br'
        ? ''
        : `
    <xhtml:link rel="alternate" hreflang="pt-br" href="${SITE_URL}/pt-br/blog/${post.slug}" />`;

    return `
  <url>
    <loc>${url}</loc>
    <lastmod>${post.lastModified}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>${canonicalLink}${alternatePosts.join('')}
  </url>`;
  }

  /**
   * Generates URL entry for blog listing page
   */
  generateBlogListingURL(locale) {
    const url = `${SITE_URL}/${locale}/blog`;

    const alternateLinks = this.locales
      .filter((l) => l !== locale)
      .map(
        (l) => `
    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}/${l}/blog" />`
      )
      .join('');

    const canonicalLink =
      locale === 'pt-br'
        ? ''
        : `
    <xhtml:link rel="alternate" hreflang="pt-br" href="${SITE_URL}/pt-br/blog" />`;

    return `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>${canonicalLink}${alternateLinks}
  </url>`;
  }

  /**
   * Generates URL entry for category page
   */
  generateCategoryURL(category, locale) {
    const url = `${SITE_URL}/${locale}/blog?category=${category}`;

    const alternateLinks = this.locales
      .filter((l) => l !== locale)
      .map(
        (l) => `
    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}/${l}/blog?category=${category}" />`
      )
      .join('');

    const canonicalLink =
      locale === 'pt-br'
        ? ''
        : `
    <xhtml:link rel="alternate" hreflang="pt-br" href="${SITE_URL}/pt-br/blog?category=${category}" />`;

    return `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${canonicalLink}${alternateLinks}
  </url>`;
  }

  /**
   * Finds alternate language version of a post
   */
  findAlternatePost(slug, locale) {
    const posts = this.posts.get(locale) || [];
    return posts.find((post) => post.slug === slug);
  }

  /**
   * Saves sitemap to public directory
   */
  async saveSitemap() {
    const sitemapContent = this.generateSitemap();
    const sitemapPath = path.join(process.cwd(), 'public', 'blog-sitemap.xml');

    try {
      fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
      console.log(`✅ Sitemap saved to: ${sitemapPath}`);
      console.log(`📊 Total URLs: ${sitemapContent.split('<url>').length - 1}`);
    } catch (error) {
      console.error('❌ Error saving sitemap:', error);
    }
  }

  /**
   * Generates robots.txt entries
   */
  generateRobotsEntries() {
    return `
# Blog sitemap
Sitemap: ${SITE_URL}/blog-sitemap.xml

# Allow search engines to crawl blog content
Allow: /blog/
Allow: /pt-br/blog/
Allow: /en/blog/

# Block admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /static/`;
  }

  /**
   * Updates robots.txt with blog entries
   */
  async updateRobotsTxt() {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    const robotsEntries = this.generateRobotsEntries();

    try {
      let existingContent = '';
      if (fs.existsSync(robotsPath)) {
        existingContent = fs.readFileSync(robotsPath, 'utf8');
      }

      // Check if blog entries already exist
      if (existingContent.includes('# Blog sitemap')) {
        console.log('ℹ️  Blog entries already exist in robots.txt');
        return;
      }

      const updatedContent = existingContent + '\n' + robotsEntries;
      fs.writeFileSync(robotsPath, updatedContent, 'utf8');
      console.log('✅ robots.txt updated with blog entries');
    } catch (error) {
      console.error('❌ Error updating robots.txt:', error);
    }
  }

  /**
   * Generates sitemap index file
   */
  generateSitemapIndex() {
    const currentDate = new Date().toISOString();

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/blog-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;
  }

  /**
   * Updates sitemap index if it exists
   */
  async updateSitemapIndex() {
    const sitemapIndexPath = path.join(process.cwd(), 'public', 'sitemap-index.xml');

    try {
      const indexContent = this.generateSitemapIndex();
      fs.writeFileSync(sitemapIndexPath, indexContent, 'utf8');
      console.log('✅ Sitemap index updated');
    } catch (error) {
      console.error('❌ Error updating sitemap index:', error);
    }
  }

  /**
   * Runs the complete sitemap generation process
   */
  async generate() {
    console.log('🚀 Starting blog sitemap generation...\n');

    await this.readAllPosts();
    await this.saveSitemap();
    await this.updateRobotsTxt();
    await this.updateSitemapIndex();

    console.log('\n✨ Blog sitemap generation completed!');
    console.log('\n📋 Summary:');

    let totalPosts = 0;
    for (const locale of this.locales) {
      const count = this.posts.get(locale)?.length || 0;
      totalPosts += count;
      console.log(`  ${locale}: ${count} posts`);
    }

    console.log(`  Total: ${totalPosts} posts`);
    console.log(`  Sitemap: ${SITE_URL}/blog-sitemap.xml`);
  }
}

// Command line interface
async function main() {
  const generator = new BlogSitemapGenerator();

  try {
    await generator.generate();
  } catch (error) {
    console.error('❌ Sitemap generation failed:', error);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📖 Blog Sitemap Generator

Usage:
  node scripts/generate-blog-sitemap.js [options]

Options:
  --help, -h     Show this help message

Description:
  Generates XML sitemap for blog content with multilingual support.
  Updates robots.txt and sitemap index automatically.

Output:
  - public/blog-sitemap.xml
  - public/robots.txt (updated)
  - public/sitemap-index.xml (updated)
`);
  process.exit(0);
}

// Run the generator
if (require.main === module) {
  main();
}

module.exports = BlogSitemapGenerator;
