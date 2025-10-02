'use client';

import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
            <div className="flex flex-col items-center justify-center h-full">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('title')}</h1>
              <p className="text-gray-600 text-center max-w-md">{t('subtitle')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
