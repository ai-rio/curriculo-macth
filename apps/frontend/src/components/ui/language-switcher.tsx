'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTransition } from 'react';

import { routing } from '../../i18n/routing';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt-br', name: 'Português', flag: '🇧🇷' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLanguage = (newLocale: string) => {
    startTransition(() => {
      // Construct the new pathname with the new locale
      const segments = pathname.split('/').filter(Boolean);
      const currentLocale = segments[0];

      // Replace the locale in the pathname
      const newSegments = [newLocale, ...segments.slice(1)];
      const newPathname = '/' + newSegments.join('/');

      router.push(newPathname);
    });
  };

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => switchLanguage(e.target.value)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.name}
          </option>
        ))}
      </select>
    </div>
  );
}
