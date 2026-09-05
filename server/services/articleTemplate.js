/**
 * Curated High-Definition Topic Banner Image Provider
 * Guarantees that 100% of posts sent to Blogger and the site always have a valid image
 * for automatic Blogger thumbnail generation and visual reader engagement.
 */
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
  // Default news/media fallback
  return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&h=630&q=80';
}

export function buildClonedHtmlArticle(clonedData, siteCategory = 'News & Updates', sourceName = 'Official Source') {
  const {
    title,
    author,
    featuredImage,
    applyOnlineUrl,
    notificationPdfUrl,
    officialWebsiteUrl,
    tablesHtml = [],
    bodyContentHtml = '',
    sourceUrl,
  } = clonedData;

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const catLower = (siteCategory || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();

  const isRecruitmentOrExam =
    catLower.includes('job') ||
    catLower.includes('admit') ||
    catLower.includes('result') ||
    catLower.includes('scheme') ||
    catLower.includes('yojana') ||
    titleLower.includes('recruitment') ||
    titleLower.includes('vacancy') ||
    titleLower.includes('admit card') ||
    titleLower.includes('scorecard') ||
    titleLower.includes('online form');

  const applyLink = applyOnlineUrl || sourceUrl;
  const pdfLink = notificationPdfUrl || '';
  const officialLink = officialWebsiteUrl || applyLink;
  const renderedTables = tablesHtml.slice(0, 3).join('\n');
  const finalBanner = (featuredImage && typeof featuredImage === 'string' && featuredImage.startsWith('http'))
    ? featuredImage
    : getCategoryBannerImage(title, siteCategory);

  // ─────────────────────────────────────────────────────────────
  // 1. RECRUITMENT & EXAM ARTICLE TEMPLATE
  // ─────────────────────────────────────────────────────────────
  if (isRecruitmentOrExam) {
    return `
      <div class="sarkari-article-modern" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.8; color: #1e293b; max-width: 860px; margin: 0 auto;">
        
        <!-- Guaranteed Lead Banner Image (Blogger & Reader Thumbnail) -->
        <div style="text-align: center; margin-bottom: 26px;">
          <img src="${finalBanner}" alt="${title}" style="max-width: 100%; height: auto; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;" />
        </div>

        <!-- Top Quick Summary Card -->
        <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #cbd5e1; border-left: 6px solid #4f46e5; padding: 22px 26px; border-radius: 16px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <h3 style="margin: 0; color: #0f172a; font-size: 19px; font-weight: 800;">
              📢 Official Notification Overview
            </h3>
            <span style="background: #10b981; color: #ffffff; padding: 3px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
              ● Active Notice
            </span>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 9px 4px; font-weight: 700; width: 34%; color: #475569;">Notice Title:</td>
              <td style="padding: 9px 4px; color: #0f172a; font-weight: 800;">${title}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 9px 4px; font-weight: 700; color: #475569;">Authority / Source:</td>
              <td style="padding: 9px 4px; color: #4f46e5; font-weight: 800;">${sourceName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 9px 4px; font-weight: 700; color: #475569;">Category:</td>
              <td style="padding: 9px 4px; color: #0f172a; font-weight: 700;">${siteCategory}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 9px 4px; font-weight: 700; color: #475569;">Published Date:</td>
              <td style="padding: 9px 4px; color: #0f172a;">${today}</td>
            </tr>
            <tr>
              <td style="padding: 9px 4px; font-weight: 700; color: #475569;">Source Website:</td>
              <td style="padding: 9px 4px; color: #4f46e5; font-weight: 800;">
                <a href="${sourceUrl || applyLink}" target="_blank" rel="noopener noreferrer" style="color: #4f46e5; text-decoration: underline;">
                  🌐 ${sourceName}
                </a>
              </td>
            </tr>
          </table>
        </div>

        <!-- Ad Slot 1 -->
        <div class="code-block code-block-1" style="margin: 20px auto; text-align: center; display: block; clear: both;">
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-format="fluid"
               data-ad-layout-key="-6t+ed+2i-1n-4w"
               data-ad-client="ca-pub-9543073887536718"
               data-ad-slot="9320506924"></ins>
          <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        </div>

        <!-- Article Body & Descriptions -->
        <div class="article-real-body" style="font-size: 16px; color: #334155; margin: 26px 0; line-height: 1.85;">
          ${bodyContentHtml}
        </div>

        <!-- Ad Slot 2 -->
        <div class="code-block code-block-2" style="margin: 22px 0; clear: both; text-align: center;">
          <ins class="adsbygoogle"
               style="display:block; text-align:center;"
               data-ad-layout="in-article"
               data-ad-format="fluid"
               data-ad-client="ca-pub-9543073887536718"
               data-ad-slot="4392273015"></ins>
          <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        </div>

        <!-- Cloned Tables -->
        ${renderedTables ? `
        <div class="article-real-tables" style="margin: 30px 0;">
          <h3 style="color: #0f172a; font-size: 19px; font-weight: 800; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
            📊 Key Details &amp; Criteria
          </h3>
          ${renderedTables}
        </div>` : ''}

        <!-- Official Direct Action Links Box -->
        <div style="background: linear-gradient(135deg, #0b1326 0%, #171f33 100%); border-radius: 18px; padding: 24px; text-align: center; margin: 30px 0; color: #ffffff;">
          <h4 style="margin: 0 0 10px; color: #fbbf24; font-size: 17px; text-transform: uppercase; font-weight: 800;">
            ⚡ Verified Direct Links &amp; Resources
          </h4>
          <p style="margin: 0 0 16px; font-size: 13px; color: #cbd5e1;">
            Access verified portals for <strong>${title}</strong>:
          </p>

          <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;">
            <a href="${applyLink}" target="_blank" rel="noopener noreferrer" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block;">
              🔗 Direct Portal / Official Link ➔
            </a>
            ${pdfLink ? `
            <a href="${pdfLink}" target="_blank" rel="noopener noreferrer" style="background: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block;">
              📄 Download Notification (PDF)
            </a>` : ''}
            ${officialLink && officialLink !== applyLink ? `
            <a href="${officialLink}" target="_blank" rel="noopener noreferrer" style="background: rgba(255,255,255,0.15); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; border: 1px solid rgba(255,255,255,0.25);">
              🌐 Official Website
            </a>` : ''}
          </div>
        </div>

      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────
  // 2. UNIVERSAL NEWS, TECHNOLOGY & EDITORIAL ARTICLE TEMPLATE
  // ─────────────────────────────────────────────────────────────
  return `
    <div class="news-article-modern" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.85; color: #1e293b; max-width: 860px; margin: 0 auto;">
      
      <!-- Guaranteed Lead Banner Image (Blogger & Reader Thumbnail) -->
      <div style="text-align: center; margin-bottom: 26px;">
        <img src="${finalBanner}" alt="${title}" style="max-width: 100%; height: auto; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;" />
      </div>

      <!-- Editorial Header Metadata -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 24px; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="background: #4f46e5; color: #ffffff; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; text-transform: uppercase;">
            ${siteCategory}
          </span>
          <span style="color: #64748b; font-size: 13px; font-weight: 600;">
            📅 ${today}
          </span>
        </div>
        <div style="font-size: 13px; color: #64748b; font-weight: 600;">
          Source: <strong style="color: #0f172a;">${sourceName}</strong>
          ${author ? ` • By <span style="color: #4f46e5;">${author}</span>` : ''}
        </div>
      </div>

      <!-- Fluid Native Ad Unit 1 -->
      <div class="code-block code-block-1" style="margin: 20px auto; text-align: center; display: block; clear: both;">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-format="fluid"
             data-ad-layout-key="-6t+ed+2i-1n-4w"
             data-ad-client="ca-pub-9543073887536718"
             data-ad-slot="9320506924"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>

      <!-- Real Formatted Article Body -->
      <div class="article-content" style="font-size: 16px; color: #334155; margin: 26px 0; line-height: 1.85;">
        ${bodyContentHtml || `<p style="font-size: 16px; line-height: 1.8; color: #334155;">${title}</p>`}
      </div>

      <!-- Mid Article Ad Unit 2 -->
      <div class="code-block code-block-2" style="margin: 24px 0; clear: both; text-align: center;">
        <ins class="adsbygoogle"
             style="display:block; text-align:center;"
             data-ad-layout="in-article"
             data-ad-format="fluid"
             data-ad-client="ca-pub-9543073887536718"
             data-ad-slot="4392273015"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>

      <!-- Tables if any exist in the news article -->
      ${renderedTables ? `
      <div class="article-tables" style="margin: 24px 0;">
        ${renderedTables}
      </div>` : ''}

      <!-- Authentic Source Citation Card -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 22px; margin: 30px 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 2px;">Original Publication</div>
          <div style="font-size: 14px; color: #0f172a; font-weight: 700;">Reported via ${sourceName}</div>
        </div>
        ${sourceUrl ? `
        <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" style="background: #0f172a; color: #ffffff; padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
          Read Original Source ➔
        </a>` : ''}
      </div>

    </div>
  `;
}

/**
 * High-Value Comprehensive Editorial Article Generator:
 * Produces an in-depth, rich, 800+ word blog post when external source text is brief.
 * Formats full structured sections, highlight boxes, step-by-step procedures, tables, FAQs, and official buttons.
 */
export function generateComprehensiveArticle({
  title,
  category = 'News & Updates',
  sourceName = 'Official Source',
  sourceUrl = '',
  snippet = '',
  featuredImage = '',
  existingBody = '',
}) {
  const cleanTitle = (title || 'Official Announcement').replace(/\s*-\s*[^-]+$/, '').trim();
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const catLower = (category || '').toLowerCase();
  const textLower = `${cleanTitle} ${snippet}`.toLowerCase();

  const isJob = catLower.includes('job') || textLower.includes('recruitment') || textLower.includes('bharti') || textLower.includes('vacancy');
  const isScheme = catLower.includes('scheme') || catLower.includes('yojana') || textLower.includes('yojana') || textLower.includes('scholarship');
  const isUniv = catLower.includes('univ') || catLower.includes('admission') || textLower.includes('admission') || textLower.includes('entrance');
  const isAdmit = catLower.includes('admit') || textLower.includes('hall ticket');
  const isResult = catLower.includes('result') || textLower.includes('merit list') || textLower.includes('cutoff');
  const isTech = catLower.includes('tech') || textLower.includes('game') || textLower.includes('bgmi') || textLower.includes('download') || textLower.includes('smartphone');

  let topicHeadline = 'Comprehensive Overview & Background Details';
  let section1Title = 'Key Highlights & Important Points';
  let section2Title = 'Eligibility & Criteria';
  let section3Title = 'Step-by-Step Procedure & Guidelines';
  let procedureSteps = [
    `Visit the official verified portal via direct link provided below.`,
    `Navigate to the notifications or registration section for <strong>${cleanTitle}</strong>.`,
    `Carefully read the official instructions, criteria, and requirements.`,
    `Complete your online registration, document verification, or access process.`,
    `Save or download a copy of the official confirmation receipt for future reference.`
  ];
  let faqs = [
    { q: `What is the current status of ${cleanTitle}?`, a: `The official update for ${cleanTitle} has been released by ${sourceName} and the details are active for all eligible candidates and readers.` },
    { q: `Where can I access the official direct portal?`, a: `You can access the verified direct gateway through the official button provided at the end of this article.` },
    { q: `Who is eligible to participate or register?`, a: `Eligibility criteria depend on official guidelines issued by ${sourceName}. Please review the detailed criteria outlined above.` }
  ];

  if (isScheme) {
    topicHeadline = 'Scheme Objectives, Financial Aid & Citizen Benefits';
    section1Title = 'Key Benefits & Assistance Provided';
    section2Title = 'Eligibility Criteria & Required Documents';
    section3Title = 'How to Apply for the Scheme Online';
    procedureSteps = [
      `Go to the official citizen welfare portal or designated state/central gateway.`,
      `Locate the online application window for <strong>${cleanTitle}</strong>.`,
      `Enter your basic personal details, Aadhaar number, and contact details.`,
      `Upload necessary certificates (Income certificate, Caste certificate, Bank passbook, Marksheet).`,
      `Submit your form and note down your Application / Beneficiary Reference ID.`
    ];
    faqs = [
      { q: `Who can apply for ${cleanTitle}?`, a: `Eligible citizens and beneficiaries meeting the prescribed income, state, or educational criteria defined by ${sourceName} are eligible.` },
      { q: `What documents are required?`, a: `Standard verification documents include Aadhaar Card, Passport-sized photographs, Resident Certificate, Income proof, and Active Bank Account passbook.` },
      { q: `How is the financial assistance credited?`, a: `Financial benefits are directly transferred to the verified beneficiary bank account via DBT (Direct Benefit Transfer).` }
    ];
  } else if (isUniv) {
    topicHeadline = 'University Admission Process, Seats & Regulations';
    section1Title = 'Course Overview & Academic Programs';
    section2Title = 'Admission Eligibility & Minimum Qualifying Marks';
    section3Title = 'How to Complete Online Admission Registration';
    procedureSteps = [
      `Visit the university's official admissions portal.`,
      `Click on "New Admission Registration / UG PG Entrance".`,
      `Fill in your academic marks, course choices, and personal information.`,
      `Upload scanned copies of required academic transcripts and identity proofs.`,
      `Pay the online registration fee and download your registration slip for merit allotment.`
    ];
    faqs = [
      { q: `When does the admission process begin?`, a: `The admission registration window has been opened as announced by ${sourceName}. Candidates should register before the specified closing date.` },
      { q: `How will candidates be selected?`, a: `Selection is based on merit list rank or entrance examination score as per university guidelines.` },
      { q: `Is offline application available?`, a: `Applications are primarily accepted online through the official university website.` }
    ];
  } else if (isTech) {
    topicHeadline = 'Technical Specifications, Features & System Requirements';
    section1Title = 'What Makes This Update Important';
    section2Title = 'Compatibility & System Specifications';
    section3Title = 'Step-by-Step Installation & Access Guide';
    procedureSteps = [
      `Ensure your device meets the minimum operating system and hardware requirements.`,
      `Access the verified developer portal or official distribution gateway.`,
      `Follow the on-screen prompts to register your account or download package.`,
      `Review security permissions and complete setup.`,
      `Launch the application to verify successful configuration and connectivity.`
    ];
    faqs = [
      { q: `What are the minimum device requirements?`, a: `Standard modern mobile or desktop devices with sufficient storage and stable internet connectivity can access this release smoothly.` },
      { q: `Is this release officially verified?`, a: `Yes, this update has been reported and announced through authorized technology and developer channels.` }
    ];
  }

  const primaryText = snippet && snippet.length > 50 ? snippet : `${cleanTitle} has been officially announced by ${sourceName}. This detailed guide covers everything you need to know, including official guidelines, eligibility, dates, and direct links.`;
  const finalBanner = (featuredImage && typeof featuredImage === 'string' && featuredImage.startsWith('http'))
    ? featuredImage
    : getCategoryBannerImage(cleanTitle, category);

  return `
    <div class="comprehensive-article-container" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.85; color: #1e293b; max-width: 860px; margin: 0 auto;">
      
      <!-- Guaranteed Lead Banner Image (Blogger & Reader Thumbnail) -->
      <div style="text-align: center; margin-bottom: 26px;">
        <img src="${finalBanner}" alt="${cleanTitle}" style="max-width: 100%; height: auto; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;" />
      </div>

      <!-- Top Summary Card -->
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #cbd5e1; border-left: 6px solid #4f46e5; padding: 22px 26px; border-radius: 16px; margin-bottom: 26px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
          <h3 style="margin: 0; color: #0f172a; font-size: 20px; font-weight: 800;">
            📢 ${cleanTitle} – Quick Summary
          </h3>
          <span style="background: #10b981; color: #ffffff; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
            Active Release
          </span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 4px; font-weight: 700; width: 34%; color: #475569;">Subject / Topic:</td>
            <td style="padding: 9px 4px; color: #0f172a; font-weight: 800;">${cleanTitle}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 4px; font-weight: 700; color: #475569;">Authority / Provider:</td>
            <td style="padding: 9px 4px; color: #4f46e5; font-weight: 800;">${sourceName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 4px; font-weight: 700; color: #475569;">Category:</td>
            <td style="padding: 9px 4px; color: #0f172a; font-weight: 700;">${category}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 4px; font-weight: 700; color: #475569;">Update Date:</td>
            <td style="padding: 9px 4px; color: #0f172a;">${today}</td>
          </tr>
          <tr>
            <td style="padding: 9px 4px; font-weight: 700; color: #475569;">Direct Portal:</td>
            <td style="padding: 9px 4px; color: #4f46e5; font-weight: 800;">
              <a href="${sourceUrl || '#'}" target="_blank" rel="noopener noreferrer" style="color: #4f46e5; text-decoration: underline;">
                🔗 Verified Source Gateway
              </a>
            </td>
          </tr>
        </table>
      </div>

      <!-- Fluid Native Ad Unit 1 -->
      <div class="code-block code-block-1" style="margin: 22px auto; text-align: center; display: block; clear: both;">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-format="fluid"
             data-ad-layout-key="-6t+ed+2i-1n-4w"
             data-ad-client="ca-pub-9543073887536718"
             data-ad-slot="9320506924"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>

      <!-- Section 1: In-Depth Overview -->
      <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin-top: 32px; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
        ${topicHeadline}
      </h2>
      <p style="font-size: 16px; line-height: 1.85; color: #334155; margin-bottom: 16px;">
        ${primaryText}
      </p>
      ${existingBody ? `<div style="font-size: 16px; line-height: 1.85; color: #334155; margin-bottom: 18px;">${existingBody}</div>` : `
      <p style="font-size: 16px; line-height: 1.85; color: #334155; margin-bottom: 16px;">
        The recent announcement regarding <strong>${cleanTitle}</strong> released by <strong>${sourceName}</strong> marks a significant update for stakeholders, applicants, and readers. It provides clear guidelines, active deadlines, and designated protocols to ensure smooth execution and transparent access for all interested individuals.
      </p>
      `}

      <!-- Section 2: Key Highlights -->
      <h3 style="color: #0f172a; font-size: 19px; font-weight: 800; margin-top: 28px; margin-bottom: 12px;">
        📌 ${section1Title}
      </h3>
      <ul style="padding-left: 24px; font-size: 15px; line-height: 1.85; color: #334155; margin-bottom: 20px;">
        <li><strong>Official Authority:</strong> Released under the verified purview of ${sourceName}.</li>
        <li><strong>Active Online Mode:</strong> Complete details, circulars, and forms are accessible via official web gateways.</li>
        <li><strong>Target Scope:</strong> Tailored to fulfill requirements in the <strong>${category}</strong> sector across state and national levels.</li>
        <li><strong>Transparency &amp; Support:</strong> Helpdesk, helpline numbers, and official documentation are available for seamless verification.</li>
      </ul>

      <!-- In-Article Ad Unit 2 -->
      <div class="code-block code-block-2" style="margin: 24px 0; clear: both; text-align: center;">
        <ins class="adsbygoogle"
             style="display:block; text-align:center;"
             data-ad-layout="in-article"
             data-ad-format="fluid"
             data-ad-client="ca-pub-9543073887536718"
             data-ad-slot="4392273015"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>

      <!-- Section 3: Eligibility / Specifications -->
      <h3 style="color: #0f172a; font-size: 19px; font-weight: 800; margin-top: 28px; margin-bottom: 12px;">
        🎯 ${section2Title}
      </h3>
      <p style="font-size: 16px; line-height: 1.85; color: #334155; margin-bottom: 14px;">
        Before proceeding with registration or accessing guidelines for <strong>${cleanTitle}</strong>, verify that you satisfy the criteria established by the authorities:
      </p>
      <ul style="padding-left: 24px; font-size: 15px; line-height: 1.85; color: #334155; margin-bottom: 24px;">
        <li>Candidates and applicants must satisfy the mandatory prerequisite standards prescribed by <strong>${sourceName}</strong>.</li>
        <li>Ensure all authentic identification cards, educational certificates, or requisite credentials are valid and updated.</li>
        <li>Applicants are advised to review the official release notification in its entirety to avoid any submission discrepancies.</li>
      </ul>

      <!-- Section 4: Step-by-Step Procedure -->
      <h3 style="color: #0f172a; font-size: 19px; font-weight: 800; margin-top: 28px; margin-bottom: 12px;">
        📝 ${section3Title}
      </h3>
      <ol style="padding-left: 24px; font-size: 15px; line-height: 1.85; color: #334155; margin-bottom: 24px;">
        ${procedureSteps.map(s => `<li style="margin-bottom: 8px;">${s}</li>`).join('\n')}
      </ol>

      <!-- Section 5: Frequently Asked Questions -->
      <h3 style="color: #0f172a; font-size: 19px; font-weight: 800; margin-top: 32px; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
        ❓ Frequently Asked Questions (FAQs)
      </h3>
      <div style="space-y: 14px; margin-bottom: 28px;">
        ${faqs.map(faq => `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 12px;">
            <h4 style="margin: 0 0 6px; font-size: 15px; font-weight: 800; color: #0f172a;">Q: ${faq.q}</h4>
            <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #475569;">${faq.a}</p>
          </div>
        `).join('')}
      </div>

      <!-- Section 6: Official Direct Actions Box -->
      <div style="background: linear-gradient(135deg, #0b1326 0%, #171f33 100%); border-radius: 18px; padding: 26px; text-align: center; margin: 32px 0; color: #ffffff;">
        <h4 style="margin: 0 0 10px; color: #fbbf24; font-size: 18px; text-transform: uppercase; font-weight: 800;">
          ⚡ Official Direct Links &amp; Resources
        </h4>
        <p style="margin: 0 0 18px; font-size: 13px; color: #cbd5e1;">
          Direct verified gateway provided by ${sourceName}:
        </p>

        <div style="display: flex; flex-wrap: wrap; gap: 14px; justify-content: center;">
          <a href="${sourceUrl || '#'}" target="_blank" rel="noopener noreferrer" style="background: #4f46e5; color: #ffffff; padding: 13px 26px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
            🔗 Access Official Portal / Online Form ➔
          </a>
          ${sourceUrl ? `
          <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" style="background: rgba(255,255,255,0.15); color: #ffffff; padding: 13px 26px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 14px; display: inline-block; border: 1px solid rgba(255,255,255,0.25);">
            📄 View Official Notice &amp; Details
          </a>` : ''}
        </div>
      </div>

    </div>
  `;
}

