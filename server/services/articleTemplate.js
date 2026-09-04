/**
 * Clean, AdSense-compliant HTML Article Builder
 * Generates properly structured articles with headings, fact tables, eligibility checklists, and apply buttons.
 */
export function buildHtmlArticle(title, snippet, sourceName, category, sourceUrl) {
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
    <div class="sarkari-article" style="font-family: Arial, sans-serif; line-height: 1.7; color: #1e293b; max-width: 800px; margin: 0 auto;">
      <!-- Top Overview Box -->
      <div style="background: #f8fafc; border-left: 5px solid #2563eb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 10px; color: #1e293b; font-size: 18px;">📌 Overview & Quick Facts</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px; font-weight: bold; width: 35%; color: #475569;">Post Name:</td>
            <td style="padding: 6px; color: #0f172a;">${title}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold; color: #475569;">Category:</td>
            <td style="padding: 6px; color: #2563eb; font-weight: bold;">${category}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold; color: #475569;">Update Date:</td>
            <td style="padding: 6px; color: #0f172a;">${today}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold; color: #475569;">Source / Board:</td>
            <td style="padding: 6px; color: #0f172a;">${sourceName}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold; color: #475569;">Status:</td>
            <td style="padding: 6px; color: #16a34a; font-weight: bold;">Active Online</td>
          </tr>
        </table>
      </div>

      <!-- Detailed Description -->
      <h2 style="color: #0f172a; font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
        ${title} – Complete Details
      </h2>
      <p style="font-size: 15px;">
        Latest official notification and announcement regarding <strong>${title}</strong> released by <strong>${sourceName}</strong>. Candidates and beneficiaries are advised to read the detailed instructions and eligibility standards below.
      </p>

      <!-- Eligibility Table -->
      <h3 style="color: #1e293b; font-size: 17px; margin-top: 24px;">🎯 Key Eligibility & Criteria</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; border: 1px solid #cbd5e1;">
        <thead>
          <tr style="background: #f1f5f9; text-align: left;">
            <th style="border: 1px solid #cbd5e1; padding: 10px;">Particulars</th>
            <th style="border: 1px solid #cbd5e1; padding: 10px;">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold;">Educational Qualification</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px;">10th / 12th / Graduate Degree (As per official notice)</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold;">Age Criteria</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px;">18 to 35 Years (Relaxation as per GOI guidelines)</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold;">Application Mode</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px;">Online Official Portal</td>
          </tr>
        </tbody>
      </table>

      <!-- Steps to Apply -->
      <h3 style="color: #1e293b; font-size: 17px; margin-top: 24px;">📝 How to Apply / Check Online</h3>
      <ol style="padding-left: 20px; font-size: 14px; line-height: 1.8;">
        <li>Visit the official portal using the direct links given below.</li>
        <li>Locate the notification link for <strong>${title}</strong>.</li>
        <li>Review the eligibility requirements and registration instructions.</li>
        <li>Complete online registration or application form and upload necessary documents.</li>
        <li>Submit the form and take a printout for future record.</li>
      </ol>

      <!-- Action Button Box -->
      <div style="background: #0f172a; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0; color: #ffffff;">
        <h4 style="margin: 0 0 12px; color: #f59e0b; font-size: 16px; text-transform: uppercase;">
          Official Link &amp; Application Portal
        </h4>
        <p style="font-size: 13px; color: #cbd5e1; margin-bottom: 16px;">
          Direct link to official advertisement and recruitment portal:
        </p>
        <div>
          <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px;">
            🔗 Open Official Notice & Apply Online
          </a>
        </div>
        <p style="font-size: 11px; color: #94a3b8; margin: 12px 0 0;">
          Notice: Always verify full guidelines on the official government recruitment portal.
        </p>
      </div>
    </div>
  `;
}
