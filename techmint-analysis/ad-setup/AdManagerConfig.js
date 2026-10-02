/**
 * Google Ad Manager (GPT) & AdSense Integration Config
 * Configured based on TechMint's live ad slots and placements.
 */

export const AD_CONFIG = {
  // Google Ad Manager Network / Account ID
  NETWORK_ID: '23355195384',

  // Ad Slot Definitions
  SLOTS: {
    // In-Article Top Box (Above Timer)
    TOP_BANNER: {
      path: '/23355195384/Insurncesstudy1111',
      sizes: [[336, 280], [300, 250], [728, 90], 'fluid'],
      divId: 'div-gpt-ad-top-banner'
    },
    // In-Article Middle Box (Below Verify Button)
    MIDDLE_RECTANGLE: {
      path: '/23355195384/Insurncesstudy1111',
      sizes: [[336, 280], [300, 250], 'fluid'],
      divId: 'div-gpt-ad-middle-box'
    },
    // Bottom Section (Above & Below Continue Button)
    BOTTOM_BANNER: {
      path: '/23355195384/Insuranceseducations1111',
      sizes: [[336, 280], [300, 250], [728, 90]],
      divId: 'div-gpt-ad-bottom-banner'
    },
    // Rewarded Out-Of-Page Ad (Triggers 35s modal)
    REWARDED_AD: {
      path: '/23355195384/Insuranceseducations1111',
      slotId: 'unlock_rewarded_slot'
    }
  },

  // High CPC Keywords targeted by TechMint
  TARGET_KEYWORDS: [
    'online_mba',
    'student_loans',
    'lasik_surgery',
    'travel_insurance',
    'scholarships',
    'study_abroad',
    'medical_finance'
  ]
};

/**
 * Initialize GPT Scripts and Slots
 */
export function initGooglePublisherTag() {
  if (typeof window === 'undefined') return;

  window.googletag = window.googletag || { cmd: [] };

  window.googletag.cmd.push(function () {
    // Define standard display slots
    window.googletag
      .defineSlot(AD_CONFIG.SLOTS.TOP_BANNER.path, AD_CONFIG.SLOTS.TOP_BANNER.sizes, AD_CONFIG.SLOTS.TOP_BANNER.divId)
      ?.addService(window.googletag.pubads());

    window.googletag
      .defineSlot(AD_CONFIG.SLOTS.MIDDLE_RECTANGLE.path, AD_CONFIG.SLOTS.MIDDLE_RECTANGLE.sizes, AD_CONFIG.SLOTS.MIDDLE_RECTANGLE.divId)
      ?.addService(window.googletag.pubads());

    window.googletag
      .defineSlot(AD_CONFIG.SLOTS.BOTTOM_BANNER.path, AD_CONFIG.SLOTS.BOTTOM_BANNER.sizes, AD_CONFIG.SLOTS.BOTTOM_BANNER.divId)
      ?.addService(window.googletag.pubads());

    // Configure Ad Service
    window.googletag.pubads().enableSingleRequest();
    window.googletag.pubads().collapseEmptyDivs();
    window.googletag.pubads().setTargeting('keywords', AD_CONFIG.TARGET_KEYWORDS);
    window.googletag.enableServices();
  });
}

/**
 * Trigger TechMint Style Rewarded Ad
 */
export function setupRewardedAd(onGrantedCallback) {
  if (typeof window === 'undefined' || !window.googletag) return;

  window.googletag.cmd.push(function () {
    const slot = window.googletag.defineOutOfPageSlot(
      AD_CONFIG.SLOTS.REWARDED_AD.path,
      window.googletag.enums.OutOfPageFormat.REWARDED
    );

    if (slot) {
      slot.addService(window.googletag.pubads());

      window.googletag.pubads().addEventListener('rewardedSlotReady', function (event) {
        if (event.slot === slot) {
          event.makeRewardedVisible();
        }
      });

      window.googletag.pubads().addEventListener('rewardedSlotGranted', function (event) {
        if (event.slot === slot) {
          // Set reward cookie and execute callback
          document.cookie = "adcadg=reward_granted; path=/; max-age=600";
          if (onGrantedCallback) onGrantedCallback();
        }
      });

      window.googletag.display(slot);
    }
  });
}
