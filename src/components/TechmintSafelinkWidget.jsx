import React, { useState, useEffect } from 'react';
import AdUnit from './AdUnit';
import './TechmintSafelink.css';

/**
 * Authentic TechMint Safelink Top Widget
 * Exact recreation of TechMint countdown, sticky step indicator, green instruction banner,
 * iframe ad-click monitor, verify button, and rewarded ad prompt.
 */
export function TechmintTopSection({
  currentStep = 1,
  totalSteps = 3,
  onVerify,
  isVerified = false,
  timerSeconds = 15,
  adSlotTop = "9320506924",
  adSlotBottom = "4392273015"
}) {
  const [seconds, setSeconds] = useState(timerSeconds);
  const [timerFinished, setTimerFinished] = useState(false);
  const [showRewardedModal, setShowRewardedModal] = useState(false);

  useEffect(() => {
    // Check if user has ad reward cookie
    const hasAdCookie = typeof document !== 'undefined' && document.cookie.includes('adcadg=');
    const startCount = hasAdCookie ? 10 : timerSeconds;
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

    // Rewarded Ad Modal trigger after 35s if unverified
    const modalTimer = setTimeout(() => {
      if (!isVerified) {
        setShowRewardedModal(true);
      }
    }, 35000);

    return () => {
      clearInterval(interval);
      clearInterval(monitor);
      clearTimeout(modalTimer);
    };
  }, [currentStep, timerSeconds, isVerified]);

  const handleVerifyClick = () => {
    if (onVerify) onVerify();
    // Do NOT auto-scroll to bottom - User explicitly requested staying and showing guidance
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

        {/* ── 3. Top Banner Ad (Always reserved height so it never collapses) ── */}
        <div className="techmint-ad-wrapper">
          <AdUnit variant="banner" slot={adSlotTop} minHeight="90px" />
        </div>

        {/* ── 4. Countdown Timer Box (#ce-wait1) ── */}
        {!timerFinished && !isVerified && (
          <div id="ce-wait1" className="techmint-wait-box">
            <div id="countdown" className="techmint-countdown-text">
              <b>Please wait <span id="ce-time">{seconds}</span> Seconds...</b>
            </div>
            <div className="techmint-progress-bar-bg">
              <div
                className="techmint-progress-bar-fill"
                style={{ width: `${((timerSeconds - seconds) / timerSeconds) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── 5. Verify Button (#btn6) ── */}
        {timerFinished && !isVerified && (
          <div className="techmint-center my-3">
            <button
              id="btn6"
              onClick={handleVerifyClick}
              className="ce-btn ce-blue"
            >
              Verify
            </button>
          </div>
        )}

        {/* ── 6. Guidance Instruction (#ce-text) - Does NOT auto-scroll, shows clear instructions ── */}
        {isVerified && (
          <div className="techmint-center my-3">
            <div id="ce-text" className="techmint-scroll-guidance-card">
              <div className="techmint-guidance-badge">
                <span className="binking-emoji">👇</span>
                <span>STEP {currentStep} VERIFIED</span>
                <span className="binking-emoji">👇</span>
              </div>
              <h4 className="techmint-guidance-heading">
                👇 Scroll down and click on <span className="highlight-red">Continue</span> button 👇
              </h4>
              <p className="techmint-guidance-subtext">
                Please scroll down to the bottom of the article to click the Continue button.
              </p>
              <div className="techmint-down-arrows-row">
                <span>👇</span>
                <span className="binking-emoji">👇</span>
                <span>👇</span>
              </div>
            </div>
          </div>
        )}

        {/* ── 7. In-Content Ad Below Verify ── */}
        <div className="techmint-ad-wrapper">
          <AdUnit variant="in-article" slot={adSlotBottom} minHeight="120px" />
        </div>

        {/* ── 8. Rewarded Ad Modal Overlay ── */}
        {showRewardedModal && (
          <div className="techmint-rewarded-overlay">
            <div className="techmint-rewarded-modal">
              <h2 className="techmint-modal-title">⚠️ Action Required</h2>
              <p className="techmint-modal-desc">
                <strong>Click "Continue" and view the sponsor ad</strong><br />
                to unlock your destination link.
              </p>
              <button
                onClick={() => {
                  setShowRewardedModal(false);
                  handleVerifyClick();
                }}
                className="techmint-modal-btn"
              >
                CONTINUE ➜
              </button>
              <p className="techmint-modal-sub">This helps keep our service 100% free</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Authentic Safelink Bottom Widget
 * Placed at the bottom of the article.
 * Tightly sandwiches Continue button between top and bottom ads with ZERO large gaps ("Sata hua").
 */
export function TechmintBottomSection({
  currentStep = 1,
  totalSteps = 3,
  onContinue,
  isUnlocked = false,
  adSlot1 = "7317709042",
  adSlot2 = "1909584638"
}) {
  const handleContinue = (e) => {
    e.preventDefault();
    if (onContinue) onContinue();
  };

  return (
    <div id="techmint-bottom-section" className="techmint-bottom-tight-container">
      {/* ── Ad Unit Directly Above Continue Button ("Sata hua") ── */}
      <div className="techmint-ad-tight-unit">
        <AdUnit variant="banner" slot={adSlot1} minHeight="0px" style={{ minHeight: 0 }} />
      </div>

      {/* ── Continue Button Section (#btn7) ── */}
      <div className="techmint-continue-tight-wrapper">
        {isUnlocked ? (
          <button
            id="btn7"
            type="button"
            onClick={handleContinue}
            className="ce-btn ce-blue techmint-continue-glow"
          >
            Continue ➔
          </button>
        ) : (
          <div className="techmint-locked-notice">
            <span>🔒 Please complete verification at the top of the article</span>
          </div>
        )}
      </div>

      {/* ── Ad Unit Directly Below Continue Button ("Sata hua") ── */}
      <div className="techmint-ad-tight-unit">
        <AdUnit variant="banner" slot={adSlot2} minHeight="0px" style={{ minHeight: 0 }} />
      </div>
    </div>
  );
}


export default TechmintTopSection;

