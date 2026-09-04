/**
 * Clean, AdSense-compliant HTML Article Builder with Dynamic Sarkari Poster Generator
 */

function detectTheme(title = '', category = '', org = '') {
  const text = `${title} ${category} ${org}`.toLowerCase();

  if (text.includes('railway') || text.includes('rrb') || text.includes('irctc') || text.includes('loco pilot')) {
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
    };
  }
  if (text.includes('upsc') || text.includes('ias') || text.includes('ips') || text.includes('nda') || text.includes('cds')) {
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
  if (text.includes('army') || text.includes('navy') || text.includes('air force') || text.includes('agniveer') || text.includes('defense') || text.includes('defence')) {
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
  if (text.includes('bank') || text.includes('ibps') || text.includes('sbi') || text.includes('rbi') || text.includes('po ') || text.includes('clerk')) {
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
  if (text.includes('yojana') || text.includes('scheme') || text.includes('kisan') || text.includes('awas') || text.includes('pension')) {
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
  if (text.includes('admit') || text.includes('hall ticket') || category.toLowerCase().includes('admit')) {
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
  if (text.includes('result') || text.includes('merit') || text.includes('cutoff') || category.toLowerCase().includes('result')) {
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
  if (text.includes('cuet') || text.includes('admission') || text.includes('university') || category.toLowerCase().includes('admission')) {
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

export function createSarkariPosterSvg(title, category, org) {
  const theme = detectTheme(title, category, org);
  const cleanTitle = (title || 'Government Recruitment Notification').replace(/\s*-\s*[^-]+$/, '').trim();
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

  <rect width="800" height="450" fill="url(#bgGrad)"/>
  <rect x="14" y="14" width="772" height="422" rx="20" fill="none" stroke="${theme.border}" stroke-width="2" stroke-opacity="0.6"/>
  <rect x="22" y="22" width="756" height="406" rx="16" fill="#000000" fill-opacity="0.35"/>

  <g transform="translate(36, 38)">
    <rect x="0" y="0" width="728" height="56" rx="12" fill="${theme.bg2}" stroke="${theme.border}" stroke-width="1.5"/>
    <text x="20" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="${theme.accent}">
      ${theme.icon} ${escapeXml(theme.dept)}
    </text>
    <rect x="520" y="12" width="188" height="32" rx="8" fill="${theme.border}"/>
    <text x="614" y="33" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="#ffffff">
      ${escapeXml(theme.tag)}
    </text>
  </g>

  <g transform="translate(36, 110)">
    <rect x="0" y="0" width="220" height="32" rx="8" fill="url(#accentGrad)"/>
    <text x="110" y="21" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#ffffff">
      ★ ${escapeXml(theme.badge)} ★
    </text>
  </g>

  <g transform="translate(36, 178)">
    ${escapedLines
      .map(
        (line, idx) => `
      <text x="0" y="${idx * 46}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="900" fill="#ffffff">
        ${line}
      </text>`
      )
      .join('')}
  </g>

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

export function buildHtmlArticle(title, snippet, sourceName, category, sourceUrl, enhancedDetails = {}) {
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const realImg = enhancedDetails.imageUrl || '';
  const applyUrl = enhancedDetails.applyUrl || sourceUrl;
  const pdfUrl = enhancedDetails.notificationPdf || '';
  const officialWeb = enhancedDetails.officialWebsite || applyUrl;
  const introText = enhancedDetails.realIntro || snippet;

  return `
    <div class="sarkari-article" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.8; color: #1e293b; max-width: 820px; margin: 0 auto;">
      
      <!-- Real Featured Poster / Banner Image -->
      ${realImg ? `
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="${realImg}" alt="${title}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.12); border: 1px solid #e2e8f0;" />
      </div>` : ''}

      <!-- Top Overview Box -->
      <div style="background: #f8fafc; border-left: 5px solid #2563eb; padding: 18px; border-radius: 10px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <h3 style="margin: 0 0 12px; color: #1e293b; font-size: 18px; font-weight: 800;">📌 Quick Information Summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 6px; font-weight: bold; width: 35%; color: #475569;">Notification / Post:</td>
            <td style="padding: 8px 6px; color: #0f172a; font-weight: 700;">${title}</td>
          </tr>
          <tr>
            <td style="padding: 8px 6px; font-weight: bold; color: #475569;">Category:</td>
            <td style="padding: 8px 6px; color: #2563eb; font-weight: 700;">${category}</td>
          </tr>
          <tr>
            <td style="padding: 8px 6px; font-weight: bold; color: #475569;">Published Date:</td>
            <td style="padding: 8px 6px; color: #0f172a;">${today}</td>
          </tr>
          <tr>
            <td style="padding: 8px 6px; font-weight: bold; color: #475569;">Source / Board:</td>
            <td style="padding: 8px 6px; color: #0f172a;">${sourceName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 6px; font-weight: bold; color: #475569;">Application Status:</td>
            <td style="padding: 8px 6px; color: #16a34a; font-weight: bold;">Active Online</td>
          </tr>
        </table>
      </div>

      <!-- Real Notification Description -->
      <h2 style="color: #0f172a; font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px;">
        ${title} – Complete Details
      </h2>
      <div style="font-size: 15px; color: #334155; margin: 16px 0;">
        ${introText.split('\n\n').map(p => `<p style="margin-bottom: 12px;">${p}</p>`).join('')}
      </div>

      <!-- Eligibility Table -->
      <h3 style="color: #1e293b; font-size: 17px; margin-top: 24px; font-weight: 800;">🎯 Key Eligibility & Criteria</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; border: 1px solid #cbd5e1;">
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; width: 35%; background: #f1f5f9;">Eligibility Criteria</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px;">Candidates should verify qualification & eligibility rules from the official notification brochure.</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; background: #f1f5f9;">Age Criteria & Relaxation</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px;">Applicable as per official board recruitment guidelines. Category relaxation applies for SC/ST/OBC.</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; background: #f1f5f9;">Application Mode</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px;">Online Official Portal</td>
          </tr>
        </tbody>
      </table>

      <!-- Steps to Apply -->
      <h3 style="color: #1e293b; font-size: 17px; margin-top: 24px; font-weight: 800;">📝 How to Apply / Check Status</h3>
      <ol style="padding-left: 20px; font-size: 14px; line-height: 1.8; color: #334155;">
        <li>Visit the official portal using the direct links provided below.</li>
        <li>Carefully read the official advertisement notification before filling the online form.</li>
        <li>Complete registration, fill all required details, and upload documents.</li>
        <li>Submit the application and save the final confirmation page.</li>
      </ol>

      <!-- Real Official Direct Action Buttons -->
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 14px; padding: 24px; text-align: center; margin: 32px 0; color: #ffffff;">
        <h4 style="margin: 0 0 14px; color: #f59e0b; font-size: 17px; text-transform: uppercase; font-weight: 800;">
          ⚡ Official Direct Links &amp; Portal
        </h4>
        <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 14px;">
          <a href="${applyUrl}" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
            🔗 Apply Online / Direct Portal
          </a>
          ${pdfUrl ? `
          <a href="${pdfUrl}" target="_blank" rel="noopener noreferrer" style="background: #16a34a; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
            📄 Download Official Notification (PDF)
          </a>` : ''}
          ${officialWeb && officialWeb !== applyUrl ? `
          <a href="${officialWeb}" target="_blank" rel="noopener noreferrer" style="background: #475569; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
            🌐 Official Website
          </a>` : ''}
        </div>
        <p style="font-size: 11px; color: #94a3b8; margin: 14px 0 0;">
          Notice: Always verify full details and deadlines on the official government recruitment portal.
        </p>
      </div>
    </div>
  `;
}
