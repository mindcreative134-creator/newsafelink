import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSafelink } from '../context/SafelinkContext';
import AdUnit from './AdUnit';
import { Clock, ShieldCheck, CheckCircle2, ArrowDownCircle } from 'lucide-react';

export default function WpSafelinkTopSection({ currentPostId }) {
  const { currentStep, isSafelinkActive, goToNextStep, markStep1Verified, step1Verified } = useSafelink();
  const navigate = useNavigate();

  // Step 2 Countdown timer (10 seconds)
  const [countdown, setCountdown] = useState(10);
  const [canGenerate, setCanGenerate] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (currentStep === 2) {
      setCountdown(10);
      setCanGenerate(false);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanGenerate(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStep, currentPostId]);

  if (!isSafelinkActive) return null;

  // Step 1: Human Verification handler
  const handleVerifyClick = () => {
    setIsVerifying(true);
    setTimeout(() => {
      markStep1Verified();
      setIsVerifying(false);
      goToNextStep(navigate, currentPostId);
    }, 800);
  };

  // Step 2: Smooth scroll to bottom generate section
  const handleGenerateClick = (e) => {
    e.preventDefault();
    const bottomTarget = document.getElementById('wpsafegenerate');
    if (bottomTarget) {
      bottomTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      bottomTarget.focus?.();
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full my-6 flex flex-col items-center justify-center text-center space-y-4">
      
      {/* ── Top Ad Unit (Ad Slot 1) ── */}
      <div className="w-full max-w-[728px] mx-auto overflow-hidden">
        <AdUnit variant="banner" slot="3056127394" minHeight="130px" />
      </div>

      {/* ── Step 1: Human Verification Button ── */}
      {currentStep === 1 && (
        <div className="w-full max-w-md mx-auto py-2">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col items-center">
            
            <button
              onClick={handleVerifyClick}
              disabled={isVerifying}
              id="wpsafelinkhuman"
              className="group relative inline-flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
            >
              {/* Authentic WP-Safelink Human Verification graphic */}
              <img
                src="/assets/safelink/human-verification4.png"
                alt="Human Verification"
                className="h-14 sm:h-16 w-auto object-contain drop-shadow-sm transition-all"
                onError={(e) => {
                  // Fallback to high-CTR button styling if image fails
                  e.target.style.display = 'none';
                  const fallback = document.getElementById('human-verify-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />

              {/* Styled Interactive Fallback Button */}
              <div
                id="human-verify-fallback"
                className="hidden items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-md text-sm uppercase tracking-wider"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-200" />
                    <span>I Am Not A Robot • Verify</span>
                  </>
                )}
              </div>
            </button>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 font-medium">
              {isVerifying ? 'Checking browser credentials...' : 'Click the button above to proceed to verification'}
            </p>
          </div>
        </div>
      )}

      {/* ── Step 2: Waiting Notice & Generate Link ── */}
      {currentStep === 2 && (
        <div className="w-full max-w-xl mx-auto py-2">
          <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-5 shadow-sm">
            
            {!canGenerate ? (
              <div id="wpsafe-wait1" className="flex flex-col items-center space-y-3">
                {/* Delay notice text identical to shortxlinks reference */}
                <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 leading-snug tracking-wide">
                  𝗖𝗹𝗶𝗰𝗸 𝗢𝗻 𝗔𝗻𝘆 ☝ 𝗜𝗺𝗮𝗴𝗲𝘀 👇 𝘁𝗵𝗲𝗻 𝗯𝗮𝗰𝗸 𝗮𝗻𝗱 𝗪𝗮𝗶𝘁 𝗙𝗼𝗿 𝗧𝗵𝗲 𝗟𝗶𝗻𝗸 (𝗜𝗳 𝗣𝗮𝗴𝗲 𝗡𝗼𝘁 𝗪𝗼𝗿𝗸𝗶𝗻𝗴 𝗥𝗲𝗳𝗿𝗲𝘀𝗵 𝗧𝗵𝗲 𝗣𝗮𝗴𝗲)
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800 shadow-sm">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                  <span className="text-xs sm:text-sm font-extrabold text-zinc-800 dark:text-zinc-100">
                    Please wait <span id="wpsafe-time" className="text-amber-600 dark:text-amber-400 text-base">{countdown}</span> seconds...
                  </span>
                </div>
              </div>
            ) : (
              <div id="wpsafe-generate" className="flex flex-col items-center space-y-2 animate-fadeIn">
                <a
                  href="#wpsafegenerate"
                  onClick={handleGenerateClick}
                  className="group inline-flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  {/* Official WP-Safelink Generate graphic */}
                  <img
                    src="/assets/safelink/generate4.png"
                    alt="CLICK 2X FOR GENERATE LINK"
                    className="h-12 sm:h-14 w-auto object-contain drop-shadow-md"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = document.getElementById('generate-fallback-btn');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />

                  {/* Fallback button if image is loading */}
                  <div
                    id="generate-fallback-btn"
                    className="hidden items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-lg text-sm uppercase tracking-wider animate-bounce"
                  >
                    <ArrowDownCircle className="w-5 h-5" />
                    <span>CLICK 2X FOR GENERATE LINK</span>
                  </div>
                </a>
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  Link generated! Click above to scroll to your destination
                </span>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Bottom Ad Unit (Ad Slot 2) ── */}
      <div className="w-full max-w-[728px] mx-auto overflow-hidden">
        <AdUnit variant="banner" slot="7489201934" minHeight="130px" />
      </div>

    </div>
  );
}
