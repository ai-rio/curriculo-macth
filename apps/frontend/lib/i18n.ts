/**
 * Internationalization utilities and translations for Brazilian Portuguese
 * Language Guidelines: Use formal "você" (not "tu"), be clear and professional
 */

/**
 * Authentication translations
 */
export const auth = {
  // Login form
  login: {
    title: 'Entrar na sua Conta',
    subtitle: 'Faça login para acessar o dashboard de otimização',
    email: 'Email',
    emailPlaceholder: 'seu@email.com',
    password: 'Senha',
    passwordPlaceholder: 'Digite sua senha',
    submitButton: 'Entrar',
    signingIn: 'Entrando...',
    rememberMe: 'Lembrar de mim',
    forgotPassword: 'Esqueceu sua senha?',
    noAccount: 'Não tem uma conta?',
    signUp: 'Criar conta',
  },

  // Signup form
  signup: {
    title: 'Criar Nova Conta',
    subtitle: 'Crie sua conta para começar a otimizar currículos',
    email: 'Email',
    emailPlaceholder: 'seu@email.com',
    password: 'Senha',
    passwordPlaceholder: 'Crie uma senha forte',
    confirmPassword: 'Confirmar Senha',
    confirmPasswordPlaceholder: 'Digite a senha novamente',
    fullName: 'Nome Completo',
    fullNamePlaceholder: 'Seu nome completo',
    submitButton: 'Criar Conta',
    creatingAccount: 'Criando conta...',
    hasAccount: 'Já tem uma conta?',
    signIn: 'Entrar',

    // Validation messages
    allFieldsRequired: 'Todos os campos são obrigatórios',
    passwordTooShort: 'A senha deve ter pelo menos 8 caracteres',
    passwordsDoNotMatch: 'As senhas não coincidem',
    invalidEmail: 'Email inválido',

    // Success messages
    successTitle: 'Conta Criada com Sucesso!',
    successMessage: 'Sua conta foi criada. Verifique seu email para confirmar.',
    redirectingToLogin: 'Redirecionando para a página de login...',

    // Password requirements
    passwordRequirements: 'Requisitos de senha:',
    requirementLength: 'Pelo menos 8 caracteres',
    requirementUppercase: 'Pelo menos uma letra maiúscula',
    requirementLowercase: 'Pelo menos uma letra minúscula',
    requirementNumber: 'Pelo menos um número',
  },

  // Forgot password form
  forgotPassword: {
    title: 'Recuperar Senha',
    subtitle: 'Digite seu email para receber instruções de recuperação',
    emailLabel: 'Email',
    emailPlaceholder: 'seu@email.com',
    submitButton: 'Enviar Email de Recuperação',
    sendingEmail: 'Enviando email...',
    emailRequired: 'Email é obrigatório',
    invalidEmail: 'Email inválido',
    rememberPassword: 'Lembrou sua senha?',
    backToLogin: 'Voltar para Login',

    // Success messages
    successTitle: 'Email Enviado!',
    successMessage: 'Enviamos instruções de recuperação para seu email.',
    checkEmail: 'Verifique sua caixa de entrada e siga as instruções.',
  },

  // Reset password form
  resetPassword: {
    title: 'Redefinir Senha',
    subtitle: 'Crie uma nova senha para sua conta',
    newPassword: 'Nova Senha',
    newPasswordPlaceholder: 'Digite sua nova senha',
    confirmNewPassword: 'Confirmar Nova Senha',
    confirmNewPasswordPlaceholder: 'Digite a nova senha novamente',
    submitButton: 'Redefinir Senha',
    resettingPassword: 'Redefinindo senha...',
    allFieldsRequired: 'Todos os campos são obrigatórios',
    passwordTooShort: 'A senha deve ter pelo menos 8 caracteres',
    passwordsDoNotMatch: 'As senhas não coincidem',
    invalidLink: 'Link de redefinição inválido ou expirado',

    // Success messages
    successTitle: 'Senha Redefinida!',
    successMessage: 'Sua senha foi redefinida com sucesso.',
    redirectingToLogin: 'Redirecionando para a página de login...',

    // Password requirements
    passwordRequirements: 'Requisitos de senha:',
    requirementLength: 'Pelo menos 8 caracteres',
    requirementUppercase: 'Pelo menos uma letra maiúscula',
    requirementLowercase: 'Pelo menos uma letra minúscula',
    requirementNumber: 'Pelo menos um número',
  },

  // General auth messages
  error: {
    invalidCredentials: 'Email ou senha incorretos',
    sessionExpired: 'Sua sessão expirou. Faça login novamente.',
    accountNotVerified: 'Sua conta não foi verificada. Verifique seu email.',
    accountLocked: 'Sua conta está bloqueada. Entre em contato com suporte.',
    networkError: 'Erro de conexão. Verifique sua internet.',
    serverError: 'Erro no servidor. Tente novamente.',
    emailAlreadyExists: 'Este email já está cadastrado.',
    weakPassword: 'Senha muito fraca. Escolha uma senha mais forte.',
  },

  success: {
    loginSuccess: 'Login realizado com sucesso!',
    logoutSuccess: 'Você saiu da sua conta.',
    profileUpdated: 'Perfil atualizado com sucesso!',
    emailVerified: 'Email verificado com sucesso!',
  },
} as const;

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
 * Dashboard translations
 */
export const dashboard = {
  title: 'Dashboard',
  subtitle: 'Bem-vindo ao seu painel de otimização de currículos',
  welcome: 'Bem-vindo ao seu Dashboard!',
  description: 'Este é um dashboard protegido. Apenas usuários autenticados podem ver isto.',
  quickActions: 'Ações Rápidas',
  uploadResume: 'Enviar Currículo',
  uploadResumeDesc: 'Comece a otimizar seu currículo enviando-o.',
  viewOptimizations: 'Ver Otimizações',
  viewOptimizationsDesc: 'Veja suas otimizações de currículo anteriores.',
  profileSettings: 'Configurações do Perfil',
  profileSettingsDesc: 'Gerencie as configurações da sua conta.',
  accountInfo: 'Informações da Conta',
  userId: 'ID do Usuário',
  email: 'Email',
  lastSignIn: 'Último Login',
  accountCreated: 'Data de Criação',
  never: 'Nunca',
  unknown: 'Desconhecido',
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
  passwordTooShort: 'A senha deve ter no mínimo 8 caracteres',
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
  auth,
  upload,
  jobDescription,
  payment,
  results,
  nav,
  dashboard,
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
