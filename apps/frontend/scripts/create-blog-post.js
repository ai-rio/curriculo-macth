#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Blog categories
const CATEGORIES = {
  atsOptimization: 'Otimização para ATS',
  resumeWriting: 'Dicas de Currículo',
  interviewPrep: 'Preparação para Entrevistas',
  careerAdvice: 'Conselhos de Carreira',
  jobSearch: 'Busca de Emprego',
  marketTrends: 'Tendências do Mercado',
};

// Portuguese templates
const TEMPLATES = {
  atsOptimization: {
    title: 'Como Otimizar seu Currículo para [Tópico Específico]',
    description:
      'Aprenda as melhores estratégias para passar pelos sistemas ATS e conseguir mais entrevistas',
    structure: `# Como Otimizar seu Currículo para [Tópico Específico]

## Introdução
[Breve introdução sobre a importância do tópico]

## O que é [Tópico]?
[Explicação detalhada do conceito]

## Por que é Importante?
[Liste os benefícios e importância]

## Como Implementar
[Passo a passo prático]

### Passo 1: [Título do Passo]
[Explicação detalhada]

### Passo 2: [Título do Passo]
[Explicação detalhada]

## Dicas Adicionais
[Dicas extras e melhores práticas]

## Conclusão
[Resumo dos pontos principais]`,
  },
  resumeWriting: {
    title: '[Número] Dicas para Melhorar seu Currículo em [Ano]',
    description: 'Transforme seu currículo com estas dicas testadas e aprovadas',
    structure: `# [Número] Dicas para Melhorar seu Currículo em [Ano]

## Introdução
[Contexto sobre a importância de um bom currículo]

## Dica 1: [Título da Dica]
[Explicação detalhada com exemplos]

## Dica 2: [Título da Dica]
[Explicação detalhada com exemplos]

[Continue com as outras dicas...]

## Erros Comuns a Evitar
[Liste os erros mais comuns]

## Conclusão
[Resumo e chamada para ação]`,
  },
  interviewPrep: {
    title: 'Como se Preparar para Entrevistas de [Tipo de Entrevista]',
    description: 'Guia completo para impressionar recrutadores e conseguir a vaga',
    structure: `# Como se Preparar para Entrevistas de [Tipo de Entrevista]

## Introdução
[Importância da preparação]

## Antes da Entrevista
[Liste o que fazer antes]

## Durante a Entrevista
[Dicas para o momento da entrevista]

## Perguntas Comuns
[Liste perguntas frequentes e como responder]

## Perguntas para Fazer ao Entrevistador
[Sugestões de perguntas]

## Conclusão
[Resumo dos pontos principais]`,
  },
  careerAdvice: {
    title: '[Estratégia] para Alavancar sua Carreira em [Ano]',
    description: 'Descubra as melhores estratégias para crescer profissionalmente',
    structure: `# [Estratégia] para Alavancar sua Carreira em [Ano]

## Introdução
[Contexto sobre o mercado atual]

## O que é [Estratégia]?
[Definição e explicação]

## Como Aplicar
[Passo a passo prático]

## Benefícios
[Liste os benefícios]

## Estudos de Caso
[Exemplos reais]

## Conclusão
[Resumo e próximos passos]`,
  },
  jobSearch: {
    title: 'Como Encontrar [Tipo de Vaga] em [Tempo Estimado]',
    description: 'Estratégias eficazes para acelerar sua busca por emprego',
    structure: `# Como Encontrar [Tipo de Vaga] em [Tempo Estimado]

## Introdução
[Contexto sobre o mercado]

## Estratégias Principais
[Liste as estratégias]

### Estratégia 1: [Nome]
[Explicação detalhada]

### Estratégia 2: [Nome]
[Explicação detalhada]

## Ferramentas Úteis
[Liste ferramentas e plataformas]

## Erros a Evitar
[Liste erros comuns na busca]

## Conclusão
[Resumo e motivação final]`,
  },
  marketTrends: {
    title: 'Tendências de [Setor] para [Ano]: O que Esperar',
    description: 'Análise completa das principais tendências do mercado',
    structure: `# Tendências de [Setor] para [Ano]: O que Esperar

## Introdução
[Contexto sobre o setor]

## Tendência 1: [Nome da Tendência]
[Explicação detalhada com dados]

## Tendência 2: [Nome da Tendência]
[Explicação detalhada com dados]

[Continue com outras tendências...]

## Impacto na Carreira
[Como as tendências afetam profissionais]

## Como se Preparar
[Dicas de preparação]

## Conclusão
[Resumo e previsões]`,
  },
};

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

