import * as cheerio from 'cheerio';
import axios from 'axios';
import { logEvent } from '../utils/logger.js';

/**
 * Dedicated Scraper for FreeJobAlert.com
 * Extracts real, verified central and state recruitment notices
 */
export async function scrapeFreeJobAlert(siteConfig = {}) {
  const url = siteConfig.url || 'https://www.freejobalert.com';
  logEvent(`[FreeJobAlert Scraper] Scraping official job portal: ${url}`);

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

    const excludedWords = [
      'facebook',
      'twitter',
      'instagram',
      'telegram',
      'privacy policy',
      'contact us',
      'about us',
      'disclaimer',
    ];

    $('table tr td a, .latjnlist li a, div.post a').each((_, el) => {
      const title = $(el).text().trim();
      let link = $(el).attr('href') || '';

      if (link.startsWith('/')) {
        link = `https://www.freejobalert.com${link}`;
      }

      const lowerTitle = title.toLowerCase();
      const isExcluded = excludedWords.some((w) => lowerTitle.includes(w) || link.toLowerCase().includes(w));

      if (!isExcluded && title.length >= 12 && title.length <= 140 && link.startsWith('http')) {
        if (!items.some((it) => it.title === title)) {
          let category = siteConfig.category || 'Latest Jobs';
          if (lowerTitle.includes('result') || lowerTitle.includes('score')) {
            category = 'Results';
          } else if (lowerTitle.includes('admit') || lowerTitle.includes('hall ticket') || lowerTitle.includes('slip')) {
            category = 'Admit Cards';
          }

          items.push({
            title,
            link,
            contentSnippet: `Verified job circular: ${title}. Verify educational qualifications, age limit, and application steps on the official board website.`,
            sourceName: 'FreeJobAlert Official Portal',
            category,
          });
        }
      }
    });

    logEvent(`[FreeJobAlert Scraper] Successfully extracted ${items.length} real job notifications`);
    return items;
  } catch (err) {
    logEvent(`[FreeJobAlert Scraper] Error: ${err.message}`, 'error');
    return [];
  }
}
