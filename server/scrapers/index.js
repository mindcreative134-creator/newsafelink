import { scrapeRssFeed } from './rssScraper.js';
import { scrapeHtmlPage } from './cheerioScraper.js';
import { scrapeSarkariResult } from './sarkariResultScraper.js';
import { scrapeFreeJobAlert } from './freeJobAlertScraper.js';
import { logEvent } from '../utils/logger.js';

/**
 * Dispatch scraper based on site type or domain
 */
export async function scrapeSite(siteConfig) {
  const url = (siteConfig.url || '').toLowerCase();
  const type = siteConfig.type || 'rss';

  try {
    // 1. Specialized scrapers
    if (url.includes('sarkariresult.com')) {
      return await scrapeSarkariResult(siteConfig);
    }
    if (url.includes('freejobalert.com')) {
      return await scrapeFreeJobAlert(siteConfig);
    }

    // 2. Direct HTML scraping
    if (type === 'scrape') {
      return await scrapeHtmlPage(siteConfig);
    }

    // 3. RSS with automatic HTML fallback
    try {
      return await scrapeRssFeed(siteConfig);
    } catch (rssErr) {
      logEvent(`RSS failed for "${siteConfig.name}" (${rssErr.message}), falling back to Cheerio HTML scraper...`, 'warning');
      return await scrapeHtmlPage(siteConfig);
    }
  } catch (err) {
    logEvent(`Scraping failed for "${siteConfig.name}": ${err.message}`, 'error');
    return [];
  }
}
