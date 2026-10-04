import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdUnit from './AdUnit';
import { AD_CONFIG } from '../config/adConfig';
import { ShieldCheck, Sparkles, ExternalLink, CheckCircle2 } from 'lucide-react';
import './ForcedAdPopupModal.css';

/**
 * Decorated TechMint Forced Ad-Click Popup Modal
 * 
 * Strict Ad-Click Enforcement:
 * 1. Modal pops up when entering/redirecting to the page.
 * 2. NO early close button; user must tap the ad to unlock.
 * 3. Supports real AdSense iframe clicks (window blur, activeElement, visibility change)
 *    and fallback ad clicks.
 * 4. Shows clear visual feedback on click and auto-closes when returning.
 * 5. Emergency skip appears after 25s for safety/slow connections.
 */
export default function ForcedAdPopupModal({
  step = 1,
  postId = '',
  onAdClicked,
  adSlot = AD_CONFIG.SLOTS.POPUP_MODAL,
  enabled = true,
  emergencyFallbackSec = 25
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [adClicked, setAdClicked] = useState(false);
  const [closingSoon, setClosingSoon] = useState(false);
  const [showEmergencyClose, setShowEmergencyClose] = useState(false);
  const adClickedRef = useRef(false);
  const isOverAdRef = useRef(false);
  const adContainerRef = useRef(null);

  const globalPopupDoneKey = 'SAFE_POPUP_DONE';
  const stepClickedKey = 'SAFE_POPUP_CLICKED';

  const handleClose = useCallback(() => {
    setClosingSoon(true);
    setTimeout(() => {
      setIsOpen(false);
      setClosingSoon(false);
      // Mark popup completed for the entire session (shows ONLY first time on redirect)
      sessionStorage.setItem(globalPopupDoneKey, '1');
      sessionStorage.removeItem(stepClickedKey);
      if (onAdClicked) onAdClicked();
    }, 400);
  }, [onAdClicked]);

  const markAdClicked = useCallback(() => {
    if (!adClickedRef.current) {
      adClickedRef.current = true;
      setAdClicked(true);
      sessionStorage.setItem(globalPopupDoneKey, '1');
      sessionStorage.setItem(stepClickedKey, '1');
      document.cookie = "adcadg=insurance,online_colleges,study_abroad,finance,loan; max-age=600; path=/;";
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // RULE: Shows ONLY first time when redirected via shortener. Never show if already completed or on step > 1
    if (step > 1 || sessionStorage.getItem(globalPopupDoneKey) === '1') {
      return;
    }

    // If user clicked the ad previously in this tab and reloaded
    if (sessionStorage.getItem(stepClickedKey) === '1') {
      adClickedRef.current = true;
      setAdClicked(true);
      setTimeout(() => {
        handleClose();
      }, 500);
      return;
    }

    // Smooth open with 350ms delay
    const openTimer = setTimeout(() => {
      setIsOpen(true);
    }, 350);

    // Emergency fallback button after 25s if ad didn't lead to interaction
    const emergencyTimer = setTimeout(() => {
      setShowEmergencyClose(true);
    }, emergencyFallbackSec * 1000);

    // 1. Pointer listeners over ad container
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

    // 2. Window Blur: focus shifted into cross-origin AdSense iframe
    const handleWindowBlur = () => {
      const activeEl = document.activeElement;
      const isIframe = activeEl && activeEl.tagName === 'IFRAME';
      if (isIframe || isOverAdRef.current) {
        markAdClicked();
      }
    };
    window.addEventListener('blur', handleWindowBlur);

    // 3. Polling activeElement for iframe click
    const pollInterval = setInterval(() => {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.tagName === 'IFRAME') {
        const isInsideGads = container && container.contains(activeEl);
        if (isInsideGads || isOverAdRef.current) {
          markAdClicked();
        }
      }
    }, 150);

    // 4. Return Detection: fires when user COMES BACK from the advertiser tab
    const handleUserReturn = () => {
      const hasClicked = adClickedRef.current || sessionStorage.getItem(stepClickedKey) === '1';
      if (hasClicked) {
        setTimeout(() => {
          handleClose();
        }, 400);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleUserReturn();
      } else {
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
  }, [enabled, emergencyFallbackSec, handleClose, markAdClicked, stepClickedKey, globalPopupDoneKey, step]);

  // Handle direct tap on container (for fallback ads or touch interactions)
  const handleAdContainerClick = () => {
    markAdClicked();
    // If not in iframe (e.g. fallback card), smooth unlock after brief confirmation
    setTimeout(() => {
      handleClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Blurred Backdrop */}
      <div 
        id="blockcont" 
        className={`techmint-modal-backdrop ${closingSoon ? 'opacity-0' : 'opacity-100'}`} 
        onClick={(e) => e.stopPropagation()} 
      />

      {/* Decorated Modal Box */}
      <div 
        id="contntblock" 
        className={`techmint-modal-card ${closingSoon ? 'techmint-modal-closing' : 'techmint-modal-opening'}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Decorative Header Badge */}
        <div className="techmint-modal-badge-wrapper">
          <span className="techmint-modal-pill">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>STEP {step}/3 VERIFICATION • सुरक्षा सत्यापन</span>
          </span>
        </div>

        {/* Main Instruction Headline */}
        <div className="techmint-modal-header-text">
          <h3 className="techmint-modal-main-title">
            👉 Tap The Ad Below To Unlock Link
          </h3>
          <p className="techmint-modal-sub-title">
            ▼ लिंक पाने के लिए नीचे दिए गए विज्ञापन पर <span className="text-red-600 font-bold">टैप करें</span> (10-15 सेकंड रुकें)
          </p>
        </div>

        {/* Ad Container with pulsating outline */}
        <div 
          id="gads" 
          ref={adContainerRef} 
          onClick={handleAdContainerClick}
          className="techmint-modal-ad-box"
          title="Click to unlock secure download"
        >
          <div className="techmint-ad-box-label">
            <span className="techmint-ad-indicator-dot" />
            <span>SPONSORED PARTNER ADVERTISEMENT • प्रायोजित विज्ञापन</span>
          </div>

          <div className="gAd">
            <div className="gCn">
              <AdUnit
                slot={adSlot}
                style={{ minHeight: '250px' }}
                className="!my-0 w-full"
              />
            </div>
          </div>
        </div>

        {/* Success Feedback Banner when ad is clicked */}
        {adClicked ? (
          <div className="techmint-modal-success-banner animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div className="text-left text-xs sm:text-sm">
              <strong className="block text-emerald-800 dark:text-emerald-200">
                ⚡ Ad Click Verified! Unlocking your link...
              </strong>
              <span className="text-emerald-700 dark:text-emerald-300 text-[11px]">
                विज्ञापन सत्यापित! लिंक अपने आप अनलॉक हो रहा है...
              </span>
            </div>
          </div>
        ) : (
          /* Step-by-Step Guidance Pill */
          <div className="techmint-modal-steps-guide">
            <div className="techmint-step-item">
              <span className="techmint-step-num">1</span>
              <span>Tap Ad</span>
            </div>
            <span className="text-zinc-300 dark:text-zinc-600">➔</span>
            <div className="techmint-step-item">
              <span className="techmint-step-num">2</span>
              <span>Wait 10-15s</span>
            </div>
            <span className="text-zinc-300 dark:text-zinc-600">➔</span>
            <div className="techmint-step-item">
              <span className="techmint-step-num">3</span>
              <span>Auto-Unlock</span>
            </div>
          </div>
        )}

        {/* Emergency close button (only shows after 25s for slow connections / blockers) */}
        {showEmergencyClose && !adClicked && (
          <button
            type="button"
            className="techmint-modal-emergency-btn"
            onClick={handleClose}
          >
            Slow connection? Click here to continue / आगे बढ़ें ➔
          </button>
        )}
      </div>
    </>
  );
}
