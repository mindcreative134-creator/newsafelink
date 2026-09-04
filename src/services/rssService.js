import defaultJobs from '../data/liveJobs.json';

const CACHE_KEY = 'SARKARI_RSS_CACHE_V7_REAL_ONLY';
const CACHE_TIME_KEY = 'SARKARI_RSS_CACHE_TIME_V7_REAL_ONLY';
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Strict Authenticity Filter:
 * Rejects menu headers, navigation categories, and crime/negative/non-job news.
 */
export function isValidSarkariPost(title) {
  if (!title || typeof title !== 'string') return false;
  const t = title.toLowerCase().trim();

  // 1. Length constraint (allow short titles like "UP Scholarship" or "UPSC CMS 2026")
  if (t.length < 10 || t.length > 250) return false;

  // 2. Reject website navigation & category menu labels
  const menuBlacklist = [
    'all india jobs',
    'latest job',
    'latest jobs',
    'home',
    'admit card',
    'admit cards',
    'result',
    'results',
    'answer key',
    'syllabus',
    'admission',
    'admissions',
    'contact us',
    'about us',
    'privacy policy',
    'disclaimer',
    'terms and conditions',
    'term & condition',
    'view all',
    'click here',
    'view more',
    'trending now',
    'quick links',
  ];
  if (menuBlacklist.includes(t)) return false;

  // 3. Reject Crime / Negative / Non-Job News (unless it is a legitimate recruitment / exam term)
  const isRecruitmentPost = t.includes('recruitment') || t.includes('bharti') || t.includes('result') || 
                            t.includes('admit card') || t.includes('vacancy') || t.includes('post') || 
                            t.includes('warder') || t.includes('jailor') || t.includes('exam');

  if (!isRecruitmentPost) {
    const crimeBlacklist = [
      'arrest',
      'arrested',
      'rape',
      'raped',
      'murder',
      'crime',
      'blast',
      'fraud',
      'scam',
      'digital arrest',
      'killed',
      'police custody',
      'extortion',
      'assault',
      'terror',
      'suicide',
      'cyber fraud',
    ];
    if (crimeBlacklist.some((word) => t.includes(word))) return false;
  }

  // 4. Must contain genuine government recruitment / exam / university / scheme keywords
  const validKeywords = [
    // Recruitment & Jobs
    'recruitment', 'bharti', 'भर्ती', 'vacancy', 'vacancies', 'posts', 'पद', 
    'online form', 'apply online', 'online apply', 'notification', 'admit card', 
    'result', 'रिजल्ट', 'answer key', 'scorecard', 'score card', 'cutoff', 'cut off', 
    'apprentice', 'officer', 'constable', 'cgl', 'chsl', 'upsc', 'bpsc', 'bssc', 'csbc', 
    'ssc', 'rrb', 'railway', 'gds', 'ctet', 'tet', 'jee', 'neet', 'police', 'army', 
    'navy', 'airforce', 'agniveer', 'bank', 'sbi', 'ibps', 'inter', 'matric', 'clerk', 
    'teacher', 'warder', 'jailor', 'prahari', 'dsssb', 'rpsc', 'oicl', 'lic', 'nabard', 
    'aiims', 'epfo', 'drdo', 'isro', 'walk-in', 'walk in', 'interview',

    // University & Academic Updates (Munger, Bihar Universities, UG/PG, B.Ed)
    'university', 'vishwavidyalaya', 'विश्वविद्यालय', 'munger', 'patna', 'lnmu', 'vksu', 
    'magadh', 'brabu', 'purnea', 'tmbu', 'bnmu', 'ppu', 'ignou', 'du', 'bhu', 'jnu', 
    'aktu', 'ccsu', 'prsu', 'college', 'degree', 'ug', 'pg', 'semester', 'session', 
    'part 1', 'part 2', 'part 3', 'ba', 'bsc', 'bcom', 'ma', 'msc', 'mcom', 'bed', 
    'b.ed', 'deled', 'd.el.ed', 'bceceb', 'counselling', 'counseling', 'choice filling', 
    'seat allotment', 'allotment', 'provisional', 'migration', 'certificate', 'marksheet', 
    'merit list', 'merit', 'timetable', 'routine', 'exam date', 'date sheet', 'syllabus', 
    'admission', 'entrance', 'iti', 'polytechnic', 'bseb', 'cbse', 'board', 'b.tech', 
    'diploma', 'registration', 'transcript', 'city slip', 'city details', 'city intimation', 
    'intimation slip', 'slip', 're-exam', 're exam', 'dossier', 'e-dossier', 'panjiyan', 'पंजीयन',

    // Government Schemes, Portals & Citizen Welfare
    'yojana', 'योजना', 'scheme', 'pension', 'subsidy', 'scholarship', 'छात्रवृत्ति', 
    'kisan', 'ration', 'राशन', 'pds', 'ayushman', 'loan', 'samman nidhi', 'fasal bima', 
    'udyami', 'beneficiary', 'awas', 'pmaw', 'eshram', 'e-shram', 'job card', 'nrega', 
    'mgnrega', 'card', 'कार्ड', 'voter', 'epic', 'driving licence', 'driving license', 
    'licence', 'license', 'rojgar', 'रोजगार', 'rojgar mela', 'mela', 'मेला', 'complaint', 
    'sahyog', 'portal', 'csc', 'rtps', 'caste certificate', 'income certificate', 
    'निवास', 'जाति', 'आय', 'medhasoft', 'nsp',

    // General Exam & News Updates
    'notice', 'circular', 'order', 'guidelines', 'update', 'alert', 'press note', 
    'announcement', 'programme', 'schedule', 'exam', 'examination', 'परीक्षा', 'आवेदन', 'फॉर्म'
  ];

  return validKeywords.some((k) => t.includes(k));
}

