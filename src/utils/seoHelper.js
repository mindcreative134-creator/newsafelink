/**
 * High-Ranking SEO & Google Search Console Structured Data Engine
 * Ensures dynamic Title, Meta, OpenGraph, Twitter Cards, and Schema.org JSON-LD for every post.
 */

const SITE_URL = 'https://iwantgovjob.vercel.app';
const SITE_NAME = 'SarkariTrend';
const DEFAULT_LOGO = 'https://iwantgovjob.vercel.app/favicon.svg';

function cleanExcerpt(contentOrSummary, title = '') {
  if (!contentOrSummary) return `${title} – Check latest official notice, eligibility, important dates, and verified direct links on SarkariTrend.`;
  const plainText = contentOrSummary
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  if (plainText.length > 155) {
    return plainText.substring(0, 155).trim() + '...';
  }
  return plainText || `${title} – Check official updates, latest details, and direct links.`;
}

function setOrCreateMeta(selector, attribute, value, isProperty = false) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    if (isProperty) {
      element.setAttribute('property', selector.replace(/meta\[property=["']|["']\]/g, ''));
    } else {
      element.setAttribute('name', selector.replace(/meta\[name=["']|["']\]/g, ''));
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

function setOrCreateCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Update dynamic page SEO tags for an article
 */
export function updatePostSeo(post) {
  if (!post || !post.title) return;

  const title = post.title.trim();
  const category = (post.labels && post.labels[0]) || post.category || 'News & Updates';
  const org = post.sourceName || post.organization || 'Official Source';
  const postUrl = `${SITE_URL}/post/${encodeURIComponent(post.id)}`;
  const excerpt = cleanExcerpt(post.content || post.summary, title);
  const imageUrl = post.imageUrl || post.thumbnail || `${SITE_URL}/og-image.jpg`;
  const pubDate = post.published ? new Date(post.published).toISOString() : new Date().toISOString();

  // 1. High-CTR Page Title
  document.title = `${title} – ${category} | ${SITE_NAME}`;

  // 2. Core Search Meta
  setOrCreateMeta('meta[name="description"]', 'content', excerpt);
  setOrCreateMeta('meta[name="keywords"]', 'content', `${title}, ${category}, ${org}, Sarkari Yojana, Govt Jobs, Admit Card, Result, SarkariTrend`);
  setOrCreateMeta('meta[name="author"]', 'content', `${SITE_NAME} Editorial Desk`);
  setOrCreateMeta('meta[name="robots"]', 'content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

  // 3. Canonical Tag
  setOrCreateCanonical(postUrl);

  // 4. OpenGraph Tags (Facebook, WhatsApp, LinkedIn)
  setOrCreateMeta('meta[property="og:title"]', 'content', `${title} – ${SITE_NAME}`, true);
  setOrCreateMeta('meta[property="og:description"]', 'content', excerpt, true);
  setOrCreateMeta('meta[property="og:image"]', 'content', imageUrl, true);
  setOrCreateMeta('meta[property="og:url"]', 'content', postUrl, true);
  setOrCreateMeta('meta[property="og:type"]', 'content', 'article', true);
  setOrCreateMeta('meta[property="og:site_name"]', 'content', SITE_NAME, true);
  setOrCreateMeta('meta[property="article:published_time"]', 'content', pubDate, true);
  setOrCreateMeta('meta[property="article:section"]', 'content', category, true);

  // 5. Twitter Card Tags
  setOrCreateMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setOrCreateMeta('meta[name="twitter:title"]', 'content', `${title} – ${SITE_NAME}`);
  setOrCreateMeta('meta[name="twitter:description"]', 'content', excerpt);
  setOrCreateMeta('meta[name="twitter:image"]', 'content', imageUrl);

  // 6. Schema.org JSON-LD Structured Data for Google Search Console
  injectStructuredData(post, { title, category, org, postUrl, excerpt, imageUrl, pubDate });
}

/**
 * Inject Google Rich Results compliant Schema.org JSON-LD structured data
 */
function injectStructuredData(post, { title, category, org, postUrl, excerpt, imageUrl, pubDate }) {
  const existingScript = document.getElementById('post-ld-json');
  if (existingScript) existingScript.remove();

  const isJob = post.isSarkariJob;

  const breadcrumbsSchema = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: category,
        item: `${SITE_URL}/category/${encodeURIComponent(category)}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: postUrl,
      },
    ],
  };

  const articleSchema = {
    '@type': isJob ? 'Article' : 'NewsArticle',
    '@id': `${postUrl}#article`,
    isPartOf: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    headline: title,
    description: excerpt,
    image: [imageUrl],
    datePublished: pubDate,
    dateModified: pubDate,
    mainEntityOfPage: postUrl,
    author: {
      '@type': 'Person',
      name: `${SITE_NAME} Editorial Desk`,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_LOGO,
      },
    },
  };

  const graph = [breadcrumbsSchema, articleSchema];

  // If recruitment, include JobPosting schema for Google Jobs feature
  if (isJob && post.rawJob) {
    const raw = post.rawJob;
    const jobSchema = {
      '@type': 'JobPosting',
      title: title,
      description: excerpt,
      datePosted: pubDate,
      validThrough: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      employmentType: 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: org,
        sameAs: raw.sourceUrl || raw.applyUrl || SITE_URL,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'IN',
        },
      },
    };
    graph.push(jobSchema);
  }

  const script = document.createElement('script');
  script.id = 'post-ld-json';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  });
  document.head.appendChild(script);
}

/**
 * Clean up dynamic post-specific tags when unmounting
 */
export function cleanupPostSeo() {
  const ldJson = document.getElementById('post-ld-json');
  if (ldJson) ldJson.remove();
}
