import React, { useState, useEffect } from 'react';
import AdUnit from './AdUnit';
import './TechmintSafelink.css';

/**
 * Authentic TechMint Safelink Top Widget
 * Exact recreation of TechMint countdown, iframe ad-click monitor, verify button,
 * and high-converting rewarded ad prompt.
 */
export function TechmintTopSection({
  currentStep = 1,
  totalSteps = 2,
  onVerify,
  isVerified = false,
  timerSeconds = 20,
  adSlotTop = "9320506924",
  adSlotBottom = "4392273015"
}) {
  const [seconds, setSeconds] = useState(timerSeconds);
  const [timerFinished, setTimerFinished] = useState(false);
  const [showRewardedModal, setShowRewardedModal] = useState(false);

  useEffect(() => {
    // Check if user has ad reward cookie
    const hasAdCookie = typeof document !== 'undefined' && document.cookie.includes('adcadg=');
    const startCount = hasAdCookie ? 12 : timerSeconds;
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
        setSeconds((curr) => (curr > 5 ? 5 : curr));
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

    // Smooth scroll down to the continue button at bottom
    setTimeout(() => {
      const bottomSection = document.getElementById('techmint-bottom-section');
      if (bottomSection) {
        bottomSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  return (
    <div className="techmint-widget-container">
      {/* Top Banner Ad */}
      <div className="techmint-ad-wrapper">
        <AdUnit variant="banner" slot={adSlotTop} minHeight="90px" className="!my-1" />
      </div>

      {/* Countdown Timer Box */}
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

      {/* Verify Button (Shows when timer hits 0) */}
      {timerFinished && !isVerified && (
        <div className="techmint-center my-3">
          <button
            id="btn6"
            onClick={handleVerifyClick}
            className="ce-btn ce-blue techmint-pulse-btn"
          >
            Verify Step {currentStep}/{totalSteps}
          </button>
        </div>
      )}

      {/* Guidance Instruction (Shows after Verify is clicked) */}
      {isVerified && (
        <div className="techmint-center my-3">
          <h4 id="ce-text" className="techmint-guidance-text">
            Scroll down &amp; click on <span className="highlight-blue">Continue</span> button for your destination link
          </h4>
        </div>
      )}

      {/* In-Content Ad Below Verify */}
      <div className="techmint-ad-wrapper">
        <AdUnit variant="in-article" slot={adSlotBottom} minHeight="120px" className="!my-1" />
      </div>

      {/* Rewarded Ad Action Required Overlay Modal */}
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
  );
}

/**
 * Authentic TechMint Safelink Bottom Widget
 * Placed at the bottom of the article.
 */
export function TechmintBottomSection({
  currentStep = 1,
  totalSteps = 2,
  onContinue,
  isUnlocked = false,
  adSlot1 = "5930219482",
  adSlot2 = "8301948271"
}) {
  return (
    <div id="techmint-bottom-section" className="techmint-bottom-container">
      {/* Ad Unit Above Continue Button */}
      <div className="techmint-ad-wrapper">
        <AdUnit variant="banner" slot={adSlot1} minHeight="90px" className="!my-1" />
      </div>

      {/* Continue Button Section */}
      <div className="techmint-center my-4">
        {isUnlocked ? (
          <button
            id="btn7"
            onClick={onContinue}
            className="ce-btn ce-blue techmint-continue-glow"
          >
            {currentStep >= totalSteps ? "Get Destination Link ➔" : `Continue to Step ${currentStep + 1} ➔`}
          </button>
        ) : (
          <div className="techmint-locked-notice">
            <span>🔒 Please complete verification at the top of the article</span>
          </div>
        )}
      </div>

      {/* Ad Unit Below Continue Button */}
      <div className="techmint-ad-wrapper">
        <AdUnit variant="banner" slot={adSlot2} minHeight="90px" className="!my-1" />
      </div>
    </div>
  );
}
