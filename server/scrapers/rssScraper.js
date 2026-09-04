import Parser from 'rss-parser';
import { logEvent } from '../utils/logger.js';

const parser = new Parser({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 10000,
});

/**
 * RSS / Atom Feed Scraper
 */
export async function scrapeRssFeed(feed) {
  logEvent(`[RSS Scraper] Fetching feed: ${feed.name} (${feed.url})`);
  const parsed = await parser.parseURL(feed.url);

  if (!parsed || !Array.isArray(parsed.items)) {
    throw new Error('No items in RSS feed');
  }

  return parsed.items.map((item) => ({
    title: (item.title || '').replace(/\s*-\s*[^-]+$/, '').trim(),
    link: item.link || feed.url,
    contentSnippet: item.contentSnippet || item.content || item.summary || '',
    pubDate: item.pubDate || new Date().toISOString(),
    sourceName: feed.name,
    category: feed.category,
  }));
}
