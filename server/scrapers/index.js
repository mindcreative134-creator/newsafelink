import { scrapeRssFeed } from './rssScraper.js';
import { scrapeHtmlPage } from './cheerioScraper.js';
import { scrapeSarkariResult } from './sarkariResultScraper.js';
import { scrapeFreeJobAlert } from './freeJobAlertScraper.js';
import { scrapeBiharHelp } from './biharHelpScraper.js';
import { scrapeOnlineUpdate } from './onlineUpdateScraper.js';
import { scrapeGenericHtml, detectPostCategory } from './universalDetector.js';
import { logEvent } from '../utils/logger.js';

/**
 * Universal Quality Filter: Rejects website navigation labels, menu items, footer links, and spam.
 * Allows genuine news articles, editorial posts, technology updates, and recruitment/education notices.
 */
export function isValidPost(title, siteConfig = {}) {
  if (!title || typeof title !== 'string') return false;
  const t = title.toLowerCase().trim();

  // 1. Length constraint (allow headlines from 8 to 280 characters)
  if (t.length < 8 || t.length > 280) return false;

  // 2. Reject website navigation, category menu labels, and footer boilerplate
  const menuBlacklist = [
    'all india jobs',
    'latest job',
    'latest jobs',
    'home',
    'homepage',
    'main menu',
    'admit card',
    'admit cards',
    'result',
    'results',
    'answer key',
    'syllabus',
    'admission',
    'admissions',
    'contact us',
    'contact',
    'about us',
    'about',
    'privacy policy',
    'privacy',
    'disclaimer',
    'terms and conditions',
    'term & condition',
    'terms of service',
    'view all',
    'click here',
    'view more',
    'read more',
    'trending now',
    'quick links',
    'important links',
    'login',
    'sign in',
    'sign up',
    'register',
    'subscribe',
    'newsletter',
    'search',
    'advertise with us',
    'feedback',
    'sitemap',
    'cookie policy',
    'all rights reserved',
    'follow us',
    'join telegram',
    'whatsapp group',
    'download app',
  ];
  if (menuBlacklist.includes(t)) return false;

  // Reject generic action labels with few words
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length <= 2 && (
    t.includes('click') || t.includes('here') || t.includes('more') || 
    t.includes('view') || t.includes('menu') || t.includes('category')
  )) {
    return false;
  }

  // 3. For specialized recruitment sites (sarkariresult, freejobalert), ensure relevance
  const siteUrl = (siteConfig.url || '').toLowerCase();
  const isDedicatedRecruitmentSite = siteUrl.includes('sarkariresult') || siteUrl.includes('freejobalert');

  if (isDedicatedRecruitmentSite) {
    const isRecruitmentPost = t.includes('recruitment') || t.includes('bharti') || t.includes('result') || 
                              t.includes('admit card') || t.includes('vacancy') || t.includes('post') || 
                              t.includes('warder') || t.includes('jailor') || t.includes('exam') ||
                              t.includes('online form') || t.includes('apply') || t.includes('answer key');
    return isRecruitmentPost;
  }

  // 4. Universal validation: passes if it resembles a genuine headline or article notice
  return true;
}

// Backwards compatibility alias
export const isValidSarkariPost = isValidPost;

/**
 * Dispatch scraper based on site type or domain with smart universal filtering
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

    // 2. Smart Quality & Category Assignment
    const verifiedItems = rawItems
      .filter((item) => {
        const isValid = isValidPost(item.title, siteConfig);
        if (!isValid) {
          logEvent(`Filtered out navigation/menu item: "${item.title}"`, 'info');
        }
        return isValid;
      })
      .map((item) => {
        // Automatically determine per-post category & badge from title/snippet
        const detected = detectPostCategory(item.title, item.contentSnippet || '', siteConfig);
        return {
          ...item,
          category: (!siteConfig.category || siteConfig.category.includes('Auto Detect')) 
            ? detected.category 
            : (item.category || siteConfig.category || detected.category),
          badge: item.badge || detected.badge,
        };
      });

    logEvent(`[Ingestion Filter] ${verifiedItems.length} of ${rawItems.length} items verified for ${siteConfig.name}`);
    return verifiedItems;
  } catch (err) {
    logEvent(`Scraping failed for "${siteConfig.name}": ${err.message}`, 'error');
    return [];
  }
}

