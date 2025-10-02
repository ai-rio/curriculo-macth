import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

// Helper function to check if a locale is supported
function hasLocale(locales: readonly string[], locale: string | undefined): locale is string {
  return locale != null && locales.includes(locale);
}

// Deep merge function to properly combine nested objects
function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        if (
          typeof result[key] === 'object' &&
          result[key] !== null &&
          !Array.isArray(result[key])
        ) {
          result[key] = deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale is a Promise when using locale-based routing
  const requested = await requestLocale;

  // Validate locale is supported, fallback to default if not
  const hasLocaleResult = hasLocale(routing.locales, requested);

  const locale = hasLocaleResult ? requested : routing.defaultLocale;

  try {
    // Load modular translation files
    const [common, auth, dashboard, pricing, resume, navigation, errors] = await Promise.all([
      import(`../../locales/${locale}/common.json`),
      import(`../../locales/${locale}/auth.json`),
      import(`../../locales/${locale}/dashboard.json`),
      import(`../../locales/${locale}/pricing.json`),
      import(`../../locales/${locale}/resume.json`),
      import(`../../locales/${locale}/navigation.json`),
      import(`../../locales/${locale}/errors.json`),
    ]);

    // Deep merge all translation modules into a single messages object
    let messages = {};
    for (const moduleData of [
      common.default,
      auth.default,
      dashboard.default,
      pricing.default,
      resume.default,
      navigation.default,
      errors.default,
    ]) {
      messages = deepMerge(messages, moduleData);
    }

    return {
      locale,
      messages,
    };
  } catch (error) {
    console.error('🚀 REQUEST CONFIG - ERROR loading messages for locale:', locale, error);

    // Try to load fallback messages (English)
    try {
      const fallbackLocale = routing.defaultLocale;
      console.log('🚀 REQUEST CONFIG - Attempting fallback to:', fallbackLocale);

      const [common, auth, dashboard, pricing, resume, navigation, errors] = await Promise.all([
        import(`../../locales/${fallbackLocale}/common.json`),
        import(`../../locales/${fallbackLocale}/auth.json`),
        import(`../../locales/${fallbackLocale}/dashboard.json`),
        import(`../../locales/${fallbackLocale}/pricing.json`),
        import(`../../locales/${fallbackLocale}/resume.json`),
        import(`../../locales/${fallbackLocale}/navigation.json`),
        import(`../../locales/${fallbackLocale}/errors.json`),
      ]);

      const fallbackMessages = {
        ...common.default,
        ...auth.default,
        ...dashboard.default,
        ...pricing.default,
        ...resume.default,
        ...navigation.default,
        ...errors.default,
      };

      console.log('🚀 REQUEST CONFIG - Using fallback messages for:', fallbackLocale);

      return {
        locale: fallbackLocale,
        messages: fallbackMessages,
      };
    } catch (fallbackError) {
      console.error('🚀 REQUEST CONFIG - CRITICAL: Fallback failed:', fallbackError);
      throw error;
    }
  }
});
