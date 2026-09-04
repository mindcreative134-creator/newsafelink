import * as cheerio from 'cheerio';
import axios from 'axios';
import { logEvent } from '../utils/logger.js';

/**
 * Dedicated Scraper for OnlineUpdateStm (onlineupdatestm.in.net)
 */
export async function scrapeOnlineUpdate(siteConfig = {}) {
  const url = siteConfig.url || 'https://onlineupdatestm.in.net/';
  logEvent(`[OnlineUpdate Scraper] Scraping portal: ${url}`);

  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(res.data);
    const items = [];

    // Target article headlines and cards, skipping navigation menus
    $('h2 a, h3 a, article a').each((_, el) => {
      const title = $(el).text().trim();
      let link = $(el).attr('href') || '';

      if (link.startsWith('/')) {
        link = `https://onlineupdatestm.in.net${link}`;
      }

      const lowerTitle = title.toLowerCase();

      if (
        title.length >= 20 &&
        title.length <= 220 &&
        link.startsWith('http') &&
        !link.includes('/category/') &&
        !link.includes('/tag/')
      ) {
        if (!items.some((it) => it.title === title)) {
          let category = siteConfig.category || 'Latest Jobs';
          if (lowerTitle.includes('result') || lowerTitle.includes('merit')) {
            category = 'Results';
          } else if (lowerTitle.includes('admit') || lowerTitle.includes('hall ticket')) {
            category = 'Admit Cards';
          } else if (lowerTitle.includes('admission') || lowerTitle.includes('entrance')) {
            category = 'University & Admissions';
          } else if (lowerTitle.includes('yojana') || lowerTitle.includes('scheme')) {
            category = 'Govt Schemes & Yojana';
          }

          items.push({
            title,
            link,
            contentSnippet: `Verified update from OnlineUpdateSTM: ${title}. Check eligibility criteria, application process, and official direct links.`,
            sourceName: 'OnlineUpdate STM',
            category,
          });
        }
      }
    });

    logEvent(`[OnlineUpdate Scraper] Successfully extracted ${items.length} real recruitment notices`);
    return items;
  } catch (err) {
    logEvent(`[OnlineUpdate Scraper] Error: ${err.message}`, 'error');
    return [];
  }
}
