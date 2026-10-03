/**
 * Ad Configuration & Placements
 * Modeled exactly after TechMint's scraped ad architecture
 * Publisher ID: ca-pub-9543073887536718
 */

export const AD_CONFIG = {
  // Google AdSense Publisher Client ID
  CLIENT_ID: import.meta.env?.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9543073887536718',

  HOST_ID: 'ca-host-pub-1556223355139109',

  // Ad Slot Definitions mapped to publisher ca-pub-9543073887536718 units
  SLOTS: {
    // 1. Forced Popup Modal (if needed)
    POPUP_MODAL: '7317709042',

    // 2. Top Banner Ad (Directly ABOVE Countdown / Timing) - Display Responsive
    TOP_BANNER: '5754054742',

    // 3. Ad directly Below Countdown / Verify Button (#btn6) - In-Article Native
    BELOW_VERIFY: '4392273015',

    // 4. In-Content Article Paragraph Ad 1 - In-Feed Native
    IN_ARTICLE_1: '1909584638',

    // 5. In-Content Article Paragraph Ad 2 - In-Article Native
    IN_ARTICLE_2: '1641433819',

    // 6. Bottom Section: Ad Directly ABOVE Continue Button (#btn7) - In-Feed Native
    ABOVE_CONTINUE: '9320506924',

    // 7. Bottom Section: Ad Directly BELOW Continue Button (#btn7) - Display Responsive
    BELOW_CONTINUE: '7317709042',

    // 8. Sidebar Responsive / Multiplex
    SIDEBAR: '8617081290',

    // 9. Intermediary / Splash Screen Banner
    SPLASH_BANNER: '5754054742'
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
