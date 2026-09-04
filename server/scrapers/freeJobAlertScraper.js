import * as cheerio from 'cheerio';
import axios from 'axios';
import { logEvent } from '../utils/logger.js';

/**
 * Dedicated Scraper for FreeJobAlert / Job Portals
 */
export async function scrapeFreeJobAlert(siteConfig = {}) {
  const url = siteConfig.url || 'https://www.freejobalert.com';
  logEvent(`[FreeJobAlert Scraper] Scraping: ${url}`);

  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 12000,
    });

    const $ = cheerio.load(res.data);
    const items = [];

    $('table tr, .latjnlist li, .post a').each((_, el) => {
      const linkEl = $(el).is('a') ? $(el) : $(el).find('a').first();
      const title = linkEl.text().trim() || $(el).find('td').first().text().trim();
      let link = linkEl.attr('href') || '';

      if (link && link.startsWith('/')) {
        link = `https://www.freejobalert.com${link}`;
      }

      if (
        title &&
        title.length > 8 &&
        title.length < 180 &&
        link.startsWith('http') &&
        !link.includes('facebook') &&
        !link.includes('twitter')
      ) {
        if (!items.some((it) => it.title === title)) {
          items.push({
            title,
            link,
            contentSnippet: `Recruitment notice: ${title}. Verify qualification details and apply before the closing date.`,
            sourceName: 'FreeJobAlert',
            category: siteConfig.category || 'Latest Jobs',
          });
        }
      }
    });

    logEvent(`[FreeJobAlert Scraper] Found ${items.length} notifications`);
    return items;
  } catch (err) {
    logEvent(`[FreeJobAlert Scraper] Error: ${err.message}`, 'error');
    return [];
  }
}
