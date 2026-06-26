import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'AIzaSyAB38Lkz-xiuvkFFuEDd7BsVo97DMA4g24';
const BLOG_ID = '6924208631263306852';
const BASE_URL = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}`;

// Helper to fetch all posts recursively from Blogger API
async function fetchAllPosts() {
  let posts = [];
  let pageToken = '';
  let hasNext = true;
  
  while (hasNext) {
    let url = `${BASE_URL}/posts?key=${API_KEY}&maxResults=100`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error('Failed to fetch posts for sitemap generation');
        break;
      }
      const data = await res.json();
      if (data.items) {
        posts = posts.concat(data.items);
      }
      if (data.nextPageToken) {
        pageToken = data.nextPageToken;
      } else {
        hasNext = false;
      }
    } catch (e) {
      console.error('Network error during sitemap fetch:', e);
      hasNext = false;
    }
  }
  return posts;
}

// Generate sitemap
async function run() {
  console.log('Generating sitemap...');
  const posts = await fetchAllPosts();
  console.log(`Fetched ${posts.length} posts successfully.`);

  const baseUrl = 'https://sarkaritrend.news';
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static routes
  const staticUrls = [
    '',
    '/about',
    '/contact',
    '/privacy-policy',
    '/disclaimer',
    '/terms-conditions'
  ];

  const today = new Date().toISOString().split('T')[0];

  staticUrls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });

  // Add dynamic post routes
  posts.forEach(post => {
    const updated = post.updated ? post.updated.split('T')[0] : (post.published ? post.published.split('T')[0] : today);
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/post/${post.id}</loc>\n`;
    xml += `    <lastmod>${updated}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.6</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';

  const outPath = path.join(__dirname, 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  console.log(`Sitemap written successfully to ${outPath}`);
}

run();