async function createBlogPost() {
  console.log('\n🚀 Criador de Posts para Blog - Resume-Matcher\n');

  // Get basic info
  const locale = (await question('Idioma (pt-br/en): ')) || 'pt-br';
  const categoryKey = await question('Categoria (' + Object.keys(CATEGORIES).join(', ') + '): ');

  if (!CATEGORIES[categoryKey]) {
    console.log('❌ Categoria inválida!');
    rl.close();
    return;
  }

  const template = TEMPLATES[categoryKey];
  if (!template) {
    console.log('❌ Template não encontrado!');
    rl.close();
    return;
  }

  const title = (await question(`Título (sugestão: "${template.title}"): `)) || template.title;
  const description =
    (await question(`Descrição (sugestão: "${template.description}"): `)) || template.description;

  const isFeatured = await question('Post em destaque? (s/n): ');
  const featured = isFeatured.toLowerCase() === 's';

  const authorName =
    (await question('Nome do autor (padrão: Resume-Matcher Team): ')) || 'Resume-Matcher Team';
  const authorBio = await question('Biografia do autor (opcional): ');

  // Generate tags
  const tagsInput = await question('Tags (separadas por vírgula): ');
  const tags = tagsInput ? tagsInput.split(',').map((tag) => tag.trim()) : [];

  // Create content directory structure
  const contentDir = path.join(process.cwd(), 'content', 'blog', locale);
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  // Generate slug
  const slug = slugify(title);
  const filePath = path.join(contentDir, `${slug}.mdx`);

  // Create frontmatter
  const frontmatter = {
    title,
    description,
    date: formatDate(new Date()),
    category: categoryKey,
    featured,
    author: {
      name: authorName,
      ...(authorBio && { bio: authorBio }),
    },
    tags,
    locale,
    lastModified: formatDate(new Date()),
  };

  // Generate full content
  const fullContent = `---
${Object.entries(frontmatter)
  .map(([key, value]) => {
    if (key === 'author') {
      return `${key}:
  name: ${value.name}${value.bio ? `\n  bio: ${value.bio}` : ''}`;
    }
    if (key === 'tags') {
      return `${key}: [${value.map((tag) => `"${tag}"`).join(', ')}]`;
    }
    return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
  })
  .join('\n')}
---

${template.structure}`;

  // Validate content
  const wordCount = fullContent.split(/\s+/).length;
  const readingTime = calculateReadingTime(fullContent);

  console.log('\n📊 Estatísticas do Post:');
  console.log(`   Palavras: ${wordCount}`);
  console.log(`   Tempo de leitura: ${readingTime} minutos`);
  console.log(`   Slug: ${slug}`);
  console.log(`   Arquivo: ${filePath}`);
  console.log(`   Categoria: ${CATEGORIES[categoryKey]}`);
  console.log(`   Destaque: ${featured ? 'Sim' : 'Não'}`);
  console.log(`   Tags: ${tags.join(', ') || 'Nenhuma'}`);

  const confirm = await question('\n✅ Criar post? (s/n): ');
  if (confirm.toLowerCase() === 's') {
    fs.writeFileSync(filePath, fullContent, 'utf8');
    console.log(`\n✅ Post criado com sucesso: ${filePath}`);
    console.log('\n📝 Próximos passos:');
    console.log('1. Edite o conteúdo conforme necessário');
    console.log('2. Substitua os placeholders [texto] por conteúdo real');
    console.log('3. Adicione exemplos e casos práticos');
    console.log('4. Revise a formatação e ortografia');
  } else {
    console.log('\n❌ Post não criado.');
  }

  rl.close();
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📖 Criador de Posts para Blog - Resume-Matcher

Uso:
  node scripts/create-blog-post.js [opções]

Opções:
  --help, -h     Mostra esta ajuda
  --template     Lista todos os templates disponíveis
  --validate     Valida posts existentes

Exemplos:
  node scripts/create-blog-post.js
  node scripts/create-blog-post.js --template
`);
  process.exit(0);
}

if (args.includes('--template')) {
  console.log('\n📋 Templates Disponíveis:\n');
  Object.entries(CATEGORIES).forEach(([key, name]) => {
    const template = TEMPLATES[key];
    console.log(`${key}: ${name}`);
    console.log(`   Título: ${template.title}`);
    console.log(`   Descrição: ${template.description}`);
    console.log('');
  });
  process.exit(0);
}

if (args.includes('--validate')) {
  console.log('\n🔍 Validando posts existentes...\n');
  const locales = ['pt-br', 'en'];

  locales.forEach((locale) => {
    const contentDir = path.join(process.cwd(), 'content', 'blog', locale);
    if (fs.existsSync(contentDir)) {
      const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.mdx'));
      console.log(`${locale}: ${files.length} posts encontrados`);

      files.forEach((file) => {
        const filePath = path.join(contentDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const wordCount = content.split(/\s+/).length;
        const readingTime = calculateReadingTime(content);
        console.log(`  ✓ ${file} (${wordCount} palavras, ${readingTime} min leitura)`);
      });
    } else {
      console.log(`${locale}: Nenhum diretório encontrado`);
    }
  });

  console.log('\n✅ Validação concluída!');
  process.exit(0);
}

// Run the main function
createBlogPost().catch(console.error);
