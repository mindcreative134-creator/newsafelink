import axios from 'axios';
import * as cheerio from 'cheerio';
import { isValidPost } from './index.js';
import { logEvent } from '../utils/logger.js';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * Clean and normalize a website URL
 */
export function cleanSiteUrl(inputUrl) {
  if (!inputUrl) return '';
  let url = inputUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  try {
    const parsed = new URL(url);
    // Keep protocol and host, remove search and hash for root
    return parsed.origin + (parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/+$/, ''));
  } catch {
    return url;
  }
}

/**
 * Intelligent Universal Post Category Classifier based on title, snippet, and site context
 */
export function detectPostCategory(title = '', snippet = '', siteConfig = {}) {
  const text = `${title} ${snippet}`.toLowerCase();

  // If site config has an explicit specific category (and not Auto Detect), prioritize it
  if (siteConfig.category && !siteConfig.category.includes('Auto Detect')) {
    const cat = siteConfig.category;
    let badge = 'UPDATE';
    if (cat.toLowerCase().includes('job')) badge = 'JOB';
    else if (cat.toLowerCase().includes('admit')) badge = 'ADMIT';
    else if (cat.toLowerCase().includes('result')) badge = 'RESULT';
    else if (cat.toLowerCase().includes('scheme') || cat.toLowerCase().includes('yojana')) badge = 'YOJANA';
    else if (cat.toLowerCase().includes('univ')) badge = 'UNIV';
    else if (cat.toLowerCase().includes('news')) badge = 'NEWS';
    else if (cat.toLowerCase().includes('tech')) badge = 'TECH';
    return { category: cat, badge };
  }

  // 1. Admit Cards / Hall Tickets
  if (
    text.includes('admit card') || 
    text.includes('hall ticket') || 
    text.includes('city intimation') || 
    text.includes('call letter') ||
    text.includes('प्रवेश पत्र')
  ) {
    return { category: 'Admit Cards', badge: 'ADMIT' };
  }

  // 2. Results & Scorecards
  if (
    text.includes('result') || 
    text.includes('scorecard') || 
    text.includes('merit list') || 
    text.includes('cutoff') || 
    text.includes('cut off') || 
    text.includes('answer key') ||
    text.includes('परिणाम')
  ) {
    return { category: 'Results', badge: 'RESULT' };
  }

  // 3. Government Schemes & Yojana
  if (
    text.includes('yojana') || 
    text.includes('योजना') || 
    text.includes('scheme') || 
    text.includes('pension') || 
    text.includes('subsidy') || 
    text.includes('scholarship') || 
    text.includes('kisan') || 
    text.includes('ration card') ||
    text.includes('ayushman')
  ) {
    return { category: 'Govt Schemes & Yojana', badge: 'YOJANA' };
  }

  // 4. University, Admissions & Academic Notices
  if (
    text.includes('admission') || 
    text.includes('counselling') || 
    text.includes('choice filling') ||
    text.includes('entrance') || 
    text.includes('university') || 
    text.includes('munger') ||
    text.includes('lnmu') ||
    text.includes('patna') ||
    text.includes('vksu') ||
    text.includes('magadh') ||
    text.includes('brabu') ||
    text.includes('purnea') ||
    text.includes('tmbu') ||
    text.includes('semester') ||
    text.includes('session') ||
    text.includes('b.ed') || 
    text.includes('deled') || 
    text.includes('iti online') || 
    text.includes('polytechnic') || 
    text.includes('cuet') || 
    text.includes('inter admission') ||
    text.includes('provisional') ||
    text.includes('migration certificate') ||
    text.includes('marksheet') ||
    text.includes('नामांकन')
  ) {
    return { category: 'University & Admissions', badge: 'UNIV' };
  }

  // 5. Technology, AI & Gadgets
  if (
    text.includes('technology') ||
    text.includes('gadget') ||
    text.includes('smartphone') ||
    text.includes('iphone') ||
    text.includes('android') ||
    text.includes('ai ') ||
    text.includes('artificial intelligence') ||
    text.includes('software') ||
    text.includes('cyber') ||
    text.includes('app') ||
    text.includes('google') ||
    text.includes('microsoft') ||
    text.includes('apple')
  ) {
    return { category: 'Technology', badge: 'TECH' };
  }

  // 6. Business, Finance & Markets
  if (
    text.includes('share market') ||
    text.includes('stock market') ||
    text.includes('sensex') ||
    text.includes('nifty') ||
    text.includes('gold price') ||
    text.includes('petrol price') ||
    text.includes('rbi') ||
    text.includes('crypto') ||
    text.includes('economy') ||
    text.includes('business')
  ) {
    return { category: 'Business & Economy', badge: 'BIZ' };
  }

  // 7. Sports & Cricket
  if (
    text.includes('cricket') ||
    text.includes('ipl') ||
    text.includes('match') ||
    text.includes('team india') ||
    text.includes('t20') ||
    text.includes('world cup') ||
    text.includes('bcci') ||
    text.includes('football') ||
    text.includes('olympics')
  ) {
    return { category: 'Sports', badge: 'SPORTS' };
  }

  // 8. Jobs & Recruitment
  if (
    text.includes('recruitment') ||
    text.includes('bharti') ||
    text.includes('भर्ती') ||
    text.includes('vacancy') ||
    text.includes('vacancies') ||
    text.includes('post') ||
    text.includes('online form') ||
    text.includes('apply online') ||
    text.includes('job')
  ) {
    return { category: 'Latest Jobs', badge: 'JOB' };
  }

  // 9. General News / Current Affairs (Default for media & news sites)
  return { category: 'News & Updates', badge: 'NEWS' };
}


