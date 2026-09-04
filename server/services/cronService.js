import cron from 'node-cron';
import { CONFIG } from '../config/index.js';
import { scrapeSite } from '../scrapers/index.js';
import { buildHtmlArticle } from './articleTemplate.js';
import { postToBlogger } from './bloggerPublisher.js';
import { loadJson, saveJson, logEvent, POSTED_CACHE_FILE } from '../utils/logger.js';

export async function runSyncRoutine() {
  logEvent('Starting sync routine across all configured websites & scrapers...');
  const feeds = loadJson(CONFIG.FEEDS_FILE, []);
  const postedCache = new Set(loadJson(POSTED_CACHE_FILE, []));
  let newPostsCount = 0;

  for (const feed of feeds) {
    if (!feed.enabled) continue;

    try {
      logEvent(`Processing source: ${feed.name}...`);
      const items = await scrapeSite(feed);

      if (Array.isArray(items) && items.length > 0) {
        // Take up to 2 newest items per site per sync run
        for (const item of items.slice(0, 2)) {
          const cleanTitle = (item.title || '').replace(/\s*-\s*[^-]+$/, '').trim();
          if (!cleanTitle || postedCache.has(cleanTitle)) {
            continue;
          }

          const htmlContent = buildHtmlArticle(
            cleanTitle,
            item.contentSnippet || cleanTitle,
            item.sourceName || feed.name,
            feed.category,
            item.link || feed.url
          );

          try {
            await postToBlogger(cleanTitle, htmlContent, feed.labels || [feed.category]);
            postedCache.add(cleanTitle);
            newPostsCount++;
            logEvent(`✅ Successfully published: "${cleanTitle}" to Blogger!`, 'success');
          } catch (postErr) {
            logEvent(`Failed to post "${cleanTitle}": ${postErr.message}`, 'error');
          }
        }
      }
    } catch (feedErr) {
      logEvent(`Error in ${feed.name}: ${feedErr.message}`, 'error');
    }
  }

  // Save posted cache (keep last 500)
  saveJson(POSTED_CACHE_FILE, Array.from(postedCache).slice(-500));
  logEvent(`Sync finished. Total new posts published: ${newPostsCount}`);
  return { newPostsCount };
}

export function initCronService() {
  cron.schedule(CONFIG.CRON_SCHEDULE, () => {
    logEvent('Cron timer fired: running automatic sync.');
    runSyncRoutine();
  });
  logEvent(`Background Cron scheduler active: "${CONFIG.CRON_SCHEDULE}"`);
}
