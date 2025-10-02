'use client';

import { useTranslations } from 'next-intl';

export default function PricingPage() {
  const t = useTranslations('pricing');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{t('title')}</h1>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">{t('subtitle')}</p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">
                {t('plans.free.name')}
              </h2>
              <p className="mt-4 text-sm text-gray-500">{t('plans.free.description')}</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">
                  {t('plans.free.price')}
                </span>
                <span className="text-base font-medium text-gray-500">
                  {t('plans.free.period')}
                </span>
              </p>
              <button className="mt-8 block w-full bg-gray-800 border border-gray-800 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-900">
                {t('plans.free.button')}
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                {t('whatsIncluded')}
              </h3>
              <ul className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-500">
                    {t('plans.free.features.basicAnalysis')}
                  </span>
                </li>
                <li className="flex space-x-3">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-500">
                    {t('plans.free.features.limitedOptimizations')}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">{t('plans.pro.name')}</h2>
              <p className="mt-4 text-sm text-gray-500">{t('plans.pro.description')}</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">
                  {t('plans.pro.price')}
                </span>
                <span className="text-base font-medium text-gray-500">{t('plans.pro.period')}</span>
              </p>
              <button className="mt-8 block w-full bg-indigo-600 border border-indigo-600 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700">
                {t('plans.pro.button')}
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                {t('whatsIncluded')}
              </h3>
              <ul className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-500">
                    {t('plans.pro.features.unlimitedOptimizations')}
                  </span>
                </li>
                <li className="flex space-x-3">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-500">
                    {t('plans.pro.features.advancedAnalysis')}
                  </span>
                </li>
                <li className="flex space-x-3">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-500">
                    {t('plans.pro.features.professionalTemplates')}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
