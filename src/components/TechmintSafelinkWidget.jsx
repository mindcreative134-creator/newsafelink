import React, { useState, useEffect } from 'react';
import AdUnit from './AdUnit';
import { AD_CONFIG } from '../config/adConfig';
import './TechmintSafelink.css';

/**
 * Authentic TechMint Safelink Top Widget
 * Exact recreation of TechMint countdown, sticky step indicator, green instruction banner,
 * iframe ad-click monitor, verify button (#btn6), and guidance card (#ce-text).
 */
export function TechmintTopSection({
  currentStep = 1,
  totalSteps = 3,
  onVerify,
  isVerified = false,
  timerSeconds = 15,
  adSlotTop = AD_CONFIG.SLOTS.TOP_BANNER,
  adSlotBottom = AD_CONFIG.SLOTS.BELOW_VERIFY
}) {
  const [seconds, setSeconds] = useState(timerSeconds);
  const [timerFinished, setTimerFinished] = useState(false);

  useEffect(() => {
    // Check if user has ad reward cookie
    const hasAdCookie = typeof document !== 'undefined' && document.cookie.includes('adcadg=');
    const startCount = hasAdCookie ? 8 : timerSeconds;
    setSeconds(startCount);
    setTimerFinished(false);

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Iframe Ad-Click Detector: Fast-forward countdown if visitor interacts with an ad iframe
    const monitor = setInterval(() => {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.tagName === 'IFRAME') {
        document.cookie = "adcadg=insurance,online_colleges,study_abroad,finance,loan; max-age=600; path=/;";
        setSeconds((curr) => (curr > 4 ? 4 : curr));
        clearInterval(monitor);
      }
    }, 200);

    return () => {
      clearInterval(interval);
      clearInterval(monitor);
    };
  }, [currentStep, timerSeconds, isVerified]);

  const handleVerifyClick = () => {
    if (onVerify) onVerify();
  };

  return (
    <>
      {/* ── 1. Sticky Step Bar (#tm-stick) ── */}
      <div id="tm-stick" role="alert">
        <strong>
          You are currently on step <span style={{ color: '#e60023' }}>{currentStep}/{totalSteps}</span>
        </strong>
        &nbsp;&nbsp;👉 <span className="binking-emoji">👇</span>
      </div>

      <div className="techmint-widget-container">
        {/* ── 2. Green Instruction Banner ── */}
        <div className="tm-instruction-banner">
          Click On The Below Image Ad, Wait 15 Sec &amp; Come Back To This Page To Get The Verified Link
        </div>

        {/* ── 3. Top Ad (Directly ABOVE Countdown / Timing) ── */}
        <div className="techmint-ad-wrapper techmint-ad-top my-2">
          <AdUnit slot={adSlotTop} minHeight="250px" />
        </div>

        {/* ── 4. Countdown Timer (#ce-wait1) - Clean text, NO box, NO border! ── */}
        {!timerFinished && !isVerified && (
          <div id="ce-wait1" className="techmint-wait-clean my-2">
            <div id="countdown" className="techmint-countdown-text">
              <b>Please wait <span id="ce-time">{seconds}</span> Seconds...</b>
            </div>
          </div>
        )}

        {/* ── 5. Verify Button (#btn6) ── */}
        {timerFinished && !isVerified && (
          <div className="techmint-center my-2">
            <button
              id="btn6"
              onClick={handleVerifyClick}
              className="ce-btn ce-blue"
            >
              Verify
            </button>
          </div>
        )}

        {/* ── 6. Simple Clean Guidance Instruction (#ce-text) ── */}
        {isVerified && (
          <div className="techmint-center my-2">
            <h4 id="ce-text" style={{
              margin: '6px 0',
              fontFamily: "'Open Sans', Arial, sans-serif",
              fontSize: '15px',
              fontWeight: '700',
              color: '#1e293b',
              textAlign: 'center'
            }}>
              👇 Scroll down &amp; click on <span style={{ color: '#e60023' }}>Continue</span> button for your destination link 👇
            </h4>
          </div>
        )}

        {/* ── 7. Display Ad (Directly BELOW Countdown / Timing / Verify) ── */}
        <div className="techmint-ad-wrapper techmint-ad-bottom my-2">
          <AdUnit slot={adSlotBottom} minHeight="250px" />
        </div>
      </div>
    </>
  );
}

/**
 * Authentic Safelink Bottom Widget
 * Placed at the bottom of the article.
 * Tightly sandwiches Continue button between top and bottom ads with ZERO unwanted gaps.
 */
export function TechmintBottomSection({
  currentStep = 1,
  totalSteps = 3,
  onContinue,
  isUnlocked = false,
  adSlot1 = AD_CONFIG.SLOTS.ABOVE_CONTINUE,
  adSlot2 = AD_CONFIG.SLOTS.BELOW_CONTINUE
}) {
  const [showHelper, setShowHelper] = useState(false);

  const handleContinue = (e) => {
    e.preventDefault();
    if (isUnlocked) {
      if (onContinue) onContinue();
    } else {
      setShowHelper(true);
      setTimeout(() => setShowHelper(false), 3000);
      const target = document.getElementById('btn6') || document.getElementById('ce-wait1') || document.getElementById('tm-stick');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div id="techmint-bottom-section" className="techmint-bottom-tight-container my-2">
      {/* ── 1. First Ad (Directly ABOVE Continue Button - "Sata hua") ── */}
      <div className="techmint-ad-tight-unit">
        <AdUnit slot={adSlot1} minHeight="250px" />
      </div>

      {/* ── 2. Continue Button Section (#btn7) (Tightly Sandwiched in the middle) ── */}
      <div className="techmint-continue-tight-wrapper flex flex-col items-center">
        <button
          id="btn7"
          type="button"
          onClick={handleContinue}
          className="ce-btn ce-blue techmint-continue-glow"
        >
          Continue ➔
        </button>
        {showHelper && !isUnlocked && (
          <span className="text-[12px] font-bold text-amber-600 dark:text-amber-400 mt-1 animate-bounce">
            ☝️ Please complete verification timer above first!
          </span>
        )}
      </div>

      {/* ── 3. Second Ad (Directly BELOW Continue Button - "Sata hua") ── */}
      <div className="techmint-ad-tight-unit">
        <AdUnit slot={adSlot2} minHeight="250px" />
      </div>
    </div>
  );
}

export default TechmintTopSection;
