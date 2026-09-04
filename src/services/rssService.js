import defaultJobs from '../data/liveJobs.json';

const CACHE_KEY = 'SARKARI_RSS_CACHE_V2';
const CACHE_TIME_KEY = 'SARKARI_RSS_CACHE_TIME_V2';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

// Curated RSS feeds across Government Jobs, Schemes (योजना), and University Admissions
const RSS_FEEDS = [
  {
    name: 'Google News - Sarkari Naukri',
    url: 'https://news.google.com/rss/search?q=sarkari+naukri+recruitment+when:2d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Latest Jobs',
    defaultBadge: 'JOB',
  },
  {
    name: 'Google News - Sarkari Yojana Schemes',
    url: 'https://news.google.com/rss/search?q=sarkari+yojana+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Govt Schemes & Yojana',
    defaultBadge: 'YOJANA',
  },
  {
    name: 'Google News - University Admissions & CUET',
    url: 'https://news.google.com/rss/search?q=university+admission+cuet+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'University & Admissions',
    defaultBadge: 'ADMISSION',
  },
  {
    name: 'Google News - Govt Exam Admit Card',
    url: 'https://news.google.com/rss/search?q=admit+card+exam+when:2d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Admit Cards',
    defaultBadge: 'ADMIT',
  },
  {
    name: 'Google News - Sarkari Result',
    url: 'https://news.google.com/rss/search?q=exam+result+declared+when:2d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Results',
    defaultBadge: 'RESULT',
  },
];

function cleanText(html) {
  if (!html) return '';
  const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return text.length > 200 ? text.substring(0, 200) + '...' : text;
}

async function fetchRssFeed(feedObj) {
  try {
    const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedObj.url)}`;
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== 'ok' || !Array.isArray(data.items)) return [];

    return data.items.map((item, index) => {
      const cleanTitle = item.title ? item.title.replace(/\s*-\s*[^-]+$/, '').trim() : 'Official Update';
      const sourceName = item.author || (item.title && item.title.includes('-') ? item.title.split('-').pop().trim() : 'Official Board');
      
      // Hash-like ID for on-site post routing
      const cleanSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
      const uniqueId = `sarkari-rss-${cleanSlug}-${index}`;

      return {
        id: uniqueId,
        title: cleanTitle,
        category: feedObj.category,
        organization: sourceName,
        totalPosts: 'Refer to Notification Details',
        qualification: 'See Detailed Educational Eligibility Below',
        lastDate: 'Online Application Window Active',
        status: 'Active',
        badge: feedObj.defaultBadge,
        applyUrl: item.link || 'https://sarkariresult.com',
        summary: cleanText(item.description) || cleanTitle,
        publishedDate: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        ageLimit: 'As per Central / State Government Guidelines',
        isRss: true,
      };
    });
  } catch (_e) {
    return [];
  }
}

export async function getLiveSarkariUpdates(forceRefresh = false) {
  if (!forceRefresh) {
    try {
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedTime && cachedData && Date.now() - Number(cachedTime) < CACHE_DURATION_MS) {
        return JSON.parse(cachedData);
      }
    } catch (_e) {}
  }

  try {
    const feedPromises = RSS_FEEDS.map((f) => fetchRssFeed(f));
    const feedResults = await Promise.allSettled(feedPromises);

    const liveItems = [];
    feedResults.forEach((res) => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        liveItems.push(...res.value);
      }
    });

    const merged = [...liveItems.slice(0, 20), ...defaultJobs];

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
    } catch (_e) {}

    return merged;
  } catch (_err) {
    return defaultJobs;
  }
}

export async function searchUpdates(query) {
  const all = await getLiveSarkariUpdates();
  if (!query) return all;
  const q = query.toLowerCase().trim();
  return all.filter(
    (item) =>
      item.title?.toLowerCase().includes(q) ||
      item.organization?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.summary?.toLowerCase().includes(q)
  );
}
