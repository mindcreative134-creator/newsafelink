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
  step = 1,
  onAdClicked,
  adSlot = "9320506924",
  autoCloseTimeoutSec = 45,
  graceCloseDelaySec = 4,
  enabled = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const modalRef = useRef(null);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    sessionStorage.setItem(`TECHMINT_AD_UNLOCKED_STEP_${step}`, '1');
    if (onAdClicked) onAdClicked();
  }, [step, onAdClicked]);

  useEffect(() => {
    if (!enabled) return;

    // Reset interaction for the current step
    setHasInteracted(false);

    // Check if user already unlocked this specific step
    const stepKey = `TECHMINT_AD_UNLOCKED_STEP_${step}`;
    if (sessionStorage.getItem(stepKey) === '1') {
      return;
    }

    // Show popup after short 350ms delay
    const showTimer = setTimeout(() => {
      setIsOpen(true);
    }, 350);

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
  }, [enabled, graceCloseDelaySec, autoCloseTimeoutSec, hasInteracted, handleClose, step]);

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
          <div
            className="techmint-popup-ad-slot cursor-pointer relative"
            style={{ minHeight: '260px', width: '100%', maxWidth: '336px', margin: '0 auto' }}
            onClick={() => {
              setHasInteracted(true);
              document.cookie = "adcadg=insurance,online_colleges,study_abroad,finance,loan; max-age=600; path=/;";
              sessionStorage.setItem('TECHMINT_AD_UNLOCKED', '1');
            }}
          >
            <AdUnit 
              variant="rectangle" 
              format="rectangle" 
              slot={adSlot} 
              minHeight="250px" 
              className="!my-0 w-full" 
            />

            {/* High-CPC Sponsor Link Fallback if AdSense is pending */}
            <div className="techmint-sponsor-fallback p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-850 rounded-lg border border-blue-200 dark:border-zinc-700 mt-2 text-left w-full">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                ⭐ Featured Sponsor Offer
              </span>
              <p className="text-xs font-bold text-zinc-900 dark:text-white mt-0.5 leading-snug">
                Top Online Degrees &amp; Global Education Grants 2026
              </p>
              <a
                href="https://sarkaritrend.boats/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setHasInteracted(true);
                  setTimeout(() => handleClose(), 1500);
                }}
                className="mt-2 inline-flex items-center justify-center w-full py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded transition-colors"
              >
                👉 Click Here to Visit Sponsor (Unlocks Link) 👈
              </a>
            </div>
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

