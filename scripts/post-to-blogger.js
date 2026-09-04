/**
 * Automated Blogger RSS Publisher Script
 * 
 * This script fetches the latest RSS items (Jobs, Schemes, Exams)
 * and automatically publishes them as full blog posts to your Blogger blog
 * via Google Blogger API v3.
 * 
 * SETUP REQUIREMENTS:
 * 1. Go to Google Cloud Console (https://console.cloud.google.com/)
 * 2. Enable "Blogger API v3"
 * 3. Create OAuth 2.0 Credentials (Desktop Application)
 * 4. Put your CLIENT_ID, CLIENT_SECRET, and REFRESH_TOKEN below.
 */

import { generateSarkariArticleHtml } from '../src/services/postService.js';

const BLOG_ID = '6924208631263306852';

// OAuth2 Credentials (Required by Google for writing to Blogger)
const CLIENT_ID = process.env.BLOGGER_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.BLOGGER_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REFRESH_TOKEN = process.env.BLOGGER_REFRESH_TOKEN || 'YOUR_REFRESH_TOKEN';

const RSS_FEEDS = [
  'https://news.google.com/rss/search?q=sarkari+naukri+when:1d&hl=hi&gl=IN&ceid=IN:hi',
  'https://news.google.com/rss/search?q=sarkari+yojana+when:1d&hl=hi&gl=IN&ceid=IN:hi',
];

/**
 * Get Google OAuth2 Access Token using Refresh Token
 */
async function getAccessToken() {
  if (CLIENT_ID === 'YOUR_CLIENT_ID') {
    throw new Error('Please set BLOGGER_CLIENT_ID, BLOGGER_CLIENT_SECRET and BLOGGER_REFRESH_TOKEN in environment or script.');
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
  if (!data.access_token) {
    throw new Error('Failed to get access token: ' + JSON.stringify(data));
  }
  return data.access_token;
}

/**
 * Publish a single post to Blogger
 */
async function publishToBlogger(accessToken, post) {
  const url = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/`;

  const body = {
    kind: 'blogger#post',
    title: post.title,
    content: post.content,
    labels: post.labels || ['Sarkari Job', 'Breaking News'],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to publish post to Blogger');
  }

  return res.json();
}

/**
 * Main execution function
 */
async function run() {
  console.log('🚀 Checking Blogger Auto-Publisher Setup...');
  
  if (CLIENT_ID === 'YOUR_CLIENT_ID') {
    console.log(`
ℹ️ How to enable automatic Blogger publishing:
1. Google Blogger API requires OAuth2 to write/upload posts (the standard API key is read-only).
2. You can either:
   A) Use IFTTT.com (Free, No Code, 24/7 cloud sync without running your PC).
   B) Use Blogger Email-to-Post (Mail2Blogger in Blogger Settings).
   C) Set BLOGGER_CLIENT_ID, BLOGGER_CLIENT_SECRET, and BLOGGER_REFRESH_TOKEN to run this script.
    `);
    return;
  }

  try {
    const token = await getAccessToken();
    console.log('✅ Authorized with Blogger API');
    // Fetch and publish
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
