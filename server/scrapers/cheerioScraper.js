import * as cheerio from 'cheerio';
import https from 'https';
import axios from 'axios';
import { logEvent } from '../utils/logger.js';

const ipv4Agent = new https.Agent({ family: 4, keepAlive: true });

/**
 * Generic Cheerio Web Scraper (BeautifulSoup Equivalent from CodeWithHarry Tutorial)
 * Extracts titles, links, and snippets from any raw HTML webpage
 */
export async function scrapeHtmlPage(siteConfig) {
  logEvent(`[HTML Scraper] Scraping URL: ${siteConfig.url}`);

  const res = await axios.get(siteConfig.url, {
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
  const selector = siteConfig.itemSelector || 'article, .post-item, table tr, .job-item, .entry, li a';

  $(selector).each((_, el) => {
    let title = '';
    let link = '';
    let snippet = '';

    if ($(el).is('tr')) {
      const linkEl = $(el).find('a').first();
      title = linkEl.text().trim() || $(el).find('td').first().text().trim();
      link = linkEl.attr('href') || siteConfig.url;
      snippet = $(el).text().replace(/\s+/g, ' ').trim();
    } else {
      const linkEl = $(el).is('a') ? $(el) : $(el).find('a').first();
      title = $(el).find('h2, h3, h4, .title').first().text().trim() || linkEl.text().trim();
      link = linkEl.attr('href') || siteConfig.url;
      snippet = $(el).find('p, .desc, .summary').first().text().trim() || title;
    }

    if (link && link.startsWith('/')) {
      try {
        const u = new URL(siteConfig.url);
        link = `${u.origin}${link}`;
      } catch {
        // keep link
      }
    }

    if (title && title.length > 8 && title.length < 250 && link && link.startsWith('http')) {
      if (!items.some((it) => it.title === title)) {
        items.push({
          title,
          link,
          contentSnippet: snippet,
          sourceName: siteConfig.name,
          category: siteConfig.category,
        });
      }
    }
  });

  logEvent(`[HTML Scraper] Extracted ${items.length} items from ${siteConfig.name}`);
  return items;
}
