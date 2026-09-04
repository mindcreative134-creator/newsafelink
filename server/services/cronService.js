import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import { CONFIG } from '../config/index.js';
import { scrapeSite } from '../scrapers/index.js';
import { buildClonedHtmlArticle } from './articleTemplate.js';
import { cloneAuthenticArticle } from '../scrapers/articleCloner.js';
import { detectPostCategory } from '../scrapers/universalDetector.js';
import { postToBlogger } from './bloggerPublisher.js';
import { loadJson, saveJson, logEvent, POSTED_CACHE_FILE, SCRAPED_POSTS_FILE } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Circuit breaker for Google Blogger API write quotas
let bloggerQuotaExhaustedUntil = 0;
const MAX_BLOGGER_POSTS_PER_CYCLE = 2; // 2 posts per cycle = ~200 posts/day, avoids triggering Google burst limits

// ── Text & URL Normalizers for 100% Duplicate Prevention ──
function normalizeText(str) {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const u = new URL(url);
    return (u.origin + u.pathname).toLowerCase().replace(/\/+$/, '');
  } catch {
    return url.toLowerCase().trim().replace(/\/+$/, '');
  }
}

function toSlug(str) {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
}

export async function runSyncRoutine() {
  logEvent('Starting 24/7 sync routine across all configured websites & scrapers...');
  const feeds = loadJson(CONFIG.FEEDS_FILE, []);
  
  // ── Load and Index Persistent Deduplication Cache ──
  const rawPostedCache = loadJson(POSTED_CACHE_FILE, []);
  const postedCacheEntries = [];
  const postedTitlesSet = new Set();
  const postedUrlsSet = new Set();
  const postedSlugsSet = new Set();

  for (const entry of rawPostedCache) {
    if (typeof entry === 'string') {
      const nText = normalizeText(entry);
      if (nText) postedTitlesSet.add(nText);
      const slug = toSlug(entry);
      if (slug) postedSlugsSet.add(slug);
      postedCacheEntries.push({ title: entry, cleanTitle: entry });
    } else if (entry && typeof entry === 'object') {
      if (entry.title) postedTitlesSet.add(normalizeText(entry.title));
      if (entry.cleanTitle) postedTitlesSet.add(normalizeText(entry.cleanTitle));
      if (entry.clonedTitle) postedTitlesSet.add(normalizeText(entry.clonedTitle));
      if (entry.url) postedUrlsSet.add(normalizeUrl(entry.url));
      if (entry.slug) postedSlugsSet.add(entry.slug);
      postedCacheEntries.push(entry);
    }
  }

  function isDuplicatePost(item, cleanTitle = '') {
    if (!item) return true;
    const titleToCheck = cleanTitle || item.title || '';
    const normTitle = normalizeText(titleToCheck);
    if (normTitle && postedTitlesSet.has(normTitle)) return true;

    if (item.link) {
      const normUrl = normalizeUrl(item.link);
      if (normUrl && postedUrlsSet.has(normUrl)) return true;
    }

    const slug = toSlug(titleToCheck);
    if (slug && postedSlugsSet.has(slug)) return true;

    return false;
  }

  function markAsPosted(title, cleanTitle, url, clonedTitle = '') {
    const normTitle = normalizeText(title);
    const normClean = normalizeText(cleanTitle);
    const normCloned = normalizeText(clonedTitle);
    const normUrl = normalizeUrl(url);
    const slug = toSlug(title);

    if (normTitle) postedTitlesSet.add(normTitle);
    if (normClean) postedTitlesSet.add(normClean);
    if (normCloned) postedTitlesSet.add(normCloned);
    if (normUrl) postedUrlsSet.add(normUrl);
    if (slug) postedSlugsSet.add(slug);

    postedCacheEntries.push({
      title,
      cleanTitle: cleanTitle || title,
      clonedTitle: clonedTitle || undefined,
      url: normUrl || undefined,
      slug,
      postedAt: new Date().toISOString()
    });

    saveJson(POSTED_CACHE_FILE, postedCacheEntries.slice(-1000));
  }

  let existingScraped = loadJson(SCRAPED_POSTS_FILE, []);
  let newPostsCount = 0;
  const scrapedMap = new Map();

  // Index existing scraped posts by clean title
  for (const p of existingScraped) {
    if (p && p.title) scrapedMap.set(p.title.trim().toLowerCase(), p);
  }

  for (const feed of feeds) {
    if (!feed.enabled) continue;

    try {
      logEvent(`Processing source: ${feed.name}...`);
      const items = await scrapeSite(feed);

      if (Array.isArray(items) && items.length > 0) {
        // 1. Collect and format genuine verified items with clear source attribution
        for (const item of items) {
          const cleanTitle = (item.title || '').replace(/\s*-\s*[^-]+$/, '').trim();
          if (!cleanTitle) continue;

          const key = cleanTitle.toLowerCase();
          if (!scrapedMap.has(key)) {
            const cleanSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 45);
            const { category: detectedCat, badge: detectedBadge } = detectPostCategory(cleanTitle, item.contentSnippet || '');
            const postCategory = (!feed.category || feed.category.includes('Auto Detect')) ? detectedCat : (item.category || feed.category || detectedCat);
            const postBadge = item.badge || detectedBadge;

            scrapedMap.set(key, {
              id: `scraped-${cleanSlug}`,
              title: cleanTitle,
              category: postCategory,
              organization: item.sourceName || feed.name,
              sourceName: item.sourceName || feed.name,
              sourceUrl: item.link || feed.url,
              originalPostUrl: item.link || feed.url,
              totalPosts: 'Refer to Official Notice',
              qualification: 'As per Official Notice / Brochure',
              lastDate: 'Online Application / Notice Active',
              status: 'Active',
              badge: postBadge,
              applyUrl: item.link || feed.url,
              summary: item.contentSnippet || `${postCategory} update from ${feed.name}: ${cleanTitle}`,
              publishedDate: new Date().toISOString().split('T')[0],
              ageLimit: 'As per official recruitment/admission norms',
              imageUrl: item.imageUrl || '',
              isScrapedLive: true,
              fetchedAt: new Date().toISOString(),
            });
          }
        }

        // 2. Publish unposted items to Blogger (guarded against Google Cloud API write quotas)
        let publishedInThisFeed = false;
        const isBloggerQuotaPaused = Date.now() < bloggerQuotaExhaustedUntil;

        if (isBloggerQuotaPaused) {
          // Blogger API write quota cooling down - feeds are still scraped and saved to website live feed
        } else if (newPostsCount >= MAX_BLOGGER_POSTS_PER_CYCLE) {
          // Reached batch limit for this sync run
        } else {
          for (const item of items) {
            if (newPostsCount >= MAX_BLOGGER_POSTS_PER_CYCLE) break;
            const cleanTitle = (item.title || '').replace(/\s*-\s*[^-]+$/, '').trim();
            if (!cleanTitle) continue;

            // Double check deduplication: Skip if already published
            if (isDuplicatePost(item, cleanTitle)) {
              continue;
            }

            const { category: postCat } = detectPostCategory(cleanTitle, item.contentSnippet || '');
            const finalBloggerCategory = (!feed.category || feed.category.includes('Auto Detect')) ? postCat : (feed.category || postCat);

            logEvent(`Cloning 100% authentic article & media for: "${cleanTitle}" from ${feed.name}...`);
            const cloned = await cloneAuthenticArticle(item.link || feed.url, finalBloggerCategory);

            let postTitle = cleanTitle;
            let htmlContent = '';

            if (cloned && cloned.bodyContentHtml) {
              postTitle = cloned.title || cleanTitle;
              htmlContent = buildClonedHtmlArticle(cloned, finalBloggerCategory, item.sourceName || feed.name);

              // Update scrapedMap with real media & links for website feed
              const mapItem = scrapedMap.get(cleanTitle.toLowerCase());
              if (mapItem) {
                if (cloned.featuredImage) mapItem.imageUrl = cloned.featuredImage;
                if (cloned.applyOnlineUrl) mapItem.applyUrl = cloned.applyOnlineUrl;
              }
            } else {
              // Clean authentic fallback
              htmlContent = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.8; color: #1e293b; max-width: 800px; margin: 0 auto;">
                  <h2 style="color: #0f172a;">${cleanTitle}</h2>
                  <p style="font-size: 15px; color: #334155;">${item.contentSnippet || cleanTitle}</p>
                  <div style="margin: 24px 0; text-align: center;">
                    <a href="${item.link || feed.url}" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                      🔗 Open Official Notification & Apply Online
                    </a>
                  </div>
                </div>
              `;
            }

            try {
              const pubResult = await postToBlogger(postTitle, htmlContent, feed.labels || [finalBloggerCategory]);
              
              // Mark as posted in BOTH live mode and preview/simulated mode to guarantee ZERO duplicates
              markAsPosted(postTitle, cleanTitle, item.link || feed.url, cloned?.title);
              newPostsCount++;
              publishedInThisFeed = true;

              if (pubResult && pubResult.status === 'simulated') {
                logEvent(`[Blogger Preview] Post prepared & cached: "${postTitle}" (Awaiting Blogger OAuth credentials for live publishing)`, 'info');
              } else {
                logEvent(`✅ Successfully published: "${postTitle}" to Blogger!`, 'success');
              }

              // 6-second interval between posts to respect Google Cloud Blogger write limits
              await new Promise((res) => setTimeout(res, 6000));
              break; // Break so only 1 new post is published per feed per sync cycle
            } catch (postErr) {
              logEvent(`Failed to post "${postTitle}": ${postErr.message}`, 'error');
              if (postErr.message && (postErr.message.includes('quota') || postErr.message.includes('exhausted') || postErr.message.includes('429'))) {
                bloggerQuotaExhaustedUntil = Date.now() + 30 * 60 * 1000;
                logEvent(`[Blogger Quota] Google Blogger API write quota limit reached. Pausing Blogger publishing across all feeds for 30 minutes to stay within Google limits. Website live feed remains 100% active.`, 'warning');
                break;
              }
            }
          }
        }

        if (!publishedInThisFeed && !isBloggerQuotaPaused) {
          logEvent(`[Feed: ${feed.name}] All ${items.length} scraped posts are already synced. Zero duplicate reposts.`);
        }
      }
    } catch (feedErr) {
      logEvent(`Error in ${feed.name}: ${feedErr.message}`, 'error');
    }
  }

  // Persist top 150 verified scraped posts for immediate website display
  const updatedScrapedList = Array.from(scrapedMap.values()).slice(0, 150);
  saveJson(SCRAPED_POSTS_FILE, updatedScrapedList);

  // Synchronize with frontend data files so website immediately displays all newly scraped updates
  try {
    const siteLiveJobsPath = path.resolve(ROOT_DIR, '..', 'src', 'data', 'liveJobs.json');
    const publicLiveJobsPath = path.resolve(ROOT_DIR, '..', 'public', 'data', 'liveJobs.json');
    if (fs.existsSync(path.dirname(siteLiveJobsPath))) {
      saveJson(siteLiveJobsPath, updatedScrapedList);
    }
    if (fs.existsSync(path.dirname(publicLiveJobsPath))) {
      saveJson(publicLiveJobsPath, updatedScrapedList);
    }
  } catch (syncErr) {
    // Non-fatal if paths differ
  }

  logEvent(`Sync finished. Total new Blogger posts published: ${newPostsCount}. Total verified live posts on site: ${updatedScrapedList.length}`);
  return { newPostsCount, totalLiveItems: updatedScrapedList.length };
}

export function initCronService() {
  cron.schedule(CONFIG.CRON_SCHEDULE, () => {
    logEvent('Cron timer fired: running automatic sync.');
    runSyncRoutine();
  });
  logEvent(`Background Cron scheduler active: "${CONFIG.CRON_SCHEDULE}"`);

  // Run initial sync after 4 seconds on server startup
  setTimeout(() => {
    logEvent('Initiating startup scrape across all official recruitment portals...');
    runSyncRoutine().catch((e) => logEvent(`Startup sync error: ${e.message}`, 'error'));
  }, 4000);
}
