import Parser from 'rss-parser';
import { logEvent } from '../utils/logger.js';

const parser = new Parser({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 10000,
});

function extractRssImage(item) {
  if (item.enclosure && item.enclosure.url && /^https?:\/\//i.test(item.enclosure.url)) {
    return item.enclosure.url;
  }
  if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
    return item['media:content']['$'].url;
  }
  if (item['media:thumbnail'] && item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) {
    return item['media:thumbnail']['$'].url;
  }
  const textContent = `${item.content || ''} ${item.description || ''} ${item['content:encoded'] || ''}`;
  const imgMatch = textContent.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1] && !imgMatch[1].includes('feedburner') && !imgMatch[1].includes('analytics')) {
    return imgMatch[1];
  }
  return '';
}

function cleanSnippetText(raw) {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

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
    contentSnippet: cleanSnippetText(item.contentSnippet || item.content || item.summary || item.description || ''),
    pubDate: item.pubDate || new Date().toISOString(),
    sourceName: feed.name,
    category: feed.category,
    imageUrl: extractRssImage(item),
  }));
}

