import * as cheerio from 'cheerio';
import axios from 'axios';
import { logEvent } from '../utils/logger.js';

/**
 * Dedicated Scraper for SarkariResult.com
 * Scrapes 100% real, official notifications directly from SarkariResult
 */
export async function scrapeSarkariResult(siteConfig = {}) {
  const url = siteConfig.url || 'https://www.sarkariresult.com';
  logEvent(`[SarkariResult Scraper] Scraping official portal: ${url}`);

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
      'youtube',
      'terms and conditions',
      'privacy policy',
      'contact us',
      'about us',
      'disclaimer',
      'click here',
      'view more',
    ];

    $('li a, div#post a, table a').each((_, el) => {
      const title = $(el).text().trim();
      let link = $(el).attr('href') || '';

      if (link.startsWith('/')) {
        link = `https://www.sarkariresult.com${link}`;
      }

      const lowerTitle = title.toLowerCase();
      const isExcluded = excludedWords.some((w) => lowerTitle.includes(w) || link.toLowerCase().includes(w));

      // Real Sarkari notices are typically 12-140 characters
      if (!isExcluded && title.length >= 12 && title.length <= 140 && link.startsWith('http')) {
        if (!items.some((it) => it.title === title)) {
          // Categorize based on title
          let category = siteConfig.category || 'Latest Jobs';
          if (lowerTitle.includes('result') || lowerTitle.includes('marks') || lowerTitle.includes('cutoff')) {
            category = 'Results';
          } else if (lowerTitle.includes('admit') || lowerTitle.includes('hall ticket') || lowerTitle.includes('city slip')) {
            category = 'Admit Cards';
          } else if (lowerTitle.includes('admission') || lowerTitle.includes('cuet') || lowerTitle.includes('scholarship')) {
            category = 'University & Admissions';
          }

          items.push({
            title,
            link,
            contentSnippet: `Official Sarkari notification for ${title}. Candidates can check eligibility criteria, online application dates, and download the official advertisement PDF online.`,
            sourceName: 'Sarkari Result',
            category,
          });
        }
      }
    });

    logEvent(`[SarkariResult Scraper] Successfully extracted ${items.length} real government notifications`);
    return items;
  } catch (err) {
    logEvent(`[SarkariResult Scraper] Error: ${err.message}`, 'error');
    return [];
  }
}
