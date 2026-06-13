const API_KEY = 'AIzaSyAB38Lkz-xiuvkFFuEDd7BsVo97DMA4g24';
const BLOG_ID = '6924208631263306852';
const BASE_URL = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}`;

// Active inflight request promise cache to prevent stampedes
const activeRequests = new Map();

// Helper to check for API errors with local caching (10-minute expiration)
async function fetchJson(url) {
  const cacheKey = `blogger_cache_${url}`;
  
  // 1. Try to load from localStorage cache first
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 600000) {
        return data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  // 2. If there is already an active promise for this URL, return it
  if (activeRequests.has(url)) {
    return activeRequests.get(url);
  }

  // 3. Initiate fetch and store promise
  const promise = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to fetch data from Blogger API');
      }
      const data = await response.json();
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
      } catch (e) {
        // Fail silently
      }
      return data;
    } finally {
      activeRequests.delete(url);
    }
  })();

  activeRequests.set(url, promise);
  return promise;
}

export async function getBlogInfo() {
  return fetchJson(`${BASE_URL}?key=${API_KEY}`);
}

export async function getPosts({ pageToken = '', maxResults = 9, label = '' } = {}) {
  // If it's a request for latest posts (no labels, no page token),
  // check if there's preloaded data/promise on window (set by index.html header script).
  if (!pageToken && !label) {
    if (window.__initialPostsData) {
      return window.__initialPostsData;
    }
    if (window.__initialPostsPromise) {
      return window.__initialPostsPromise;
    }
  }

  let finalMaxResults = maxResults;
  // Normalize latest posts query so that Home, Sidebar, and Header hit the exact same URL
  if (!pageToken && !label) {
    finalMaxResults = 15;
  }

  let url = `${BASE_URL}/posts?key=${API_KEY}&maxResults=${finalMaxResults}`;
  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }
  if (label) {
    url += `&labels=${encodeURIComponent(label)}`;
  }
  return fetchJson(url);
}

export async function getPostById(postId) {
  return fetchJson(`${BASE_URL}/posts/${postId}?key=${API_KEY}`);
}

export async function getPages() {
  return fetchJson(`${BASE_URL}/pages?key=${API_KEY}`);
}

export async function getPageById(pageId) {
  return fetchJson(`${BASE_URL}/pages/${pageId}?key=${API_KEY}`);
}
