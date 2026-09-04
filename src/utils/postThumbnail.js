/**
 * Dynamic Content-Specific Sarkari Poster & Thumbnail Generator
 * Generates high-impact, authentic posters customized to the post's title, department, and category.
 */

function detectTheme(title = '', category = '', org = '') {
  const text = `${title} ${category} ${org}`.toLowerCase();

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
    };
  }
  if (text.includes('ssc') || text.includes('cgl') || text.includes('chsl') || text.includes('mts') || text.includes('gd constable') || text.includes('stenographer')) {
    return {
      dept: 'STAFF SELECTION COMMISSION',
      badge: 'SSC OFFICIAL NOTIFICATION',
      bg1: '#1e3a8a',
      bg2: '#0f172a',
      accent: '#60a5fa',
      border: '#2563eb',
      icon: '🏛️',
      tag: 'SSC RECRUITMENT',
    };
  }
  if (text.includes('upsc') || text.includes('ias') || text.includes('ips') || text.includes('nda') || text.includes('cds') || text.includes('civil services')) {
    return {
      dept: 'UNION PUBLIC SERVICE COMMISSION',
      badge: 'UPSC CIVIL SERVICES',
      bg1: '#312e81',
      bg2: '#0f172a',
      accent: '#fbbf24',
      border: '#4f46e5',
      icon: '⚖️',
      tag: 'UPSC ADVERTISEMENT',
    };
  }
  if (text.includes('police') || text.includes('constable') || text.includes('sub inspector') || text.includes('si ') || text.includes('daroga')) {
    return {
      dept: 'STATE POLICE RECRUITMENT BOARD',
      badge: 'POLICE BHARTI 2026',
      bg1: '#881337',
      bg2: '#0f172a',
      accent: '#f43f5e',
      border: '#e11d48',
      icon: '🛡️',
      tag: 'POLICE VACANCY',
    };
  }
  if (text.includes('army') || text.includes('navy') || text.includes('air force') || text.includes('agniveer') || text.includes('defense') || text.includes('defence') || text.includes('bsf') || text.includes('crpf')) {
    return {
      dept: 'INDIAN ARMED FORCES (भारतीय सेना)',
      badge: 'DEFENSE RECRUITMENT 2026',
      bg1: '#14532d',
      bg2: '#0f172a',
      accent: '#86efac',
      border: '#16a34a',
      icon: '⚔️',
      tag: 'AGNIVEER / DEFENSE',
    };
  }
  if (text.includes('bank') || text.includes('ibps') || text.includes('sbi') || text.includes('rbi') || text.includes('po ') || text.includes('clerk') || text.includes('nabard')) {
    return {
      dept: 'BANKING RECRUITMENT BOARD',
      badge: 'BANK RECRUITMENT 2026',
      bg1: '#0c4a6e',
      bg2: '#082f49',
      accent: '#38bdf8',
      border: '#0284c7',
      icon: '🏦',
      tag: 'IBPS / SBI NOTICE',
    };
  }
  if (text.includes('yojana') || text.includes('scheme') || text.includes('kisan') || text.includes('awas') || text.includes('pension') || text.includes('subsidy') || text.includes('ration')) {
    return {
      dept: 'GOVERNMENT OF INDIA (सरकारी योजना)',
      badge: 'GOVT SCHEME & WELFARE',
      bg1: '#7c2d12',
      bg2: '#0f172a',
      accent: '#fb923c',
      border: '#ea580c',
      icon: '🇮🇳',
      tag: 'PRADHAN MANTRI YOJANA',
    };
  }
  if (text.includes('admit') || text.includes('hall ticket') || text.includes('call letter') || category.toLowerCase().includes('admit')) {
    return {
      dept: 'EXAMINATION CONTROLLER BOARD',
      badge: 'ADMIT CARD RELEASED',
      bg1: '#78350f',
      bg2: '#0f172a',
      accent: '#fde047',
      border: '#d97706',
      icon: '🎫',
      tag: 'HALL TICKET ACTIVE',
    };
  }
  if (text.includes('result') || text.includes('merit') || text.includes('cutoff') || text.includes('scorecard') || category.toLowerCase().includes('result')) {
    return {
      dept: 'EXAM RESULTS PORTAL',
      badge: 'OFFICIAL RESULT DECLARED',
      bg1: '#134e4a',
      bg2: '#0f172a',
      accent: '#2dd4bf',
      border: '#0d9488',
      icon: '🏆',
      tag: 'SCORECARD & CUTOFF',
    };
  }
  if (text.includes('cuet') || text.includes('admission') || text.includes('university') || text.includes('college') || text.includes('entrance') || category.toLowerCase().includes('admission') || text.includes('counseling')) {
    return {
      dept: 'UNIVERSITY ADMISSIONS (CUET / NTA)',
      badge: 'ADMISSION NOTICE 2026',
      bg1: '#581c87',
      bg2: '#0f172a',
      accent: '#c084fc',
      border: '#7e22ce',
      icon: '🎓',
      tag: 'ENTRANCE & COUNSELING',
    };
  }
  if (text.includes('teacher') || text.includes('tet') || text.includes('bpsc teacher') || text.includes('ctet') || text.includes('prt') || text.includes('tgt') || text.includes('pgt')) {
    return {
      dept: 'EDUCATION RECRUITMENT BOARD',
      badge: 'TEACHER RECRUITMENT 2026',
      bg1: '#4c1d95',
      bg2: '#0f172a',
      accent: '#a78bfa',
      border: '#6d28d9',
      icon: '📚',
      tag: 'TEACHING VACANCY',
    };
  }

  // Default Sarkari Theme
  return {
    dept: org ? org.toUpperCase().slice(0, 32) : 'GOVERNMENT RECRUITMENT PORTAL',
    badge: 'OFFICIAL NOTIFICATION 2026',
    bg1: '#1e1b4b',
    bg2: '#020617',
    accent: '#818cf8',
    border: '#4338ca',
    icon: '📌',
    tag: category.toUpperCase() || 'LATEST UPDATE',
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
 * Creates an authentic Sarkari thumbnail SVG Data-URI customized for the specific post
 */
export function createSarkariPosterSvg(post = {}) {
  const rawTitle = post.title || 'Government Recruitment Notification';
  const category = post.category || 'Latest Jobs';
  const org = post.organization || '';
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
    <rect x="0" y="0" width="220" height="32" rx="8" fill="url(#accentGrad)"/>
    <text x="110" y="21" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#ffffff" letter-spacing="1">
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

  <!-- Bottom Info Bar -->
  <g transform="translate(36, 360)">
    <rect x="0" y="0" width="728" height="52" rx="12" fill="${theme.bg1}" stroke="${theme.border}" stroke-width="1"/>
    
    <text x="24" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">
      📌 Application: <tspan fill="${theme.accent}">ONLINE PORTAL ACTIVE</tspan>
    </text>
    <text x="360" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">
      🎯 Eligibility: <tspan fill="${theme.accent}">10th / 12th / Graduate</tspan>
    </text>
    
    <rect x="610" y="10" width="104" height="32" rx="8" fill="#16a34a"/>
    <text x="662" y="31" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#ffffff">
      APPLY NOW ➔
    </text>
  </g>
</svg>
`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Universal Post Thumbnail Extractor & Generator
 * Checks if a post already has an authentic image; otherwise returns a customized Sarkari poster.
 */
export function getPostThumbnail(post) {
  if (!post) return createSarkariPosterSvg({});

  // 1. Check explicit image fields (that are NOT generic Unsplash fallbacks)
  const candidateUrl = post.imageUrl || post.thumbnail || post.image;
  if (candidateUrl && typeof candidateUrl === 'string' && !candidateUrl.includes('unsplash.com')) {
    return candidateUrl;
  }

  // 2. Check HTML content for embedded <img> tags (ignoring old unsplash fallback)
  if (post.content && typeof post.content === 'string') {
    const match = post.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1] && !match[1].includes('unsplash.com')) {
      return match[1];
    }
  }

  // 3. Generate content-specific Sarkari Poster SVG
  return createSarkariPosterSvg(post);
}
