const API_KEY = 'AIzaSyAB38Lkz-xiuvkFFuEDd7BsVo97DMA4g24';
const BLOG_ID = '6924208631263306852';
const BASE_URL = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}`;

// Helper to check for API errors
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to fetch data from Blogger API');
  }
  return response.json();
}

export async function getBlogInfo() {
  return fetchJson(`${BASE_URL}?key=${API_KEY}`);
}

export async function getPosts({ pageToken = '', maxResults = 9, label = '' } = {}) {
  let url = `${BASE_URL}/posts?key=${API_KEY}&maxResults=${maxResults}`;
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
