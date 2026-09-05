/**
 * Dynamic Content-Specific Poster & Thumbnail Generator
 * Generates high-impact, authentic posters customized to the post's title, department, and category.
 * Strictly adapts typography and labels for News, Tech, Gaming, Admissions, Schemes, and Jobs.
 */

function detectTheme(title = '', category = '', org = '') {
  const text = `${title} ${category} ${org}`.toLowerCase();

  // 1. Tech, Gaming, Apps & Gadgets (e.g. BGMI, Smartphones, Software, AI)
  if (
    text.includes('bgmi') || text.includes('game') || text.includes('gaming') ||
    text.includes('smartphone') || text.includes('laptop') || text.includes('iphone') ||
    text.includes('android') || text.includes('download') || text.includes('gadget') ||
    text.includes('tech') || text.includes('software') || text.includes('artificial intelligence') ||
    text.includes('ai ') || category.toLowerCase().includes('tech')
  ) {
    return {
      dept: 'TECH & GAMING INSIGHTS',
      badge: 'TECH GUIDE & RELEASE',
      bg1: '#0f172a',
      bg2: '#020617',
      accent: '#38bdf8',
      border: '#0284c7',
      icon: '🎮',
      tag: 'TECH & DIGITAL',
      info1Label: '💻 Category',
      info1Value: 'TECH & GAMING',
      info2Label: '⚡ Status',
      info2Value: 'LATEST UPDATE',
      actionText: 'READ GUIDE ➔',
    };
  }

  // 2. University Admissions & Academic Notices (e.g. LLB, BA, B.Ed, Munger Univ, CUET)
  if (
    text.includes('cuet') || text.includes('admission') || text.includes('university') ||
    text.includes('college') || text.includes('entrance') || text.includes('munger') ||
    text.includes('lnmu') || text.includes('patna') || text.includes('llb') ||
    text.includes('b.ed') || text.includes('deled') || text.includes('counseling') ||
    text.includes('counselling') || category.toLowerCase().includes('admission') ||
    category.toLowerCase().includes('univ')
  ) {
    const univName = org ? org.toUpperCase().slice(0, 24) : 'UNIVERSITY ADMISSIONS';
    return {
      dept: `${univName} ADMISSIONS`,
      badge: 'ACADEMIC SESSION 2026',
      bg1: '#3b0764',
      bg2: '#0f172a',
      accent: '#c084fc',
      border: '#9333ea',
      icon: '🎓',
      tag: 'ACADEMIC NOTICE',
      info1Label: '🎓 Program',
      info1Value: text.includes('llb') ? 'LAW / LLB ADMISSION' : 'DEGREE / ENTRANCE',
      info2Label: '📋 Session',
      info2Value: 'ACADEMIC 2026-27',
      actionText: 'VIEW NOTICE ➔',
    };
  }

  // 3. Government Schemes & Citizen Welfare (e.g. NFOBC, PM Kisan, Scholarship, Yojana)
  if (
    text.includes('yojana') || text.includes('scheme') || text.includes('scholarship') ||
    text.includes('kisan') || text.includes('awas') || text.includes('pension') ||
    text.includes('subsidy') || text.includes('ration') || text.includes('nfobc') ||
    text.includes('fellowship') || category.toLowerCase().includes('scheme') ||
    category.toLowerCase().includes('yojana')
  ) {
    return {
      dept: 'PRADHAN MANTRI & STATE YOJANA',
      badge: 'GOVT SCHEME & WELFARE',
      bg1: '#7c2d12',
      bg2: '#0f172a',
      accent: '#fb923c',
      border: '#ea580c',
      icon: '🏛️',
      tag: 'CITIZEN WELFARE',
      info1Label: '🏛️ Scheme',
      info1Value: text.includes('fellowship') || text.includes('scholar') ? 'RESEARCH FELLOWSHIP' : 'GOVT WELFARE AID',
      info2Label: '👥 Beneficiary',
      info2Value: 'ELIGIBLE BENEFICIARIES',
      actionText: 'CHECK STATUS ➔',
    };
  }

  // 4. Admit Cards & Hall Tickets
  if (text.includes('admit') || text.includes('hall ticket') || text.includes('call letter') || category.toLowerCase().includes('admit')) {
    return {
      dept: org ? org.toUpperCase().slice(0, 28) : 'EXAMINATION CONTROLLER',
      badge: 'ADMIT CARD RELEASED',
      bg1: '#78350f',
      bg2: '#0f172a',
      accent: '#fde047',
      border: '#d97706',
      icon: '🎫',
      tag: 'HALL TICKET ACTIVE',
      info1Label: '🎫 Document',
      info1Value: 'EXAM CITY / ADMIT CARD',
      info2Label: '📅 Status',
      info2Value: 'DOWNLOAD ACTIVE',
      actionText: 'DOWNLOAD ➔',
    };
  }

  // 5. Results & Merit Lists
  if (text.includes('result') || text.includes('merit') || text.includes('cutoff') || text.includes('scorecard') || category.toLowerCase().includes('result')) {
    return {
      dept: org ? org.toUpperCase().slice(0, 28) : 'EXAMINATION RESULTS DESK',
      badge: 'OFFICIAL RESULT DECLARED',
      bg1: '#134e4a',
      bg2: '#0f172a',
      accent: '#2dd4bf',
      border: '#0d9488',
      icon: '🏆',
      tag: 'SCORECARD & MERIT LIST',
      info1Label: '🏆 Scorecard',
      info1Value: 'MERIT LIST RELEASED',
      info2Label: '📊 Details',
      info2Value: 'OFFICIAL CUTOFF',
      actionText: 'CHECK RESULT ➔',
    };
  }

  // 6. Railways Recruitment
  if (text.includes('railway') || text.includes('rrb') || text.includes('irctc') || text.includes('loco pilot') || text.includes('rrc')) {
    return {
      dept: 'INDIAN RAILWAYS (भारतीय रेल)',
      badge: 'RAILWAY RECRUITMENT 2026',
      bg1: '#064e3b',
      bg2: '#022c22',
      accent: '#34d399',
      border: '#059669',
      icon: '🚆',
      tag: 'RRB / RRC VACANCY',
      info1Label: '📌 Application',
      info1Value: 'ONLINE RECRUITMENT',
      info2Label: '🎯 Eligibility',
      info2Value: '10TH / ITI / GRADUATE',
      actionText: 'APPLY NOW ➔',
    };
  }

  // 7. SSC Recruitment
  if (text.includes('ssc') || text.includes('cgl') || text.includes('chsl') || text.includes('mts') || text.includes('gd constable')) {
    return {
      dept: 'STAFF SELECTION COMMISSION',
      badge: 'SSC OFFICIAL NOTIFICATION',
      bg1: '#1e3a8a',
      bg2: '#0f172a',
      accent: '#60a5fa',
      border: '#2563eb',
      icon: '🏛️',
      tag: 'SSC RECRUITMENT',
      info1Label: '📌 Application',
      info1Value: 'ONLINE PORTAL ACTIVE',
      info2Label: '🎯 Eligibility',
      info2Value: '10TH / 12TH / DEGREE',
      actionText: 'APPLY NOW ➔',
    };
  }

  // 8. General News, Current Affairs & Sports
  if (
    category.toLowerCase().includes('news') || category.toLowerCase().includes('sport') ||
    text.includes('news') || text.includes('minister') || text.includes('pm ') ||
    text.includes('president') || text.includes('india') || text.includes('world')
  ) {
    return {
      dept: org ? org.toUpperCase().slice(0, 28) : 'NATIONAL & GLOBAL NEWS DESK',
      badge: 'VERIFIED REPORT & COVERAGE',
      bg1: '#1e293b',
      bg2: '#0f172a',
      accent: '#f59e0b',
      border: '#d97706',
      icon: '📰',
      tag: 'CURRENT AFFAIRS',
      info1Label: '🌐 Coverage',
      info1Value: 'NATIONAL & WORLD',
      info2Label: '📅 Edition',
      info2Value: 'LATEST REPORT',
      actionText: 'READ STORY ➔',
    };
  }

  // 9. Default Govt Recruitment Theme
  return {
    dept: org ? org.toUpperCase().slice(0, 30) : 'GOVERNMENT RECRUITMENT DESK',
    badge: 'OFFICIAL NOTIFICATION 2026',
    bg1: '#1e1b4b',
    bg2: '#020617',
    accent: '#818cf8',
    border: '#4338ca',
    icon: '💼',
    tag: 'GOVT RECRUITMENT',
    info1Label: '📌 Status',
    info1Value: 'ACTIVE NOTICE',
    info2Label: '🎯 Target',
    info2Value: 'OFFICIAL GUIDELINES',
    actionText: 'READ NOTICE ➔',
  };
}