/**
 * 1-Click Site Auto-Detector:
 * Inspects any website URL and automatically extracts:
 * - Clean Site Name (from og:site_name, <title>, or domain)
 * - Feed Type (Detects RSS feed vs HTML Scraper)
 * - RSS Feed URL if available
 */
export async function autoDetectSite(rawUrl) {
  const url = cleanSiteUrl(rawUrl);
  if (!url) throw new Error('Invalid URL provided');

  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname.replace(/^www\./, '');
  const domainParts = hostname.split('.');
  const defaultSiteName = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);

  let siteName = defaultSiteName;
  let detectedType = 'scrape';
  let feedUrl = url;
  let samplePostsFound = 0;

  try {
    const res = await axios.get(url, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 10000,
      maxRedirects: 5,
    });

    const html = res.data;
    if (typeof html === 'string') {
      const $ = cheerio.load(html);

      // 1. Extract Site Name
      const ogSiteName = $('meta[property="og:site_name"]').attr('content');
      const pageTitle = $('title').text().trim();

      if (ogSiteName && ogSiteName.length > 2 && ogSiteName.length < 50) {
        siteName = ogSiteName.trim();
      } else if (pageTitle) {
        // Clean title: remove suffixes like " - Home", " : Official Portal", "| Sarkari Result"
        const cleanTitle = pageTitle
          .split(/[-|:–—]/)[0]
          .replace(/home|official\s+portal|latest\s+jobs|website/gi, '')
          .trim();
        if (cleanTitle.length >= 3 && cleanTitle.length <= 40) {
          siteName = cleanTitle;
        }
      }

      // 2. Check for RSS / Atom feeds
      const rssLink = $('link[type="application/rss+xml"]').attr('href') ||
                      $('link[type="application/atom+xml"]').attr('href');

      if (rssLink) {
        let fullRss = rssLink;
        if (!fullRss.startsWith('http')) {
          fullRss = new URL(fullRss, url).toString();
        }
        // Verify RSS works
        try {
          const rssRes = await axios.get(fullRss, { headers: { 'User-Agent': USER_AGENT }, timeout: 6000 });
          if (rssRes.data && (rssRes.data.includes('<rss') || rssRes.data.includes('<feed') || rssRes.data.includes('<item>'))) {
            detectedType = 'rss';
            feedUrl = fullRss;
          }
        } catch {
          // Keep as scrape if RSS link failed
        }
      }

      // Probing common RSS paths if not in <head>
      if (detectedType === 'scrape') {
        const commonPaths = ['/feed', '/feed/', '/rss', '/rss.xml'];
        for (const p of commonPaths) {
          try {
            const probeUrl = new URL(p, url).toString();
            const probeRes = await axios.get(probeUrl, { headers: { 'User-Agent': USER_AGENT }, timeout: 4000 });
            if (probeRes.data && typeof probeRes.data === 'string' && (probeRes.data.includes('<rss') || probeRes.data.includes('<item>'))) {
              detectedType = 'rss';
              feedUrl = probeUrl;
              break;
            }
          } catch {
            // Continue probing
          }
        }
      }

      // 3. Count potential genuine article / post links on page
      $('a').each((_, el) => {
        const text = $(el).text().trim();
        if (isValidPost(text)) {
          samplePostsFound++;
        }
      });
    }
  } catch (err) {
    logEvent(`Auto-detection notice for ${url}: ${err.message}. Proceeding with smart scraper defaults.`, 'warning');
  }

  return {
    name: siteName,
    url,
    feedUrl,
    type: detectedType,
    category: 'Auto Detect (Multi-Category)',
    labels: [siteName, 'News & Updates', 'Latest Updates'],
    samplePostsFound,
  };
}

