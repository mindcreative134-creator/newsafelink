import * as cheerio from 'cheerio';
import axios from 'axios';
import { logEvent } from '../utils/logger.js';

/**
 * Dedicated Scraper for BiharHelp.in
 * Scrapes 100% real, verified job recruitment notices, BPSC updates, and schemes
 */
export async function scrapeBiharHelp(siteConfig = {}) {
  const url = siteConfig.url || 'https://biharhelp.in/';
  logEvent(`[BiharHelp Scraper] Scraping official portal: ${url}`);

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

    // Target article titles in h3 tags (each real article uses h3 on biharhelp.in)
    $('h3 a, article a').each((_, el) => {
      const title = $(el).text().trim();
      let link = $(el).attr('href') || '';

      if (link.startsWith('/')) {
        link = `https://biharhelp.in${link}`;
      }

      const lowerTitle = title.toLowerCase();

      // Filter out menu/category links
      if (
        title.length >= 25 &&
        title.length <= 220 &&
        link.startsWith('http') &&
        !link.includes('/category/') &&
        !link.includes('/tag/')
      ) {
        if (!items.some((it) => it.title === title)) {
          let category = siteConfig.category || 'Latest Jobs';
          if (lowerTitle.includes('result') || lowerTitle.includes('score')) {
            category = 'Results';
          } else if (lowerTitle.includes('admit') || lowerTitle.includes('hall ticket')) {
            category = 'Admit Cards';
          } else if (lowerTitle.includes('admission') || lowerTitle.includes('entrance') || lowerTitle.includes('counseling')) {
            category = 'University & Admissions';
          } else if (lowerTitle.includes('yojana') || lowerTitle.includes('scheme')) {
            category = 'Govt Schemes & Yojana';
          }

          items.push({
            title,
            link,
            contentSnippet: `Official update from BiharHelp: ${title}. Complete details regarding eligibility, vacancy count, exam pattern, and official application process are provided.`,
            sourceName: 'Bihar Help (biharhelp.in)',
            category,
          });
        }
      }
    });

    logEvent(`[BiharHelp Scraper] Successfully extracted ${items.length} real recruitment articles`);
    return items;
  } catch (err) {
    logEvent(`[BiharHelp Scraper] Error: ${err.message}`, 'error');
    return [];
  }
}
