import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const ipv4Agent = new https.Agent({ family: 4, keepAlive: true });

/**
 * Fetch real article page to extract:
 * 1. Real Featured Image (og:image, webp/jpg)
 * 2. Real Direct Apply / Notification PDF / Official Website Links
 * 3. Real Description & Eligibility specifics
 */
export async function fetchFullArticleDetails(articleUrl) {
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
      },
      timeout: 12000,
    });

    const $ = cheerio.load(res.data);

    // 1. Extract Real Image
    let imageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('article img.wp-post-image').attr('src') ||
      $('article img').first().attr('src') ||
      '';

    if (imageUrl.startsWith('//')) {
      imageUrl = `https:${imageUrl}`;
    }

    // 2. Extract Real Official Links from tables or content
    let applyUrl = '';
    let notificationPdf = '';
    let officialWebsite = '';

    $('table tr').each((_, tr) => {
      const rowText = $(tr).text().toLowerCase();
      const a = $(tr).find('a').first();
      const href = a.attr('href');

      if (!href || !href.startsWith('http')) return;
      if (href.includes('telegram') || href.includes('whatsapp') || href.includes('youtube') || href.includes('facebook')) return;

      if (!applyUrl && (rowText.includes('apply') || rowText.includes('registration') || rowText.includes('login') || rowText.includes('online form'))) {
        applyUrl = href;
      } else if (!notificationPdf && (rowText.includes('notification') || rowText.includes('notice') || rowText.includes('pdf') || href.endsWith('.pdf'))) {
        notificationPdf = href;
      } else if (!officialWebsite && (rowText.includes('official website') || rowText.includes('portal') || rowText.includes('board'))) {
        officialWebsite = href;
      }
    });

    // Fallback link search
    if (!applyUrl) {
      $('a').each((_, a) => {
        const text = $(a).text().trim().toLowerCase();
        const href = $(a).attr('href') || '';
        if (href.startsWith('http') && !href.includes('telegram') && !href.includes('whatsapp')) {
          if (!applyUrl && (text.includes('apply') || text.includes('registration'))) {
            applyUrl = href;
          } else if (!notificationPdf && (text.includes('notification') || href.endsWith('.pdf'))) {
            notificationPdf = href;
          }
        }
      });
    }

    if (!applyUrl) applyUrl = articleUrl;
    if (!officialWebsite) officialWebsite = applyUrl;

    // 3. Extract Real Intro Paragraphs
    const introParagraphs = [];
    $('article p, .entry-content p, .post-content p').each((_, p) => {
      const text = $(p).text().trim();
      if (
        text.length > 35 &&
        !text.includes('WhatsApp') &&
        !text.includes('Telegram') &&
        !text.includes('Subscribe') &&
        !text.includes('Follow us')
      ) {
        introParagraphs.push(text);
      }
    });

    const realIntro = introParagraphs.slice(0, 3).join('\n\n') || '';

    return {
      imageUrl,
      applyUrl,
      notificationPdf,
      officialWebsite,
      realIntro,
    };
  } catch (err) {
    return null;
  }
}
