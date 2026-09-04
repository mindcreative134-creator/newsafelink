import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FEEDS_FILE = path.join(__dirname, 'feeds.json');
const LOGS_FILE = path.join(__dirname, 'logs.json');
const POSTED_CACHE_FILE = path.join(__dirname, 'posted_cache.json');

const app = express();
const PORT = process.env.PORT || 5000;
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
});

app.use(cors());
app.use(express.json());

// Blogger Configuration
const BLOG_ID = process.env.BLOGGER_BLOG_ID || process.env.BLOG_ID || '6924208631263306852';
const CLIENT_ID = process.env.BLOGGER_CLIENT_ID;
const CLIENT_SECRET = process.env.BLOGGER_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.BLOGGER_REFRESH_TOKEN;

// ── Helpers for persistent state ──
function loadJson(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

function saveJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error saving ${filePath}:`, err.message);
  }
}

function logEvent(message, type = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  const logs = loadJson(LOGS_FILE, []);
  logs.unshift({ timestamp, message, type });
  saveJson(LOGS_FILE, logs.slice(0, 100)); // keep last 100 logs
}

/**
 * Direct HTML Web Scraper (Cheerio / BeautifulSoup style as in CodeWithHarry tutorial)
 * Directly parses HTML, extracts tables, links, titles, and snippets from any regular webpage.
 */
async function scrapeDirectWebsite(feed) {
  logEvent(`Scraping website HTML directly with Cheerio: ${feed.url}...`);
  const response = await axios.get(feed.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    timeout: 12000,
  });

  const $ = cheerio.load(response.data);
  const items = [];
  const selector = feed.itemSelector || 'table tr, .post-item, article, .job-item, .entry, li a';

  $(selector).each((_, el) => {
    let title = '';
    let link = '';
    let snippet = '';

    if ($(el).is('tr')) {
      const linkEl = $(el).find('a').first();
      title = linkEl.text().trim() || $(el).find('td').first().text().trim();
      link = linkEl.attr('href') || feed.url;
      snippet = $(el).text().replace(/\s+/g, ' ').trim();
    } else {
      const linkEl = $(el).is('a') ? $(el) : $(el).find('a').first();
      title = $(el).find('h2, h3, h4, .title').first().text().trim() || linkEl.text().trim();
      link = linkEl.attr('href') || feed.url;
      snippet = $(el).find('p, .desc, .summary').first().text().trim() || title;
    }

    if (link && link.startsWith('/')) {
      try {
        const u = new URL(feed.url);
        link = `${u.origin}${link}`;
      } catch {
        // keep link as is
      }
    }

    if (title && title.length > 8 && title.length < 250 && link && link.startsWith('http')) {
      // Deduplicate within this single scrape run
      if (!items.some((it) => it.title === title)) {
        items.push({ title, link, contentSnippet: snippet });
      }
    }
  });

  logEvent(`Scraped ${items.length} items from ${feed.name}`, 'info');
  return items;
}

/**
 * Clean AdSense-Compliant HTML Article Builder for Blogger
 */
function buildHtmlArticle(title, snippet, sourceName, category, sourceUrl) {
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
    <div class="sarkari-article" style="font-family: Arial, sans-serif; line-height: 1.7; color: #1e293b; max-width: 800px; margin: 0 auto;">
      <!-- Top Overview Box -->
      <div style="background: #f8fafc; border-left: 5px solid #2563eb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 10px; color: #1e293b; font-size: 18px;">📌 Overview & Quick Facts</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px; font-weight: bold; width: 35%; color: #475569;">Post Name:</td>
            <td style="padding: 6px; color: #0f172a;">${title}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold; color: #475569;">Category:</td>
            <td style="padding: 6px; color: #2563eb; font-weight: bold;">${category}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold; color: #475569;">Update Date:</td>
            <td style="padding: 6px; color: #0f172a;">${today}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold; color: #475569;">Source / Board:</td>
            <td style="padding: 6px; color: #0f172a;">${sourceName}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold; color: #475569;">Status:</td>
            <td style="padding: 6px; color: #16a34a; font-weight: bold;">Active Online</td>
          </tr>
        </table>
      </div>

      <!-- Detailed Description -->
      <h2 style="color: #0f172a; font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
        ${title} – Complete Details
      </h2>
      <p style="font-size: 15px;">
        Latest official notification and announcement regarding <strong>${title}</strong> released by <strong>${sourceName}</strong>. Candidates and beneficiaries are advised to read the detailed instructions and eligibility standards below.
      </p>

      <!-- Eligibility Table -->
      <h3 style="color: #1e293b; font-size: 17px; margin-top: 24px;">🎯 Key Eligibility & Criteria</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; border: 1px solid #cbd5e1;">
        <thead>
          <tr style="background: #f1f5f9; text-align: left;">
            <th style="border: 1px solid #cbd5e1; padding: 10px;">Particulars</th>
            <th style="border: 1px solid #cbd5e1; padding: 10px;">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold;">Educational Qualification</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px;">10th / 12th / Graduate Degree (As per official notice)</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold;">Age Criteria</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px;">18 to 35 Years (Relaxation as per GOI guidelines)</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold;">Application Mode</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px;">Online Official Portal</td>
          </tr>
        </tbody>
      </table>

      <!-- Steps to Apply -->
      <h3 style="color: #1e293b; font-size: 17px; margin-top: 24px;">📝 How to Apply / Check Online</h3>
      <ol style="padding-left: 20px; font-size: 14px; line-height: 1.8;">
        <li>Visit the official portal using the direct links given below.</li>
        <li>Locate the notification link for <strong>${title}</strong>.</li>
        <li>Review the eligibility requirements and registration instructions.</li>
        <li>Complete online registration or application form and upload necessary documents.</li>
        <li>Submit the form and take a printout for future record.</li>
      </ol>

      <!-- Action Button Box -->
      <div style="background: #0f172a; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0; color: #ffffff;">
        <h4 style="margin: 0 0 12px; color: #f59e0b; font-size: 16px; text-transform: uppercase;">
          Official Link &amp; Application Portal
        </h4>
        <p style="font-size: 13px; color: #cbd5e1; margin-bottom: 16px;">
          Direct link to official advertisement and recruitment portal:
        </p>
        <div>
          <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px;">
            🔗 Open Official Notice & Apply Online
          </a>
        </div>
        <p style="font-size: 11px; color: #94a3b8; margin: 12px 0 0;">
          Notice: Always verify full guidelines on the official government recruitment portal.
        </p>
      </div>
    </div>
  `;
}

