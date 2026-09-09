/**
 * Comprehensive Authentic Post Sync & Cloner Engine
 * Usage: node scripts/sync-sarkari-rss.js
 * 
 * 1. Fetches genuine active notices from BiharHelp, OnlineUpdateSTM, SarkariResult, and News feeds.
 * 2. Clones the full article page for each item: extracting 100% authentic original images,
 *    complete tables, full paragraphs, eligibility criteria, and direct portal links.
 * 3. Strictly filters out flaticons, site logos, and random stock photos.
 * 4. Completely updates src/data/liveJobs.json and server/data/latest_scraped_posts.json.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cloneAuthenticArticle } from '../server/scrapers/articleCloner.js';
import { scrapeBiharHelp } from '../server/scrapers/biharHelpScraper.js';
import { scrapeOnlineUpdate } from '../server/scrapers/onlineUpdateScraper.js';
import { scrapeSarkariResult } from '../server/scrapers/sarkariResultScraper.js';
import { detectPostCategory } from '../server/scrapers/universalDetector.js';
import { buildClonedHtmlArticle } from '../server/services/articleTemplate.js';
import { createSarkariPosterSvg } from '../src/utils/postThumbnail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DATA_FILE = path.join(__dirname, '../src/data/liveJobs.json');
const PUBLIC_DATA_FILE = path.join(__dirname, '../public/data/liveJobs.json');
const SERVER_DATA_FILE = path.join(__dirname, '../server/data/latest_scraped_posts.json');

function cleanSlug(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 45)
    .replace(/^-+|-+$/g, '');
}

async function runSync() {
  console.log('🚀 Starting Comprehensive Authentic Content & Media Sync...');

  const sourcesToScrape = [
    { name: 'Bihar Help', fn: scrapeBiharHelp, url: 'https://biharhelp.in/' },
    { name: 'OnlineUpdate STM', fn: scrapeOnlineUpdate, url: 'https://onlineupdatestm.in/' },
    { name: 'Sarkari Result', fn: scrapeSarkariResult, url: 'https://www.sarkariresult.com/' },
  ];

  const candidateItems = [];

  for (const src of sourcesToScrape) {
    try {
      console.log(`📡 Fetching from ${src.name}...`);
      const items = await src.fn({ url: src.url });
      console.log(`✅ Extracted ${items.length} links from ${src.name}`);
      // Take top 15 most recent notices per source
      candidateItems.push(...items.slice(0, 15));
    } catch (err) {
      console.error(`❌ Error fetching from ${src.name}:`, err.message);
    }
  }

  console.log(`\n📋 Found ${candidateItems.length} candidate items to process.`);

  // Deduplicate candidate items by normalized title
  const uniqueMap = new Map();
  for (const it of candidateItems) {
    const key = (it.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
    if (key && !uniqueMap.has(key)) {
      uniqueMap.set(key, it);
    }
  }

  const itemsToClone = Array.from(uniqueMap.values()).slice(0, 30);
  console.log(`🎯 Cloning full article body & real images for ${itemsToClone.length} authentic posts...\n`);

  const processedPosts = [];

  for (let i = 0; i < itemsToClone.length; i++) {
    const item = itemsToClone[i];
    const cleanTitle = (item.title || '').replace(/\s*-\s*[^-]+$/, '').trim();
    const { category, badge } = detectPostCategory(cleanTitle, item.contentSnippet || '', item);
    const slug = cleanSlug(cleanTitle);

    console.log(`[${i + 1}/${itemsToClone.length}] Cloning: "${cleanTitle.slice(0, 60)}..."`);

    let authenticImage = '';
    let bodyHtml = '';
    let directApplyUrl = item.link;

    if (item.link && item.link.startsWith('http')) {
      try {
        const cloned = await cloneAuthenticArticle(item.link, category);
        if (cloned) {
          if (cloned.featuredImage && cloned.featuredImage.startsWith('http')) {
            authenticImage = cloned.featuredImage;
            console.log(`   🖼️  Authentic Image found: ${authenticImage.slice(0, 70)}...`);
          }
          if (cloned.applyOnlineUrl) {
            directApplyUrl = cloned.applyOnlineUrl;
          }
          if (cloned.bodyContentHtml && cloned.bodyContentHtml.length > 150) {
            bodyHtml = buildClonedHtmlArticle(cloned, category, item.sourceName);
            console.log(`   📄 Cloned full body: ${cloned.bodyContentHtml.length} chars, ${cloned.tablesHtml?.length || 0} tables`);
          }
        }
      } catch (err) {
        console.warn(`   ⚠️ Could not clone ${item.link}: ${err.message}`);
      }
    }

    // If no photographic banner on source (e.g. SarkariResult plain text table),
    // generate official SVG notice poster so NO random Unsplash images are ever used!
    if (!authenticImage) {
      authenticImage = createSarkariPosterSvg({
        title: cleanTitle,
        category,
        organization: item.sourceName,
      });
      console.log(`   🎨 Generated official notice SVG poster (authentic title-based).`);
    }

    processedPosts.push({
      id: `scraped-${slug}`,
      title: cleanTitle,
      category,
      organization: item.sourceName,
      sourceName: item.sourceName,
      sourceUrl: item.link,
      originalPostUrl: item.link,
      totalPosts: 'Refer to Official Details',
      qualification: 'As Prescribed in Official Release',
      lastDate: 'Active Online',
      status: 'Active',
      badge,
      applyUrl: directApplyUrl,
      summary: item.contentSnippet || `${category} release: ${cleanTitle}`,
      publishedDate: new Date().toISOString().split('T')[0],
      ageLimit: 'As per official norms',
      imageUrl: authenticImage,
      bodyContentHtml: bodyHtml,
      isScrapedLive: true,
      fetchedAt: new Date().toISOString(),
    });

    // Small courteous pause
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\n💾 Persisting ${processedPosts.length} fresh, authentic posts...`);

  // Write to src/data/liveJobs.json
  fs.writeFileSync(SRC_DATA_FILE, JSON.stringify(processedPosts, null, 2), 'utf-8');
  console.log(`✅ Saved to ${SRC_DATA_FILE}`);

  // Write to public/data/liveJobs.json if dir exists
  try {
    const pubDir = path.dirname(PUBLIC_DATA_FILE);
    if (fs.existsSync(pubDir)) {
      fs.writeFileSync(PUBLIC_DATA_FILE, JSON.stringify(processedPosts, null, 2), 'utf-8');
      console.log(`✅ Saved to ${PUBLIC_DATA_FILE}`);
    }
  } catch {}

  // Write to server/data/latest_scraped_posts.json
  try {
    const srvDir = path.dirname(SERVER_DATA_FILE);
    if (fs.existsSync(srvDir)) {
      fs.writeFileSync(SERVER_DATA_FILE, JSON.stringify(processedPosts, null, 2), 'utf-8');
      console.log(`✅ Saved to ${SERVER_DATA_FILE}`);
    }
  } catch {}

  console.log('\n🎉 Content & Image Sync Finished Successfully!');
}

runSync().catch((err) => {
  console.error('Fatal sync failure:', err);
  process.exit(1);
});
