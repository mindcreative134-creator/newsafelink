/**
 * Sarkari RSS & Job Sync Script
 * Usage: node scripts/sync-sarkari-rss.js
 * 
 * Fetches latest Government Jobs, Schemes (योजना), and University Admissions
 * and updates src/data/liveJobs.json with structured on-site records.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../src/data/liveJobs.json');

const RSS_SOURCES = [
  {
    name: 'Sarkari Jobs & Recruitment',
    url: 'https://news.google.com/rss/search?q=sarkari+naukri+recruitment+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Latest Jobs',
    badge: 'JOB',
  },
  {
    name: 'Government Schemes & Yojana',
    url: 'https://news.google.com/rss/search?q=sarkari+yojana+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Govt Schemes & Yojana',
    badge: 'YOJANA',
  },
  {
    name: 'University & College Admissions',
    url: 'https://news.google.com/rss/search?q=university+admission+cuet+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'University & Admissions',
    badge: 'ADMISSION',
  },
  {
    name: 'Govt Exam Admit Cards',
    url: 'https://news.google.com/rss/search?q=admit+card+hall+ticket+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Admit Cards',
    badge: 'ADMIT',
  },
  {
    name: 'Sarkari Exam Results',
    url: 'https://news.google.com/rss/search?q=sarkari+result+declared+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Results',
    badge: 'RESULT',
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
      const cleanTitle = item.title ? item.title.replace(/\s*-\s*[^-]+$/, '').trim() : 'Govt Update';
      const cleanDesc = item.description ? item.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : cleanTitle;
      const org = item.author || (item.title && item.title.includes('-') ? item.title.split('-').pop().trim() : 'Official Board');
      
      const cleanSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
      const uniqueId = `sarkari-auto-${cleanSlug}-${idx}`;

      return {
        id: uniqueId,
        title: cleanTitle,
        category: source.category,
        organization: org,
        totalPosts: 'Refer to Official Details',
        qualification: 'See Detailed Educational Eligibility Below',
        lastDate: 'Application Window Active',
        status: 'Active',
        badge: source.badge,
        applyUrl: item.link || 'https://sarkariresult.com',
        summary: cleanDesc.length > 200 ? cleanDesc.substring(0, 200) + '...' : cleanDesc,
        publishedDate: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        ageLimit: 'As per Official Guidelines',
      };
    });
  } catch (err) {
    console.error(`Failed to fetch feed ${source.name}:`, err.message);
    return [];
  }
}

async function sync() {
  console.log('🔄 Starting Sarkari, Yojana & Admission RSS sync...');
  let existing = [];
  try {
    if (fs.existsSync(DATA_FILE)) {
      existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (_e) {}

  const fetched = [];
  for (const source of RSS_SOURCES) {
    console.log(`Fetching from: ${source.name}...`);
    const items = await fetchFeed(source);
    console.log(`Fetched ${items.length} items from ${source.name}`);
    fetched.push(...items.slice(0, 4));
  }

  if (fetched.length === 0) {
    console.log('No new items fetched. Keeping existing items.');
    return;
  }

  // Deduplicate by title
  const titleSet = new Set(existing.map((x) => x.title.toLowerCase().trim()));
  const newItems = fetched.filter((x) => !titleSet.has(x.title.toLowerCase().trim()));

  const updated = [...newItems, ...existing].slice(0, 40);
  fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  console.log(`✅ Sync successful! Total updates stored: ${updated.length} (New added: ${newItems.length})`);
}

sync();