/**
 * Get Google OAuth Access Token
 */
async function getGoogleAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return null;
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  return data.access_token || null;
}

/**
 * Publish a post to Blogger API
 */
async function postToBlogger(title, contentHtml, labels = []) {
  const token = await getGoogleAccessToken();

  // If no OAuth token configured, run in Simulation / Preview mode
  if (!token) {
    logEvent(`[Simulated] Post prepared for Blogger: "${title}" (OAuth token not configured)`, 'info');
    return { id: `simulated-${Date.now()}`, title };
  }

  const url = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      kind: 'blogger#post',
      title,
      content: contentHtml,
      labels,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Blogger API failed');
  }

  return res.json();
}

/**
 * Main Fetch & Post Sync Routine (Supports both RSS and Direct Cheerio Web Scraping)
 */
async function syncFeedsToBlogger() {
  logEvent('Starting sync routine across configured sites/feeds...');
  const feeds = loadJson(FEEDS_FILE, []);
  const postedCache = new Set(loadJson(POSTED_CACHE_FILE, []));
  let newPostsCount = 0;

  for (const feed of feeds) {
    if (!feed.enabled) continue;

    try {
      logEvent(`Processing: ${feed.name} (${feed.type || 'rss'})...`);
      let items = [];

      if (feed.type === 'scrape') {
        items = await scrapeDirectWebsite(feed);
      } else {
        try {
          const parsed = await parser.parseURL(feed.url);
          if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
            items = parsed.items;
          } else {
            throw new Error('No items returned by RSS feed');
          }
        } catch (rssErr) {
          logEvent(`RSS failed for "${feed.name}" (${rssErr.message}). Falling back to Cheerio HTML scraper...`, 'warning');
          items = await scrapeDirectWebsite(feed);
        }
      }

      if (Array.isArray(items) && items.length > 0) {
        // Take up to 2 newest items per feed per sync run
        for (const item of items.slice(0, 2)) {
          const cleanTitle = (item.title || '').replace(/\s*-\s*[^-]+$/, '').trim();
          if (!cleanTitle || postedCache.has(cleanTitle)) {
            continue;
          }

          const htmlContent = buildHtmlArticle(
            cleanTitle,
            item.contentSnippet || item.content || item.summary || cleanTitle,
            feed.name,
            feed.category,
            item.link || feed.url
          );

          try {
            await postToBlogger(cleanTitle, htmlContent, feed.labels || [feed.category]);
            postedCache.add(cleanTitle);
            newPostsCount++;
            logEvent(`✅ Successfully published: "${cleanTitle}" to Blogger!`, 'success');
          } catch (postErr) {
            logEvent(`Failed to publish "${cleanTitle}": ${postErr.message}`, 'error');
          }
        }
      }
    } catch (feedErr) {
      logEvent(`Error processing ${feed.name}: ${feedErr.message}`, 'error');
    }
  }

  // Save posted cache (keep last 500)
  saveJson(POSTED_CACHE_FILE, Array.from(postedCache).slice(-500));
  logEvent(`Sync finished. Total new posts published: ${newPostsCount}`);
  return { newPostsCount };
}

