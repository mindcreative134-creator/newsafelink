import React, { useState, useEffect } from 'react';
import { useSafelink } from '../context/SafelinkContext';
import AdUnit from './AdUnit';
import { Clock, ArrowDown } from 'lucide-react';

export default function WpSafelinkTopSection({ currentPostId }) {
  const { currentStep, isSafelinkActive } = useSafelink();

  // 7-second countdown on top of each page (Page 1, Page 2, Page 3)
  const [countdown, setCountdown] = useState(7);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    setCountdown(7);
    setCanScroll(false);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanScroll(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStep, currentPostId]);

  if (!isSafelinkActive || currentStep < 1 || currentStep > 3) return null;

  // Smooth scroll down to bottom section #wpsafegenerate
  const handleScrollToBottom = (e) => {
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
    <div className="w-full my-2 flex flex-col items-center justify-center text-center space-y-1">
      
      {/* ── Top Ad Unit (Closely Attached) ── */}
      <div className="w-full max-w-[728px] mx-auto overflow-hidden">
        <AdUnit variant="banner" slot="3056127394" minHeight="90px" className="!my-0.5" />
      </div>

      {/* ── Direct Button / Timer (Closely Attached, NO BOX / CARD WRAPPER) ── */}
      <div className="w-full flex flex-col items-center justify-center py-0.5">
        {!canScroll ? (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-100 font-extrabold text-sm shadow-sm select-none">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <span>Please wait... {countdown}s</span>
          </div>
        ) : (
          <a
            href="#wpsafegenerate"
            onClick={handleScrollToBottom}
            className="group inline-flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none select-none"
          >
            {/* Official WP-Safelink generate button graphic */}
            <img
              src="/assets/safelink/generate4.png"
              alt="CLICK TO CONTINUE"
              className="h-12 sm:h-14 w-auto object-contain drop-shadow"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = document.getElementById('top-gen-fallback');
                if (fallback) fallback.style.display = 'inline-flex';
              }}
            />

            {/* Fallback button if image is delayed */}
            <div
              id="top-gen-fallback"
              className="hidden items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black rounded-xl shadow-md text-sm uppercase tracking-wider"
            >
              <span>CLICK TO CONTINUE</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </div>
          </a>
        )}
      </div>

      {/* ── Bottom Ad Unit (Closely Attached) ── */}
      <div className="w-full max-w-[728px] mx-auto overflow-hidden">
        <AdUnit variant="banner" slot="7489201934" minHeight="90px" className="!my-0.5" />
      </div>

    </div>
  );
}
