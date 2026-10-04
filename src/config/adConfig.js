/**
 * Ad Configuration
 * Publisher: ca-pub-9543073887536718
 * Site: iwantgovjob.vercel.app (React/Vite SPA — NOT Blogger)
 *
 * ⚠️  CRITICAL RULES FOR ADSENSE ON REACT SPA:
 * 1. Each slot ID must appear ONLY ONCE per page at any time.
 * 2. NEVER use data-ad-host on a non-Blogger site — it blocks ads.
 * 3. NEVER use In-Article / In-Feed formats without Blogger host.
 * 4. All display units need min-height so AdSense has space to render.
 * 5. Use format="auto" + data-full-width-responsive="true" for all display units.
 */

export const AD_CONFIG = {
  // Publisher Client ID
  CLIENT_ID: import.meta.env?.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9543073887536718',

  // ✅ All slots below are standard Responsive Display Ad units (format=auto)
  // These work on any website — no Blogger host required.
  SLOTS: {
    // Safelink Top Section — Above countdown timer
    TOP_BANNER:     '5754054742',

    // Safelink Top Section — Below verify button
    BELOW_VERIFY:   '7317709042',

    // Safelink Bottom — Above Continue button
    ABOVE_CONTINUE: '4969186882',

    // Safelink Bottom — Below Continue button
    BELOW_CONTINUE: '6529422128',

    // Post detail article — In-content
    IN_ARTICLE_1:   '4392273015',

    // Sidebar ad
    SIDEBAR:        '8617081290',

    // Popup modal / Splash
    POPUP_MODAL:    '9320506924',

    // ReadMore / intermediate page
    SPLASH_BANNER:  '1909584638',

    // Home / Category page feed
    FEED_BANNER:    '1641433819',
  },
};

export default AD_CONFIG;
