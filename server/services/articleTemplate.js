/**
 * 100% Authentic AdSense-Compliant HTML Article Builder
 * Renders real cloned tables, authentic images, and direct official buttons with high-end modern styling.
 */

export function buildClonedHtmlArticle(clonedData, siteCategory = 'Latest Jobs', sourceName = 'Official Government Portal') {
  const {
    title,
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

  const applyLink = applyOnlineUrl || sourceUrl;
  const pdfLink = notificationPdfUrl || '';
  const officialLink = officialWebsiteUrl || applyLink;

  // Selected top 3 real tables from the original post
  const renderedTables = tablesHtml.slice(0, 3).join('\n');

  return `
    <div class="sarkari-article-modern" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.8; color: #1e293b; max-width: 860px; margin: 0 auto;">
      
      <!-- Real Featured Banner Image with subtle rounded elevation -->
      ${featuredImage ? `
      <div style="text-align: center; margin-bottom: 26px;">
        <img src="${featuredImage}" alt="${title}" style="max-width: 100%; height: auto; border-radius: 18px; box-shadow: 0 12px 30px rgba(0,0,0,0.12); border: 1px solid #e2e8f0;" />
      </div>` : ''}

      <!-- Top Quick Summary Card (Modern Glassmorphic Style) -->
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #cbd5e1; border-left: 6px solid #4f46e5; padding: 22px 26px; border-radius: 18px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(79,70,229,0.06);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
          <h3 style="margin: 0; color: #0f172a; font-size: 19px; font-weight: 900; letter-spacing: -0.02em;">
            📢 Official Recruitment Overview
          </h3>
          <span style="background: #10b981; color: #ffffff; padding: 3px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
            ● Active Online
          </span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 4px; font-weight: 700; width: 34%; color: #475569;">Notice Title:</td>
            <td style="padding: 9px 4px; color: #0f172a; font-weight: 800;">${title}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 4px; font-weight: 700; color: #475569;">Authority / Board:</td>
            <td style="padding: 9px 4px; color: #4f46e5; font-weight: 800;">${sourceName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 4px; font-weight: 700; color: #475569;">Category:</td>
            <td style="padding: 9px 4px; color: #0f172a; font-weight: 700;">${siteCategory}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 4px; font-weight: 700; color: #475569;">Release Date:</td>
            <td style="padding: 9px 4px; color: #0f172a;">${today}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 4px; font-weight: 700; color: #475569;">Source Website:</td>
            <td style="padding: 9px 4px; color: #4f46e5; font-weight: 800;">
              <a href="${sourceUrl || applyLink}" target="_blank" rel="noopener noreferrer" style="color: #4f46e5; text-decoration: underline;">
                🌐 ${sourceName} (${sourceUrl ? new URL(sourceUrl).hostname : 'Official Source'})
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 9px 4px; font-weight: 700; color: #475569;">Application Mode:</td>
            <td style="padding: 9px 4px; color: #059669; font-weight: 800;">Online Registration Form / Official Notice</td>
          </tr>
        </table>
      </div>

      <!-- BiharHelpAdvt 1 (Fluid Native Top Banner) -->
      <div class="code-block code-block-1" style="margin: 20px auto; text-align: center; display: block; clear: both;">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #94a3b8; margin-bottom: 6px;">Advertisement</div>
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-format="fluid"
             data-ad-layout-key="-6t+ed+2i-1n-4w"
             data-ad-client="ca-pub-9543073887536718"
             data-ad-slot="9320506924"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>

      <!-- Real Article Body & Descriptions -->
      <div class="article-real-body" style="font-size: 16px; color: #334155; margin: 26px 0; line-height: 1.85;">
        ${bodyContentHtml}
      </div>

      <!-- BiharHelpAdvt 2 (In-Article Mid Ad) -->
      <div class="code-block code-block-2" style="margin: 22px 0; clear: both; text-align: center;">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #94a3b8; margin-bottom: 6px;">Advertisement</div>
        <ins class="adsbygoogle"
             style="display:block; text-align:center;"
             data-ad-layout="in-article"
             data-ad-format="fluid"
             data-ad-client="ca-pub-9543073887536718"
             data-ad-slot="4392273015"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>

      <!-- Real Cloned Information & Vacancy Tables -->
      ${renderedTables ? `
      <div class="article-real-tables" style="margin: 30px 0;">
        <h3 style="color: #0f172a; font-size: 19px; font-weight: 900; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
          📊 Key Vacancy Breakdown &amp; Eligibility
        </h3>
        ${renderedTables}
      </div>` : ''}

      <!-- BiharHelpAdvt 3 (Pre-Official Links High CTR Banner) -->
      <div class="code-block code-block-3" style="margin: 24px auto; text-align: center; display: block; clear: both;">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #94a3b8; margin-bottom: 6px;">Advertisement</div>
        <ins class="adsbygoogle"
             style="display:block;"
             data-ad-client="ca-pub-9543073887536718"
             data-ad-slot="1362664078"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>

      <!-- Real Official Direct Action Links Box (Cyber Dark Glow Card) -->
      <div style="background: linear-gradient(135deg, #0b1326 0%, #171f33 100%); border-radius: 20px; padding: 26px; text-align: center; margin: 30px 0; color: #ffffff; box-shadow: 0 12px 35px rgba(11,19,38,0.3); border: 1px solid rgba(145,143,161,0.25);">
        <h4 style="margin: 0 0 10px; color: #fbbf24; font-size: 18px; text-transform: uppercase; font-weight: 900; letter-spacing: 0.8px;">
          ⚡ Official Direct Portals &amp; Resources
        </h4>
        <p style="margin: 0 0 18px; font-size: 13px; color: #cbd5e1;">
          Verified direct gateway links for <strong>${title}</strong>:
        </p>

        <div style="display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; margin-top: 14px;">
          <a href="${applyLink}" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 6px 18px rgba(79,70,229,0.35);">
            🔗 Apply Online / Direct Portal ➔
          </a>
          ${pdfLink ? `
          <a href="${pdfLink}" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 6px 18px rgba(16,185,129,0.3);">
            📄 Download Official Notification (PDF)
          </a>` : ''}
          ${officialLink && officialLink !== applyLink ? `
          <a href="${officialLink}" target="_blank" rel="noopener noreferrer" style="background: rgba(255,255,255,0.12); color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; display: inline-block; border: 1px solid rgba(255,255,255,0.2);">
            🌐 Official Website
          </a>` : ''}
        </div>
      </div>

      <!-- Bottom Official Advisory Box -->
      <div style="background: #f8fafc; border-radius: 16px; padding: 20px 24px; text-align: center; margin: 32px 0; border: 1px solid #e2e8f0;">
        <p style="font-size: 13.5px; color: #334155; font-weight: 600; margin-bottom: 12px; line-height: 1.6;">
          ⚠️ <strong>Candidate Advisory:</strong> Please thoroughly review the official notification brochure before submitting personal and educational details on the portal.
        </p>
        <a href="${applyLink}" target="_blank" rel="noopener noreferrer" style="background: #4f46e5; color: #ffffff; padding: 10px 24px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px; display: inline-block;">
          Visit Authentic Portal ➔
        </a>
      </div>

    </div>
  `;
}
