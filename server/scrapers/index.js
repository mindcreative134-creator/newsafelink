import { scrapeRssFeed } from './rssScraper.js';
import { scrapeHtmlPage } from './cheerioScraper.js';
import { scrapeSarkariResult } from './sarkariResultScraper.js';
import { scrapeFreeJobAlert } from './freeJobAlertScraper.js';
import { scrapeBiharHelp } from './biharHelpScraper.js';
import { scrapeOnlineUpdate } from './onlineUpdateScraper.js';
import { scrapeGenericHtml, detectPostCategory } from './universalDetector.js';
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

  // 4. Must contain genuine government recruitment / exam / university / scheme keywords
  const validKeywords = [
    // Recruitment & Jobs
    'recruitment', 'bharti', 'भर्ती', 'vacancy', 'vacancies', 'posts', 'पद', 
    'online form', 'apply online', 'notification', 'admit card', 'result', 
    'answer key', 'scorecard', 'cutoff', 'cut off', 'apprentice', 'officer', 
    'constable', 'cgl', 'chsl', 'upsc', 'bpsc', 'ssc', 'rrb', 'railway', 
    'gds', 'ctet', 'tet', 'jee', 'neet', 'police', 'army', 'navy', 'airforce', 
    'agniveer', 'bank', 'sbi', 'ibps', 'inter', 'matric', 'clerk', 'teacher',

    // University & Academic Updates (Munger, Bihar Universities, UG/PG, B.Ed)
    'university', 'munger', 'patna', 'lnmu', 'vksu', 'magadh', 'brabu', 'purnea', 
    'tmbu', 'college', 'degree', 'ug', 'pg', 'semester', 'session', 'part 1', 
    'part 2', 'part 3', 'ba', 'bsc', 'bcom', 'ma', 'msc', 'mcom', 'bed', 'b.ed', 
    'deled', 'd.el.ed', 'bceceb', 'counselling', 'choice filling', 'provisional', 
    'migration', 'certificate', 'marksheet', 'merit list', 'timetable', 'routine', 
    'exam date', 'date sheet', 'syllabus', 'admission', 'entrance', 'iti', 
    'polytechnic', 'bseb', 'cbse', 'board', 'b.tech', 'diploma', 'registration',

    // Government Schemes & Citizen Welfare
    'yojana', 'योजना', 'scheme', 'pension', 'subsidy', 'scholarship', 'kisan', 
    'ration', 'ayushman', 'loan', 'samman nidhi', 'fasal bima', 'udyami', 
    'beneficiary', 'awas', 'pmaw', 'eshram',

    // General Notices & Important Updates
    'notice', 'circular', 'order', 'guidelines', 'update', 'alert', 'press note', 
    'announcement', 'programme', 'schedule'
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
    // 1. Specialized or Universal Scrapers
    if (url.includes('biharhelp.in')) {
      rawItems = await scrapeBiharHelp(siteConfig);
    } else if (url.includes('onlineupdatestm')) {
      rawItems = await scrapeOnlineUpdate(siteConfig);
    } else if (url.includes('sarkariresult.com')) {
      rawItems = await scrapeSarkariResult(siteConfig);
    } else if (url.includes('freejobalert.com')) {
      rawItems = await scrapeFreeJobAlert(siteConfig);
    } else if (type === 'rss') {
      try {
        rawItems = await scrapeRssFeed(siteConfig);
        if (!rawItems || rawItems.length === 0) {
          logEvent(`RSS returned 0 items for "${siteConfig.name}", seamlessly falling back to Universal HTML Scraper...`, 'info');
          rawItems = await scrapeGenericHtml(siteConfig);
        }
      } catch (rssErr) {
        logEvent(`RSS failed for "${siteConfig.name}" (${rssErr.message}), falling back to Universal HTML Scraper...`, 'warning');
        rawItems = await scrapeGenericHtml(siteConfig);
      }
    } else {
      rawItems = await scrapeGenericHtml(siteConfig);
    }

    // 2. Strict Quality & Authenticity Filter + Dynamic Category Assignment
    const verifiedItems = rawItems
      .filter((item) => {
        const isValid = isValidSarkariPost(item.title);
        if (!isValid) {
          logEvent(`Filtered out non-recruitment or menu item: "${item.title}"`, 'info');
        }
        return isValid;
      })
      .map((item) => {
        // Automatically determine per-post category & badge from title/snippet
        const detected = detectPostCategory(item.title, item.contentSnippet || '');
        return {
          ...item,
          category: (!siteConfig.category || siteConfig.category.includes('Auto Detect')) 
            ? detected.category 
            : (item.category || siteConfig.category || detected.category),
          badge: item.badge || detected.badge,
        };
      });

    logEvent(`[Quality Filter] ${verifiedItems.length} of ${rawItems.length} items verified as genuine recruitment posts for ${siteConfig.name}`);
    return verifiedItems;
  } catch (err) {
    logEvent(`Scraping failed for "${siteConfig.name}": ${err.message}`, 'error');
    return [];
  }
}
