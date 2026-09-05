import { fetchAllLiveBloggerPosts, deleteBloggerPost, postToBlogger } from '../services/bloggerPublisher.js';
import { generateComprehensiveArticle, getCategoryBannerImage } from '../services/articleTemplate.js';
import { detectPostCategory } from '../scrapers/universalDetector.js';
import { loadJson, saveJson, POSTED_CACHE_FILE } from '../utils/logger.js';

async function runCleanupAndRepublish() {
  console.log('--- Step 1: Scanning Blogger for posts without images ---');
  const allPosts = await fetchAllLiveBloggerPosts();
  console.log(`Total posts currently on Blogger: ${allPosts.length}`);

  const noImagePosts = allPosts.filter(p => !p.images && (!p.content || !p.content.includes('<img')));
  console.log(`Found ${noImagePosts.length} posts without images to delete and re-publish.`);

  if (noImagePosts.length === 0) {
    console.log('No posts without images found! All posts on Blogger already have images.');
    return;
  }

  // Step 2: Delete each no-image post from Blogger
  console.log('\n--- Step 2: Deleting no-image posts from Blogger ---');
  const deletedTitles = [];
  for (const p of noImagePosts) {
    console.log(`Deleting: [${p.id}] "${p.title}"...`);
    const success = await deleteBloggerPost(p.id);
    if (success) {
      console.log(`  -> Deleted successfully.`);
      deletedTitles.push(p.title);
    } else {
      console.warn(`  -> Failed to delete [${p.id}]`);
    }
    // Respect Blogger write limits
    await new Promise(r => setTimeout(r, 2000));
  }

  // Step 3: Clean up posted_cache.json so these posts can be re-cached
  console.log('\n--- Step 3: Cleaning posted_cache.json ---');
  const cache = loadJson(POSTED_CACHE_FILE, []);
  const initialCacheLen = cache.length;
  const deletedNormSet = new Set(deletedTitles.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, '')));
  const filteredCache = cache.filter(entry => {
    const t = (entry.title || entry.cleanTitle || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return !deletedNormSet.has(t);
  });
  saveJson(POSTED_CACHE_FILE, filteredCache);
  console.log(`Cache trimmed from ${initialCacheLen} to ${filteredCache.length} entries.`);

  // Step 4: Re-publish with guaranteed images & rich 800+ word structured content
  console.log('\n--- Step 4: Re-publishing posts with guaranteed banner images ---');
  let republishCount = 0;
  for (const p of noImagePosts) {
    const rawCategory = (p.labels && p.labels[0]) || '';
    const { category: detectedCat } = detectPostCategory(p.title, p.content || '', { category: rawCategory });
    const finalCategory = rawCategory || detectedCat || 'News & Updates';
    const bannerUrl = getCategoryBannerImage(p.title, finalCategory);

    // Extract snippet if available
    const cleanSnippet = (p.content || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 300)
      .trim();

    const richHtml = generateComprehensiveArticle({
      title: p.title,
      category: finalCategory,
      sourceName: 'Official News Desk',
      sourceUrl: p.url || '',
      snippet: cleanSnippet || p.title,
      featuredImage: bannerUrl,
      existingBody: cleanSnippet.length > 80 ? `<p>${cleanSnippet}</p>` : '',
    });

    console.log(`Re-publishing: "${p.title}" [Category: ${finalCategory}]`);
    console.log(`  Banner Image: ${bannerUrl.slice(0, 60)}...`);

    try {
      const pubResult = await postToBlogger(p.title, richHtml, p.labels || [finalCategory]);
      republishCount++;
      console.log(`  -> Published successfully! New ID: ${pubResult.id}`);

      // Add to cache
      filteredCache.push({
        title: p.title,
        cleanTitle: p.title,
        url: pubResult.url || p.url || '',
        slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50),
        postedAt: new Date().toISOString(),
      });
      saveJson(POSTED_CACHE_FILE, filteredCache);
    } catch (pubErr) {
      console.error(`  -> Error publishing "${p.title}": ${pubErr.message}`);
    }

    // Google Blogger write rate limit buffer
    await new Promise(r => setTimeout(r, 4000));
  }

  // Step 5: Verification scan
  console.log('\n--- Step 5: Verifying Blogger image health ---');
  const refreshedPosts = await fetchAllLiveBloggerPosts();
  const remainingNoImage = refreshedPosts.filter(p => !p.images && (!p.content || !p.content.includes('<img')));
  console.log(`Total posts on Blogger: ${refreshedPosts.length}`);
  console.log(`Remaining posts without images: ${remainingNoImage.length}`);
  console.log(`Re-published count: ${republishCount}`);
  console.log('Cleanup and republish routine completed successfully!');
}

runCleanupAndRepublish().catch(err => {
  console.error('Fatal error in cleanup and republish script:', err);
  process.exit(1);
});
