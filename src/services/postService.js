import { getPosts as getBloggerPosts, getPostById as getBloggerPostById } from './bloggerApi';
import { getLiveSarkariUpdates } from './rssService';
import defaultJobs from '../data/liveJobs.json';
import { getPostThumbnail } from '../utils/postThumbnail';

/**
 * Generate high quality, comprehensive HTML blog post for a Sarkari/Yojana/Admission update
 */
export function generateSarkariArticleHtml(item) {
  const org = item.organization || 'Government Department / Board';
  const category = item.category || 'Government Job Notification';
  const totalPosts = item.totalPosts || 'Refer to Official Notification';
  const qualification = item.qualification || 'Graduate / 10th / 12th Pass';
  const ageLimit = item.ageLimit || '18 to 35 Years (Age relaxation applicable as per rules)';
  const lastDate = item.lastDate || 'Active Online';
  const pubDate = item.publishedDate || new Date().toISOString().split('T')[0];
  const applyUrl = item.applyUrl || 'https://sarkariresult.com';
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
            <td class="font-bold bg-zinc-100 dark:bg-zinc-800/80 p-3">Number of Vacancies / Scope</td>
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
            <td class="font-bold bg-zinc-100 dark:bg-zinc-800/80 p-3">Last Date to Apply / Check</td>
            <td class="p-3 text-red-600 font-bold">${lastDate}</td>
          </tr>
        </tbody>
      </table>

      <!-- Eligibility & Criteria Section -->
      <h3 class="text-lg font-black text-zinc-900 dark:text-white font-heading mt-6 mb-2">
        🎯 Eligibility & Qualification Criteria
      </h3>
      <ul class="list-disc pl-5 space-y-2 text-sm text-zinc-700 dark:text-zinc-300 mb-6">
        <li><strong>Educational Qualification:</strong> ${qualification} from any recognized Board or University in India.</li>
        <li><strong>Age Limit:</strong> ${ageLimit}. Age relaxation will be provided to SC/ST/OBC/EWS candidates as per Government of India guidelines.</li>
        <li><strong>Nationality:</strong> Candidate must be a citizen of India.</li>
      </ul>

      <!-- Application Fee Section -->
      <h3 class="text-lg font-black text-zinc-900 dark:text-white font-heading mt-6 mb-2">
        💳 Application Fee & Payment Mode
      </h3>
      <table class="w-full text-xs sm:text-sm border-collapse my-4">
        <thead>
          <tr class="bg-zinc-100 dark:bg-zinc-800 text-left">
            <th class="p-3 font-bold">Category</th>
            <th class="p-3 font-bold">Application Fee</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-3">General / OBC / EWS</td>
            <td class="p-3 font-semibold">₹100 to ₹500 (As per category guidelines)</td>
          </tr>
          <tr>
            <td class="p-3">SC / ST / PwD / Female Candidates</td>
            <td class="p-3 font-semibold text-emerald-600">Nil / Exempted</td>
          </tr>
          <tr>
            <td class="p-3">Payment Method</td>
            <td class="p-3">Online through Net Banking, UPI, Credit/Debit Card</td>
          </tr>
        </tbody>
      </table>

      <!-- How to Apply Steps -->
      <h3 class="text-lg font-black text-zinc-900 dark:text-white font-heading mt-6 mb-3">
        📝 How to Apply / Check Status Online
      </h3>
      <ol class="list-decimal pl-5 space-y-2.5 text-sm text-zinc-700 dark:text-zinc-300 mb-6">
        <li>Visit the official portal of <strong>${org}</strong> by clicking the direct link below.</li>
        <li>Locate the notification link for <strong>${item.title}</strong> under the Latest Recruitment / Notifications section.</li>
        <li>Read the official notification brochure carefully to ensure eligibility.</li>
        <li>Click on <strong>"Apply Online"</strong> or <strong>"Registration"</strong> and complete your basic profile details.</li>
        <li>Upload required scanned documents (photograph, signature, educational certificates).</li>
        <li>Pay the online application fee (if applicable) and submit your final application form.</li>
        <li>Download and print a hard copy of the final confirmation receipt for future reference.</li>
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
            📄 Download Official Notification (PDF)
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
 * Format a job/RSS item into a standard post object for UI consistency
 */
function formatJobAsPost(item) {
  const posterImg = getPostThumbnail(item);
  const contentHtml = generateSarkariArticleHtml(item);

  return {
    id: item.id,
    title: item.title,
    thumbnail: posterImg,
    imageUrl: posterImg,
    content: `<img src="${posterImg}" alt="${item.title}" class="w-full rounded-2xl mb-6 object-cover aspect-video shadow-lg border border-slate-200 dark:border-slate-800" />` + contentHtml,
    published: item.publishedDate || new Date().toISOString(),
    updated: item.publishedDate || new Date().toISOString(),
    labels: [item.category, item.organization || 'Sarkari Update'],
    isSarkariJob: true,
    rawJob: item,
  };
}

/**
 * Get single post by ID (Checking Blogger API or local/RSS Sarkari repository)
 */
export async function getPostById(postId) {
  // If it's a Sarkari or RSS post ID
  if (postId.startsWith('sarkari-') || postId.startsWith('rss-')) {
    // Check cached live RSS jobs
    const allUpdates = await getLiveSarkariUpdates();
    const found = allUpdates.find((j) => j.id === postId) || defaultJobs.find((j) => j.id === postId);

    if (found) {
      return formatJobAsPost(found);
    }
  }

  // Otherwise, fetch from Blogger API
  try {
    const bloggerPost = await getBloggerPostById(postId);
    if (bloggerPost && bloggerPost.id) {
      return bloggerPost;
    }
  } catch (err) {
    // If not found in Blogger, search in defaultJobs as fallback
    const fallback = defaultJobs.find((j) => j.id === postId);
    if (fallback) {
      return formatJobAsPost(fallback);
    }
    throw err;
  }
}

/**
 * Get unified posts feed (Blogger posts + Sarkari/Yojana posts combined)
 */
export async function getUnifiedPosts({ pageToken = '', maxResults = 12, label = '' } = {}) {
  let bloggerItems = [];
  let bloggerNextToken = '';

  try {
    const bloggerData = await getBloggerPosts({ pageToken, maxResults, label });
    if (bloggerData.items) {
      bloggerItems = bloggerData.items;
      bloggerNextToken = bloggerData.nextPageToken || '';
    }
  } catch (e) {
    // Blogger failed or empty
  }

  // Get Sarkari / RSS updates
  const sarkariUpdates = await getLiveSarkariUpdates();
  let filteredSarkari = sarkariUpdates;

  if (label) {
    const l = label.toLowerCase();
    filteredSarkari = sarkariUpdates.filter(
      (j) => j.category?.toLowerCase().includes(l) || (j.organization && j.organization.toLowerCase().includes(l))
    );
  }

  const formattedSarkari = filteredSarkari.map((item) => formatJobAsPost(item));

  // Merge items: mix Blogger posts with Sarkari posts
  const merged = [...formattedSarkari.slice(0, 8), ...bloggerItems];

  return {
    items: merged.slice(0, maxResults),
    nextPageToken: bloggerNextToken,
  };
}
