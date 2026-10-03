/**
 * Ad Configuration & Placements
 * Publisher ID: ca-pub-9543073887536718
 *
 * IMPORTANT: Each slot ID should appear only ONCE per page.
 * Using the same slot ID in multiple AdUnit instances on the same page
 * causes AdSense to only fill the first one — all others stay blank.
 */

export const AD_CONFIG = {
  // Google AdSense Publisher Client ID
  CLIENT_ID: import.meta.env?.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9543073887536718',

  // HOST_ID: Only used for native In-Article/In-Feed units on Blogger-hosted publishers
  HOST_ID: 'ca-host-pub-1556223355139109',

  // Ad Slot Definitions — each slot ID must be UNIQUE per page load
  SLOTS: {
    // 1. Forced Popup Modal — Display Responsive
    POPUP_MODAL: '8617081290',

    // 2. Top Banner Ad (Directly ABOVE Countdown / Timing) — Display Responsive
    TOP_BANNER: '5754054742',

    // 3. Ad directly Below Countdown / Verify Button (#btn6) — Display Responsive
    BELOW_VERIFY: '7317709042',

    // 4. In-Content Article Paragraph Ad 1 — In-Article Native (Blogger host required)
    IN_ARTICLE_1: '4392273015',

    // 5. In-Content Article Paragraph Ad 2 — In-Article Native (Blogger host required)
    IN_ARTICLE_2: '1641433819',

    // 6. Bottom Section: Ad Directly ABOVE Continue Button (#btn7) — Display Responsive
    ABOVE_CONTINUE: '4969186882',

    // 7. Bottom Section: Ad Directly BELOW Continue Button (#btn7) — Display Responsive
    BELOW_CONTINUE: '6529422128',

    // 8. Sidebar — uses In-Feed Native (fluid layout)
    SIDEBAR: '9320506924',

    // 9. Intermediary / Splash Screen Banner — Display Responsive
    SPLASH_BANNER: '1909584638',
  },

  // High-CPC keywords targeted across the site
  TARGET_KEYWORDS: [
    'online_mba',
    'student_loans',
    'lasik_surgery',
    'travel_insurance',
    'scholarships',
    'study_abroad',
    'medical_finance',
    'university_admission'
  ]
};

export default AD_CONFIG;
