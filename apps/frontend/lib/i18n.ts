/**
 * Internationalization utilities and translations for Brazilian Portuguese
 * Language Guidelines: Use formal "você" (not "tu"), be clear and professional
 */

/**
 * Upload feature translations
 */
export const upload = {
  title: 'Envie seu Currículo',
  subtitle: 'Faça o upload do seu currículo para começar a otimização',
  dragDrop: 'Clique para selecionar ou arraste seu arquivo aqui',
  formats: 'PDF, DOCX ou TXT (máx. 5MB)',
  uploading: 'Enviando arquivo...',
  success: 'Arquivo enviado com sucesso!',
  error: 'Erro ao enviar arquivo. Por favor, tente novamente.',
  invalidType: 'Tipo de arquivo inválido. Use PDF, DOCX ou TXT.',
  tooLarge: 'O arquivo é muito grande. O tamanho máximo é 5MB.',
  button: 'Selecionar Arquivo',
} as const;

/**
 * Job description input translations
 */
export const jobDescription = {
  title: 'Descrição da Vaga',
  subtitle: 'Cole a descrição completa da vaga desejada',
  placeholder:
    'Cole aqui a descrição da vaga incluindo requisitos, responsabilidades e qualificações...',
  minChars: 'Mínimo de 50 caracteres',
  maxChars: 'Máximo de 5.000 caracteres',
  charCount: (current: number, max: number) => `${current} / ${max} caracteres`,
  error: 'Por favor, insira uma descrição válida da vaga.',
} as const;

/**
 * Payment feature translations
 */
export const payment = {
  title: 'Finalizar Pagamento',
  subtitle: 'Complete o pagamento para iniciar a otimização do seu currículo',
  button: 'Otimizar Currículo - R$ 50,00',
  price: 'R$ 50,00',
  processing: 'Processando pagamento...',
  success: 'Pagamento realizado com sucesso!',
  error: 'Erro ao processar pagamento. Por favor, tente novamente.',
  cancelled: 'Pagamento cancelado.',
  description: 'Otimização de Currículo com IA',
  securePayment: 'Pagamento seguro processado pela Stripe',
  errors: {
    notAuthenticated: 'Você precisa estar autenticado para continuar',
    checkoutFailed: 'Falha ao criar sessão de pagamento',
    verificationFailed: 'Falha ao verificar pagamento',
    paymentFailed: 'Falha ao processar pagamento. Por favor, tente novamente.',
  },
} as const;

/**
 * Results page translations
 */
export const results = {
  title: 'Resultado da Otimização',
  subtitle: 'Seu currículo foi otimizado com sucesso',
  processing: 'Processando seu currículo...',
  processingDescription: 'Isso pode levar alguns minutos. Por favor, aguarde.',
  matchScore: 'Compatibilidade com a Vaga',
  suggestions: 'Sugestões de Melhoria',
  download: 'Baixar Currículo Otimizado',
  downloadDocx: 'Baixar como DOCX',
  viewOptimized: 'Visualizar Currículo Otimizado',
  error: 'Erro ao processar seu currículo. Por favor, tente novamente.',
  notFound: 'Otimização não encontrada.',
} as const;

/**
 * Navigation translations
 */
export const nav = {
  home: 'Início',
  dashboard: 'Dashboard',
  pricing: 'Preços',
  about: 'Sobre',
  contact: 'Contato',
  login: 'Entrar',
  signup: 'Criar Conta',
  logout: 'Sair',
} as const;

/**
 * Common UI translations
 */
export const common = {
  loading: 'Carregando...',
  save: 'Salvar',
  cancel: 'Cancelar',
  delete: 'Excluir',
  edit: 'Editar',
  back: 'Voltar',
  next: 'Próximo',
  previous: 'Anterior',
  continue: 'Continuar',
  confirm: 'Confirmar',
  success: 'Sucesso!',
  error: 'Erro',
  warning: 'Atenção',
  info: 'Informação',
  close: 'Fechar',
  search: 'Buscar',
  filter: 'Filtrar',
  reset: 'Limpar',
  refresh: 'Atualizar',
} as const;

/**
 * Error messages
 */
export const errors = {
  required: 'Este campo é obrigatório',
  invalidEmail: 'Email inválido',
  passwordTooShort: 'A senha deve ter no mínimo 6 caracteres',
  passwordMismatch: 'As senhas não coincidem',
  networkError: 'Erro de conexão. Verifique sua internet e tente novamente.',
  unauthorized: 'Você precisa estar autenticado para acessar esta página.',
  forbidden: 'Você não tem permissão para acessar este recurso.',
  notFound: 'Recurso não encontrado.',
  serverError: 'Erro no servidor. Por favor, tente novamente mais tarde.',
  rateLimitExceeded: 'Muitas requisições. Por favor, aguarde alguns minutos.',
} as const;

/**
 * Combined translations object for convenience
 */
export const translations = {
  upload,
  jobDescription,
  payment,
  results,
  nav,
  common,
  errors,
} as const;

/**
 * Format currency to Brazilian Real (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format date to Brazilian format (DD/MM/YYYY)
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR').format(dateObj);
}

/**
 * Format date and time to Brazilian format (DD/MM/YYYY HH:MM)
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Format relative time (e.g., "há 5 minutos", "há 2 horas")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'há poucos segundos';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `há ${diffInWeeks} ${diffInWeeks === 1 ? 'semana' : 'semanas'}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `há ${diffInMonths} ${diffInMonths === 1 ? 'mês' : 'meses'}`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `há ${diffInYears} ${diffInYears === 1 ? 'ano' : 'anos'}`;
}

/**
 * Format file size (e.g., "2.5 MB", "150 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format percentage (e.g., "85%", "92.5%")
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}
