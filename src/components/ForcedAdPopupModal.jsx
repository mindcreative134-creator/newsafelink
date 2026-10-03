import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdUnit from './AdUnit';
import { AD_CONFIG } from '../config/adConfig';
import './ForcedAdPopupModal.css';

/**
 * Authentic TechMint Forced Ad-Click Popup Overlay
 * 
 * Strict Ad-Click Enforcement:
 * 1. NO close button after 1-2 seconds. The modal remains locked until an ad click occurs.
 * 2. Detects user click into the ad iframe (activeElement polling + window blur + pointer interaction).
 * 3. Records ad interaction state and sets TechMint high-CPC targeting cookie.
 * 4. Listens for user RETURN via document 'visibilitychange', window 'focus', and 'pageshow'.
 * 5. Automatically closes the popup and unlocks the safelink only when the user returns from the ad.
 * 6. Safety fallback: Only if an ad fails to load or adblocker blocks iframes after 45s does an emergency skip appear.
 */
export default function ForcedAdPopupModal({
  step = 1,
  onAdClicked,
  adSlot = AD_CONFIG.SLOTS.POPUP_MODAL,
  enabled = true,
  emergencyFallbackSec = 45
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [adClicked, setAdClicked] = useState(false);
  const [showEmergencyClose, setShowEmergencyClose] = useState(false);
  const adClickedRef = useRef(false);
  const isOverAdRef = useRef(false);
  const adContainerRef = useRef(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    sessionStorage.setItem(`TECHMINT_AD_UNLOCKED_STEP_${step}`, '1');
    sessionStorage.removeItem(`TECHMINT_AD_CLICKED_STEP_${step}`);
    if (onAdClicked) onAdClicked();
  }, [step, onAdClicked]);

  useEffect(() => {
    if (!enabled) return;

    const stepUnlockKey = `TECHMINT_AD_UNLOCKED_STEP_${step}`;
    const stepClickedKey = `TECHMINT_AD_CLICKED_STEP_${step}`;

    // If user already completed this step, don't show modal
    if (sessionStorage.getItem(stepUnlockKey) === '1') {
      return;
    }

    // If user already clicked the ad in a previous tab session and just returned/reloaded
    if (sessionStorage.getItem(stepClickedKey) === '1') {
      handleClose();
      return;
    }

    // Open modal with short smooth delay
    const openTimer = setTimeout(() => {
      setIsOpen(true);
    }, 300);

    // Emergency fallback: only show close if ad completely failed to load after 45s
    const emergencyTimer = setTimeout(() => {
      const hasIframe = adContainerRef.current?.querySelector('iframe');
      if (!hasIframe) {
        setShowEmergencyClose(true);
      }
    }, emergencyFallbackSec * 1000);

    // Register ad click handler
    const markAdClicked = () => {
      if (!adClickedRef.current) {
        adClickedRef.current = true;
        setAdClicked(true);
        sessionStorage.setItem(stepClickedKey, '1');
        document.cookie = "adcadg=insurance,online_colleges,study_abroad,finance,loan; max-age=600; path=/;";
      }
    };

    // 1. Track pointer / touch over ad container
    const container = adContainerRef.current;
    const handleMouseEnter = () => { isOverAdRef.current = true; };
    const handleMouseLeave = () => { isOverAdRef.current = false; };
    const handleTouchStart = () => { isOverAdRef.current = true; };
    const handlePointerDown = () => { isOverAdRef.current = true; };

    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('pointerdown', handlePointerDown, { passive: true });
    }

    // 2. Window Blur: fires when focus shifts into cross-origin ad iframe
    const handleWindowBlur = () => {
      const activeEl = document.activeElement;
      const isIframe = activeEl && activeEl.tagName === 'IFRAME';
      if (isIframe || isOverAdRef.current) {
        markAdClicked();
      }
    };
    window.addEventListener('blur', handleWindowBlur);

    // 3. Active element polling (every 100ms) to detect iframe click immediately
    const pollInterval = setInterval(() => {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.tagName === 'IFRAME') {
        const isInsideGads = container && container.contains(activeEl);
        if (isInsideGads || isOverAdRef.current) {
          markAdClicked();
        }
      }
    }, 100);

    // 4. Return Detection: fires when user COMES BACK from the ad page/tab
    const handleUserReturn = () => {
      const hasClicked = adClickedRef.current || sessionStorage.getItem(stepClickedKey) === '1';
      if (hasClicked) {
        // User clicked ad and has returned to our page -> auto-close and unlock!
        setTimeout(() => {
          handleClose();
        }, 350);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab is visible again!
        handleUserReturn();
      } else {
        // User left tab; check if leaving after clicking ad
        if (isOverAdRef.current || document.activeElement?.tagName === 'IFRAME') {
          markAdClicked();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleUserReturn);
    window.addEventListener('pageshow', handleUserReturn);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(emergencyTimer);
      clearInterval(pollInterval);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleUserReturn);
      window.removeEventListener('pageshow', handleUserReturn);
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('pointerdown', handlePointerDown);
      }
    };
  }, [enabled, emergencyFallbackSec, handleClose, step]);

  if (!isOpen) return null;

  return (
    <>
      {/* TechMint Blurred Backdrop */}
      <div id="blockcont" className="blockcont" onClick={(e) => e.stopPropagation()} />

      {/* TechMint Centered Modal Box */}
      <div id="contntblock" className="contntblock">
        <center>
          <h5 id="continue1" className="techmint-inst-heading">
            👇 Click Image &amp; Wait &amp; Come back this page to <span style={{ color: 'red' }}>Get Link - Download</span>.
          </h5>
          <h5 id="continue1" className="techmint-inst-heading">
            ▼ <span style={{ color: 'red' }}>LINK पाने और DOWNLOAD करने</span> के लिए, 👇 फोटो पर क्लिक करें, <span style={{ color: 'blue' }}>15 सेकंड रुकें</span> और फिर इसी पेज पर वापस आएं
          </h5>
        </center>

        <br />

        {/* Real AdSlot inside TechMint #gads container */}
        <div id="gads" ref={adContainerRef}>
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

        {/* Visual feedback if ad click detected before leaving */}
        {adClicked && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '6px',
            padding: '8px 12px',
            margin: '8px 0',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            ⚡ Ad Click Detected! Switch back to this page to automatically unlock your link.
            <br />
            <span style={{ fontSize: '11px', color: '#047857' }}>
              विज्ञापन पर क्लिक दर्ज हो गया! इस पेज पर वापस आते ही लिंक अपने आप खुल जाएगा।
            </span>
          </div>
        )}

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

        {/* Emergency close button: ONLY shown if ad failed to load after 45s (e.g. adblocker) */}
        {showEmergencyClose && (
          <div
            className="closeis"
            id="close-btn"
            style={{ display: 'inline-block' }}
            onClick={handleClose}
          >
            Skip (Ad unavailable)
          </div>
        )}
      </div>
    </>
  );
}
