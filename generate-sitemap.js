import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'AIzaSyAB38Lkz-xiuvkFFuEDd7BsVo97DMA4g24';
const BLOG_ID = '6924208631263306852';
const BASE_URL = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}`;

// Helper to fetch all posts recursively from Blogger API
async function fetchAllBloggerPosts() {
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
      hasNext = false;
    }
  }
  return posts;
}

// Generate complete Google Search Console compliant sitemap
async function run() {
  console.log('Generating comprehensive sitemap...');
  
  // 1. Fetch Blogger posts
  const bloggerPosts = await fetchAllBloggerPosts();
  console.log(`Fetched ${bloggerPosts.length} Blogger posts.`);

  // 2. Load live verified jobs from liveJobs.json and server/data/scrapedPosts.json
  let liveJobs = [];
  try {
    const liveJobsPath = path.join(__dirname, 'src', 'data', 'liveJobs.json');
    if (fs.existsSync(liveJobsPath)) {
      liveJobs = JSON.parse(fs.readFileSync(liveJobsPath, 'utf8'));
      console.log(`Loaded ${liveJobs.length} verified jobs from liveJobs.json.`);
    }
    const serverScrapedPath = path.join(__dirname, 'server', 'data', 'scrapedPosts.json');
    if (fs.existsSync(serverScrapedPath)) {
      const serverPosts = JSON.parse(fs.readFileSync(serverScrapedPath, 'utf8'));
      console.log(`Loaded ${serverPosts.length} posts from server/data/scrapedPosts.json.`);
      liveJobs = liveJobs.concat(serverPosts);
    }
  } catch (e) {
    console.error('Error reading posts:', e.message);
  }

  const baseUrl = process.env.SITE_URL || 'https://iwantgovjob.vercel.app';
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  const today = new Date().toISOString().split('T')[0];

  // Static core routes
  const staticUrls = [
    { url: '', priority: '1.0', changefreq: 'always' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/privacy-policy', priority: '0.5', changefreq: 'monthly' },
    { url: '/disclaimer', priority: '0.5', changefreq: 'monthly' },
    { url: '/terms-conditions', priority: '0.5', changefreq: 'monthly' }
  ];

  // Category archive routes
  const categoryUrls = [
    '/category/News%20%26%20Updates',
    '/category/Latest%20Jobs',
    '/category/Govt%20Schemes%20%26%20Yojana',
    '/category/University%20%26%20Admissions',
    '/category/Admit%20Cards',
    '/category/Results',
    '/category/Technology',
    '/category/Sports',
    '/category/Business%20%26%20Economy',
    '/category/Syllabus'
  ];

  staticUrls.forEach(item => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${item.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `    <priority>${item.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  categoryUrls.forEach(catUrl => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${catUrl}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>0.85</priority>\n';
    xml += '  </url>\n';
  });

  // Track unique IDs to avoid duplicates
  const seenIds = new Set();

  // Add all live scraped recruitment posts (Highest Priority 0.9)
  liveJobs.forEach(job => {
    if (!job || !job.id || seenIds.has(job.id)) return;
    seenIds.add(job.id);
    const pubDate = job.publishedDate ? job.publishedDate.split('T')[0] : today;
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/post/${encodeURIComponent(job.id)}</loc>\n`;
    xml += `    <lastmod>${pubDate}</lastmod>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n';
  });

  // Add all Blogger posts
  bloggerPosts.forEach(post => {
    if (!post || !post.id || seenIds.has(post.id)) return;
    seenIds.add(post.id);
    const updated = post.updated ? post.updated.split('T')[0] : (post.published ? post.published.split('T')[0] : today);
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/post/${encodeURIComponent(post.id)}</loc>\n`;
    xml += `    <lastmod>${updated}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';

  const outPath = path.join(__dirname, 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  console.log(`Comprehensive sitemap written successfully to ${outPath} with ${seenIds.size + staticUrls.length + categoryUrls.length} total URLs!`);
}

run();
