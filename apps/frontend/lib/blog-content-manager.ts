import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

import { BlogPost } from './blog-utils';
import { BlogContentValidator } from './blog-validation';

export interface ContentStats {
  totalPosts: number;
  postsByLocale: Record<string, number>;
  postsByCategory: Record<string, number>;
  featuredPosts: number;
  averageReadingTime: number;
  lastUpdated: string;
}

export interface TranslationStatus {
  slug: string;
  ptBrExists: boolean;
  enExists: boolean;
  isComplete: boolean;
  missingIn: string[];
  lastModifiedPt?: string;
  lastModifiedEn?: string;
}

export interface ContentTask {
  id: string;
  type: 'create' | 'translate' | 'update' | 'review';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export class BlogContentManager {
  private static readonly CONTENT_PATH = path.join(process.cwd(), 'content', 'blog');
  private static readonly LOCALES = ['pt-br', 'en'];
  private static readonly CATEGORIES = [
    'atsOptimization',
    'resumeWriting',
    'interviewPrep',
    'careerAdvice',
    'jobSearch',
    'marketTrends',
  ];

  /**
   * Gets comprehensive content statistics
   */
  static getContentStats(): ContentStats {
    const stats: ContentStats = {
      totalPosts: 0,
      postsByLocale: {},
      postsByCategory: {},
      featuredPosts: 0,
      averageReadingTime: 0,
      lastUpdated: '',
    };

    let totalReadingTime = 0;
    let postCount = 0;
    let latestDate = '';

    this.LOCALES.forEach((locale) => {
      const localePath = path.join(this.CONTENT_PATH, locale);
      stats.postsByLocale[locale] = 0;

      if (fs.existsSync(localePath)) {
        const posts = this.getAllPostsFromDirectory(localePath);
        stats.postsByLocale[locale] = posts.length;
        stats.totalPosts += posts.length;

        posts.forEach((post) => {
          // Count by category
          stats.postsByCategory[post.category] = (stats.postsByCategory[post.category] || 0) + 1;

          // Count featured posts
          if (post.featured) {
            stats.featuredPosts++;
          }

          // Calculate reading time
          totalReadingTime += post.readingTime;
          postCount++;

          // Track latest update
          if (post.lastModified && post.lastModified > latestDate) {
            latestDate = post.lastModified;
          }
        });
      }
    });

    stats.averageReadingTime = postCount > 0 ? Math.round(totalReadingTime / postCount) : 0;
    stats.lastUpdated = latestDate;

    return stats;
  }

  /**
   * Gets translation status for all posts
   */
  static getTranslationStatus(): TranslationStatus[] {
    const allSlugs = new Set<string>();
    const postsByLocale: Record<string, Record<string, BlogPost>> = {};

    // Collect all slugs and posts
    this.LOCALES.forEach((locale) => {
      postsByLocale[locale] = {};
      const localePath = path.join(this.CONTENT_PATH, locale);

      if (fs.existsSync(localePath)) {
        const posts = this.getAllPostsFromDirectory(localePath);
        posts.forEach((post) => {
          allSlugs.add(post.slug);
          postsByLocale[locale][post.slug] = post;
        });
      }
    });

    // Analyze translation status
    const translationStatuses: TranslationStatus[] = [];

    allSlugs.forEach((slug) => {
      const ptPost = postsByLocale['pt-br']?.[slug];
      const enPost = postsByLocale['en']?.[slug];

      const status: TranslationStatus = {
        slug,
        ptBrExists: !!ptPost,
        enExists: !!enPost,
        isComplete: !!ptPost && !!enPost,
        missingIn: [],
        lastModifiedPt: ptPost?.lastModified,
        lastModifiedEn: enPost?.lastModified,
      };

      if (!ptPost) status.missingIn.push('pt-br');
      if (!enPost) status.missingIn.push('en');

      translationStatuses.push(status);
    });

    return translationStatuses.sort((a, b) => a.slug.localeCompare(b.slug));
  }

  /**
   * Creates content tasks based on analysis
   */
  static generateContentTasks(): ContentTask[] {
    const tasks: ContentTask[] = [];
    const translationStatuses = this.getTranslationStatus();

    // Tasks for missing translations
    translationStatuses.forEach((status) => {
      if (!status.isComplete) {
        if (status.ptBrExists && !status.enExists) {
          tasks.push({
            id: `translate-${status.slug}-en`,
            type: 'translate',
            title: `Traduzir "${status.slug}" para inglês`,
            description: `Traduzir post "${status.slug}" do português para o inglês`,
            priority: 'medium',
            status: 'pending',
            createdAt: new Date().toISOString(),
          });
        } else if (!status.ptBrExists && status.enExists) {
          tasks.push({
            id: `translate-${status.slug}-pt`,
            type: 'translate',
            title: `Traduzir "${status.slug}" para português`,
            description: `Traduzir post "${status.slug}" do inglês para o português`,
            priority: 'high',
            status: 'pending',
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    // Tasks for content review
    this.LOCALES.forEach((locale) => {
      const localePath = path.join(this.CONTENT_PATH, locale);
      if (fs.existsSync(localePath)) {
        const posts = this.getAllPostsFromDirectory(localePath);

        posts.forEach((post) => {
          const validation = BlogContentValidator.validatePost(post);
          if (validation.score < 70) {
            tasks.push({
              id: `review-${post.slug}-${locale}`,
              type: 'review',
              title: `Revisar "${post.title}"`,
              description: `Post precisa de melhorias de SEO/qualidade (score: ${validation.score})`,
              priority: 'high',
              status: 'pending',
              createdAt: new Date().toISOString(),
            });
          }
        });
      }
    });

    // Tasks for creating content in missing categories
    const stats = this.getContentStats();
    this.CATEGORIES.forEach((category) => {
      const categoryCount = stats.postsByCategory[category] || 0;
      if (categoryCount < 2) {
        tasks.push({
          id: `create-${category}`,
          type: 'create',
          title: `Criar conteúdo para categoria "${category}"`,
          description: `A categoria "${category}" precisa de mais conteúdo (${categoryCount} posts)`,
          priority: 'medium',
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }
    });

    return tasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Syncs content between locales
   */
  static syncContent(primaryLocale: string = 'pt-br'): void {
    const primaryPath = path.join(this.CONTENT_PATH, primaryLocale);

    if (!fs.existsSync(primaryPath)) {
      throw new Error(`Primary locale directory not found: ${primaryPath}`);
    }

    const primaryPosts = this.getAllPostsFromDirectory(primaryPath);

    primaryPosts.forEach((post) => {
      const targetLocale = primaryLocale === 'pt-br' ? 'en' : 'pt-br';
      const targetPath = path.join(this.CONTENT_PATH, targetLocale);

      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }

      const targetFilePath = path.join(targetPath, `${post.slug}.mdx`);

      if (!fs.existsSync(targetFilePath)) {
        // Create placeholder for translation
        const placeholderContent = `---
title: "[TRADUZIR] ${post.title}"
description: "[TRADUZIR] ${post.description}"
date: "${post.date}"
category: "${post.category}"
featured: ${post.featured}
author:
  name: "${post.author?.name || 'Resume-Matcher Team'}"
tags: ${JSON.stringify(post.tags || [])}
locale: "${targetLocale}"
status: "needs_translation"
---

# [TRADUZIR] ${post.title}

## Status
Este post precisa ser traduzido do ${primaryLocale} para ${targetLocale}.

## Conteúdo Original (${primaryLocale})
${post.content}

## Instruções de Tradução
1. Traduza o título e descrição
2. Adapte o conteúdo para o público ${targetLocale}
3. Mantenha a estrutura e formatação
4. Ajuste exemplos e referências culturais se necessário
5. Remova este bloco de instruções quando finalizado
`;

        fs.writeFileSync(targetFilePath, placeholderContent, 'utf8');
        console.log(`Created translation placeholder: ${targetFilePath}`);
      }
    });
  }

  /**
   * Validates all content
   */
  static validateAllContent(): Record<string, any> {
    const results: Record<string, any> = {};

    this.LOCALES.forEach((locale) => {
      const localePath = path.join(this.CONTENT_PATH, locale);

      if (fs.existsSync(localePath)) {
        const posts = this.getAllPostsFromDirectory(localePath);

        posts.forEach((post) => {
          const key = `${post.slug}-${locale}`;
          results[key] = BlogContentValidator.validatePost(post);
        });
      }
    });

    return results;
  }

  /**
   * Gets content recommendations
   */
  static getContentRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getContentStats();
    const translationStatuses = this.getTranslationStatus();

    // Content balance recommendations
    const ptBrCount = stats.postsByLocale['pt-br'] || 0;
    const enCount = stats.postsByLocale['en'] || 0;
    const total = ptBrCount + enCount;

    if (total > 0) {
      const ptBrPercentage = (ptBrCount / total) * 100;

      if (ptBrPercentage < 60) {
        recommendations.push('Aumentar conteúdo em português (meta: 70% pt-br, 30% en)');
      } else if (ptBrPercentage > 80) {
        recommendations.push('Adicionar mais conteúdo em inglês para melhor equilíbrio');
      }
    }

    // Category balance recommendations
    this.CATEGORIES.forEach((category) => {
      const count = stats.postsByCategory[category] || 0;
      if (count === 0) {
        recommendations.push(`Criar conteúdo para categoria "${category}"`);
      } else if (count < 2) {
        recommendations.push(`Adicionar mais posts na categoria "${category}"`);
      }
    });

    // Translation completion recommendations
    const incompleteTranslations = translationStatuses.filter((s) => !s.isComplete);
    if (incompleteTranslations.length > 0) {
      recommendations.push(`Completar ${incompleteTranslations.length} traduções pendentes`);
    }

    // Content quality recommendations
    const validationResults = this.validateAllContent();
    const lowScorePosts = Object.entries(validationResults).filter(
      ([_, result]) => result.score < 70
    );

    if (lowScorePosts.length > 0) {
      recommendations.push(`Revisar ${lowScorePosts.length} posts com baixa qualidade SEO`);
    }

    // Featured content recommendations
    if (stats.featuredPosts < 3) {
      recommendations.push('Adicionar mais posts em destaque (mínimo recomendado: 3)');
    }

    return recommendations;
  }

  /**
   * Exports content analysis report
   */
  static exportAnalysisReport(): string {
    const stats = this.getContentStats();
    const translationStatuses = this.getTranslationStatus();
    const tasks = this.generateContentTasks();
    const recommendations = this.getContentRecommendations();

    const report = `# Relatório de Análise de Conteúdo do Blog
*Gerado em ${new Date().toLocaleString('pt-BR')}*

## 📊 Estatísticas Gerais

- **Total de Posts:** ${stats.totalPosts}
- **Posts em Português:** ${stats.postsByLocale['pt-br'] || 0}
- **Posts em Inglês:** ${stats.postsByLocale['en'] || 0}
- **Posts em Destaque:** ${stats.featuredPosts}
- **Tempo Médio de Leitura:** ${stats.averageReadingTime} minutos
- **Última Atualização:** ${stats.lastUpdated || 'N/A'}

## 📂 Conteúdo por Categoria

${Object.entries(stats.postsByCategory)
  .map(([category, count]) => `- **${category}:** ${count} posts`)
  .join('\n')}

## 🌐 Status de Tradução

${translationStatuses
  .map((status) => {
    const statusIcon = status.isComplete ? '✅' : '⚠️';
    const locales = [];
    if (status.ptBrExists) locales.push('PT-BR');
    if (status.enExists) locales.push('EN');

    return `${statusIcon} **${status.slug}** (${locales.join(', ')})${
      !status.isComplete ? ` - Faltando: ${status.missingIn.join(', ')}` : ''
    }`;
  })
  .join('\n')}

## 📋 Tarefas Pendentes

${tasks
  .map((task) => {
    const priorityIcon = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
    return `${priorityIcon} **${task.title}** (${task.type})
   ${task.description}`;
  })
  .join('\n\n')}

## 💡 Recomendações

${recommendations.map((rec) => `- ${rec}`).join('\n')}

---
*Relatório gerado automaticamente pelo Sistema de Gestão de Conteúdo*
`;

    return report;
  }

  /**
   * Helper method to get all posts from a directory
   */
  private static getAllPostsFromDirectory(dirPath: string): BlogPost[] {
    const posts: BlogPost[] = [];

    if (!fs.existsSync(dirPath)) {
      return posts;
    }

    const fileNames = fs.readdirSync(dirPath).filter((name) => name.endsWith('.mdx'));

    fileNames.forEach((fileName) => {
      try {
        const slug = fileName.replace(/\.mdx$/, '');
        const fullPath = path.join(dirPath, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        const wordCount = matterResult.content.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);

        posts.push({
          slug,
          title: matterResult.data.title || slug,
          description: matterResult.data.description || '',
          date: matterResult.data.date || new Date().toISOString(),
          readingTime,
          category: matterResult.data.category || 'careerAdvice',
          featured: matterResult.data.featured || false,
          content: matterResult.content,
          locale: path.basename(dirPath),
          author: matterResult.data.author,
          tags: matterResult.data.tags || [],
          lastModified: matterResult.data.lastModified,
        });
      } catch (error) {
        console.error(`Error reading file ${fileName}:`, error);
      }
    });

    return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  }
}

export default BlogContentManager;
