import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: number;
  category: string;
  featured?: boolean;
  content: string;
  locale: string;
  author?: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  tags?: string[];
  lastModified?: string;
}

const BLOG_CONTENT_PATH = path.join(process.cwd(), 'content/blog');

export function getAllBlogPosts(locale: string): BlogPost[] {
  try {
    const localePath = path.join(BLOG_CONTENT_PATH, locale);

    if (!fs.existsSync(localePath)) {
      return [];
    }

    const fileNames = fs.readdirSync(localePath);
    const allPostsData = fileNames
      .filter((name) => name.endsWith('.mdx'))
      .map((fileName) => {
        // Remove .mdx file extension to get slug
        const slug = fileName.replace(/\.mdx$/, '');
        const fullPath = path.join(localePath, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        // Calculate reading time (rough estimate: 200 words per minute)
        const wordCount = matterResult.content.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);

        return {
          slug,
          title: matterResult.data.title || slug,
          description: matterResult.data.description || '',
          date: matterResult.data.date || new Date().toISOString(),
          readingTime,
          category: matterResult.data.category || 'careerAdvice',
          featured: matterResult.data.featured || false,
          content: matterResult.content,
          locale,
          author: matterResult.data.author,
          tags: matterResult.data.tags || [],
          lastModified: matterResult.data.lastModified
        } as BlogPost;
      })
      // Sort posts by date (newest first)
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    return allPostsData;
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

export function getBlogPostBySlug(slug: string, locale: string): BlogPost | null {
  try {
    const fullPath = path.join(BLOG_CONTENT_PATH, locale, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    // Calculate reading time
    const wordCount = matterResult.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    return {
      slug,
      title: matterResult.data.title || slug,
      description: matterResult.data.description || '',
      date: matterResult.data.date || new Date().toISOString(),
      readingTime,
      category: matterResult.data.category || 'careerAdvice',
      featured: matterResult.data.featured || false,
      content: matterResult.content,
      locale,
      author: matterResult.data.author,
      tags: matterResult.data.tags || [],
      lastModified: matterResult.data.lastModified
    } as BlogPost;
  } catch (error) {
    console.error('Error reading blog post:', error);
    return null;
  }
}

export function getBlogPostsByCategory(category: string, locale: string): BlogPost[] {
  const allPosts = getAllBlogPosts(locale);

  if (category === 'all') {
    return allPosts;
  }

  return allPosts.filter(post => post.category === category);
}

export function getFeaturedBlogPosts(locale: string, limit = 3): BlogPost[] {
  const allPosts = getAllBlogPosts(locale);
  return allPosts.filter(post => post.featured).slice(0, limit);
}

export function getRelatedPosts(currentPost: BlogPost, limit = 3): BlogPost[] {
  const allPosts = getAllBlogPosts(currentPost.locale);

  return allPosts
    .filter(post =>
      post.slug !== currentPost.slug &&
      (post.category === currentPost.category ||
       post.tags?.some(tag => currentPost.tags?.includes(tag)))
    )
    .slice(0, limit);
}