// Every public, indexable route. The sitemap is built from this list and the
// e2e suite checks it against the pages that exist, so a new page can't be forgotten.
export const PUBLIC_ROUTES = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/salah-times', changeFrequency: 'daily', priority: 0.9 },
  { path: '/events', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/prospectus', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/donate', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
];

// Reachable but kept out of search results.
export const NOINDEX_ROUTES = ['/admin', '/thank-you', '/contact/sent'];
