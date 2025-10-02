import { BlogPost } from './blog-utils';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100 SEO score
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface SEORecommendation {
  type: 'title' | 'description' | 'content' | 'structure' | 'metadata';
  message: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
}

export class BlogContentValidator {
  private static readonly MIN_TITLE_LENGTH = 30;
  private static readonly MAX_TITLE_LENGTH = 60;
  private static readonly MIN_DESCRIPTION_LENGTH = 120;
  private static readonly MAX_DESCRIPTION_LENGTH = 160;
  private static readonly MIN_CONTENT_LENGTH = 300;
  private static readonly MIN_READING_TIME = 3;
  private static readonly MAX_READING_TIME = 15;

  /**
   * Validates blog post content and provides SEO recommendations
   */
  static validatePost(post: BlogPost): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let score = 100;

    // Title validation
    this.validateTitle(post.title, errors, warnings, score);

    // Description validation
    this.validateDescription(post.description, errors, warnings, score);

    // Content validation
    this.validateContent(post.content, errors, warnings, score);

    // Metadata validation
    this.validateMetadata(post, errors, warnings, score);

    // Calculate final score
    score = Math.max(0, 100 - errors.length * 15 - warnings.length * 5);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score,
    };
  }

  /**
   * Validates post title for SEO best practices
   */
  private static validateTitle(
    title: string,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    score: number
  ): void {
    if (!title || title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: 'O título é obrigatório',
        severity: 'error',
      });
      return;
    }

    if (title.length < this.MIN_TITLE_LENGTH) {
      warnings.push({
        field: 'title',
        message: `Título muito curto (${title.length} caracteres)`,
        suggestion: `Use entre ${this.MIN_TITLE_LENGTH}-${this.MAX_TITLE_LENGTH} caracteres para melhor SEO`,
      });
    }

    if (title.length > this.MAX_TITLE_LENGTH) {
      errors.push({
        field: 'title',
        message: `Título muito longo (${title.length} caracteres)`,
        severity: 'error',
      });
    }

    // Check for keywords
    if (!this.containsKeywords(title)) {
      warnings.push({
        field: 'title',
        message: 'Título não contém palavras-chave relevantes',
        suggestion: 'Inclua termos como "currículo", "ATS", "entrevista", "carreira"',
      });
    }

    // Check for clickbait patterns
    if (this.isClickbait(title)) {
      warnings.push({
        field: 'title',
        message: 'Título parece ser clickbait',
        suggestion: 'Use títulos informativos e honestos',
      });
    }
  }

  /**
   * Validates post description for SEO
   */
  private static validateDescription(
    description: string,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    score: number
  ): void {
    if (!description || description.trim().length === 0) {
      errors.push({
        field: 'description',
        message: 'A descrição é obrigatória',
        severity: 'error',
      });
      return;
    }

    if (description.length < this.MIN_DESCRIPTION_LENGTH) {
      warnings.push({
        field: 'description',
        message: `Descrição muito curta (${description.length} caracteres)`,
        suggestion: `Use entre ${this.MIN_DESCRIPTION_LENGTH}-${this.MAX_DESCRIPTION_LENGTH} caracteres`,
      });
    }

    if (description.length > this.MAX_DESCRIPTION_LENGTH) {
      errors.push({
        field: 'description',
        message: `Descrição muito longa (${description.length} caracteres)`,
        severity: 'error',
      });
    }

    // Check if description summarizes content well
    if (!this.containsKeywords(description)) {
      warnings.push({
        field: 'description',
        message: 'Descrição não contém palavras-chave relevantes',
        suggestion: 'Inclua termos relevantes para o conteúdo',
      });
    }
  }

  /**
   * Validates post content structure and quality
   */
  private static validateContent(
    content: string,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    score: number
  ): void {
    if (!content || content.trim().length === 0) {
      errors.push({
        field: 'content',
        message: 'O conteúdo é obrigatório',
        severity: 'error',
      });
      return;
    }

    const wordCount = content.split(/\s+/).length;

    if (wordCount < this.MIN_CONTENT_LENGTH) {
      errors.push({
        field: 'content',
        message: `Conteúdo muito curto (${wordCount} palavras)`,
        severity: 'error',
      });
    }

    // Check content structure
    const headings = content.match(/^#{1,6}\s.+$/gm) || [];
    if (headings.length < 3) {
      warnings.push({
        field: 'content',
        message: 'Conteúdo tem poucos subtítulos',
        suggestion: 'Use mais subtítulos para melhor legibilidade e SEO',
      });
    }

    // Check for lists
    const lists = content.match(/^\s*[-*+]\s+/gm) || content.match(/^\s*\d+\.\s+/gm) || [];
    if (lists.length === 0) {
      warnings.push({
        field: 'content',
        message: 'Conteúdo não contém listas',
        suggestion: 'Use listas para melhorar a legibilidade',
      });
    }

    // Check for bold/emphasis
    const emphasis = content.match(/\*\*.*?\*\*/g) || content.match(/\*.*?\*/g) || [];
    if (emphasis.length < 3) {
      warnings.push({
        field: 'content',
        message: 'Conteúdo tem pouca ênfase',
        suggestion: 'Use negrito para destacar pontos importantes',
      });
    }

    // Check reading time
    const readingTime = Math.ceil(wordCount / 200);
    if (readingTime < this.MIN_READING_TIME) {
      warnings.push({
        field: 'content',
        message: `Tempo de leitura muito curto (${readingTime} minutos)`,
        suggestion: 'Adicione mais conteúdo para um post mais completo',
      });
    }

    if (readingTime > this.MAX_READING_TIME) {
      warnings.push({
        field: 'content',
        message: `Tempo de leitura muito longo (${readingTime} minutos)`,
        suggestion: 'Considere dividir o conteúdo em múltiplos posts',
      });
    }
  }

  /**
   * Validates post metadata
   */
  private static validateMetadata(
    post: BlogPost,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    score: number
  ): void {
    // Category validation
    const validCategories = [
      'atsOptimization',
      'resumeWriting',
      'interviewPrep',
      'careerAdvice',
      'jobSearch',
      'marketTrends',
    ];

    if (!validCategories.includes(post.category)) {
      errors.push({
        field: 'category',
        message: `Categoria inválida: ${post.category}`,
        severity: 'error',
      });
    }

    // Tags validation
    if (!post.tags || post.tags.length === 0) {
      warnings.push({
        field: 'tags',
        message: 'Post não tem tags',
        suggestion: 'Adicione 3-5 tags relevantes para melhor categorização',
      });
    } else if (post.tags.length > 8) {
      warnings.push({
        field: 'tags',
        message: 'Muitas tags (recomendado: 3-5)',
        suggestion: 'Reduza para as tags mais relevantes',
      });
    }

    // Author validation
    if (!post.author || !post.author.name) {
      warnings.push({
        field: 'author',
        message: 'Post não tem autor definido',
        suggestion: 'Adicione um autor para aumentar credibilidade',
      });
    }

    // Date validation
    if (!post.date) {
      errors.push({
        field: 'date',
        message: 'Data de publicação é obrigatória',
        severity: 'error',
      });
    }
  }

  /**
   * Generates SEO recommendations for the post
   */
  static generateSEORecommendations(post: BlogPost): SEORecommendation[] {
    const recommendations: SEORecommendation[] = [];

    // Title recommendations
    if (post.title.length < this.MIN_TITLE_LENGTH) {
      recommendations.push({
        type: 'title',
        message: 'Expanda o título para melhorar SEO',
        impact: 'high',
        action: `Adicione mais detalhes para atingir ${this.MIN_TITLE_LENGTH}-${this.MAX_TITLE_LENGTH} caracteres`,
      });
    }

    // Description recommendations
    if (post.description.length < this.MIN_DESCRIPTION_LENGTH) {
      recommendations.push({
        type: 'description',
        message: 'Melhore a meta descrição',
        impact: 'high',
        action: `Expanda para ${this.MIN_DESCRIPTION_LENGTH}-${this.MAX_DESCRIPTION_LENGTH} caracteres`,
      });
    }

    // Content recommendations
    const headings = post.content.match(/^#{1,6}\s.+$/gm) || [];
    if (headings.length < 3) {
      recommendations.push({
        type: 'structure',
        message: 'Adicione mais subtítulos',
        impact: 'medium',
        action: 'Use headings H2 e H3 para estruturar melhor o conteúdo',
      });
    }

    // Keywords recommendations
    if (!this.containsKeywords(post.title + ' ' + post.description)) {
      recommendations.push({
        type: 'content',
        message: 'Adicione palavras-chave relevantes',
        impact: 'high',
        action: 'Inclua termos como "currículo", "ATS", "entrevista" no título e descrição',
      });
    }

    return recommendations;
  }

  /**
   * Checks if text contains relevant keywords
   */
  private static containsKeywords(text: string): boolean {
    const keywords = [
      'currículo',
      'ats',
      'entrevista',
      'carreira',
      'emprego',
      'vaga',
      'recrutador',
      'profissional',
      'oportunidade',
      'resume',
      'interview',
      'career',
      'job',
      'hiring',
    ];

    const lowerText = text.toLowerCase();
    return keywords.some((keyword) => lowerText.includes(keyword));
  }

  /**
   * Checks if title appears to be clickbait
   */
  private static isClickbait(title: string): boolean {
    const clickbaitPatterns = [
      /você não vai acreditar/i,
      /o segredo revelado/i,
      /ninguém te contou/i,
      /choque!/i,
      /impossível/i,
      /urgente!/i,
      /\d+ coisas que/i,
      /motivos que/i,
    ];

    return clickbaitPatterns.some((pattern) => pattern.test(title));
  }

  /**
   * Validates bilingual content consistency
   */
  static validateBilingualConsistency(ptPost: BlogPost, enPost: BlogPost): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let score = 100;

    // Check if categories match
    if (ptPost.category !== enPost.category) {
      warnings.push({
        field: 'category',
        message: 'Categorias diferentes entre versões',
        suggestion: 'Mantenha a mesma categoria em ambos os idiomas',
      });
    }

    // Check if content length is reasonable
    const ptWords = ptPost.content.split(/\s+/).length;
    const enWords = enPost.content.split(/\s+/).length;
    const ratio = enWords / ptWords;

    if (ratio < 0.7 || ratio > 1.3) {
      warnings.push({
        field: 'content',
        message: 'Diferença significativa no tamanho do conteúdo',
        suggestion: 'Mantenha proporção razoável entre as versões',
      });
    }

    // Check if tags are translated
    const ptTags = ptPost.tags || [];
    const enTags = enPost.tags || [];

    if (Math.abs(ptTags.length - enTags.length) > 1) {
      warnings.push({
        field: 'tags',
        message: 'Número diferente de tags entre versões',
        suggestion: 'Mantenha consistência nas tags',
      });
    }

    score = Math.max(0, 100 - errors.length * 15 - warnings.length * 10);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score,
    };
  }
}

export default BlogContentValidator;