// Curated RSS feeds across Government Jobs, Schemes (योजना), and University Admissions
const RSS_FEEDS = [
  {
    name: 'Google News - Sarkari Naukri',
    url: 'https://news.google.com/rss/search?q=sarkari+naukri+recruitment+when:2d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Latest Jobs',
    defaultBadge: 'JOB',
  },
  {
    name: 'Google News - Sarkari Yojana Schemes',
    url: 'https://news.google.com/rss/search?q=sarkari+yojana+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Govt Schemes & Yojana',
    defaultBadge: 'YOJANA',
  },
  {
    name: 'Google News - University Admissions & CUET',
    url: 'https://news.google.com/rss/search?q=university+admission+cuet+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'University & Admissions',
    defaultBadge: 'ADMISSION',
  },
  {
    name: 'Google News - Govt Exam Admit Card',
    url: 'https://news.google.com/rss/search?q=admit+card+exam+when:2d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Admit Cards',
    defaultBadge: 'ADMIT',
  },
  {
    name: 'Google News - Sarkari Result',
    url: 'https://news.google.com/rss/search?q=exam+result+declared+when:2d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'Results',
    defaultBadge: 'RESULT',
  },
];

function cleanText(html) {
  if (!html) return '';
  const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return text.length > 200 ? text.substring(0, 200) + '...' : text;
}

async function fetchRssFeed(feedObj) {
  try {
    const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedObj.url)}`;
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== 'ok' || !Array.isArray(data.items)) return [];

    const verifiedItems = [];

    data.items.forEach((item, index) => {
      const cleanTitle = item.title ? item.title.replace(/\s*-\s*[^-]+$/, '').trim() : '';
      if (!cleanTitle || !isValidSarkariPost(cleanTitle)) {
        return; // Filter out non-recruitment or crime headlines
      }

      const sourceName = item.author || (item.title && item.title.includes('-') ? item.title.split('-').pop().trim() : 'Official Board');
      const cleanSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
      const uniqueId = `sarkari-rss-${cleanSlug}-${index}`;

      let extractedImg = item.thumbnail || (item.enclosure && item.enclosure.link);
      if (!extractedImg && item.description) {
        const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) extractedImg = imgMatch[1];
      }

      verifiedItems.push({
        id: uniqueId,
        title: cleanTitle,
        category: feedObj.category,
        organization: sourceName,
        totalPosts: 'Refer to Notification Details',
        qualification: 'See Detailed Educational Eligibility Below',
        lastDate: 'Online Application Window Active',
        status: 'Active',
        badge: feedObj.defaultBadge,
        applyUrl: item.link || 'https://sarkariresult.com',
        summary: cleanText(item.description) || cleanTitle,
        publishedDate: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        ageLimit: 'As per Central / State Government Guidelines',
        imageUrl: extractedImg || '',
        isRss: true,
      });
    });

    return verifiedItems;
  } catch (_e) {
    return [];
  }
}

/**
 * Fetch latest scraped recruitment posts from backend server
 */
async function fetchBackendScrapedPosts() {
  const possibleUrls = [
    '/api/latest-posts',
    'http://localhost:5000/api/latest-posts',
  ];

  if (import.meta.env.VITE_BACKEND_URL) {
    possibleUrls.unshift(`${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}/api/latest-posts`);
  }

  for (const url of possibleUrls) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {}
  }
  return [];
}

export async function getLiveSarkariUpdates(forceRefresh = false) {
  if (!forceRefresh) {
    try {
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedTime && cachedData && Date.now() - Number(cachedTime) < CACHE_DURATION_MS) {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (_e) {}
  }

  try {
    // 1. Fetch real scraped posts from backend server
    const backendPosts = await fetchBackendScrapedPosts();

    // 2. Fetch fresh verified RSS items
    const feedPromises = RSS_FEEDS.map((f) => fetchRssFeed(f));
    const feedResults = await Promise.allSettled(feedPromises);

    const liveItems = [];
    feedResults.forEach((res) => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        liveItems.push(...res.value);
      }
    });

    // 3. Merge: Scraped backend posts first, then live RSS items, then default verified jobs
    const combined = [...backendPosts, ...liveItems.slice(0, 25), ...defaultJobs];

    // Deduplicate by clean title
    const seenTitles = new Set();
    const uniqueMerged = [];

    for (const item of combined) {
      if (!item || !item.title) continue;
      const normalized = item.title.trim().toLowerCase();
      if (!seenTitles.has(normalized)) {
        seenTitles.add(normalized);
        uniqueMerged.push(item);
      }
    }

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(uniqueMerged));
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
    } catch (_e) {}

    return uniqueMerged;
  } catch (_err) {
    return defaultJobs;
  }
}

export async function searchUpdates(query) {
  const all = await getLiveSarkariUpdates();
  if (!query) return all;
  const q = query.toLowerCase().trim();
  return all.filter(
    (item) =>
      item.title?.toLowerCase().includes(q) ||
      item.organization?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.summary?.toLowerCase().includes(q)
  );
}