// ── Scheduled Cron Job (Runs every 2 hours) ──
const cronSchedule = process.env.CRON_SCHEDULE || '0 */2 * * *';
cron.schedule(cronSchedule, () => {
  logEvent('Cron job triggered scheduled feed sync.');
  syncFeedsToBlogger();
});

// ── REST API Routes ──

// Health check for Render uptime
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), blogId: BLOG_ID });
});

// Get all configured feeds
app.get('/api/feeds', (req, res) => {
  res.json(loadJson(FEEDS_FILE, []));
});

// Add new feed
app.post('/api/feeds', (req, res) => {
  const { name, url, category, type, itemSelector, labels } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required' });
  }

  const feeds = loadJson(FEEDS_FILE, []);
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
  saveJson(FEEDS_FILE, feeds);
  logEvent(`Added new source: ${name} (${newFeed.type})`);
  res.json({ success: true, feed: newFeed });
});

// Toggle or delete feed
app.delete('/api/feeds/:id', (req, res) => {
  let feeds = loadJson(FEEDS_FILE, []);
  feeds = feeds.filter((f) => f.id !== req.params.id);
  saveJson(FEEDS_FILE, feeds);
  logEvent(`Deleted feed: ${req.params.id}`);
  res.json({ success: true });
});

// Manual Sync Trigger
app.post('/api/sync-now', async (req, res) => {
  try {
    const result = await syncFeedsToBlogger();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get logs
app.get('/api/logs', (req, res) => {
  res.json(loadJson(LOGS_FILE, []));
});

// ── Built-in Modern Web Dashboard ──
app.get('/', (req, res) => {
  const feeds = loadJson(FEEDS_FILE, []);
  const logs = loadJson(LOGS_FILE, []);
  const isOauthConfigured = Boolean(CLIENT_ID && REFRESH_TOKEN);

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sarkari Blogger Auto-Publisher & Web Scraper Bot</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-950 text-slate-100 min-h-screen p-4 sm:p-8 font-sans">
      <div class="max-w-5xl mx-auto flex flex-col gap-8">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider">
                Render Backend Worker
              </span>
              <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
                Cheerio / BeautifulSoup Web Scraper
              </span>
            </div>
            <h1 class="text-3xl font-black text-white mt-1">Sarkari Blogger Auto-Publisher Bot</h1>
            <p class="text-slate-400 text-sm mt-1">
              Target Blog ID: <code class="bg-slate-900 px-2 py-0.5 rounded text-amber-400">${BLOG_ID}</code> | 
              Cron: <code class="bg-slate-900 px-2 py-0.5 rounded text-indigo-400">${cronSchedule}</code>
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="triggerSync()" class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center gap-2">
              ⚡ Sync &amp; Post Now
            </button>
          </div>
        </div>

        <!-- Status Card -->
        <div class="p-6 rounded-2xl ${isOauthConfigured ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-200' : 'bg-amber-950/40 border border-amber-800/60 text-amber-200'} flex items-start gap-4">
          <div class="text-2xl">${isOauthConfigured ? '✅' : 'ℹ️'}</div>
          <div>
            <h3 class="font-bold text-base text-white">
              ${isOauthConfigured ? 'Blogger OAuth2 Connected & Active' : 'Simulation Mode Active (Preview Ready)'}
            </h3>
            <p class="text-xs leading-relaxed mt-1 opacity-90">
              ${isOauthConfigured 
                ? 'Your backend server is fully connected to Google Blogger API. New posts from the configured sites are automatically published.' 
                : 'To post live on Blogger, set BLOGGER_CLIENT_ID, BLOGGER_CLIENT_SECRET, and BLOGGER_REFRESH_TOKEN in your Render Environment Variables. Until set, the bot runs safely in simulation/preview mode.'}
            </p>
          </div>
        </div>

        <!-- Feeds List -->
        <div class="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 class="text-lg font-black text-white">Connected Target Sites / Scrapers (${feeds.length})</h2>
            <span class="text-xs text-slate-400">Supports RSS &amp; Direct HTML Scraping</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${feeds.map(f => `
              <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm text-white">${f.name}</span>
                  <div class="flex items-center gap-1.5">
                    <span class="px-2 py-0.5 rounded-full ${f.type === 'scrape' ? 'bg-emerald-950 text-emerald-400' : 'bg-blue-950 text-blue-400'} text-[9px] font-bold uppercase">${f.type || 'rss'}</span>
                    <span class="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 text-[9px] font-bold uppercase">${f.category}</span>
                  </div>
                </div>
                <div class="text-xs text-slate-400 truncate font-mono">${f.url}</div>
                <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span class="text-emerald-400 font-bold">● Active</span>
                  <button onclick="deleteFeed('${f.id}')" class="text-red-400 hover:text-red-300 font-bold">Remove</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Add Feed / Scraper Form -->
        <div class="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <h2 class="text-lg font-black text-white mb-2">Add Target Website / RSS Feed</h2>
          <p class="text-xs text-slate-400 mb-4">Add any RSS feed link OR any normal website URL (which will be scraped using Cheerio HTML parser).</p>
          <form onsubmit="addFeed(event)" class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input id="feedName" type="text" placeholder="Site Name (e.g. FreeJobAlert)" required class="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input id="feedUrl" type="url" placeholder="URL (RSS or Webpage)" required class="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <select id="feedType" class="px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white">
              <option value="rss">Type: RSS Feed (Auto)</option>
              <option value="scrape">Type: HTML Web Scraper</option>
            </select>
            <div class="flex gap-2">
              <select id="feedCategory" class="px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white flex-1">
                <option value="Latest Jobs">Latest Jobs</option>
                <option value="Govt Schemes & Yojana">Govt Schemes &amp; Yojana</option>
                <option value="University & Admissions">University &amp; Admissions</option>
                <option value="Admit Cards">Admit Cards</option>
                <option value="Results">Results</option>
              </select>
              <button type="submit" class="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider">
                Add
              </button>
            </div>
          </form>
        </div>

        <!-- Live Activity Logs -->
        <div class="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-black text-white">Live Activity &amp; Posting Logs</h2>
            <button onclick="location.reload()" class="text-xs text-indigo-400 hover:underline">Refresh Logs</button>
          </div>
          <div class="flex flex-col gap-2 max-h-64 overflow-y-auto font-mono text-xs text-slate-300">
            ${logs.length === 0 ? '<div class="text-slate-500">No logs recorded yet.</div>' : logs.map(l => `
              <div class="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <span class="${l.type === 'success' ? 'text-emerald-400' : l.type === 'error' ? 'text-red-400' : l.type === 'warning' ? 'text-amber-400' : 'text-slate-300'}">${l.message}</span>
                <span class="text-slate-500 text-[10px] shrink-0">${new Date(l.timestamp).toLocaleTimeString()}</span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <script>
        async function triggerSync() {
          const btn = event.target;
          btn.disabled = true;
          btn.innerText = 'Syncing...';
          try {
            const res = await fetch('/api/sync-now', { method: 'POST' });
            const data = await res.json();
            alert('Sync completed! Published: ' + (data.newPostsCount || 0) + ' new posts.');
            location.reload();
          } catch(e) {
            alert('Sync failed: ' + e.message);
          } finally {
            btn.disabled = false;
            btn.innerText = '⚡ Sync & Post Now';
          }
        }

        async function addFeed(e) {
          e.preventDefault();
          const name = document.getElementById('feedName').value;
          const url = document.getElementById('feedUrl').value;
          const type = document.getElementById('feedType').value;
          const category = document.getElementById('feedCategory').value;
          await fetch('/api/feeds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, url, type, category })
          });
          location.reload();
        }

        async function deleteFeed(id) {
          if (confirm('Delete this source?')) {
            await fetch('/api/feeds/' + id, { method: 'DELETE' });
            location.reload();
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  logEvent(`Server running on port ${PORT}`);
});
