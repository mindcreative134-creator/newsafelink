/**
 * Ad Configuration & Placements
 * Modeled exactly after TechMint's scraped ad architecture
 * Publisher ID: ca-pub-9543073887536718
 */

export const AD_CONFIG = {
  // Google AdSense Publisher Client ID
  CLIENT_ID: import.meta.env?.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9543073887536718',

  // Ad Slot Definitions mapped 1:1 to TechMint placements
  SLOTS: {
    // 1. Forced Popup Modal (#gads in #contntblock)
    POPUP_MODAL: '7317709042',

    // 2. Top Header Banner (Above Article / Before Countdown)
    TOP_BANNER: '9320506924',

    // 3. Ad directly Below Countdown / Verify Button (#btn6)
    BELOW_VERIFY: '4392273015',

    // 4. Ad directly Below Scroll Guidance Card (#ce-text)
    BELOW_GUIDANCE: '1909584638',

    // 5. In-Content Article Paragraph Ad 1
    IN_ARTICLE_1: '5754054742',

    // 6. In-Content Article Paragraph Ad 2
    IN_ARTICLE_2: '1641433819',

    // 7. Bottom Section: Ad Directly Above Continue Button (#btn7)
    ABOVE_CONTINUE: '9320506924',

    // 8. Bottom Section: Ad Directly Below Continue Button (#btn7)
    BELOW_CONTINUE: '4392273015',

    // 9. Sidebar Responsive Rectangle
    SIDEBAR: '7317709042',

    // 10. Intermediary / Splash Screen Banner
    SPLASH_BANNER: '9320506924'
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
