import express from 'express';
import { CONFIG } from '../config/index.js';
import { loadJson, LOGS_FILE, SCRAPED_POSTS_FILE } from '../utils/logger.js';
import { getKeepAliveStatus } from '../services/keepAliveService.js';

const router = express.Router();

router.get('/', (req, res) => {
  const feeds = loadJson(CONFIG.FEEDS_FILE, []);
  const logs = loadJson(LOGS_FILE, []);
  const scrapedPosts = loadJson(SCRAPED_POSTS_FILE, []);
  const isOauthConfigured = Boolean(CONFIG.CLIENT_ID && CONFIG.REFRESH_TOKEN);
  const keepAlive = getKeepAliveStatus();

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sarkari Blogger Auto-Publisher &amp; Universal Web Scraper</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-950 text-slate-100 min-h-screen p-4 sm:p-8 font-sans">
      <div class="max-w-5xl mx-auto flex flex-col gap-8">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider">
                Render 24/7 Worker
              </span>
              <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
                Universal Auto-Scraper
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

        <!-- Render 24/7 Anti-Sleep Keep-Alive Monitor Card -->
        <div class="p-6 rounded-3xl bg-slate-900/80 border border-indigo-900/40 shadow-xl flex flex-col gap-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2.5">
              <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              <h2 class="text-base font-black text-white">Render 24/7 Anti-Sleep Keep-Alive Engine</h2>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-[10px] font-black uppercase">
                Active 24/7
              </span>
            </div>
            <div class="text-xs text-slate-400 font-mono">
              Auto-Ping Interval: <span class="text-indigo-400 font-bold">Every 10 Minutes</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span class="text-slate-400 block mb-1">Target Keep-Alive Endpoint</span>
              <span class="font-mono text-indigo-300 font-bold break-all">${keepAlive.externalUrl}/ping</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span class="text-slate-400 block mb-1">Total Keep-Alive Pings Sent</span>
              <span class="text-emerald-400 font-bold text-sm">${keepAlive.totalPings} pings</span>
              <span class="text-slate-500 text-[10px] block mt-0.5">${keepAlive.lastPingTime ? 'Last: ' + new Date(keepAlive.lastPingTime).toLocaleTimeString() : 'Starting...'}</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span class="text-slate-400 block mb-1">Render Container State</span>
              <span class="text-emerald-400 font-bold flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Always Awake (Zero Sleep)
              </span>
              <span class="text-slate-500 text-[10px] block mt-0.5">${keepAlive.lastStatus}</span>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>💡 <b>Tip for Render:</b> If deployed on Render, your web service URL is auto-detected. You can also add <code class="text-indigo-300">RENDER_EXTERNAL_URL</code> to Render Environment Variables.</span>
            <button onclick="copyPingUrl('${keepAlive.externalUrl}/ping')" class="text-indigo-400 hover:text-indigo-300 font-bold shrink-0 underline">
              Copy /ping URL
            </button>
          </div>
        </div>

        <!-- Blogger OAuth Status Card -->
        <div class="p-6 rounded-2xl ${isOauthConfigured ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-200' : 'bg-amber-950/40 border border-amber-800/60 text-amber-200'} flex flex-col sm:flex-row items-start gap-4">
          <div class="text-2xl">${isOauthConfigured ? '✅' : 'ℹ️'}</div>
          <div class="flex-1">
            <h3 class="font-bold text-base text-white">
              ${isOauthConfigured ? 'Blogger OAuth2 Live Posting Active' : 'Website Feed Live (Blogger Live Posting Awaiting OAuth Token)'}
            </h3>
            <p class="text-xs leading-relaxed mt-1 opacity-90">
              ${isOauthConfigured 
                ? 'Your backend server is actively connected to Google Blogger API. New posts are automatically cloned with real media & published directly to your live blog.' 
                : 'All scraped posts are 100% active and feeding directly to your website. To also push posts directly into your live Blogger account, ensure Google Cloud OAuth credentials are set.'}
            </p>
          </div>
        </div>

        <!-- ── ⚡ 1-Click Universal Site Auto-Detector & Adder ── -->
        <div class="bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-black uppercase tracking-wider">
              ⚡ 1-Click Universal Auto-Detector
            </span>
            <span class="text-xs text-slate-400">Zero Configuration Needed</span>
          </div>

          <h2 class="text-xl sm:text-2xl font-black text-white font-heading mb-1">
            Connect Any Target Website
          </h2>
          <p class="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
            Sirf website ka link daalein (jaise <code class="text-indigo-300">https://biharhelp.in/</code> ya <code class="text-indigo-300">https://sarkariresult.com</code>). 
            System automatically Site Name, RSS vs HTML Scraper, aur har post ki Category (Jobs, Admit Card, Result, Yojana) detect kar lega!
          </p>

          <form onsubmit="autoDetectAndAdd(event)" class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <input
                id="autoSiteUrl"
                type="url"
                placeholder="Paste Website URL (e.g. https://biharhelp.in/ or https://sarkariresult.com)"
                required
                class="w-full px-5 py-4 rounded-2xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <button
              id="autoDetectBtn"
              type="submit"
              class="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>⚡ Auto-Detect &amp; Connect Site</span>
            </button>
          </form>

          <!-- Notification feedback banner -->
          <div id="autoDetectBanner" class="hidden mt-4 p-4 rounded-2xl text-xs flex items-center gap-3"></div>

          <!-- Optional Advanced Settings (Manual Overrides) -->
          <details class="mt-4 pt-3 border-t border-slate-800/80 group">
            <summary class="text-xs text-slate-400 hover:text-indigo-400 cursor-pointer font-bold select-none list-none flex items-center gap-1.5">
              <span>⚙️ Optional Advanced Settings (Custom Overrides)</span>
              <span class="text-[10px] text-slate-600 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-2">
              <div>
                <label class="text-[11px] text-slate-400 block mb-1 font-semibold">Custom Site Name (Optional)</label>
                <input id="customName" type="text" placeholder="Auto-detected if blank" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white" />
              </div>
              <div>
                <label class="text-[11px] text-slate-400 block mb-1 font-semibold">Fixed Category Override</label>
                <select id="customCategory" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white">
                  <option value="Auto Detect (Multi-Category)">Auto Detect (Multi-Category per post)</option>
                  <option value="Latest Jobs">Force: Latest Jobs</option>
                  <option value="Admit Cards">Force: Admit Cards</option>
                  <option value="Results">Force: Results</option>
                  <option value="Govt Schemes & Yojana">Force: Govt Schemes &amp; Yojana</option>
                  <option value="University & Admissions">Force: University &amp; Admissions</option>
                </select>
              </div>
              <div class="flex items-end">
                <p class="text-[11px] text-slate-500 leading-relaxed">
                  Default settings auto-detect RSS feeds and categorize each recruitment post dynamically.
                </p>
              </div>
            </div>
          </details>
        </div>

        <!-- Connected Feeds & Scrapers List -->
        <div class="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 class="text-lg font-black text-white">Connected Target Sites &amp; Scrapers (${feeds.length})</h2>
              <p class="text-xs text-slate-400">Ye sabhi sources 24/7 background me monitor ho rahe hain</p>
            </div>
            <span class="text-xs font-bold text-indigo-400 bg-indigo-950 px-3 py-1 rounded-full">Automated 24/7</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${feeds.map(f => `
              <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm text-white">${f.name}</span>
                  <div class="flex items-center gap-1.5">
                    <span class="px-2 py-0.5 rounded-full ${f.type === 'scrape' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-blue-950 text-blue-400 border border-blue-800/50'} text-[9px] font-bold uppercase">${f.type || 'universal'}</span>
                    <span class="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 text-[9px] font-bold uppercase">${f.category || 'Multi-Category'}</span>
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

        <!-- Live Scraped Posts on Website Feed -->
        <div class="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 class="text-lg font-black text-white">Live Verified Scraped Posts on Website (${scrapedPosts.length})</h2>
              <p class="text-xs text-slate-400">Har post ka authentic title, category, aur link auto-detect hua hai</p>
            </div>
            <a href="/api/latest-posts" target="_blank" class="text-xs font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-3 py-1.5 rounded-xl hover:bg-indigo-900 transition-all flex items-center gap-1">
              View JSON API ➔
            </a>
          </div>

          <div class="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
            ${scrapedPosts.length === 0 ? '<div class="text-slate-500 text-xs py-4 text-center">No scraped posts yet. Click "Sync & Post Now" to scrape immediately.</div>' : scrapedPosts.slice(0, 15).map((p, idx) => `
              <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="w-5 h-5 rounded-full bg-slate-900 text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0">${idx + 1}</span>
                  <a href="${p.applyUrl}" target="_blank" class="font-semibold text-slate-200 hover:text-indigo-400 transition-colors truncate">
                    ${p.title}
                  </a>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-bold">${p.organization || 'Govt Portal'}</span>
                  <span class="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold">${p.category}</span>
                </div>
              </div>
            `).join('')}
          </div>
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

        async function autoDetectAndAdd(e) {
          e.preventDefault();
          const urlInput = document.getElementById('autoSiteUrl');
          const btn = document.getElementById('autoDetectBtn');
          const banner = document.getElementById('autoDetectBanner');
          const customName = document.getElementById('customName').value;
          const customCategory = document.getElementById('customCategory').value;

          const url = urlInput.value.trim();
          if (!url) return;

          btn.disabled = true;
          btn.innerHTML = '<span class="animate-spin">⏳</span> Detecting Site &amp; Feeds...';
          banner.className = 'mt-4 p-4 rounded-2xl text-xs bg-indigo-950/60 border border-indigo-800 text-indigo-200 flex items-center gap-2';
          banner.innerHTML = '<span>⚡ Analyzing site, checking RSS vs HTML scraper, extracting post links...</span>';
          banner.classList.remove('hidden');

          try {
            const res = await fetch('/api/feeds/auto-detect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url, name: customName, category: customCategory })
            });
            const data = await res.json();

            if (data.success) {
              banner.className = 'mt-4 p-4 rounded-2xl text-xs bg-emerald-950/80 border border-emerald-800 text-emerald-200';
              banner.innerHTML = '<b>✅ ' + (data.message || 'Site Connected Successfully!') + '</b> Auto-detected: ' + (data.detected?.samplePostsFound || 0) + ' initial posts.';
              urlInput.value = '';
              setTimeout(() => location.reload(), 1500);
            } else {
              banner.className = 'mt-4 p-4 rounded-2xl text-xs bg-red-950/80 border border-red-800 text-red-200';
              banner.innerHTML = '<b>❌ Error:</b> ' + (data.error || 'Failed to detect site.');
              btn.disabled = false;
              btn.innerHTML = '⚡ Auto-Detect &amp; Connect Site';
            }
          } catch (err) {
            banner.className = 'mt-4 p-4 rounded-2xl text-xs bg-red-950/80 border border-red-800 text-red-200';
            banner.innerHTML = '<b>❌ Network Error:</b> ' + err.message;
            btn.disabled = false;
            btn.innerHTML = '⚡ Auto-Detect &amp; Connect Site';
          }
        }

        async function deleteFeed(id) {
          if (confirm('Delete this target source?')) {
            await fetch('/api/feeds/' + id, { method: 'DELETE' });
            location.reload();
          }
        }

        function copyPingUrl(url) {
          navigator.clipboard.writeText(url);
          alert('Copied keep-alive ping URL: ' + url + '\\nYou can use this in Cron-Job.org or UptimeRobot to ping every 10 minutes.');
        }
      </script>
    </body>
    </html>
  `);
});

export default router;
