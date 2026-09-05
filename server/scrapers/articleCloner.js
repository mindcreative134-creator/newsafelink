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
    const res = await axios.get(articleUrl, {
      httpsAgent: ipv4Agent,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
      },
      timeout: 18000,
    });

    const $ = cheerio.load(res.data);

    // 1. Exact Title
    const rawTitle =
      $('h1.entry-title').first().text().trim() ||
      $('h1.post-title').first().text().trim() ||
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      '';

    const cleanTitle = rawTitle.replace(/\s*-\s*[^-]+$/, '').trim();

    // 2. Real Featured Banner Image
    let featuredImage =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('article img.wp-post-image').attr('src') ||
      $('.entry-content img').first().attr('src') ||
      $('article img').first().attr('src') ||
      '';

    if (featuredImage.startsWith('//')) {
      featuredImage = `https:${featuredImage}`;
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

    contentContainer.find('table tr').each((_, tr) => {
      const label = $(tr).find('th, td').first().text().trim().toLowerCase();
      const a = $(tr).find('a').first();
      const href = a.attr('href');

      if (
        !href ||
        !href.startsWith('http') ||
        href.includes('wp-admin') ||
        href.includes('t.me') ||
        href.includes('whatsapp') ||
        href.includes('facebook')
      ) {
        return;
      }

      if (!applyOnlineUrl && (label.includes('apply') || label.includes('registration') || label.includes('online form') || label.includes('login'))) {
        applyOnlineUrl = href;
      } else if (!notificationPdfUrl && (label.includes('notification') || label.includes('advt') || label.includes('notice') || href.endsWith('.pdf'))) {
        notificationPdfUrl = href;
      } else if (!officialWebsiteUrl && (label.includes('official website') || label.includes('portal') || label.includes('board'))) {
        officialWebsiteUrl = href;
      }
    });

    if (!applyOnlineUrl) applyOnlineUrl = officialWebsiteUrl || articleUrl;
    if (!officialWebsiteUrl) officialWebsiteUrl = applyOnlineUrl;

    // 5. Extract Real Tables (e.g. Vacancy details, dates, fees, eligibility)
    const tablesHtml = [];
    contentContainer.find('table').each((i, tbl) => {
      $(tbl).attr('style', 'width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; border: 1px solid #cbd5e1;');
      $(tbl).find('th').attr('style', 'background: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1; text-align: left; font-weight: bold; color: #1e293b;');
      $(tbl).find('td').attr('style', 'padding: 10px; border: 1px solid #cbd5e1; color: #334155; vertical-align: top;');
      
      const tblText = $(tbl).text().toLowerCase();
      if (tblText.length > 30) {
        tablesHtml.push($.html(tbl));
      }
    });

    // 6. Extract Clean Informative Paragraphs, Headings, and Quotes
    const paragraphs = [];
    contentContainer.find('p, h2, h3, h4, blockquote, ul, ol').each((_, el) => {
      const tag = el.tagName.toLowerCase();
      const text = $(el).text().trim();

      if (!text || text.length < 15) return;
      if (text.includes('Join Telegram') || text.includes('WhatsApp') || text.includes('All Rights Reserved')) return;

      if (tag === 'h2' || tag === 'h3' || tag === 'h4') {
        paragraphs.push(`<${tag} style="color: #0f172a; font-size: 20px; margin-top: 28px; margin-bottom: 12px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">${text}</${tag}>`);
      } else if (tag === 'blockquote') {
        paragraphs.push(`<blockquote style="border-left: 4px solid #4f46e5; padding: 12px 18px; margin: 20px 0; background: #f8fafc; font-style: italic; color: #1e293b; border-radius: 0 12px 12px 0;">${text}</blockquote>`);
      } else if (tag === 'p') {
        paragraphs.push(`<p style="font-size: 16px; line-height: 1.85; color: #334155; margin-bottom: 16px;">${text}</p>`);
      } else if (tag === 'ul' || tag === 'ol') {
        paragraphs.push(`<${tag} style="padding-left: 24px; font-size: 15px; line-height: 1.8; color: #334155; margin: 16px 0;">${$(el).html()}</${tag}>`);
      }
    });

    const bodyContentHtml = paragraphs.slice(0, 30).join('\n');

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
