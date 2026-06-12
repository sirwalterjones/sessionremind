import { MetadataRoute } from 'next'

// Crawl rules: marketing/docs pages are public; everything behind auth (and
// all API routes) is off-limits. Served at /robots.txt.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/admin',
          '/connect',
          '/automation',
          '/onboarding',
          '/welcome',
          '/reminders',
          '/profile',
          '/new',
          '/payment-required',
          '/verify-email',
          '/login',
        ],
      },
    ],
    sitemap: 'https://sessionremind.com/sitemap.xml',
  }
}
