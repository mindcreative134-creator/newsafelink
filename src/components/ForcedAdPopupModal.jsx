import React, { useState, useEffect, useRef } from 'react';
import AdUnit from './AdUnit';
import { AD_CONFIG } from '../config/adConfig';
import './ForcedAdPopupModal.css';

/**
 * Authentic TechMint Forced Ad-Click Popup Overlay
 * Exact recreation of TechMint's #blockcont & #contntblock modal.
 * 
 * Flow:
 * 1. Blocks the page with backdrop (#blockcont).
 * 2. Instructs user (Bilingual Hindi & English) to click the ad image, wait 10-15s, and come back.
 * 3. Contains ONLY the real AdSense ad inside #gads (Zero fake sponsor links or dummy text).
 * 4. Listens for iframe click and visibilitychange: when user returns, popup auto-closes and unlocks!
 * 5. Fallback Close button displays after 4s for safety.
 */
export default function ForcedAdPopupModal({
  step = 1,
  onAdClicked,
  adSlot = AD_CONFIG.SLOTS.POPUP_MODAL,
  autoCloseTimeoutSec = 40,
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

    // Safety timeout: automatically unlock after 40s so user is never stuck
    const safetyTimer = setTimeout(() => {
      handleClose();
    }, autoCloseTimeoutSec * 1000);

    // ── IFRAME CLICK & VISIBILITY DETECTION (Exact TechMint logic) ──
    let isWaitingForReturn = false;

    // 1. Monitor activeElement for iframe click
    const iframeMonitor = setInterval(() => {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.tagName === 'IFRAME') {
        isWaitingForReturn = true;
        setHasInteracted(true);
        // Set high-CPC ad reward cookie (TechMint adcadg)
        document.cookie = "adcadg=insurance,online_colleges,study_abroad,finance,loan; max-age=600; path=/;";
        sessionStorage.setItem('TECHMINT_AD_UNLOCKED', '1');
      }
    }, 150);

    // 2. Window blur event (triggers when clicking into an ad iframe)
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

    // 3. Tab visibilitychange event (triggers when user opens ad tab and returns)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched to ad window/tab
        if (isWaitingForReturn || document.activeElement?.tagName === 'IFRAME') {
          isWaitingForReturn = true;
          setHasInteracted(true);
        }
      } else {
        // User RETURNED back to our page!
        if (isWaitingForReturn || hasInteracted) {
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
      {/* Exact TechMint Blurred Backdrop */}
      <div id="blockcont" className="blockcont" onClick={(e) => e.stopPropagation()} />

      {/* Exact TechMint Centered Modal Box */}
      <div id="contntblock" className="contntblock" ref={modalRef}>
        <center>
          <h5 id="continue1" className="techmint-inst-heading">
            👇 Click Image &amp; Wait &amp; Come back this page to <span style={{ color: 'red' }}>Get Link - Download</span>.
          </h5>
          <h5 id="continue1" className="techmint-inst-heading">
            ▼ <span style={{ color: 'red' }}>LINK पाने और DOWNLOAD करने</span> के लिए, 👇 फोटो पर क्लिक करें, <span style={{ color: 'blue' }}>15 सेकंड रुकें</span> और फिर इसी पेज पर वापस आएं
          </h5>
        </center>

        <br />

        {/* Real AdSlot inside TechMint #gads container (NO FAKE SPONSOR ADS) */}
        <div id="gads">
          <div className="gAd">
            <div className="gCn">
              <AdUnit
                variant="rectangle"
                format="rectangle"
                slot={adSlot}
                minHeight="250px"
                className="!my-0 w-full"
              />
            </div>
          </div>
        </div>

        {/* Exact TechMint Steps Guidance */}
        <div className="bottom-text" id="bottmtxt" style={{ padding: '8px' }}>
          <center>
            <b>
              <p style={{ color: '#2563eb', margin: '4px 0', fontSize: '12px' }}>
                🔴 Steps to 🔗 Get link 🔗
              </p>
              <p style={{ margin: '4px 0', fontSize: '11px', color: '#475569' }}>
                1. Click On banner/AD &nbsp;&nbsp; 2. Wait 10 second on ad page &nbsp;&nbsp; 3. Come Back Here
              </p>
            </b>
          </center>
        </div>

        {/* Exact TechMint Close Button (Appears after 4s) */}
        {showCloseButton && (
          <div className="closeis" id="close-btn" onClick={handleClose}>
            Close
          </div>
        )}
      </div>
    </>
  );
}
