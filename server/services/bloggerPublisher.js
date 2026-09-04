import { CONFIG } from '../config/index.js';
import { logEvent } from '../utils/logger.js';

/**
 * Get Google OAuth Access Token using Refresh Token
 */
async function getGoogleAccessToken() {
  if (!CONFIG.CLIENT_ID || !CONFIG.CLIENT_SECRET || !CONFIG.REFRESH_TOKEN) {
    return null;
  }

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CONFIG.CLIENT_ID,
        client_secret: CONFIG.CLIENT_SECRET,
        refresh_token: CONFIG.REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });

    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    logEvent(`[Blogger Auth Error] Failed to refresh token: ${err.message}`, 'error');
    return null;
  }
}

/**
 * Publish post to Blogger API
 */
export async function postToBlogger(title, contentHtml, labels = []) {
  const token = await getGoogleAccessToken();

  // If no OAuth token configured, run safely in Simulation / Preview mode
  if (!token) {
    logEvent(`[Simulated Post] "${title}" prepared for Blogger (OAuth token not configured)`, 'info');
    return { id: `simulated-${Date.now()}`, title, status: 'simulated' };
  }

  const url = `https://www.googleapis.com/blogger/v3/blogs/${CONFIG.BLOG_ID}/posts/`;
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
    throw new Error(err.error?.message || 'Blogger API call failed');
  }

  return res.json();
}