/**
 * Universal Smart HTML Post Extractor:
 * Extracts genuine articles, news stories, and notices from any website HTML
 */
export async function scrapeGenericHtml(siteConfig) {
  const targetUrl = siteConfig.url;
  logEvent(`Universal HTML Scraper fetching: ${targetUrl}...`);

  try {
    const res = await axios.get(targetUrl, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 12000,
    });

    const $ = cheerio.load(res.data);
    const results = [];
    const seenUrls = new Set();
    const seenTitles = new Set();

    $('a').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      const href = $(el).attr('href');

      if (!text || !href || !isValidPost(text, siteConfig)) return;

      let fullUrl = href;
      if (!fullUrl.startsWith('http')) {
        try {
          fullUrl = new URL(fullUrl, targetUrl).toString();
        } catch {
          return;
        }
      }

      // Discard duplicate URLs or exact titles
      const normTitle = text.toLowerCase();
      if (seenUrls.has(fullUrl) || seenTitles.has(normTitle)) return;
      seenUrls.add(fullUrl);
      seenTitles.add(normTitle);

      // Check for an image inside or nearby
      let imageUrl = $(el).find('img').attr('src') ||
                     $(el).closest('article, div, li').find('img').attr('src') || '';
      if (imageUrl && !imageUrl.startsWith('http')) {
        try {
          imageUrl = new URL(imageUrl, targetUrl).toString();
        } catch {
          imageUrl = '';
        }
      }

      // Detect post category automatically with siteConfig context
      const { category, badge } = detectPostCategory(text, '', siteConfig);

      results.push({
        title: text,
        link: fullUrl,
        category: (!siteConfig.category || siteConfig.category.includes('Auto Detect')) ? category : (siteConfig.category || category),
        badge,
        imageUrl,
        sourceName: siteConfig.name,
        contentSnippet: `${category} update from ${siteConfig.name}: ${text}`,
        publishedDate: new Date().toISOString().split('T')[0],
      });
    });

    logEvent(`Universal HTML Scraper extracted ${results.length} genuine posts from ${siteConfig.name}`);
    return results;
  } catch (err) {
    logEvent(`Universal HTML Scraper failed for ${siteConfig.name}: ${err.message}`, 'error');
    return [];
  }
}

