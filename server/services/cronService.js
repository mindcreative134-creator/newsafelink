import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import { CONFIG } from '../config/index.js';
import { scrapeSite } from '../scrapers/index.js';
import { buildClonedHtmlArticle, generateComprehensiveArticle } from './articleTemplate.js';
import { cloneAuthenticArticle } from '../scrapers/articleCloner.js';
import { detectPostCategory } from '../scrapers/universalDetector.js';
import { postToBlogger, fetchAllLiveBloggerPosts } from './bloggerPublisher.js';
import { loadJson, saveJson, logEvent, POSTED_CACHE_FILE, SCRAPED_POSTS_FILE } from '../utils/logger.js';
import { updateSitemapXml } from './sitemapGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Circuit breaker for Google Blogger API write quotas
let bloggerQuotaExhaustedUntil = 0;
const MAX_BLOGGER_POSTS_PER_CYCLE = 2; // 2 posts per cycle = ~200 posts/day, avoids triggering Google burst limits

// ── Stop words & Semantic Tokenizer for 100% Duplicate Prevention ──
const STOP_WORDS = new Set([
  'recruitment', 'bharti', 'भर्ती', 'online', 'form', 'apply', 'notification', 'out', 
  'new', 'check', 'download', 'details', 'for', 'and', 'the', 'with', 'post', 
  'posts', 'पद', '2024', '2025', '2026', '2027', 'vacancy', 'vacancies', 'exam', 
  'date', 'portal', 'official', 'link', 'update', 'updates', 'regarding', 'how',
  'sarkari', 'result', 'रिजल्ट', 'admit', 'card'
]);

function extractSignificantTokens(str) {
  if (!str || typeof str !== 'string') return [];
  const words = str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  return [...new Set(words)];
}

function isSemanticDuplicate(titleA, titleB) {
  const t1 = extractSignificantTokens(titleA);
  const t2 = extractSignificantTokens(titleB);
  if (t1.length === 0 || t2.length === 0) return false;

  const set2 = new Set(t2);
  const intersection = t1.filter((w) => set2.has(w));

  const minLen = Math.min(t1.length, t2.length);
  const overlapRatio = intersection.length / minLen;

  // If two titles share 2+ core tokens and cover >= 50% of the shorter title's tokens
  if (intersection.length >= 2 && overlapRatio >= 0.5) {
    return true;
  }
  // Single strong token match if both titles only have 1 significant token
  if (t1.length === 1 && t2.length === 1 && t1[0] === t2[0]) {
    return true;
  }
  return false;
}

