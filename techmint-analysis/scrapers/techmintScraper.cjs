/**
 * TechMint High-CPC Post Scraper
 * Scrapes articles, headings, featured images, and metadata from techmint.in
 * and formats them for the safelink blog / newsafelink database / Blogger.
 */

const fs = require('fs');
const path = require('path');

// Dynamically resolve cheerio from available node_modules
let cheerio;
try {
  cheerio = require('cheerio');
} catch {
  try {
    cheerio = require(path.resolve(__dirname, '../../server/node_modules/cheerio'));
  } catch {
    try {
      cheerio = require(path.resolve(__dirname, '../../../safelink-backend/node_modules/cheerio'));
    } catch {
      console.warn('Cheerio not found in local paths, will use regex fallback.');
    }
  }
}

const BASE_URL = 'https://techmint.in';
const SITEMAP_URL = `${BASE_URL}/wp-sitemap-posts-post-1.xml`;
const RSS_FEED_URL = `${BASE_URL}/feed/`;

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return await res.text();
}

/**
 * Get all post URLs from TechMint sitemap or RSS
 */
async function getPostUrls(limit = 20) {
  try {
    console.log(`Fetching post URLs from ${SITEMAP_URL}...`);
    const xml = await fetchHtml(SITEMAP_URL);
    const urls = [...xml.matchAll(/<loc>(https:\/\/techmint\.in\/[^<]+)<\/loc>/gi)].map(m => m[1]);
    
    // Filter out root or non-article URLs if any
    const articleUrls = urls.filter(u => u !== `${BASE_URL}/` && !u.includes('category') && !u.includes('author'));
    console.log(`Found ${articleUrls.length} articles in sitemap.`);
    return articleUrls.slice(0, limit);
  } catch (err) {
    console.warn(`Sitemap fetch failed: ${err.message}. Falling back to RSS feed...`);
    const rss = await fetchHtml(RSS_FEED_URL);
    const links = [...rss.matchAll(/<item>[\s\S]*?<link>(https:\/\/techmint\.in\/[^<]+)<\/link>/gi)].map(m => m[1]);
    return links.slice(0, limit);
  }
}

/**
 * Scrape a single article from TechMint
 */
async function scrapeArticle(url) {
  console.log(`Scraping article: ${url}...`);
  const html = await fetchHtml(url);

  if (cheerio) {
    const $ = cheerio.load(html);

    // Extract Title
    const title = $('h1.entry-title').text().trim() || $('title').text().split('–')[0].trim();

    // Extract Category
    const category = $('.cat-links a').first().text().trim() || 'Education Finance';

    // Extract Featured Image
    let featuredImage = $('meta[property="og:image"]').attr('content') || '';
    if (!featuredImage) {
      featuredImage = $('.featured-image img, .wp-post-image').first().attr('src') || '';
    }

    // Extract Publication Date
    const published = $('time.entry-date').attr('datetime') || $('meta[property="article:published_time"]').attr('content') || new Date().toISOString();

    // Extract and Clean Article Body
    const contentEl = $('.entry-content');

    // Remove existing ads, scripts, and safelink buttons injected in source
    contentEl.find('script').remove();
    contentEl.find('ins.adsbygoogle, .ad-container, [id^="div-gpt-ad"]').remove();
    contentEl.find('#ce-wait1, #btn6, #btn7, #btn1, #adOverlay, #contntblock, #blockcont, .countdown').remove();
    contentEl.find('#v207-card, #v217-card, #v205-card, [id$="-card"]').remove();
    contentEl.find('.sharedaddy, .wp-block-comments, .comments-area').remove();

    // Clean attributes from tags
    contentEl.find('*').each(function() {
      const el = $(this);
      el.removeAttr('onclick');
      el.removeAttr('onload');
    });

    const cleanedHtml = contentEl.html() ? contentEl.html().trim() : '';
    const excerpt = contentEl.find('p').first().text().trim().slice(0, 200) + '...';

    const tags = [];
    $('.tags-links a').each((i, el) => tags.push($(el).text().trim()));
    if (tags.length === 0) {
      if (title.toLowerCase().includes('scholarship')) tags.push('Scholarships', 'Financial Aid');
      if (title.toLowerCase().includes('loan')) tags.push('Student Loans', 'Education Financing');
      if (title.toLowerCase().includes('degree') || title.toLowerCase().includes('mba')) tags.push('Online Degree', 'Higher Education');
      if (title.toLowerCase().includes('surgery') || title.toLowerCase().includes('lasik')) tags.push('Medical Care', 'Health Insurance');
    }

    return {
      id: path.basename(url.replace(/\/$/, '')),
      slug: path.basename(url.replace(/\/$/, '')),
      title,
      category,
      tags,
      featuredImage,
      published,
      excerpt,
      content: cleanedHtml,
      sourceUrl: url,
      sourceName: 'TechMint'
    };
  } else {
    // Regex fallback
    const titleMatch = html.match(/<h1[^>]*class=['"][^'"]*entry-title[^'"]*['"][^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'TechMint Article';

    const ogImg = html.match(/<meta[^>]*property=['"]og:image['"][^>]*content=['"]([^'"]+)['"]/i);
    const featuredImage = ogImg ? ogImg[1] : '';

    return {
      id: path.basename(url.replace(/\/$/, '')),
      slug: path.basename(url.replace(/\/$/, '')),
      title,
      category: 'Education & Tech',
      tags: ['Guide', 'TechMint'],
      featuredImage,
      published: new Date().toISOString(),
      excerpt: title,
      content: '<p>' + title + '</p>',
      sourceUrl: url,
      sourceName: 'TechMint'
    };
  }
}

/**
 * Main scraper runner
 */
async function runScraper(options = { limit: 5, saveToFile: true }) {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const urls = await getPostUrls(options.limit);
  const results = [];

  for (let i = 0; i < urls.length; i++) {
    try {
      const article = await scrapeArticle(urls[i]);
      results.push(article);
      console.log(`[${i + 1}/${urls.length}] Scraped: "${article.title}" (${article.category})`);
      await new Promise(r => setTimeout(r, 400));
    } catch (err) {
      console.error(`Failed to scrape ${urls[i]}: ${err.message}`);
    }
  }

  if (options.saveToFile) {
    const filePath = path.join(outputDir, 'techmint_posts.json');
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`\nSuccessfully saved ${results.length} articles to: ${filePath}`);
  }

  return results;
}

if (require.main === module) {
  runScraper({ limit: 3, saveToFile: true }).catch(console.error);
}

module.exports = {
  getPostUrls,
  scrapeArticle,
  runScraper
};
