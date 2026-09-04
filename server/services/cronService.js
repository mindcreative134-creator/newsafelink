import cron from 'node-cron';
import { CONFIG } from '../config/index.js';
import { scrapeSite } from '../scrapers/index.js';
import { buildClonedHtmlArticle } from './articleTemplate.js';
import { cloneAuthenticArticle } from '../scrapers/articleCloner.js';
import { detectPostCategory } from '../scrapers/universalDetector.js';
import { postToBlogger } from './bloggerPublisher.js';
import { loadJson, saveJson, logEvent, POSTED_CACHE_FILE, SCRAPED_POSTS_FILE } from '../utils/logger.js';

export async function runSyncRoutine() {
  logEvent('Starting sync routine across all configured websites & scrapers...');
  const feeds = loadJson(CONFIG.FEEDS_FILE, []);
  const postedCache = new Set(loadJson(POSTED_CACHE_FILE, []));
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
        // 1. Collect and format genuine verified items for website display
        for (const item of items) {
          const cleanTitle = (item.title || '').replace(/\s*-\s*[^-]+$/, '').trim();
          if (!cleanTitle) continue;

          const key = cleanTitle.toLowerCase();
          if (!scrapedMap.has(key)) {
            const cleanSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 35);
            const { category: detectedCat, badge: detectedBadge } = detectPostCategory(cleanTitle, item.contentSnippet || '');
            const postCategory = (!feed.category || feed.category.includes('Auto Detect')) ? detectedCat : (item.category || feed.category || detectedCat);
            const postBadge = item.badge || detectedBadge;

            scrapedMap.set(key, {
              id: `scraped-${cleanSlug}`,
              title: cleanTitle,
              category: postCategory,
              organization: item.sourceName || feed.name,
              totalPosts: 'Refer to Notification',
              qualification: 'As per Official Notice',
              lastDate: 'Online Application Active',
              status: 'Active',
              badge: postBadge,
              applyUrl: item.link || feed.url,
              summary: item.contentSnippet || `${postCategory} update from ${feed.name}: ${cleanTitle}`,
              publishedDate: new Date().toISOString().split('T')[0],
              ageLimit: 'As per official recruitment rules',
              imageUrl: item.imageUrl || '',
              sourceName: item.sourceName || feed.name,
              isScrapedLive: true,
            });
          }
        }

        // 2. Publish newest item to Blogger (1 per feed to respect Google Blogger rate quotas)
        for (const item of items.slice(0, 1)) {
          const cleanTitle = (item.title || '').replace(/\s*-\s*[^-]+$/, '').trim();
          if (!cleanTitle || postedCache.has(cleanTitle)) {
            continue;
          }

          const { category: postCat } = detectPostCategory(cleanTitle, item.contentSnippet || '');
          const finalBloggerCategory = (!feed.category || feed.category.includes('Auto Detect')) ? postCat : (feed.category || postCat);

          logEvent(`Cloning 100% authentic article & media for: "${cleanTitle}"...`);
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
            const pubResult = await postToBlogger(postTitle, htmlContent, feed.labels || [feed.category]);
            if (pubResult && pubResult.status === 'simulated') {
              logEvent(`[Blogger Preview] Post prepared: "${postTitle}" (Awaiting Blogger OAuth credentials for live publishing)`, 'info');
            } else {
              postedCache.add(cleanTitle);
              newPostsCount++;
              logEvent(`✅ Successfully published: "${postTitle}" to Blogger!`, 'success');
              // 5-second interval between posts to respect Google Cloud Blogger write limits
              await new Promise((res) => setTimeout(res, 5000));
            }
          } catch (postErr) {
            logEvent(`Failed to post "${postTitle}": ${postErr.message}`, 'error');
            if (postErr.message && postErr.message.includes('quota')) {
              logEvent(`[Blogger Quota] Google Blogger API write quota limit reached. Pausing until next cycle.`, 'warning');
              break;
            }
          }
        }
      }
    } catch (feedErr) {
      logEvent(`Error in ${feed.name}: ${feedErr.message}`, 'error');
    }
  }

  // Persist top 120 verified scraped posts for immediate website display
  const updatedScrapedList = Array.from(scrapedMap.values()).slice(0, 120);
  saveJson(SCRAPED_POSTS_FILE, updatedScrapedList);

  // Save posted cache (keep last 500)
  saveJson(POSTED_CACHE_FILE, Array.from(postedCache).slice(-500));
  logEvent(`Sync finished. Total new posts published: ${newPostsCount}. Total verified live posts on site: ${updatedScrapedList.length}`);
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
