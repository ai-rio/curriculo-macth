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

// Mock blog posts for development - will be replaced with actual MDX parsing
export const mockBlogPosts: Record<string, BlogPost[]> = {
  'pt-br': [
    {
      slug: 'como-otimizar-seu-curriculo-para-ats',
      title: 'Como Otimizar seu Currículo para Sistemas ATS',
      description: 'Aprenda os segredos para passar pelos sistemas automatizados de triagem e garantir mais entrevistas',
      date: '2024-10-02',
      readingTime: 8,
      category: 'atsOptimization',
      featured: true,
      content: `# Como Otimizar seu Currículo para Sistemas ATS

Você já se perguntou por que envia seu currículo para dezenas de vagas e não recebe retorno? A resposta pode estar nos **Sistemas de Rastreamento de Candidatos (ATS)**.

## O que é um Sistema ATS?

Um Sistema ATS é um software usado por empresas para gerenciar e filtrar candidaturas de emprego. Estes sistemas analisam automaticamente os currículos em busca de palavras-chave e qualificações específicas antes mesmo de um recrutador ver seu currículo.

## Por que a Otimização ATS é Crucial?

- **95%** das empresas Fortune 500 usam sistemas ATS
- **75%** dos currículos são descartados automaticamente
- Apenas os **top 25%** chegam aos recrutadores humanos

## Como Otimizar seu Currículo para ATS

### 1. Use Palavras-Chave Relevantes

Analise a descrição da vaga e identifique:
- Habilidades técnicas mencionadas
- Certificações requeridas
- Termos específicos da indústria
- Soft skills valorizadas

### 2. Formatação Simples e Limpa

Evite colunas múltiplas, tabelas complexas, imagens e gráficos.

Use fontes padrão, tamanho entre 10-12 pontos e layout de coluna única.

## Conclusão

Otimizar seu currículo para ATS não significa sacrificar a legibilidade humana. Trata-se de encontrar o equilíbrio entre ser amigável para máquinas e atraente para recrutadores.`,
      locale: 'pt-br',
      author: {
        name: 'Resume-Matcher Team',
      },
      tags: ['ATS', 'currículo', 'otimização', 'entrevista']
    },
    {
      slug: 'dicas-para-entrevistas-online',
      title: 'Dicas Essenciais para Entrevistas Online em 2024',
      description: 'Como se destacar em entrevistas remotas e conquistar sua vaga dos sonhos',
      date: '2024-10-01',
      readingTime: 6,
      category: 'interviewPrep',
      content: `# Dicas Essenciais para Entrevistas Online em 2024

As entrevistas online se tornaram o novo normal no mercado de trabalho.

## Preparação Técnica

Teste seu equipamento: internet estável, áudio e vídeo funcionando corretamente.

## Durante a Entrevista

Mantenha contato visual com a câmera, fale claramente e seja autêntico.

## Conclusão

Com preparação adequada, você pode transformar entrevistas remotas em sua vantagem competitiva.`,
      locale: 'pt-br',
      author: {
        name: 'Resume-Matcher Team',
      },
      tags: ['entrevista', 'remoto', 'zoom', 'preparação']
    }
  ],
  'en': [
    {
      slug: 'how-to-optimize-resume-for-ats',
      title: 'How to Optimize Your Resume for ATS Systems',
      description: 'Learn the secrets to getting past automated screening systems and landing more interviews',
      date: '2024-10-02',
      readingTime: 8,
      category: 'atsOptimization',
      featured: true,
      content: `# How to Optimize Your Resume for ATS Systems

Have you ever wondered why you send your resume to dozens of job openings and hear nothing back? The answer might lie in **Applicant Tracking Systems (ATS)**.

## What is an ATS System?

An Applicant Tracking System is software used by companies to manage and filter job applications.

## Why ATS Optimization is Crucial

- **95%** of Fortune 500 companies use ATS systems
- **75%** of resumes are automatically rejected
- Only the **top 25%** reach human recruiters

## How to Optimize Your Resume for ATS

### 1. Use Relevant Keywords

Analyze the job description and identify key skills and qualifications.

### 2. Simple and Clean Formatting

Avoid multiple columns, complex tables, images and graphics.

## Conclusion

Optimizing your resume for ATS doesn't mean sacrificing human readability.`,
      locale: 'en',
      author: {
        name: 'Resume-Matcher Team',
      },
      tags: ['ATS', 'resume', 'optimization', 'interview']
    }
  ]
};

export function getAllBlogPosts(locale: string): BlogPost[] {
  return mockBlogPosts[locale] || [];
}

export function getBlogPostBySlug(slug: string, locale: string): BlogPost | null {
  const posts = mockBlogPosts[locale] || [];
  return posts.find(post => post.slug === slug) || null;
}

export function getBlogPostsByCategory(category: string, locale: string): BlogPost[] {
  const allPosts = getAllBlogPosts(locale);

  if (category === 'all') {
    return allPosts;
  }

  return allPosts.filter(post => post.category === category);
}