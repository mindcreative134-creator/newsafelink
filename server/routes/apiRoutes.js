import express from 'express';
import { CONFIG } from '../config/index.js';
import { runSyncRoutine } from '../services/cronService.js';
import { autoDetectSite, cleanSiteUrl } from '../scrapers/universalDetector.js';
import { getKeepAliveStatus } from '../services/keepAliveService.js';
import { loadJson, saveJson, logEvent, LOGS_FILE, SCRAPED_POSTS_FILE } from '../utils/logger.js';

const router = express.Router();

// ── Render 24/7 Anti-Sleep Keep-Alive Ping Endpoint ──
router.get('/ping', (req, res) => {
  res.status(200).json({
    status: 'pong - alive',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    keepAlive: 'Active 24/7',
  });
});

// Health check for Render uptime monitoring
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    blogId: CONFIG.BLOG_ID,
    cronSchedule: CONFIG.CRON_SCHEDULE,
    keepAlive: getKeepAliveStatus(),
  });
});

// Get keep-alive status
router.get('/api/keep-alive-status', (req, res) => {
  res.json(getKeepAliveStatus());
});

// Get all configured sites & feeds
router.get('/api/feeds', (req, res) => {
  res.json(loadJson(CONFIG.FEEDS_FILE, []));
});

// ── ⚡ Universal 1-Click Site Auto-Detector & Adder ──
// Accepts JUST a website URL, automatically detects site name, RSS vs HTML, and categories!
router.post('/api/feeds/auto-detect', async (req, res) => {
  const { url, name, category } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Please provide a website URL.' });
  }

  try {
    logEvent(`⚡ Running 1-Click Auto-Detector for website: ${url}...`);
    const detected = await autoDetectSite(url);

    const feeds = loadJson(CONFIG.FEEDS_FILE, []);
    const cleanUrl = cleanSiteUrl(url);

    // Prevent adding exact duplicate URL
    const existing = feeds.find((f) => cleanSiteUrl(f.url) === cleanUrl);
    if (existing) {
      return res.json({
        success: true,
        alreadyExists: true,
        message: `Site "${existing.name}" is already connected!`,
        feed: existing,
      });
    }

    const newFeed = {
      id: `feed-${Date.now()}`,
      name: name?.trim() || detected.name,
      url: cleanUrl,
      type: detected.type || 'scrape',
      category: category || 'Auto Detect (Multi-Category)',
      labels: detected.labels || [detected.name, 'Sarkari Update'],
      enabled: true,
    };

    feeds.push(newFeed);
    saveJson(CONFIG.FEEDS_FILE, feeds);

    logEvent(`✅ Successfully auto-configured source: "${newFeed.name}" (${newFeed.type}) with ${detected.samplePostsFound} initial posts detected.`);

    res.json({
      success: true,
      feed: newFeed,
      detected,
      message: `Successfully added ${newFeed.name} (${newFeed.type.toUpperCase()})!`,
    });
  } catch (err) {
    logEvent(`Auto-detector error for ${url}: ${err.message}`, 'error');
    res.status(500).json({ error: `Auto-detection failed: ${err.message}` });
  }
});

// Add new site or scraper (supports optional manual overrides)
router.post('/api/feeds', (req, res) => {
  const { name, url, category, type, itemSelector, labels } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const cleanUrl = cleanSiteUrl(url);
  const derivedName = name?.trim() || new URL(cleanUrl).hostname.replace(/^www\./, '');

  const feeds = loadJson(CONFIG.FEEDS_FILE, []);
  const newFeed = {
    id: `feed-${Date.now()}`,
    name: derivedName,
    url: cleanUrl,
    category: category || 'Auto Detect (Multi-Category)',
    type: type || 'scrape',
    itemSelector: itemSelector || '',
    labels: labels || [derivedName, 'Sarkari Update'],
    enabled: true,
  };
  feeds.push(newFeed);
  saveJson(CONFIG.FEEDS_FILE, feeds);
  logEvent(`Added new target source: ${derivedName} (${newFeed.type})`);
  res.json({ success: true, feed: newFeed });
});

// Delete a feed
router.delete('/api/feeds/:id', (req, res) => {
  let feeds = loadJson(CONFIG.FEEDS_FILE, []);
  feeds = feeds.filter((f) => f.id !== req.params.id);
  saveJson(CONFIG.FEEDS_FILE, feeds);
  logEvent(`Removed source: ${req.params.id}`);
  res.json({ success: true });
});

// Trigger manual sync
router.post('/api/sync-now', async (req, res) => {
  try {
    const result = await runSyncRoutine();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get logs
router.get('/api/logs', (req, res) => {
  res.json(loadJson(LOGS_FILE, []));
});

// Get latest verified scraped posts for instant frontend display
router.get('/api/latest-posts', (req, res) => {
  const posts = loadJson(SCRAPED_POSTS_FILE, []);
  res.json(posts);
});

export default router;
