import withMDX from '@next/mdx';

const nextConfig = {
  /* config options here */
    async rewrites() {
    return [
      {
        source: '/api_be/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
};

export default withMDX(nextConfig);
