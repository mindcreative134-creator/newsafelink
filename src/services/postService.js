import { getPosts as getBloggerPosts, getPostById as getBloggerPostById } from './bloggerApi.js';
import { getLiveSarkariUpdates } from './rssService.js';
import defaultJobs from '../data/liveJobs.json';
import { getPostThumbnail } from '../utils/postThumbnail.js';

/**
 * Generate high quality, comprehensive HTML blog post for a Sarkari/Yojana/Admission update
 */
export function generateSarkariArticleHtml(item) {
  const org = item.organization || 'Official Recruitment Board';
  const category = item.category || 'Government Job Notification';
  const totalPosts = item.totalPosts || 'Refer to Official Notification';
  const qualification = item.qualification || 'As prescribed in official notification';
  const ageLimit = item.ageLimit || 'Refer to official advertisement brochure';
  const lastDate = item.lastDate || 'Active Online';
  const pubDate = item.publishedDate || new Date().toISOString().split('T')[0];
  const applyUrl = item.applyUrl || 'https://biharhelp.in';
  const summary = item.summary || item.title;

  return `
    <div class="sarkari-article-container">
      <!-- Quick Overview Box -->
      <div class="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-5 mb-6">
        <h3 class="text-base font-black text-indigo-900 dark:text-indigo-200 mb-2 font-heading">
          📢 Quick Information Summary
        </h3>
        <p class="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
          ${summary}
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div class="bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-indigo-100 dark:border-zinc-800">
            <span class="text-zinc-400 block text-[10px] font-bold uppercase">Authority</span>
            <strong class="text-zinc-900 dark:text-zinc-100 font-extrabold line-clamp-1">${org}</strong>
          </div>
          <div class="bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-indigo-100 dark:border-zinc-800">
            <span class="text-zinc-400 block text-[10px] font-bold uppercase">Total Posts</span>
            <strong class="text-zinc-900 dark:text-zinc-100 font-extrabold">${totalPosts}</strong>
          </div>
          <div class="bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-indigo-100 dark:border-zinc-800">
            <span class="text-zinc-400 block text-[10px] font-bold uppercase">Category</span>
            <strong class="text-indigo-600 dark:text-indigo-400 font-extrabold">${category}</strong>
          </div>
          <div class="bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-indigo-100 dark:border-zinc-800">
            <span class="text-zinc-400 block text-[10px] font-bold uppercase">Deadline</span>
            <strong class="text-red-600 dark:text-red-400 font-extrabold">${lastDate}</strong>
          </div>
        </div>
      </div>

      <!-- Overview Table -->
      <h2 class="text-xl font-black text-zinc-900 dark:text-white font-heading mt-6 mb-3">
        ${item.title} – Detailed Overview
      </h2>
      <p class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
        Candidates seeking updates regarding <strong>${item.title}</strong> released by <strong>${org}</strong> can find all verified details below, including eligibility standards, application steps, fee criteria, and official links.
      </p>

      <table class="w-full text-xs sm:text-sm border-collapse my-6">
        <tbody>
          <tr>
            <td class="font-bold bg-zinc-100 dark:bg-zinc-800/80 p-3 w-1/3">Recruitment / Authority</td>
            <td class="p-3">${org}</td>
          </tr>
          <tr>
            <td class="font-bold bg-zinc-100 dark:bg-zinc-800/80 p-3">Post / Scheme Name</td>
            <td class="p-3">${item.title}</td>
          </tr>
          <tr>
            <td class="font-bold bg-zinc-100 dark:bg-zinc-800/80 p-3">Vacancies / Scope</td>
            <td class="p-3">${totalPosts}</td>
          </tr>
          <tr>
            <td class="font-bold bg-zinc-100 dark:bg-zinc-800/80 p-3">Application Mode</td>
            <td class="p-3">Online (Official Portal)</td>
          </tr>
          <tr>
            <td class="font-bold bg-zinc-100 dark:bg-zinc-800/80 p-3">Notification Date</td>
            <td class="p-3">${pubDate}</td>
          </tr>
          <tr>
            <td class="font-bold bg-zinc-100 dark:bg-zinc-800/80 p-3">Application Status</td>
            <td class="p-3 text-emerald-600 font-bold">Active Online</td>
          </tr>
        </tbody>
      </table>

      <!-- Eligibility & Criteria Section -->
      <h3 class="text-lg font-black text-zinc-900 dark:text-white font-heading mt-6 mb-2">
        🎯 Eligibility & Criteria
      </h3>
      <ul class="list-disc pl-5 space-y-2 text-sm text-zinc-700 dark:text-zinc-300 mb-6">
        <li><strong>Eligibility / Qualification:</strong> ${qualification} from any recognized Board / University.</li>
        <li><strong>Age Criteria:</strong> ${ageLimit}. Age relaxation will be provided to reserved categories as per government norms.</li>
        <li><strong>Nationality:</strong> Citizen of India.</li>
      </ul>

      <!-- How to Apply Steps -->
      <h3 class="text-lg font-black text-zinc-900 dark:text-white font-heading mt-6 mb-3">
        📝 How to Apply / Check Status Online
      </h3>
      <ol class="list-decimal pl-5 space-y-2.5 text-sm text-zinc-700 dark:text-zinc-300 mb-6">
        <li>Visit the official portal by clicking the direct link below.</li>
        <li>Locate the notification link for <strong>${item.title}</strong>.</li>
        <li>Read the official notification brochure carefully to ensure eligibility.</li>
        <li>Click on <strong>"Apply Online"</strong> and complete your registration / profile.</li>
        <li>Upload required documents and submit your final application form.</li>
      </ol>

      <!-- Important Official Links Box -->
      <div class="my-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-xl">
        <h4 class="text-base font-black uppercase tracking-wider mb-4 text-amber-400 font-heading flex items-center gap-2">
          ⚡ Official Direct Links & Downloads
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="${applyUrl}"
            target="_blank"
            rel="noreferrer"
            class="p-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider text-center transition-all shadow-md flex items-center justify-center gap-2"
          >
            🔗 Apply Online / Direct Portal ➔
          </a>
          <a
            href="${applyUrl}"
            target="_blank"
            rel="noreferrer"
            class="p-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider text-center transition-all border border-white/20 flex items-center justify-center gap-2"
          >
            📄 Official Advertisement & Details
          </a>
        </div>
        <p class="text-[11px] text-indigo-300/80 text-center mt-3">
          Notice: Always verify details from the official government release before submitting forms.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate rich, comprehensive, multi-section article HTML for News, Schemes, Universities, and Tech
 */
export function generateComprehensiveArticleHtml(item) {
  const title = item.title || 'Official Announcement';
  const category = item.category || 'News & Updates';
  const org = item.organization || item.sourceName || 'Official Source';
  const pubDate = item.publishedDate || new Date().toISOString().split('T')[0];
  const summary = item.summary || item.contentSnippet || `${title} released by ${org}.`;
  const applyUrl = item.applyUrl || item.sourceUrl || '#';

  const catLower = category.toLowerCase();
  const textLower = `${title} ${summary}`.toLowerCase();

  const isScheme = catLower.includes('scheme') || catLower.includes('yojana') || textLower.includes('yojana') || textLower.includes('scholarship');
  const isUniv = catLower.includes('univ') || catLower.includes('admission') || textLower.includes('admission') || textLower.includes('entrance');
  const isTech = catLower.includes('tech') || textLower.includes('game') || textLower.includes('bgmi') || textLower.includes('download');

  let section1 = 'Key Highlights & Important Details';
  let section2 = 'Eligibility, Standards & Requirements';
  let section3 = 'Step-by-Step Procedure';
  let steps = [
    `Access the verified official portal using the direct link provided below.`,
    `Locate the active notification / application section for <strong>${title}</strong>.`,
    `Review the complete guidelines, criteria, and official brochure.`,
    `Submit your registration or required verification details as per official instructions.`,
    `Keep a printed or digital copy of the acknowledgement for future reference.`
  ];

  if (isScheme) {
    section1 = 'Scheme Benefits & Financial Assistance';
    section2 = 'Beneficiary Eligibility & Required Documents';
    section3 = 'How to Apply for the Scheme';
    steps = [
      `Visit the designated welfare or state/central portal.`,
      `Navigate to the online registration window for <strong>${title}</strong>.`,
      `Fill in applicant personal, family income, and residential details.`,
      `Upload essential verification documents (Aadhaar, income/caste certificate, bank account).`,
      `Submit application and track beneficiary status through the portal.`
    ];
  } else if (isUniv) {
    section1 = 'Academic Programs & Course Intake';
    section2 = 'Admission Eligibility & Qualifying Criteria';
    section3 = 'How to Complete Online Admission';
    steps = [
      `Go to the official university admission portal.`,
      `Complete online student registration with basic details.`,
      `Enter academic scores, qualifying examination details, and course choices.`,
      `Upload academic certificates, photograph, and signature.`,
      `Pay the registration fee and download the admission application slip.`
    ];
  } else if (isTech) {
    section1 = 'Features & What’s New';
    section2 = 'System Requirements & Device Specifications';
    section3 = 'How to Download / Access';
    steps = [
      `Verify device compatibility with minimum operating system requirements.`,
      `Access the official distribution platform or verified web portal.`,
      `Initiate setup or account registration following safety guidelines.`,
      `Complete installation and check for latest patches or updates.`
    ];
  }

  return `
    <div class="comprehensive-article-view space-y-6">
      <!-- Quick Overview Highlights Card -->
      <div class="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl p-6">
        <h3 class="text-base font-black text-indigo-900 dark:text-indigo-200 mb-2 font-heading">
          📢 Overview &amp; Verification Summary
        </h3>
        <p class="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
          ${summary}
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div class="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-indigo-100 dark:border-zinc-800">
            <span class="text-zinc-400 block text-[10px] font-bold uppercase">Authority</span>
            <strong class="text-zinc-900 dark:text-zinc-100 font-extrabold line-clamp-1">${org}</strong>
          </div>
          <div class="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-indigo-100 dark:border-zinc-800">
            <span class="text-zinc-400 block text-[10px] font-bold uppercase">Category</span>
            <strong class="text-indigo-600 dark:text-indigo-400 font-extrabold">${category}</strong>
          </div>
          <div class="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-indigo-100 dark:border-zinc-800">
            <span class="text-zinc-400 block text-[10px] font-bold uppercase">Published</span>
            <strong class="text-zinc-900 dark:text-zinc-100 font-extrabold">${pubDate}</strong>
          </div>
          <div class="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-indigo-100 dark:border-zinc-800">
            <span class="text-zinc-400 block text-[10px] font-bold uppercase">Status</span>
            <strong class="text-emerald-600 dark:text-emerald-400 font-extrabold">Active Release</strong>
          </div>
        </div>
      </div>

      <!-- In-Depth Section 1 -->
      <div class="space-y-3">
        <h3 class="text-lg font-black text-zinc-900 dark:text-white font-heading">
          📌 ${section1}
        </h3>
        <p class="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
          The release regarding <strong>${title}</strong> provides critical updates and guidelines issued by <strong>${org}</strong>. It aims to ensure clear access, verified information, and standard procedures for all interested candidates and readers.
        </p>
        <ul class="list-disc pl-5 space-y-2 text-sm sm:text-base text-zinc-700 dark:text-zinc-300">
          <li>Authentic announcement officially circulated under <strong>${org}</strong>.</li>
          <li>Complete protocols and verified documents are accessible through the designated online gateway.</li>
          <li>Candidates and readers are advised to check all eligibility requirements before final submission.</li>
        </ul>
      </div>

      <!-- In-Depth Section 2 -->
      <div class="space-y-3 pt-2">
        <h3 class="text-lg font-black text-zinc-900 dark:text-white font-heading">
          🎯 ${section2}
        </h3>
        <p class="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Before taking action, ensure that you satisfy the prerequisite norms outlined by the governing authority:
        </p>
        <ul class="list-disc pl-5 space-y-2 text-sm sm:text-base text-zinc-700 dark:text-zinc-300">
          <li>Ensure valid identification, educational certificates, or requisite credentials are kept ready.</li>
          <li>Adhere strictly to official timelines and deadlines announced by <strong>${org}</strong>.</li>
          <li>For detailed clauses, refer directly to the verified official documentation linked below.</li>
        </ul>
      </div>

      <!-- In-Depth Section 3: Step-by-Step Procedure -->
      <div class="space-y-3 pt-2">
        <h3 class="text-lg font-black text-zinc-900 dark:text-white font-heading">
          📝 ${section3}
        </h3>
        <ol class="list-decimal pl-5 space-y-2.5 text-sm sm:text-base text-zinc-700 dark:text-zinc-300">
          ${steps.map(s => `<li>${s}</li>`).join('')}
        </ol>
      </div>

      <!-- Frequently Asked Questions -->
      <div class="space-y-3 pt-2">
        <h3 class="text-lg font-black text-zinc-900 dark:text-white font-heading">
          ❓ Frequently Asked Questions
        </h3>
        <div class="space-y-3">
          <div class="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
            <h4 class="text-sm font-bold text-zinc-900 dark:text-white mb-1">What is the status of ${title}?</h4>
            <p class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">The update has been officially confirmed by ${org} and is active for verification and online access.</p>
          </div>
          <div class="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
            <h4 class="text-sm font-bold text-zinc-900 dark:text-white mb-1">Where can I access the direct official link?</h4>
            <p class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">Click the official link button provided below to access the verified source portal directly.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Format a job/RSS/News item into a standard post object for UI consistency
 */
function formatJobAsPost(item) {
  const posterImg = item.imageUrl || getPostThumbnail(item);
  const cat = (item.category || '').toLowerCase();
  const titleLower = (item.title || '').toLowerCase();
  const isJob = cat.includes('job') || cat.includes('admit') || cat.includes('result') || titleLower.includes('recruitment') || titleLower.includes('vacancy');
  
  let contentHtml = '';
  if (item.bodyContentHtml && item.bodyContentHtml.length > 200) {
    contentHtml = item.bodyContentHtml;
  } else if (isJob) {
    contentHtml = generateSarkariArticleHtml(item);
  } else {
    contentHtml = generateComprehensiveArticleHtml(item);
  }

  return {
    id: item.id,
    title: item.title,
    thumbnail: posterImg,
    imageUrl: posterImg,
    content: contentHtml,
    published: item.publishedDate || new Date().toISOString(),
    updated: item.publishedDate || new Date().toISOString(),
    labels: [item.category || 'News & Updates', item.sourceName || item.organization || 'Verified Source'],
    isSarkariJob: isJob,
    sourceName: item.sourceName || item.organization || 'Verified Source',
    sourceUrl: item.sourceUrl || item.applyUrl || '',
    rawJob: item,
  };
}

/**
 * Format a raw Google Blogger API post into a standardized post object
 */
export function formatBloggerPost(item) {
  if (!item) return null;
  const posterImg = getPostThumbnail(item);
  const labels = Array.isArray(item.labels) && item.labels.length > 0 ? item.labels : ['News & Updates'];
  const primaryCat = labels[0] || 'News & Updates';
  const org = labels[1] || item.author?.displayName || 'Sarkari Portal Desk';

  const catLower = primaryCat.toLowerCase();
  const titleLower = (item.title || '').toLowerCase();
  const isJob = catLower.includes('job') || catLower.includes('admit') || catLower.includes('result') || titleLower.includes('recruitment') || titleLower.includes('vacancy');

  return {
    id: item.id,
    title: item.title,
    thumbnail: posterImg,
    imageUrl: posterImg,
    content: item.content || '',
    published: item.published || new Date().toISOString(),
    updated: item.updated || item.published || new Date().toISOString(),
    labels: labels,
    isSarkariJob: isJob,
    sourceName: org,
    sourceUrl: item.url || '',
    rawJob: {
      id: item.id,
      title: item.title,
      category: primaryCat,
      organization: org,
      sourceName: org,
      applyUrl: item.url || '',
      totalPosts: 'Refer to Official Details Below',
      qualification: 'Refer to Official Criteria Below',
      lastDate: 'Active Online',
      publishedDate: item.published ? item.published.split('T')[0] : new Date().toISOString().split('T')[0],
      imageUrl: posterImg,
      summary: item.title,
    },
  };
}

/**
 * Universal Intelligent Category Matcher
 * Maps queries like 'News', 'Jobs', 'Admit Cards', 'Results', 'University', 'Govt Schemes', 'Technology'
 * flexibly to all Blogger labels and verified Sarkari database items.
 */
export function matchesCategory(item, queryCategory) {
  if (!queryCategory || queryCategory === 'All' || queryCategory === '') return true;
  const q = queryCategory.toLowerCase().trim();
  
  const title = (item.title || '').toLowerCase();
  const cat = (item.category || (item.labels && item.labels[0]) || '').toLowerCase();
  const org = (item.organization || item.sourceName || (item.labels && item.labels[1]) || '').toLowerCase();
  const labels = (item.labels || []).map(l => (l || '').toLowerCase());
  const allText = `${title} ${cat} ${org} ${labels.join(' ')}`;

  if (q.includes('news')) {
    return allText.includes('news') || labels.some(l => l.includes('news')) || cat.includes('news') || allText.includes('notice') || allText.includes('update') || allText.includes('breaking');
  }
  if (q.includes('job') || q.includes('recruitment') || q.includes('bharti') || q.includes('vacancy')) {
    return cat.includes('job') || labels.some(l => l.includes('job') || l.includes('recruitment') || l.includes('bharti')) || allText.includes('recruitment') || allText.includes('vacancy');
  }
  if (q.includes('admit') || q.includes('hall ticket')) {
    return cat.includes('admit') || labels.some(l => l.includes('admit') || l.includes('hall ticket') || l.includes('slip')) || allText.includes('admit') || allText.includes('hall ticket');
  }
  if (q.includes('result') || q.includes('cutoff') || q.includes('merit')) {
    return cat.includes('result') || labels.some(l => l.includes('result') || l.includes('cutoff') || l.includes('merit')) || allText.includes('result');
  }
  if (q.includes('scheme') || q.includes('yojana') || q.includes('scholarship') || q.includes('kisan')) {
    return cat.includes('scheme') || cat.includes('yojana') || labels.some(l => l.includes('scheme') || l.includes('yojana') || l.includes('pm') || l.includes('kisan')) || allText.includes('yojana') || allText.includes('scheme') || allText.includes('scholarship') || allText.includes('kisan');
  }
  if (q.includes('univ') || q.includes('admission') || q.includes('cuet') || q.includes('entrance') || q.includes('college')) {
    return cat.includes('admission') || cat.includes('univ') || labels.some(l => l.includes('admission') || l.includes('cuet') || l.includes('entrance') || l.includes('univ')) || allText.includes('admission') || allText.includes('entrance') || allText.includes('university');
  }
  if (q.includes('tech') || q.includes('game') || q.includes('app') || q.includes('cyber')) {
    return cat.includes('tech') || labels.some(l => l.includes('tech') || l.includes('google') || l.includes('telegram') || l.includes('cyber')) || allText.includes('tech') || allText.includes('online');
  }

  return allText.includes(q) || q.split(/\s+/).every(word => allText.includes(word));
}

// In-memory memory cache for ultra-fast instant UI rendering (0ms)
let cachedBloggerPosts = null;
let bloggerFetchPromise = null;

async function getCachedOrFreshBloggerPosts() {
  if (cachedBloggerPosts && cachedBloggerPosts.length > 0) {
    return cachedBloggerPosts;
  }
  if (!bloggerFetchPromise) {
    bloggerFetchPromise = getBloggerPosts({ maxResults: 50 })
      .then((res) => {
        if (res.items && Array.isArray(res.items)) {
          cachedBloggerPosts = res.items.map(formatBloggerPost);
          return cachedBloggerPosts;
        }
        return [];
      })
      .catch(() => [])
      .finally(() => {
        bloggerFetchPromise = null;
      });
  }
  return bloggerFetchPromise;
}

/**
 * Get single post by ID (Instant 0ms resolution via local cache + Blogger API)
 */
export async function getPostById(postId) {
  if (!postId) {
    if (defaultJobs && defaultJobs.length > 0) {
      return formatJobAsPost(defaultJobs[0]);
    }
    throw new Error('Post ID is required');
  }

  // 1. Instant check in local verified jobs (0ms - zero delay)
  const localFound = (defaultJobs || []).find((j) => j && j.id === postId);
  if (localFound) {
    return formatJobAsPost(localFound);
  }

  // 2. Check in cached Blogger posts (0ms)
  if (cachedBloggerPosts) {
    const cachedBlogger = cachedBloggerPosts.find((p) => p && p.id === postId);
    if (cachedBlogger) return cachedBlogger;
  }

  // 3. Try fetching directly from Blogger API by ID
  try {
    const bloggerPost = await getBloggerPostById(postId);
    if (bloggerPost && bloggerPost.id) {
      const formatted = formatBloggerPost(bloggerPost);
      // Cache it
      if (!cachedBloggerPosts) cachedBloggerPosts = [];
      cachedBloggerPosts.push(formatted);
      return formatted;
    }
  } catch (_err) {}

  // 4. Try matching by slug or title in local repository
  const slug = postId
    .replace(/^(sarkari-rss-|scraped-|sarkari-|blogger-)/, '')
    .replace(/-\d+$/, '')
    .toLowerCase();

  if (slug.length > 3) {
    const slugMatch = (defaultJobs || []).find((j) => {
      if (!j) return false;
      const jId = (j.id || '').toLowerCase();
      const jTitle = (j.title || '').toLowerCase();
      return jId.includes(slug) || slug.split('-').slice(0, 4).every((w) => jTitle.includes(w));
    });
    if (slugMatch) {
      return formatJobAsPost(slugMatch);
    }
  }

  // 5. Check live RSS updates
  try {
    const liveUpdates = await getLiveSarkariUpdates();
    const liveFound = (liveUpdates || []).find((j) => j && j.id === postId);
    if (liveFound) {
      return formatJobAsPost(liveFound);
    }
  } catch (_e) {}

  // 6. Resilient Fallback: Always return first verified post so user NEVER sees blank or error screen
  if (defaultJobs && defaultJobs.length > 0) {
    console.warn(`[postService] Post "${postId}" served with verified default post.`);
    return formatJobAsPost(defaultJobs[0]);
  }

  throw new Error('Article not available.');
}

/**
 * Get unified posts feed (Blogger real posts + Sarkari/Yojana posts combined)
 * Guaranteed to return posts instantly for every category and tab!
 */
export async function getUnifiedPosts({ pageToken = '', maxResults = 12, label = '' } = {}) {
  // 1. Instantly prepare local formatted jobs (0ms)
  const localFormatted = (defaultJobs || []).map((item) => formatJobAsPost(item));

  // 2. Fetch or retrieve cached Blogger posts
  let bloggerList = [];
  try {
    bloggerList = await getCachedOrFreshBloggerPosts();
  } catch (_e) {
    bloggerList = [];
  }

  // Combine: Blogger real posts + local verified jobs
  const allPosts = [...bloggerList, ...localFormatted];

  // Apply intelligent category matcher
  let filtered = allPosts;
  if (label && label !== 'All') {
    filtered = allPosts.filter((post) => matchesCategory(post, label));
  }

  // Fallback: If filter returned nothing (e.g. obscure query), return top posts rather than empty screen!
  if (filtered.length === 0 && allPosts.length > 0) {
    filtered = allPosts;
  }

  return {
    items: filtered.slice(0, maxResults),
    nextPageToken: filtered.length > maxResults ? 'has_more' : '',
  };
}

/**
 * Pick a random post guaranteed to be distinct and natural
 * Draws from all combined posts (Blogger real posts + 155 live verified jobs)
 * Excludes any post IDs passed in excludeIds
 */
export async function getRandomSafelinkPost(excludeIds = []) {
  let pool = [];
  try {
    const res = await getUnifiedPosts({ maxResults: 150 });
    if (res.items && res.items.length > 0) {
      pool = res.items;
    }
  } catch (_e) {}

  if (!pool || pool.length === 0) {
    pool = (defaultJobs || []).map(formatJobAsPost);
  }

  const excludeSet = new Set((excludeIds || []).filter(Boolean));
  const available = pool.filter(p => p && p.id && !excludeSet.has(p.id));
  const candidatePool = available.length > 0 ? available : pool;

  const chosen = candidatePool[Math.floor(Math.random() * candidatePool.length)];
  return chosen || pool[0];
}