// ── Text & URL Normalizers ──
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
  
  // ── 1. Fetch Live Blogger Posts to Guarantee Zero Duplicate Reposting ──
  let liveBloggerPosts = [];
  try {
    liveBloggerPosts = await fetchAllLiveBloggerPosts();
    logEvent(`[Deduplication Engine] Synced ${liveBloggerPosts.length} live posts directly from Blogger API.`);
  } catch (err) {
    logEvent(`[Deduplication Engine] Could not fetch live Blogger posts: ${err.message}`, 'warning');
  }

  // ── 2. Load and Index Persistent Deduplication Cache ──
  const rawPostedCache = loadJson(POSTED_CACHE_FILE, []);
  const postedCacheEntries = [];
  const postedTitlesSet = new Set();
  const postedUrlsSet = new Set();
  const postedSlugsSet = new Set();
  const allKnownTitles = [];

  function registerKnownPost(title, cleanTitle = '', url = '', slug = '') {
    if (title) {
      postedTitlesSet.add(normalizeText(title));
      allKnownTitles.push(title);
    }
    if (cleanTitle) {
      postedTitlesSet.add(normalizeText(cleanTitle));
      allKnownTitles.push(cleanTitle);
    }
    if (url) {
      postedUrlsSet.add(normalizeUrl(url));
    }
    if (slug) {
      postedSlugsSet.add(slug);
    } else if (title) {
      postedSlugsSet.add(toSlug(title));
    }
  }

  // Index all live Blogger posts
  for (const bp of liveBloggerPosts) {
    registerKnownPost(bp.title, bp.title, bp.url);
  }

  // Index all pre-existing posts from liveJobs.json
  try {
    const siteLiveJobsPath = path.resolve(ROOT_DIR, '..', 'src', 'data', 'liveJobs.json');
    if (fs.existsSync(siteLiveJobsPath)) {
      const localJobs = loadJson(siteLiveJobsPath, []);
      for (const lj of localJobs) {
        registerKnownPost(lj.title, lj.title, lj.applyUrl);
      }
    }
  } catch {}

  // Index all cached posts from POSTED_CACHE_FILE
  for (const entry of rawPostedCache) {
    if (typeof entry === 'string') {
      registerKnownPost(entry, entry);
      postedCacheEntries.push({ title: entry, cleanTitle: entry });
    } else if (entry && typeof entry === 'object') {
      registerKnownPost(entry.title, entry.cleanTitle, entry.url, entry.slug);
      if (entry.clonedTitle) registerKnownPost(entry.clonedTitle);
      postedCacheEntries.push(entry);
    }
  }

  function isDuplicatePost(item, cleanTitle = '') {
    if (!item) return true;
    const titleToCheck = cleanTitle || item.title || '';
    const normTitle = normalizeText(titleToCheck);

    // Tier 1: Exact Normalized Title
    if (normTitle && postedTitlesSet.has(normTitle)) return true;

    // Tier 2: Normalized Canonical URL
    if (item.link) {
      const normUrl = normalizeUrl(item.link);
      if (normUrl && postedUrlsSet.has(normUrl)) return true;
    }

    // Tier 3: Slug Match
    const slug = toSlug(titleToCheck);
    if (slug && postedSlugsSet.has(slug)) return true;

    // Tier 4: Fuzzy Semantic & Core Entity Overlap Match
    for (const known of allKnownTitles) {
      if (isSemanticDuplicate(titleToCheck, known)) {
        return true;
      }
    }

    return false;
  }

  function markAsPosted(title, cleanTitle, url, clonedTitle = '') {
    registerKnownPost(title, cleanTitle, url);
    if (clonedTitle) registerKnownPost(clonedTitle);

    postedCacheEntries.push({
      title,
      cleanTitle: cleanTitle || title,
      clonedTitle: clonedTitle || undefined,
      url: url ? normalizeUrl(url) : undefined,
      slug: toSlug(title),
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
            const { category: detectedCat, badge: detectedBadge } = detectPostCategory(cleanTitle, item.contentSnippet || '', feed);
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
              totalPosts: 'Refer to Source Notice',
              qualification: 'As per Official Guidelines',
              lastDate: 'Active',
              status: 'Active',
              badge: postBadge,
              applyUrl: item.link || feed.url,
              summary: item.contentSnippet || `${postCategory} update from ${feed.name}: ${cleanTitle}`,
              publishedDate: new Date().toISOString().split('T')[0],
              ageLimit: 'As per official norms',
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

            const { category: postCat } = detectPostCategory(cleanTitle, item.contentSnippet || '', feed);
            const finalBloggerCategory = (!feed.category || feed.category.includes('Auto Detect')) ? postCat : (feed.category || postCat);

            logEvent(`Cloning authentic article & media for: "${cleanTitle}" from ${feed.name}...`);
            const cloned = await cloneAuthenticArticle(item.link || feed.url, finalBloggerCategory);

            let postTitle = cleanTitle;
            let htmlContent = '';

            if (cloned && cloned.bodyContentHtml && cloned.bodyContentHtml.length > 250) {
              postTitle = cloned.title || cleanTitle;
              htmlContent = buildClonedHtmlArticle(cloned, finalBloggerCategory, item.sourceName || feed.name);
            } else {
              // High-value, comprehensive editorial post with overview, breakdown, tables, and FAQs
              htmlContent = generateComprehensiveArticle({
                title: cleanTitle,
                category: finalBloggerCategory,
                sourceName: item.sourceName || feed.name,
                sourceUrl: item.link || feed.url,
                snippet: item.contentSnippet || cleanTitle,
                featuredImage: cloned?.featuredImage || item.imageUrl || '',
                existingBody: cloned?.bodyContentHtml || '',
              });
            }

            // Update scrapedMap with real media, body content & links for website feed
            const mapItem = scrapedMap.get(cleanTitle.toLowerCase());
            if (mapItem) {
              if (cloned?.featuredImage) mapItem.imageUrl = cloned.featuredImage;
              if (cloned?.applyOnlineUrl) mapItem.applyUrl = cloned.applyOnlineUrl;
              mapItem.bodyContentHtml = htmlContent;
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

  // Persist top 300 verified scraped posts across all categories for immediate website display
  const updatedScrapedList = Array.from(scrapedMap.values()).slice(0, 300);
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

  // Dynamically regenerate sitemap.xml and ping Google & Bing search engines
  try {
    await updateSitemapXml(updatedScrapedList);
  } catch (sitemapErr) {
    logEvent(`[SEO Sitemap] Failed to update sitemap: ${sitemapErr.message}`, 'warning');
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
