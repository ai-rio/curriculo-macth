'use client';

import {
  BookmarkPlus,
  Check,
  Facebook,
  Link2,
  Linkedin,
  MessageCircle,
  Send,
  Share2,
  Twitter,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface SocialSharingProps {
  url: string;
  title: string;
  description: string;
  locale: string;
  tags?: string[];
  className?: string;
}

interface ShareButton {
  name: string;
  icon: any;
  color: string;
  hoverColor: string;
  getUrl: (url: string, title: string, description: string, tags?: string[]) => string;
}

export default function SocialSharing({
  url,
  title,
  description,
  locale,
  tags = [],
  className = '',
}: SocialSharingProps) {
  const t = useTranslations('blog');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  // Detect native sharing capability on client-side only
  useEffect(() => {
    setHasNativeShare(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  // Social media sharing buttons
  const shareButtons: ShareButton[] = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      getUrl: (url, title) =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500',
      hoverColor: 'hover:bg-sky-600',
      getUrl: (url, title, description, tags) => {
        const hashtags = (tags || []).slice(0, 3).join(',');
        const text = `${title} - ${description}`;
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}${hashtags ? `&hashtags=${encodeURIComponent(hashtags)}` : ''}`;
      },
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700',
      hoverColor: 'hover:bg-blue-800',
      getUrl: (url, title, description) =>
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      getUrl: (url, title, description) => {
        const text = `${title}\n${description}\n${url}`;
        return `https://wa.me/?text=${encodeURIComponent(text)}`;
      },
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      getUrl: (url, title, description) => {
        const text = `${title}\n${description}\n${url}`;
        return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      },
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleShare = (getUrl: () => string) => {
    const shareUrl = getUrl();
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };

  const nativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        console.log('Native share cancelled or failed:', err);
      }
    } else {
      // Fallback to copying link
      copyToClipboard();
    }
  };

  const visibleButtons = isExpanded ? shareButtons : shareButtons.slice(0, 3);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('shareArticle') || 'Compartilhar Artigo'}
        </h3>
        {shareButtons.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {isExpanded ? t('showLess') || 'Mostrar Menos' : t('showMore') || 'Mostrar Mais'}
          </button>
        )}
      </div>

      {/* Social Sharing Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Native Share (Mobile) */}
        {hasNativeShare && (
          <button
            onClick={nativeShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            title={t('nativeShare') || 'Compartilhar nativamente'}
          >
            <Share2 className="w-4 h-4" />
            <span className="font-medium">{t('share') || 'Compartilhar'}</span>
          </button>
        )}

        {/* Social Media Buttons */}
        {visibleButtons.map((button) => (
          <button
            key={button.name}
            onClick={() => handleShare(() => button.getUrl(url, title, description, tags))}
            className={`flex items-center gap-2 px-4 py-2 ${button.color} ${button.hoverColor} text-white rounded-lg transition-colors`}
            title={t('shareOn', { platform: button.name }) || `${t('share')} ${button.name}`}
          >
            <button.icon className="w-4 h-4" />
            <span className="font-medium">{button.name}</span>
          </button>
        ))}

        {/* Copy Link Button */}
        <button
          onClick={copyToClipboard}
          className={`flex items-center gap-2 px-4 py-2 border ${copied ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 hover:bg-gray-50 text-gray-700'} rounded-lg transition-colors`}
          title={t('copyLink') || 'Copiar link'}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span className="font-medium">{t('copied') || 'Copiado!'}</span>
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              <span className="font-medium">{t('copyLink') || 'Copiar Link'}</span>
            </>
          )}
        </button>
      </div>

      {/* Email Sharing */}
      <div className="pt-4 border-t border-gray-200">
        <a
          href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <Send className="w-4 h-4" />
          <span>{t('shareViaEmail') || 'Compartilhar por E-mail'}</span>
        </a>
      </div>

      {/* Additional Sharing Options */}
      <div className="text-sm text-gray-600 space-y-2">
        <p>{t('shareHelp') || 'Ajude outros profissionais a encontrarem este conteúdo útil!'}</p>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            {t('shareHashtags') || 'Use os hashtags:'} #{tags.slice(0, 3).join(' #')}
          </span>
        </div>
      </div>

      {/* Bookmark Prompt */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BookmarkPlus className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-indigo-900 mb-1">
              {t('saveForLater') || 'Salvar para Depois'}
            </h4>
            <p className="text-sm text-indigo-700">
              {t('saveForLaterDescription') ||
                'Adicione este artigo aos seus favoritos para consultar mais tarde.'}
            </p>
            <button
              onClick={() => {
                // In a real app, this would save to user's bookmarks
                alert('Este recurso estará disponível em breve!');
              }}
              className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              {t('addToFavorites') || 'Adicionar aos Favoritos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FloatingShareButtonsProps {
  url: string;
  title: string;
  description: string;
  locale: string;
  tags?: string[];
  visible?: boolean;
}

export function FloatingShareButtons({
  url,
  title,
  description,
  locale,
  tags = [],
  visible = false,
}: FloatingShareButtonsProps) {
  const t = useTranslations('blog');

  if (!visible) return null;

  const mainButtons = [
    {
      icon: Facebook,
      getUrl: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      icon: Twitter,
      getUrl: () => {
        const text = `${title} - ${description}`;
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      },
    },
    {
      icon: Linkedin,
      getUrl: () =>
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 space-y-2">
        <div className="px-3 py-2 text-xs font-medium text-gray-600 text-center border-b border-gray-200">
          {t('share') || 'Compartilhar'}
        </div>
        {mainButtons.map((button, index) => (
          <button
            key={index}
            onClick={() => window.open(button.getUrl(), '_blank', 'width=600,height=400')}
            className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title={t('share') || 'Compartilhar'}
          >
            <button.icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  );
}
