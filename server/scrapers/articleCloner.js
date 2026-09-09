import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
import { logEvent } from '../utils/logger.js';

const ipv4Agent = new https.Agent({ family: 4, keepAlive: true });

/**
 * High-Fidelity 1:1 Article Cloner:
 * Extracts authentic article content (real tables, real featured banner, real official links, real descriptions)
 * while filtering out external promotional spam (Telegram, WhatsApp, 3rd-party ads).
 */
export async function cloneAuthenticArticle(articleUrl, defaultCategory = 'Latest Jobs') {
  if (!articleUrl || !articleUrl.startsWith('http')) {
    return null;
  }

  try {
    let html = '';
    try {
      const resp = await fetch(articleUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(18000),
      });
      if (resp.ok) {
        html = await resp.text();
      }
    } catch {}

    if (!html) {
      const res = await axios.get(articleUrl, {
        httpsAgent: ipv4Agent,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 18000,
      });
      html = res.data;
    }

    const $ = cheerio.load(html);

function isValidArticleImage(imgUrl) {
  if (!imgUrl || typeof imgUrl !== 'string') return false;
  const lower = imgUrl.toLowerCase().trim();
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) return false;

  const junkPatterns = [
    'flaticon', 'favicon', 'site-logo', 'logo.png', 'biharhelp.png', 'gravatar',
    'telegram', 'whatsapp', 'facebook', 'twitter', 'instagram', 'youtube',
    'pixel', 'spinner', 'loading', 'placeholder', 'blank.gif', 'share-icon',
    '1x1', 'arrow', 'badge-icon', 'rss.png', 'feed-icon', 'icon-', 'avatar'
  ];
  if (junkPatterns.some(p => lower.includes(p))) return false;
  return true;
}

