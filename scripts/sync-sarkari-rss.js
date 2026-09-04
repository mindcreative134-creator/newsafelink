/**
 * Sarkari RSS & Job Sync Script
 * Usage: node scripts/sync-sarkari-rss.js
 * 
 * Fetches the latest government job notices and updates from public RSS feeds
 * and saves them into src/data/liveJobs.json.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../src/data/liveJobs.json');

const RSS_SOURCES = [
  {
    name: 'Sarkari Naukri Updates',
    url: 'https://news.google.com/rss/search?q=sarkari+naukri+recruitment+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Latest Jobs',
    badge: 'NEW',
  },
  {
    name: 'Govt Exam Admit Cards',
    url: 'https://news.google.com/rss/search?q=admit+card+hall+ticket+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Admit Cards',
    badge: 'URGENT',
  },
  {
    name: 'Sarkari Results',
    url: 'https://news.google.com/rss/search?q=sarkari+result+declared+cutoff+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Results',
    badge: 'DECLARED',
  },
];

async function fetchFeed(source) {
  try {
    const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`;
    const res = await fetch(endpoint);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== 'ok' || !Array.isArray(data.items)) return [];

    return data.items.map((item, idx) => {
      const cleanTitle = item.title ? item.title.replace(/\s*-\s*[^-]+$/, '').trim() : 'Govt Job Notification';
      const cleanDesc = item.description ? item.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : cleanTitle;
      const org = item.author || (item.title && item.title.includes('-') ? item.title.split('-').pop().trim() : 'Govt Board');

      return {
        id: `sarkari-auto-${Date.now()}-${idx}`,
        title: cleanTitle,
        category: source.category,
        organization: org,
        totalPosts: 'Check Notice',
        qualification: 'Graduate / 10th / 12th',
        lastDate: 'Online Application Active',
        status: 'Active',
        badge: source.badge,
        applyUrl: item.link || 'https://sarkariresult.com',
        summary: cleanDesc.length > 200 ? cleanDesc.substring(0, 200) + '...' : cleanDesc,
        publishedDate: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        ageLimit: '18 - 35 Years',
      };
    });
  } catch (err) {
    console.error(`Failed to fetch feed ${source.name}:`, err.message);
    return [];
  }
}

async function sync() {
  console.log('🔄 Starting Sarkari RSS sync...');
  let existing = [];
  try {
    if (fs.existsSync(DATA_FILE)) {
      existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (e) {}

  const fetched = [];
  for (const source of RSS_SOURCES) {
    console.log(`Fetching from: ${source.name}...`);
    const items = await fetchFeed(source);
    console.log(`Fetched ${items.length} items from ${source.name}`);
    fetched.push(...items.slice(0, 5));
  }

  if (fetched.length === 0) {
    console.log('No new items fetched. Keeping existing items.');
    return;
  }

  // Deduplicate by title similarity
  const titleSet = new Set(existing.map((x) => x.title.toLowerCase().trim()));
  const newItems = fetched.filter((x) => !titleSet.has(x.title.toLowerCase().trim()));

  const updated = [...newItems, ...existing].slice(0, 30);
  fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  console.log(`✅ Sync successful! Total jobs stored: ${updated.length} (New added: ${newItems.length})`);
}

sync();
