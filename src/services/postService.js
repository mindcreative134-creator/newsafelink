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
 * Get single post by ID (Checking Blogger API or local/RSS/scraped Sarkari repository)
 */
export async function getPostById(postId) {
  if (!postId) {
    if (defaultJobs && defaultJobs.length > 0) {
      return formatJobAsPost(defaultJobs[0]);
    }
    throw new Error('Post ID is required');
  }

  // 1. Try resolving from live RSS / scraped updates or default jobs
  let allUpdates;
  try {
    allUpdates = await getLiveSarkariUpdates();
  } catch (_e) {
    allUpdates = defaultJobs || [];
  }

  const combinedList = [...allUpdates, ...(defaultJobs || [])];

  // Exact ID match
  let found = combinedList.find((j) => j && j.id === postId);

  // If not found by exact ID, try match by slug or title
  if (!found) {
    const slug = postId
      .replace(/^(sarkari-rss-|scraped-|sarkari-|blogger-)/, '')
      .replace(/-\d+$/, '')
      .toLowerCase();

    if (slug.length > 3) {
      found = combinedList.find((j) => {
        if (!j) return false;
        const jId = (j.id || '').toLowerCase();
        const jTitle = (j.title || '').toLowerCase();
        return jId.includes(slug) || slug.split('-').slice(0, 4).every((word) => jTitle.includes(word));
      });
    }
  }

  if (found) {
    return formatJobAsPost(found);
  }

  // 2. Try fetching from Blogger API
  try {
    const bloggerPost = await getBloggerPostById(postId);
    if (bloggerPost && bloggerPost.id) {
      return bloggerPost;
    }
  } catch (_err) {
    // Continue to fallback
  }

  // 3. Fallback: Return the first verified post from defaultJobs so post NEVER fails to render
  if (defaultJobs && defaultJobs.length > 0) {
    console.warn(`[postService] Post "${postId}" not found directly; serving verified fallback post.`);
    return formatJobAsPost(defaultJobs[0]);
  }

  throw new Error('Notification post not found.');
}

/**
 * Get unified posts feed (Blogger posts + Sarkari/Yojana posts combined)
 */
export async function getUnifiedPosts({ pageToken = '', maxResults = 12, label = '' } = {}) {
  let bloggerItems = [];
  let bloggerNextToken = '';

  try {
    const bloggerData = await getBloggerPosts({ pageToken, maxResults, label });
    if (bloggerData.items && bloggerData.items.length > 0) {
      bloggerItems = bloggerData.items;
      bloggerNextToken = bloggerData.nextPageToken || '';
    }
  } catch (e) {
    // Blogger API failed or empty
  }

  // Get live verified Sarkari / Scraped updates
  const sarkariUpdates = await getLiveSarkariUpdates();
  let filteredSarkari = sarkariUpdates;

  if (label) {
    const l = label.toLowerCase();
    if (l.includes('live') || l.includes('all')) {
      // Live Updates category returns all current real-time feeds
      filteredSarkari = sarkariUpdates;
    } else {
      filteredSarkari = sarkariUpdates.filter(
        (j) => 
          j.category?.toLowerCase().includes(l) || 
          (j.organization && j.organization.toLowerCase().includes(l)) ||
          (j.sourceName && j.sourceName.toLowerCase().includes(l)) ||
          (j.title && j.title.toLowerCase().includes(l))
      );
    }
  }

  const formattedSarkari = filteredSarkari.map((item) => formatJobAsPost(item));

  // Merge items: if Blogger has posts, combine both; otherwise show all real Sarkari posts
  let merged;
  if (bloggerItems.length > 0) {
    merged = [...bloggerItems, ...formattedSarkari];
  } else {
    merged = formattedSarkari;
  }

  return {
    items: merged.slice(0, maxResults),
    nextPageToken: bloggerNextToken,
  };
}
