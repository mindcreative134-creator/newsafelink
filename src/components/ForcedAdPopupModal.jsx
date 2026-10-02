import React, { useState, useEffect, useRef } from 'react';
import AdUnit from './AdUnit';
import './ForcedAdPopupModal.css';

/**
 * Authentic TechMint Forced Ad-Click Popup Overlay
 * 
 * Mechanics:
 * 1. Blocks the page on arrival with a blurred backdrop.
 * 2. Instructs the user (in Hindi & English) to click the ad image, wait 10-15 seconds, and come back.
 * 3. Listens for iframe activeElement, window blur, and visibilitychange events.
 * 4. When the visitor clicks the ad and returns to the tab, the popup closes automatically and unlocks the content!
 * 5. Provides a fallback close button after a grace delay so users with ad blockers aren't trapped.
 */
export default function ForcedAdPopupModal({
  onAdClicked,
  adSlot = "9320506924",
  autoCloseTimeoutSec = 45,
  graceCloseDelaySec = 5,
  enabled = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // Check if user already clicked/unlocked in this session
    const alreadyUnlocked = sessionStorage.getItem('TECHMINT_AD_UNLOCKED') === '1' ||
                            document.cookie.includes('adcadg=');
    if (alreadyUnlocked) {
      return;
    }

    // Show popup immediately or after brief 300ms delay
    const showTimer = setTimeout(() => {
      setIsOpen(true);
    }, 400);

    // Grace delay to show close button (fallback for adblockers)
    const closeBtnTimer = setTimeout(() => {
      setShowCloseButton(true);
    }, graceCloseDelaySec * 1000);

    // Safety timeout: automatically unlock after 45s so user is never stuck
    const safetyTimer = setTimeout(() => {
      handleClose();
    }, autoCloseTimeoutSec * 1000);

    // ── IFRAME CLICK & VISIBILITY DETECTION ──
    let isWaitingForReturn = false;

    // 1. Monitor activeElement for iframe click
    const iframeMonitor = setInterval(() => {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.tagName === 'IFRAME') {
        isWaitingForReturn = true;
        setHasInteracted(true);
        // Set high-CPC ad reward cookie
        document.cookie = "adcadg=insurance,online_colleges,study_abroad,finance,loan; max-age=600; path=/;";
        sessionStorage.setItem('TECHMINT_AD_UNLOCKED', '1');
      }
    }, 150);

    // 2. Window blur event (occurs immediately when user clicks into an ad iframe)
    const handleBlur = () => {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.tagName === 'IFRAME') {
        isWaitingForReturn = true;
        setHasInteracted(true);
        document.cookie = "adcadg=insurance,online_colleges,study_abroad,finance,loan; max-age=600; path=/;";
        sessionStorage.setItem('TECHMINT_AD_UNLOCKED', '1');
      }
    };
    window.addEventListener('blur', handleBlur);

    // 3. Tab visibilitychange event (triggers when user opens ad tab and comes back)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched to ad tab!
        if (isWaitingForReturn || document.activeElement?.tagName === 'IFRAME') {
          isWaitingForReturn = true;
          setHasInteracted(true);
        }
      } else {
        // User RETURNED back to our tab!
        if (isWaitingForReturn || hasInteracted) {
          // Success! User clicked ad and came back!
          setTimeout(() => {
            handleClose();
          }, 300);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeBtnTimer);
      clearTimeout(safetyTimer);
      clearInterval(iframeMonitor);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, graceCloseDelaySec, autoCloseTimeoutSec, hasInteracted]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('TECHMINT_AD_UNLOCKED', '1');
    if (onAdClicked) onAdClicked();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Blurred Backdrop */}
      <div id="blockcont" className="techmint-blockcont" onClick={(e) => e.stopPropagation()} />

      {/* Centered Modal */}
      <div id="contntblock" className="techmint-contntblock" ref={modalRef}>
        <div className="techmint-modal-content">
          
          {/* Header Instruction Text (Hindi & English exact match) */}
          <div className="techmint-instruction-box">
            <h5 className="techmint-inst-en">
              👇 Click Image &amp; Wait &amp; Come back to this page to <span className="highlight-red">Get Link - Download</span>.
            </h5>
            <h5 className="techmint-inst-hi">
              ▼ <span className="highlight-red">LINK पाने और DOWNLOAD करने</span> के लिए, 👇 फोटो / Ad पर क्लिक करें, <span className="highlight-blue">15 सेकंड रुकें</span> और फिर इसी पेज पर वापस आएं
            </h5>
            <div className="techmint-steps-pill">
              <span>🔴 <b>Steps to 🔗 Get Link:</b></span>
              <span>1. Click On Ad ➔</span>
              <span>2. Wait 10-15s on ad ➔</span>
              <span>3. Come Back Here</span>
            </div>
          </div>

          {/* Ad Container inside popup */}
          <div className="techmint-popup-ad-slot">
            <AdUnit variant="banner" slot={adSlot} minHeight="250px" className="!my-0" />
          </div>

          {/* Grace Close Button */}
          {showCloseButton && (
            <div className="techmint-popup-footer">
              <button
                id="close-btn"
                onClick={handleClose}
                className="techmint-closeis-btn"
              >
                ✕ Close Ad &amp; Continue
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
