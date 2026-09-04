import defaultJobs from '../data/liveJobs.json';

const CACHE_KEY = 'SARKARI_RSS_CACHE_V1';
const CACHE_TIME_KEY = 'SARKARI_RSS_CACHE_TIME';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

// Curated RSS feeds for Government Jobs and News in India
const RSS_FEEDS = [
  {
    name: 'Google News - Sarkari Naukri',
    url: 'https://news.google.com/rss/search?q=sarkari+naukri+when:2d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Latest Jobs',
  },
  {
    name: 'Google News - Govt Exam Admit Card',
    url: 'https://news.google.com/rss/search?q=admit+card+exam+when:2d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Admit Cards',
  },
  {
    name: 'Google News - Sarkari Result',
    url: 'https://news.google.com/rss/search?q=exam+result+declared+when:2d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Results',
  },
];

/**
 * Clean HTML strings from RSS feed descriptions
 */
function cleanText(html) {
  if (!html) return '';
  const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return text.length > 180 ? text.substring(0, 180) + '...' : text;
}

/**
 * Fetch a single RSS feed via rss2json API
 */
async function fetchRssFeed(feedObj) {
  try {
    const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedObj.url)}`;
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== 'ok' || !Array.isArray(data.items)) return [];

    return data.items.map((item, index) => {
      const cleanTitle = item.title ? item.title.replace(/\s*-\s*[^-]+$/, '').trim() : 'Govt Update';
      const sourceName = item.author || (item.title && item.title.includes('-') ? item.title.split('-').pop().trim() : 'Govt Portal');
      
      return {
        id: `rss-${feedObj.category.toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.parse(item.pubDate) || Date.now()}`,
        title: cleanTitle,
        category: feedObj.category,
        organization: sourceName,
        totalPosts: 'Latest Update',
        qualification: 'See Notification',
        lastDate: 'Check Official Link',
        status: 'Active',
        badge: 'LIVE',
        applyUrl: item.link || '#',
        summary: cleanText(item.description) || cleanTitle,
        publishedDate: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        ageLimit: 'As per rules',
        isRss: true,
      };
    });
  } catch (_e) {
    return [];
  }
}

/**
 * Get all Sarkari updates (Combining cached jobs + live RSS updates)
 */
export async function getLiveSarkariUpdates(forceRefresh = false) {
  // Check localStorage cache
  if (!forceRefresh) {
    try {
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedTime && cachedData && Date.now() - Number(cachedTime) < CACHE_DURATION_MS) {
        return JSON.parse(cachedData);
      }
    } catch (_e) {
      // ignore storage errors
    }
  }

  // Attempt live RSS fetch
  try {
    const feedPromises = RSS_FEEDS.map((f) => fetchRssFeed(f));
    const feedResults = await Promise.allSettled(feedPromises);

    const liveItems = [];
    feedResults.forEach((res) => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        liveItems.push(...res.value);
      }
    });

    // Merge live items with default verified jobs
    const merged = [...liveItems.slice(0, 15), ...defaultJobs];

    // Cache merged results
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
    } catch (_e) {
      // ignore storage quotas
    }

    return merged;
  } catch (_err) {
    // If network fails, return high quality fallback
    return defaultJobs;
  }
}

/**
 * Filter updates by category
 */
export async function getUpdatesByCategory(category) {
  const all = await getLiveSarkariUpdates();
  if (!category || category === 'All') return all;
  return all.filter((item) => item.category?.toLowerCase() === category.toLowerCase());
}

/**
 * Search updates by keyword
 */
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
