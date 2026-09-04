import express from 'express';
import { CONFIG } from '../config/index.js';
import { loadJson, LOGS_FILE } from '../utils/logger.js';

const router = express.Router();

router.get('/', (req, res) => {
  const feeds = loadJson(CONFIG.FEEDS_FILE, []);
  const logs = loadJson(LOGS_FILE, []);
  const isOauthConfigured = Boolean(CONFIG.CLIENT_ID && CONFIG.REFRESH_TOKEN);

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sarkari Blogger Auto-Publisher &amp; Multi-Site Web Scraper</title>
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
                Modular Architecture
              </span>
            </div>
            <h1 class="text-3xl font-black text-white mt-1">Sarkari Blogger Auto-Publisher Bot</h1>
            <p class="text-slate-400 text-sm mt-1">
              Target Blog ID: <code class="bg-slate-900 px-2 py-0.5 rounded text-amber-400">${CONFIG.BLOG_ID}</code> | 
              Cron: <code class="bg-slate-900 px-2 py-0.5 rounded text-indigo-400">${CONFIG.CRON_SCHEDULE}</code>
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
            <div>
              <h2 class="text-lg font-black text-white">Connected Target Sites &amp; Scrapers (${feeds.length})</h2>
              <p class="text-xs text-slate-400">Har site ka alag module/scraper banaya gaya hai</p>
            </div>
            <span class="text-xs font-bold text-indigo-400 bg-indigo-950 px-3 py-1 rounded-full">Automated</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${feeds.map(f => `
              <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm text-white">${f.name}</span>
                  <div class="flex items-center gap-1.5">
                    <span class="px-2 py-0.5 rounded-full ${f.type === 'scrape' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-blue-950 text-blue-400 border border-blue-800/50'} text-[9px] font-bold uppercase">${f.type || 'rss'}</span>
                    <span class="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 text-[9px] font-bold uppercase">${f.category}</span>
                  </div>
                </div>
                <div class="text-xs text-slate-400 truncate font-mono">${f.url}</div>
                <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span class="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active Scraper
                  </span>
                  <button onclick="deleteFeed('${f.id}')" class="text-red-400 hover:text-red-300 font-bold">Remove</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Add Feed / Scraper Form -->
        <div class="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <h2 class="text-lg font-black text-white mb-1">Add Another Target Website / Scraper</h2>
          <p class="text-xs text-slate-400 mb-4">Koi bhi RSS feed URL ya direct website link daalein (Cheerio parser automatically scrape karega).</p>
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

export default router;
