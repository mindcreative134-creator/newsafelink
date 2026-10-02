import React, { useState, useEffect, useRef } from 'react';
import './techmint-widget.css';

/**
 * TechMint Authentic Multi-Step Safelink Widget
 * 
 * Features:
 * 1. Exact TechMint DOM structure & classes (`ce-btn ce-blue`, `#ce-wait1`, `#btn6`, `#btn7`, `#ce-text`).
 * 2. Countdown timer (configurable 15s-24s).
 * 3. Iframe Ad click monitor (cuts timer down to 5s if user clicks an ad iframe).
 * 4. Verify (#btn6) -> Smooth scroll & instruction (#ce-text) -> Continue (#btn7).
 * 5. Rewarded Ad Action Required popup overlay after 35s.
 * 6. Configurable for 2-step or 3-step flows.
 */

export function TechmintTopWidget({
  currentStep = 1,
  totalSteps = 2,
  onVerify,
  timerSeconds = 20,
  adSlotTop = "1790593258475-01",
  adSlotBottom = "1790593258475-02"
}) {
  const [seconds, setSeconds] = useState(timerSeconds);
  const [timerFinished, setTimerFinished] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showRewardedModal, setShowRewardedModal] = useState(false);

  // 1. Countdown Timer
  useEffect(() => {
    // Check if user has ad reward cookie
    const hasAdCookie = document.cookie.includes('adcadg=');
    const startCount = hasAdCookie ? 12 : timerSeconds;
    setSeconds(startCount);
    setTimerFinished(false);
    setIsVerified(false);

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

    // 2. Iframe Ad-Click Monitor (Reward visitor for clicking ads)
    const monitor = setInterval(() => {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.tagName === 'IFRAME') {
        document.cookie = "adcadg=insurance,online_colleges,study_abroad,finance,loan; max-age=600; path=/;";
        // Fast-forward countdown to 5 seconds remaining
        setSeconds((curr) => (curr > 5 ? 5 : curr));
        clearInterval(monitor);
      }
    }, 200);

    // 3. Rewarded Ad Modal trigger after 35s if unverified
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
  }, [currentStep, timerSeconds]);

  // Click Verify Button
  const handleVerifyClick = () => {
    setIsVerified(true);
    if (onVerify) onVerify();

    // Smooth scroll down to the continue button at bottom
    setTimeout(() => {
      const bottomBtn = document.getElementById('techmint-bottom-section');
      if (bottomBtn) {
        bottomBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  return (
    <div className="techmint-widget-container">
      {/* Top Banner Ad Container */}
      <div className="techmint-ad-box">
        <div className="techmint-ad-placeholder">
          {/* AdSense or Google Ad Manager unit */}
          <span className="techmint-ad-label">Advertisement</span>
          <div id={`div-gpt-ad-${adSlotTop}`} className="techmint-ad-slot" />
        </div>
      </div>

      {/* Countdown Timer Box */}
      {!timerFinished && (
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

      {/* Verify Button (Shows when countdown hits 0) */}
      {timerFinished && !isVerified && (
        <div className="techmint-center my-3">
          <button
            id="btn6"
            onClick={handleVerifyClick}
            className="ce-btn ce-blue animate-pulse-btn"
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

      {/* In-Content Ad Container Below Verify */}
      <div className="techmint-ad-box">
        <div className="techmint-ad-placeholder">
          <span className="techmint-ad-label">Advertisement</span>
          <div id={`div-gpt-ad-${adSlotBottom}`} className="techmint-ad-slot" />
        </div>
      </div>

      {/* High-Converting Rewarded Ad Modal */}
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
                setIsVerified(true);
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

export function TechmintBottomWidget({
  currentStep = 1,
  totalSteps = 2,
  onContinue,
  isUnlocked = false
}) {
  return (
    <div id="techmint-bottom-section" className="techmint-bottom-container">
      {/* Ad Unit Above Continue Button */}
      <div className="techmint-ad-box">
        <div className="techmint-ad-placeholder">
          <span className="techmint-ad-label">Advertisement</span>
          <div id="div-gpt-ad-bottom-1" className="techmint-ad-slot" />
        </div>
      </div>

      {/* Continue Button Section */}
      <div className="techmint-center my-4">
        {isUnlocked ? (
          <button
            id="btn7"
            onClick={onContinue}
            className="ce-btn ce-blue techmint-continue-glow"
          >
            {currentStep >= totalSteps ? "Get Final Destination Link ➔" : `Continue to Step ${currentStep + 1} ➔`}
          </button>
        ) : (
          <div className="techmint-locked-notice">
            <span>🔒 Please complete verification at the top of the article</span>
          </div>
        )}
      </div>

      {/* Ad Unit Below Continue Button */}
      <div className="techmint-ad-box">
        <div className="techmint-ad-placeholder">
          <span className="techmint-ad-label">Advertisement</span>
          <div id="div-gpt-ad-bottom-2" className="techmint-ad-slot" />
        </div>
      </div>
    </div>
  );
}
