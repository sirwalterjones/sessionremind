import { MetadataRoute } from 'next'

const BASE = 'https://sessionremind.com'

// Public, indexable pages only. Served at /sitemap.xml.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    { url: `${BASE}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/instructions`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/faq`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/help`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/contact`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/register`, lastModified, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/sms-opt-in`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
