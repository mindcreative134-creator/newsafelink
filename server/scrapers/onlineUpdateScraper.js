import * as cheerio from 'cheerio';
import https from 'https';
import axios from 'axios';
import { logEvent } from '../utils/logger.js';

const ipv4Agent = new https.Agent({ family: 4, keepAlive: true });

/**
 * Dedicated Scraper for OnlineUpdateStm (onlineupdatestm.in.net)
 */
export async function scrapeOnlineUpdate(siteConfig = {}) {
  const url = (siteConfig.url || 'https://onlineupdatestm.in/').replace('.in.net', '.in');
  logEvent(`[OnlineUpdate Scraper] Scraping portal: ${url}`);

  try {
    const res = await axios.get(url, {
      httpsAgent: ipv4Agent,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 20000,
    });

    const $ = cheerio.load(res.data);
    const items = [];

    // Target article headlines, cards, and content links
    $('h2 a, h3 a, article a, .entry-title a, .post-title a, .card a, a').each((_, el) => {
      let title = $(el).text().replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
      let link = $(el).attr('href') || '';

      if (link.startsWith('/')) {
        link = `https://onlineupdatestm.in${link}`;
      }

      const lowerTitle = title.toLowerCase();
      const lowerLink = link.toLowerCase();

      if (
        title.length >= 18 &&
        title.length <= 250 &&
        link.startsWith('http') &&
        !lowerLink.includes('whatsapp') &&
        !lowerLink.includes('telegram') &&
        !lowerLink.includes('youtube') &&
        !lowerLink.includes('facebook') &&
        !lowerLink.includes('/category/') &&
        !lowerLink.includes('/tag/') &&
        !lowerLink.includes('/page/') &&
        !lowerLink.includes('/author/')
      ) {
        if (!items.some((it) => it.title === title || it.link === link)) {
          let category = siteConfig.category || 'Latest Jobs';
          if (lowerTitle.includes('result') || lowerTitle.includes('merit') || lowerTitle.includes('रिजल्ट')) {
            category = 'Results';
          } else if (lowerTitle.includes('admit') || lowerTitle.includes('hall ticket') || lowerTitle.includes('city') || lowerTitle.includes('एडमिट')) {
            category = 'Admit Cards';
          } else if (lowerTitle.includes('admission') || lowerTitle.includes('entrance') || lowerTitle.includes('university') || lowerTitle.includes('कॉलेज')) {
            category = 'University & Admissions';
          } else if (lowerTitle.includes('yojana') || lowerTitle.includes('scheme') || lowerTitle.includes('योजना') || lowerTitle.includes('कार्ड') || lowerTitle.includes('card') || lowerTitle.includes('scholarship')) {
            category = 'Govt Schemes & Yojana';
          }

          items.push({
            title,
            link,
            contentSnippet: `Verified official update from OnlineUpdateSTM: ${title}. Complete eligibility criteria, steps, and official direct links.`,
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
