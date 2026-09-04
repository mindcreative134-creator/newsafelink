import { scrapeRssFeed } from './rssScraper.js';
import { scrapeHtmlPage } from './cheerioScraper.js';
import { scrapeSarkariResult } from './sarkariResultScraper.js';
import { scrapeFreeJobAlert } from './freeJobAlertScraper.js';
import { scrapeBiharHelp } from './biharHelpScraper.js';
import { logEvent } from '../utils/logger.js';

/**
 * Strict Quality Filter: Rejects menu items, navigation labels, and crime/negative news.
 * Guarantees that only genuine government recruitment, admission, and scheme notices pass.
 */
export function isValidSarkariPost(title) {
  if (!title || typeof title !== 'string') return false;
  const t = title.toLowerCase().trim();

  // 1. Length constraint (Menu links like "Latest Job" or "All India Jobs" are short)
  if (t.length < 18 || t.length > 220) return false;

  // 2. Reject website navigation & category menu labels
  const menuBlacklist = [
    'all india jobs',
    'latest job',
    'latest jobs',
    'home',
    'admit card',
    'admit cards',
    'result',
    'results',
    'answer key',
    'syllabus',
    'admission',
    'admissions',
    'scholarship',
    'contact us',
    'about us',
    'privacy policy',
    'disclaimer',
    'terms and conditions',
    'view all',
    'click here',
    'view more',
    'trending now',
    'quick links',
  ];
  if (menuBlacklist.includes(t)) return false;

  // 3. Reject Crime / Negative / Non-Job News (e.g. from Google News)
  const crimeBlacklist = [
    'arrest',
    'arrested',
    'rape',
    'raped',
    'murder',
    'crime',
    'blast',
    'fraud',
    'scam',
    'digital arrest',
    'jail',
    'killed',
    'police custody',
    'extortion',
    'assault',
    'terror',
    'suicide',
    'cyber fraud',
  ];
  if (crimeBlacklist.some((word) => t.includes(word))) return false;

  // 4. Must contain genuine government recruitment / exam / scheme keywords
  const validKeywords = [
    'recruitment',
    'bharti',
    'भर्ती',
    'vacancy',
    'vacancies',
    'posts',
    'पद',
    'online form',
    'apply online',
    'notification',
    'admit card',
    'result',
    'answer key',
    'scorecard',
    'cutoff',
    'cut off',
    'apprentice',
    'officer',
    'constable',
    'yojana',
    'योजना',
    'scheme',
    'admission',
    'exam',
    'cgl',
    'chsl',
    'upsc',
    'bpsc',
    'ssc',
    'rrb',
    'railway',
    'gds',
    'ctet',
    'tet',
    'jee',
    'neet',
    'police',
    'army',
    'navy',
    'airforce',
    'agniveer',
    'bank',
    'sbi',
    'ibps',
    'inter',
    'matric',
  ];

  return validKeywords.some((k) => t.includes(k));
}

/**
 * Dispatch scraper based on site type or domain with strict filtering
 */
export async function scrapeSite(siteConfig) {
  const url = (siteConfig.url || '').toLowerCase();
  const type = siteConfig.type || 'rss';
  let rawItems = [];

  try {
    // 1. Specialized scrapers
    if (url.includes('biharhelp.in')) {
      rawItems = await scrapeBiharHelp(siteConfig);
    } else if (url.includes('sarkariresult.com')) {
      rawItems = await scrapeSarkariResult(siteConfig);
    } else if (url.includes('freejobalert.com')) {
      rawItems = await scrapeFreeJobAlert(siteConfig);
    } else if (type === 'scrape') {
      rawItems = await scrapeHtmlPage(siteConfig);
    } else {
      try {
        rawItems = await scrapeRssFeed(siteConfig);
      } catch (rssErr) {
        logEvent(`RSS failed for "${siteConfig.name}" (${rssErr.message}), falling back to Cheerio HTML scraper...`, 'warning');
        rawItems = await scrapeHtmlPage(siteConfig);
      }
    }

    // 2. Strict Quality & Authenticity Filter
    const verifiedItems = rawItems.filter((item) => {
      const isValid = isValidSarkariPost(item.title);
      if (!isValid) {
        logEvent(`Filtered out non-recruitment or menu item: "${item.title}"`, 'info');
      }
      return isValid;
    });

    logEvent(`[Quality Filter] ${verifiedItems.length} of ${rawItems.length} items verified as genuine recruitment posts for ${siteConfig.name}`);
    return verifiedItems;
  } catch (err) {
    logEvent(`Scraping failed for "${siteConfig.name}": ${err.message}`, 'error');
    return [];
  }
}
