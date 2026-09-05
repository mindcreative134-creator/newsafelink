/**
 * Universal AdSense-Compliant HTML Article Builder
 * Dynamically builds:
 * 1. Editorial / News layout for general news, technology, sports, business, and editorial stories
 * 2. Official Recruitment layout for government jobs, admit cards, exam results, and schemes
 */

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

  // ─────────────────────────────────────────────────────────────
  // 1. RECRUITMENT & EXAM ARTICLE TEMPLATE
  // ─────────────────────────────────────────────────────────────
  if (isRecruitmentOrExam) {
    return `
      <div class="sarkari-article-modern" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.8; color: #1e293b; max-width: 860px; margin: 0 auto;">
        
        <!-- Real Featured Banner Image -->
        ${featuredImage ? `
        <div style="text-align: center; margin-bottom: 26px;">
          <img src="${featuredImage}" alt="${title}" style="max-width: 100%; height: auto; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;" />
        </div>` : ''}

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
      
      <!-- Featured Banner Image -->
      ${featuredImage ? `
      <div style="text-align: center; margin-bottom: 26px;">
        <img src="${featuredImage}" alt="${title}" style="max-width: 100%; height: auto; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;" />
      </div>` : ''}

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