function resolveUrl(url, base) {
  if (!url) return '';
  try {
    if (url.startsWith('//')) return `https:${url}`;
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

    // 1. Exact Title
    const rawTitle =
      $('h1.entry-title').first().text().trim() ||
      $('h1.post-title').first().text().trim() ||
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      '';

    const cleanTitle = rawTitle.replace(/\s*-\s*[^-]+$/, '').trim();

    // 2. Real Authentic Featured Banner Image
    let featuredImage = '';

    // Priority candidates
    const imageCandidates = [
      $('meta[property="og:image"]').attr('content'),
      $('meta[property="og:image:secure_url"]').attr('content'),
      $('meta[name="twitter:image"]').attr('content'),
      $('meta[name="twitter:image:src"]').attr('content'),
      $('article img.wp-post-image').attr('src') || $('article img.wp-post-image').attr('data-src') || $('article img.wp-post-image').attr('data-lazy-src'),
      $('.featured-image img').attr('src') || $('.featured-image img').attr('data-src'),
      $('.entry-content img').first().attr('src') || $('.entry-content img').first().attr('data-src') || $('.entry-content img').first().attr('data-lazy-src'),
      $('article figure img').first().attr('src') || $('article figure img').first().attr('data-src'),
      $('article img').first().attr('src') || $('article img').first().attr('data-src'),
    ];

    for (const cand of imageCandidates) {
      if (cand) {
        const resolved = resolveUrl(cand, articleUrl);
        if (isValidArticleImage(resolved)) {
          featuredImage = resolved;
          break;
        }
      }
    }

    // 3. Locate Main Article Content Container across News, Media, and Blog architectures
    let contentContainer = $(
      '.story-details, .story-body, .article-body, .article-content, [itemprop="articleBody"], ' +
      '.storyContent, .news-story, .story__content, #story-body, .content-area, .story_details, ' +
      '.entry-content, article .content, .post-content, article, main'
    ).first();

    if (!contentContainer || contentContainer.length === 0) {
      contentContainer = $('body');
    }

    // Remove third-party spam / ads / social buttons / comments / recommendations
    contentContainer
      .find('script, style, iframe, ins, .adsbygoogle, .ad-banner, .social-share, .comments, #comments, .recommendations, .outbrain, .taboola, .author-bio, nav, header, footer')
      .remove();
    
    // Remove promotional telegram / whatsapp links safely
    contentContainer.find('a').each((_, a) => {
      const href = $(a).attr('href') || '';
      const text = $(a).text().toLowerCase();
      if (
        href.includes('t.me') ||
        href.includes('telegram') ||
        href.includes('whatsapp') ||
        href.includes('youtube.com') ||
        text.includes('join our telegram') ||
        text.includes('whatsapp group')
      ) {
        $(a).remove();
      }
    });

    // 4. Extract Real Official Action Links (Apply Online, Notification PDF, Official Website)
    let applyOnlineUrl = '';
    let notificationPdfUrl = '';
    let officialWebsiteUrl = '';

    contentContainer.find('table tr, p a, div a').each((_, el) => {
      const a = el.tagName.toLowerCase() === 'a' ? $(el) : $(el).find('a').first();
      const href = a.attr('href');
      const label = (a.text() || $(el).text()).trim().toLowerCase();

      if (
        !href ||
        !href.startsWith('http') ||
        href.includes('wp-admin') ||
        href.includes('t.me') ||
        href.includes('whatsapp') ||
        href.includes('facebook') ||
        href.includes('twitter')
      ) {
        return;
      }

      if (!applyOnlineUrl && (label.includes('apply online') || label.includes('registration') || label.includes('online form') || label.includes('direct apply'))) {
        applyOnlineUrl = href;
      } else if (!notificationPdfUrl && (label.includes('notification') || label.includes('advt') || label.includes('download pdf') || href.endsWith('.pdf'))) {
        notificationPdfUrl = href;
      } else if (!officialWebsiteUrl && (label.includes('official website') || label.includes('official portal') || label.includes('home page'))) {
        officialWebsiteUrl = href;
      }
    });

    if (!applyOnlineUrl) applyOnlineUrl = officialWebsiteUrl || articleUrl;
    if (!officialWebsiteUrl) officialWebsiteUrl = applyOnlineUrl;

    // 5. Extract Real Tables (Vacancy details, dates, fees, eligibility)
    const tablesHtml = [];
    contentContainer.find('table').each((i, tbl) => {
      $(tbl).attr('style', 'width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; border: 1px solid #cbd5e1;');
      $(tbl).find('th').attr('style', 'background: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1; text-align: left; font-weight: bold; color: #1e293b;');
      $(tbl).find('td').attr('style', 'padding: 10px; border: 1px solid #cbd5e1; color: #334155; vertical-align: top;');
      
      const tblText = $(tbl).text().toLowerCase();
      if (tblText.length > 30) {
        tablesHtml.push(`<div style="overflow-x: auto; margin: 20px 0;">${$.html(tbl)}</div>`);
      }
    });

    // 6. Extract Clean Informative Paragraphs, Headings, and Quotes (Full Article Content)
    const elements = [];
    contentContainer.find('p, h2, h3, h4, blockquote, ul, ol').each((_, el) => {
      const tag = el.tagName.toLowerCase();
      const text = $(el).text().trim();

      if (!text || text.length < 15) return;
      if (text.includes('Join Telegram') || text.includes('WhatsApp Group') || text.includes('All Rights Reserved') || text.includes('Click Here To Join')) return;

      if (tag === 'h2' || tag === 'h3' || tag === 'h4') {
        elements.push(`<${tag} style="color: #0f172a; font-size: 20px; margin-top: 26px; margin-bottom: 12px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">${text}</${tag}>`);
      } else if (tag === 'blockquote') {
        elements.push(`<blockquote style="border-left: 4px solid #4f46e5; padding: 12px 18px; margin: 20px 0; background: #f8fafc; font-style: italic; color: #1e293b; border-radius: 0 12px 12px 0;">${text}</blockquote>`);
      } else if (tag === 'p') {
        elements.push(`<p style="font-size: 16px; line-height: 1.85; color: #334155; margin-bottom: 16px;">${text}</p>`);
      } else if (tag === 'ul' || tag === 'ol') {
        elements.push(`<${tag} style="padding-left: 24px; font-size: 15px; line-height: 1.8; color: #334155; margin: 16px 0;">${$(el).html()}</${tag}>`);
      }
    });

    // Include full elements up to 80 items so complete coverage is imported
    const bodyContentHtml = elements.slice(0, 80).join('\n');

    // 7. Author / Byline if present
    const author =
      $('meta[name="author"]').attr('content') ||
      $('.author-name, .byline, [rel="author"], .story-byline').first().text().trim() ||
      '';

    return {
      title: cleanTitle,
      author,
      featuredImage,
      applyOnlineUrl,
      notificationPdfUrl,
      officialWebsiteUrl,
      tablesHtml,
      bodyContentHtml,
      sourceUrl: articleUrl,
    };
  } catch (err) {
    logEvent(`[Article Cloner] Failed to clone ${articleUrl}: ${err.message}`, 'error');
    return null;
  }
}
