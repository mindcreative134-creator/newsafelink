import express from 'express';
import { CONFIG } from '../config/index.js';
import { runSyncRoutine } from '../services/cronService.js';
import { loadJson, saveJson, logEvent, LOGS_FILE } from '../utils/logger.js';

const router = express.Router();

// Health check for Render uptime monitoring
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    blogId: CONFIG.BLOG_ID,
    cronSchedule: CONFIG.CRON_SCHEDULE,
  });
});

// Get all configured sites & feeds
router.get('/api/feeds', (req, res) => {
  res.json(loadJson(CONFIG.FEEDS_FILE, []));
});

// Add new site or scraper
router.post('/api/feeds', (req, res) => {
  const { name, url, category, type, itemSelector, labels } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'Site name and URL are required' });
  }

  const feeds = loadJson(CONFIG.FEEDS_FILE, []);
  const newFeed = {
    id: `feed-${Date.now()}`,
    name,
    url,
    category: category || 'Latest Jobs',
    type: type || 'rss',
    itemSelector: itemSelector || '',
    labels: labels || ['Sarkari Update'],
    enabled: true,
  };
  feeds.push(newFeed);
  saveJson(CONFIG.FEEDS_FILE, feeds);
  logEvent(`Added new target source: ${name} (${newFeed.type})`);
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

export default router;
