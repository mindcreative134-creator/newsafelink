import * as cheerio from 'cheerio';
import axios from 'axios';
import { logEvent } from '../utils/logger.js';

/**
 * Dedicated Scraper for SarkariResult.com
 * Extracts latest jobs, admit cards, and results from their main tables
 */
export async function scrapeSarkariResult(siteConfig = {}) {
  const url = siteConfig.url || 'https://www.sarkariresult.com';
  logEvent(`[SarkariResult Scraper] Scraping: ${url}`);

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

    // SarkariResult has #post div containing lists and tables
    $('#post ul li a, table tr td a, .post-item a').each((_, el) => {
      const title = $(el).text().trim();
      let link = $(el).attr('href') || '';

      if (link.startsWith('/')) {
        link = `https://www.sarkariresult.com${link}`;
      }

      if (
        title &&
        title.length > 8 &&
        title.length < 180 &&
        link.startsWith('http') &&
        !link.includes('facebook') &&
        !link.includes('twitter') &&
        !link.includes('telegram')
      ) {
        if (!items.some((it) => it.title === title)) {
          items.push({
            title,
            link,
            contentSnippet: `Latest notification for ${title}. Candidates can check eligibility, exam date, and application process online.`,
            sourceName: 'Sarkari Result',
            category: siteConfig.category || 'Latest Jobs',
          });
        }
      }
    });

    logEvent(`[SarkariResult Scraper] Found ${items.length} notifications`);
    return items;
  } catch (err) {
    logEvent(`[SarkariResult Scraper] Error: ${err.message}`, 'error');
    return [];
  }
}
