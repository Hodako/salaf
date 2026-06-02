import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/whoisadmin/admin',
        destination: '/admin/dashboard',
      },
      {
        source: '/whoisadmin/admin/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
  // output: "standalone",
  experimental: {
    inlineCss: true,
    webVitalsAttribution: ['CLS', 'LCP', 'FID', 'INP', 'TTFB', 'FCP'],
  },
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
