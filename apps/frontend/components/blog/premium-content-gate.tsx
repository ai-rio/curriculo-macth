'use client';

import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Crown,
  Gift,
  Lock,
  Sparkles,
  Star,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface PremiumContentGateProps {
  locale: string;
  onUpgrade?: () => void;
  previewContent?: string;
  contentTitle?: string;
}

export default function PremiumContentGate({
  locale,
  onUpgrade,
  previewContent,
  contentTitle,
}: PremiumContentGateProps) {
  const t = useTranslations('blog');
  const [isHovered, setIsHovered] = useState(false);

  const premiumFeatures = [
    {
      icon: BookOpen,
      title: t('premiumFullAccess') || 'Acesso Completo',
      description: t('premiumFullAccessDesc') || 'Acesso ilimitado a todos os posts premium',
    },
    {
      icon: Target,
      title: t('premiumExclusive') || 'Conteúdo Exclusivo',
      description: t('premiumExclusiveDesc') || 'Guias detalhados e estratégias avançadas',
    },
    {
      icon: Zap,
      title: t('premiumTemplates') || 'Templates Prontos',
      description: t('premiumTemplatesDesc') || 'Download de templates de currículo e cartas',
    },
    {
      icon: Gift,
      title: t('premiumBonus') || 'Bônus Extras',
      description: t('premiumBonusDesc') || 'Webinars exclusivos e consultoria',
    },
  ];

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    }
  };

  return (
    <div className="relative">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-white pointer-events-none" />

      {/* Content Gate */}
      <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl border border-indigo-200 p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('premiumTitle') || 'Conteúdo Premium Exclusivo'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('premiumDescription') ||
              'Este conteúdo está disponível exclusivamente para assinantes Pro. Desbloqueie acesso completo a guias detalhados, estratégias avançadas e recursos exclusivos.'}
          </p>
        </div>

        {/* Preview Content */}
        {previewContent && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              {t('preview') || 'Prévia'} {contentTitle && `- ${contentTitle}`}
            </h3>
            <div className="text-sm text-gray-600 line-clamp-3">{previewContent}</div>
          </div>
        )}

        {/* Premium Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {premiumFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-sm font-semibold text-gray-600">
                {t('mostPopular') || 'Mais Popular'}
              </span>
            </div>

            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-900">R$29</span>
              <span className="text-gray-600">/{t('month') || 'mês'}</span>
            </div>

            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">
                  {t('feature1') || 'Acesso a todos os posts premium'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">{t('feature2') || 'Templates exclusivos'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">{t('feature3') || 'Prioridade no suporte'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">
                  {t('feature4') || 'Cancelamento a qualquer momento'}
                </span>
              </li>
            </ul>

            <button
              onClick={handleUpgrade}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                <Sparkles
                  className={`w-5 h-5 transition-transform duration-200 ${isHovered ? 'rotate-12' : ''}`}
                />
                <span>{t('upgradeToPro') || 'Assinar Resume-Matcher Pro'}</span>
                <ArrowRight
                  className={`w-5 h-5 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`}
                />
              </div>

              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>{t('guarantee') || '7 dias de garantia'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4 text-gray-400" />
              <span>{t('securePayment') || 'Pagamento seguro'}</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span>{t('cancelAnytime') || 'Cancele a qualquer momento'}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            {t('termsNote') ||
              'Ao assinar, você concorda com nossos termos de serviço e política de privacidade.'}
          </p>
        </div>

        {/* Alternative Options */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-4">
            {t('notReadyYet') || 'Ainda não tem certeza?'}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href={`/${locale}/blog`}
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
            >
              {t('browseFreeContent') || 'Ver conteúdo gratuito'}
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href={`/${locale}/pricing`}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm"
            >
              {t('viewAllPlans') || 'Ver todos os planos'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PremiumBadgeProps {
  locale: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PremiumBadge({ locale, size = 'md' }: PremiumBadgeProps) {
  const t = useTranslations('blog');

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div
      className={`inline-flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-medium ${sizeClasses[size]}`}
    >
      <Crown className="w-3 h-3" />
      <span>{t('premium') || 'Premium'}</span>
    </div>
  );
}

interface UpgradePromptProps {
  locale: string;
  onUpgrade?: () => void;
  compact?: boolean;
}

export function UpgradePrompt({ locale, onUpgrade, compact = false }: UpgradePromptProps) {
  const t = useTranslations('blog');

  if (compact) {
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-semibold text-indigo-900">
            {t('unlockFullContent') || 'Desbloqueie o Conteúdo Completo'}
          </span>
        </div>
        <button
          onClick={onUpgrade}
          className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {t('upgradeNow') || 'Assinar Agora'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5" />
            <h3 className="text-lg font-semibold">{t('limitedAccess') || 'Acesso Limitado'}</h3>
          </div>
          <p className="text-indigo-100 mb-4">
            {t('upgradePromptDescription') ||
              'Assine Pro para desbloquear este e outros conteúdos exclusivos.'}
          </p>
          <button
            onClick={onUpgrade}
            className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            {t('upgradeToPro') || 'Assinar Pro'}
          </button>
        </div>
        <Crown className="w-16 h-16 text-indigo-200" />
      </div>
    </div>
  );
}