function escapeXml(unsafe = '') {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxCharsPerLine = 30, maxLines = 3) {
  const words = text.split(/\s+/);
  const lines = [];
  let curLine = '';

  for (const w of words) {
    if ((curLine + ' ' + w).trim().length <= maxCharsPerLine) {
      curLine = (curLine + ' ' + w).trim();
    } else {
      if (curLine) lines.push(curLine);
      curLine = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (curLine && lines.length < maxLines) lines.push(curLine);
  if (lines.length === 0) lines.push(text.slice(0, maxCharsPerLine));
  return lines;
}

/**
 * Creates an authentic, topic-specific poster SVG Data-URI customized for the specific post
 */
export function createSarkariPosterSvg(post = {}) {
  const rawTitle = post.title || 'Official Portal Notification';
  const category = post.category || 'News & Updates';
  const org = post.organization || post.sourceName || '';
  const theme = detectTheme(rawTitle, category, org);

  // Clean title
  const cleanTitle = rawTitle.replace(/\s*-\s*[^-]+$/, '').trim();
  const lines = wrapText(cleanTitle, 28, 3);
  const escapedLines = lines.map((l) => escapeXml(l));

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg1}"/>
      <stop offset="100%" stop-color="${theme.bg2}"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.accent}"/>
      <stop offset="100%" stop-color="${theme.border}"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="800" height="450" fill="url(#bgGrad)"/>
  
  <!-- Outer Frame -->
  <rect x="14" y="14" width="772" height="422" rx="20" fill="none" stroke="${theme.border}" stroke-width="2" stroke-opacity="0.6"/>
  <rect x="22" y="22" width="756" height="406" rx="16" fill="#000000" fill-opacity="0.35"/>

  <!-- Top Header Banner -->
  <g transform="translate(36, 38)">
    <rect x="0" y="0" width="728" height="56" rx="12" fill="${theme.bg2}" stroke="${theme.border}" stroke-width="1.5"/>
    <text x="20" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="${theme.accent}" letter-spacing="0.5">
      ${theme.icon} ${escapeXml(theme.dept)}
    </text>
    <rect x="520" y="12" width="188" height="32" rx="8" fill="${theme.border}"/>
    <text x="614" y="33" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="#ffffff" letter-spacing="1">
      ${escapeXml(theme.tag)}
    </text>
  </g>

  <!-- Center Badge / Alert Box -->
  <g transform="translate(36, 110)">
    <rect x="0" y="0" width="230" height="32" rx="8" fill="url(#accentGrad)"/>
    <text x="115" y="21" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#ffffff" letter-spacing="1">
      ★ ${escapeXml(theme.badge)} ★
    </text>
  </g>

  <!-- Main Title Lines -->
  <g transform="translate(36, 178)">
    ${escapedLines
      .map(
        (line, idx) => `
      <text x="0" y="${idx * 46}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="900" fill="#ffffff" letter-spacing="-0.5">
        ${line}
      </text>`
      )
      .join('')}
  </g>

  <!-- Bottom Info Bar (Topic-Adaptive) -->
  <g transform="translate(36, 360)">
    <rect x="0" y="0" width="728" height="52" rx="12" fill="${theme.bg1}" stroke="${theme.border}" stroke-width="1"/>
    
    <text x="24" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">
      ${escapeXml(theme.info1Label)}: <tspan fill="${theme.accent}">${escapeXml(theme.info1Value)}</tspan>
    </text>
    <text x="360" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">
      ${escapeXml(theme.info2Label)}: <tspan fill="${theme.accent}">${escapeXml(theme.info2Value)}</tspan>
    </text>
    
    <rect x="596" y="10" width="118" height="32" rx="8" fill="${theme.border}"/>
    <text x="655" y="31" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#ffffff">
      ${escapeXml(theme.actionText)}
    </text>
  </g>
</svg>
`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getCategoryBannerImage(title = '', category = '') {
  const t = (title || '').toLowerCase();
  const c = (category || '').toLowerCase();
  const combined = `${t} ${c}`;

  if (combined.includes('bgmi') || combined.includes('freefire') || combined.includes('game') || combined.includes('gaming') || combined.includes('esport')) {
    return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&h=630&q=80';
  }
  if (combined.includes('tech') || combined.includes('gadget') || combined.includes('phone') || combined.includes('software') || combined.includes('ai') || combined.includes('scam') || combined.includes('cyber') || combined.includes('fraudster')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&h=630&q=80';
  }
  if (combined.includes('baaghi') || combined.includes('movie') || combined.includes('cinema') || combined.includes('film') || combined.includes('trailer') || combined.includes('actor') || combined.includes('actress')) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&h=630&q=80';
  }
  if (combined.includes('result') || combined.includes('score') || combined.includes('marks') || combined.includes('merit') || combined.includes('cutoff')) {
    return 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&h=630&q=80';
  }
  if (combined.includes('admit') || combined.includes('hall ticket') || combined.includes('exam date')) {
    return 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=1200&h=630&q=80';
  }
  if (combined.includes('admission') || combined.includes('university') || combined.includes('college') || combined.includes('munger') || combined.includes('llb') || combined.includes('ug') || combined.includes('pg') || combined.includes('bed') || combined.includes('certificate fee')) {
    return 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&h=630&q=80';
  }
  if (combined.includes('scheme') || combined.includes('yojana') || combined.includes('scholarship') || combined.includes('nfobc') || combined.includes('kisan') || combined.includes('dbt')) {
    return 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&h=630&q=80';
  }
  if (combined.includes('job') || combined.includes('recruitment') || combined.includes('bharti') || combined.includes('vacancy') || combined.includes('assistant') || combined.includes('officer') || combined.includes('clerk') || combined.includes('apprentice')) {
    return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&h=630&q=80';
  }
  if (combined.includes('sport') || combined.includes('cricket') || combined.includes('ipl') || combined.includes('football')) {
    return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&h=630&q=80';
  }
  return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=630&q=80';
}

/**
 * Universal Post Thumbnail Extractor & Generator
 * Checks if a post already has an authentic image; otherwise returns a customized topic banner or SVG poster.
 */
export function getPostThumbnail(post) {
  if (!post) return createSarkariPosterSvg({});

  // 1. Check explicit image fields (including Blogger API native images array)
  const candidateUrl = post.imageUrl || post.thumbnail || post.image || post.images?.[0]?.url;
  if (candidateUrl && typeof candidateUrl === 'string' && candidateUrl.startsWith('http')) {
    return candidateUrl;
  }

  // 2. Check HTML content for embedded <img> tags
  if (post.content && typeof post.content === 'string') {
    const match = post.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1] && match[1].startsWith('http')) {
      return match[1];
    }
  }

  // 3. Fallback to curated high-resolution topic banner
  const banner = getCategoryBannerImage(post.title || '', (post.labels && post.labels[0]) || post.category || '');
  if (banner) {
    return banner;
  }

  // 4. Generate topic-specific Poster SVG
  return createSarkariPosterSvg(post);
}
