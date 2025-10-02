/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  experimental: {
    // Add any experimental features here
  },

  // Fix module resolution issues in monorepo
  webpack: (config, { isServer }) => {
    // Fix for module resolution in monorepo
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.js', '.ts', '.tsx'],
    };

    return config;
  },

  // Ensure proper transpilation for node_modules
  transpilePackages: ['next-intl'],
};

module.exports = withNextIntl(nextConfig);
