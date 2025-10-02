import withMDX from '@next/mdx';
import type { NextConfig } from 'next';

const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  experimental: {
    // Add any experimental features here
    mdxRs: true,
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

  async rewrites() {
    return [
      {
        source: '/api_be/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
};

// Apply MDX plugin with options, then next-intl
const withMDXConfig = withMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

// Apply MDX plugin first, then next-intl
export default withNextIntl(withMDXConfig(nextConfig));
