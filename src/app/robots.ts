import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/checkout/',
        '/api/',
        '/_next/',
        '/static/',
      ],
    },
    sitemap: 'https://salaf.bd/sitemap.xml',
  };
}
