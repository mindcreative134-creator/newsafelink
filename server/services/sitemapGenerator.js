import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logEvent, loadJson } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const BASE_URL = process.env.SITE_URL || 'https://iwantgovjob.vercel.app';

const ALL_CATEGORIES = [
  'News & Updates',
  'Latest Jobs',
  'Govt Schemes & Yojana',
  'University & Admissions',
  'Admit Cards',
  'Results',
  'Technology',
  'Sports',
  'Business & Economy',
  'Syllabus',
];

const STATIC_ROUTES = [
  { url: '', priority: '1.0', changefreq: 'always' },
  { url: '/about', priority: '0.7', changefreq: 'monthly' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' },
  { url: '/privacy-policy', priority: '0.5', changefreq: 'monthly' },
  { url: '/disclaimer', priority: '0.5', changefreq: 'monthly' },
  { url: '/terms-conditions', priority: '0.5', changefreq: 'monthly' },
];

/**
 * Build and save Google Search Console compliant sitemap.xml
 */
export async function updateSitemapXml(scrapedItems = []) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const seenIds = new Set();
    const seenLocs = new Set();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // 1. Static Core Pages
    STATIC_ROUTES.forEach((route) => {
      const loc = `${BASE_URL}${route.url}`;
      seenLocs.add(loc);
      xml += '  <url>\n';
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // 2. All Topic & Category Archive Hubs
    ALL_CATEGORIES.forEach((cat) => {
      const loc = `${BASE_URL}/category/${encodeURIComponent(cat)}`;
      if (!seenLocs.has(loc)) {
        seenLocs.add(loc);
        xml += '  <url>\n';
        xml += `    <loc>${loc}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>0.85</priority>\n';
        xml += '  </url>\n';
      }
    });

    // 3. Load all scraped & live repository items
    let combinedPosts = Array.isArray(scrapedItems) ? [...scrapedItems] : [];

    try {
      const scrapedDataPath = path.resolve(ROOT_DIR, 'data', 'scrapedPosts.json');
      if (fs.existsSync(scrapedDataPath)) {
        const diskScraped = loadJson(scrapedDataPath, []);
        combinedPosts.push(...diskScraped);
      }
    } catch {}

    try {
      const siteLiveJobsPath = path.resolve(ROOT_DIR, '..', 'src', 'data', 'liveJobs.json');
      if (fs.existsSync(siteLiveJobsPath)) {
        const liveJobs = loadJson(siteLiveJobsPath, []);
        combinedPosts.push(...liveJobs);
      }
    } catch {}

    // Add posts with high search priority (0.90)
    for (const post of combinedPosts) {
      if (!post || !post.id || seenIds.has(post.id)) continue;
      seenIds.add(post.id);

      const loc = `${BASE_URL}/post/${encodeURIComponent(post.id)}`;
      if (seenLocs.has(loc)) continue;
      seenLocs.add(loc);

      const pubDate = post.publishedDate ? post.publishedDate.split('T')[0] : (post.published ? post.published.split('T')[0] : today);

      xml += '  <url>\n';
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <lastmod>${pubDate}</lastmod>\n`;
      xml += '    <changefreq>daily</changefreq>\n';
      xml += '    <priority>0.90</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>\n';

    // 4. Save to public/sitemap.xml
    const publicSitemapPath = path.resolve(ROOT_DIR, '..', 'public', 'sitemap.xml');
    fs.writeFileSync(publicSitemapPath, xml, 'utf8');

    // Also update dist/sitemap.xml if dist exists
    const distSitemapPath = path.resolve(ROOT_DIR, '..', 'dist', 'sitemap.xml');
    if (fs.existsSync(path.dirname(distSitemapPath))) {
      try {
        fs.writeFileSync(distSitemapPath, xml, 'utf8');
      } catch {}
    }

    logEvent(`[SEO Sitemap Engine] Successfully generated sitemap.xml with ${seenLocs.size} indexed URLs.`);

    // 5. Ping Search Engines (Google & Bing)
    pingSearchEngines();

    return { totalUrls: seenLocs.size };
  } catch (err) {
    logEvent(`[SEO Sitemap Engine] Error generating sitemap: ${err.message}`, 'error');
    return { error: err.message };
  }
}

/**
 * Ping Google and Bing Search Engines to notify of fresh sitemap updates
 */
export async function pingSearchEngines() {
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  const pingEndpoints = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];

  for (const endpoint of pingEndpoints) {
    try {
      fetch(endpoint, { method: 'GET', signal: AbortSignal.timeout(5000) }).catch(() => {});
    } catch {}
  }
}
