import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSafelink } from '../context/SafelinkContext';
import AdUnit from './AdUnit';
import { ArrowRight, ExternalLink } from 'lucide-react';

export default function WpSafelinkBottomSection({ currentPostId }) {
  const { currentStep, isSafelinkActive, goToNextStep, completeAndRedirect } = useSafelink();
  const navigate = useNavigate();

  // 2-second wait on bottom of each page before revealing continue / download link
  const [isWaiting, setIsWaiting] = useState(true);

  useEffect(() => {
    setIsWaiting(true);
    const timer = setTimeout(() => {
      setIsWaiting(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentStep, currentPostId]);

  if (!isSafelinkActive || currentStep < 1 || currentStep > 3) return null;

  const handleBottomClick = (e) => {
    e.preventDefault();
    if (currentStep === 3) {
      // Step 3 final click unlocks the destination link!
      completeAndRedirect();
    } else {
      // Step 1 or 2 advances to the next verification page!
      goToNextStep(navigate, currentPostId);
    }
  };

  return (
    <div
      id="wpsafegenerate"
      tabIndex="-1"
      className="w-full my-2 flex flex-col items-center justify-center text-center space-y-1 focus:outline-none"
    >
      
      {/* ── Top Ad Unit in Bottom Section (Closely Attached) ── */}
      <div className="w-full max-w-[728px] mx-auto overflow-hidden">
        <AdUnit variant="banner" slot="5930219482" minHeight="90px" className="!my-0.5" />
      </div>

      {/* ── Direct Button / Wait Graphic (Closely Attached, NO BOX / CARD WRAPPER, NO HELPER TEXT) ── */}
      <div className="w-full flex flex-col items-center justify-center py-0.5">
        {isWaiting ? (
          <div id="wpsafe-wait2" className="flex flex-col items-center justify-center select-none">
            {/* Official WP-Safelink wait4.png graphic */}
            <img
              id="image2"
              src="/assets/safelink/wait4.png"
              alt="PLEASE WAIT ..."
              className="h-12 sm:h-14 w-auto object-contain drop-shadow"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = document.getElementById('bot-wait-fallback');
                if (fallback) fallback.style.display = 'inline-flex';
              }}
            />

            {/* Fallback wait indicator */}
            <div
              id="bot-wait-fallback"
              className="hidden items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-100 font-extrabold text-sm shadow-sm"
            >
              <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>PLEASE WAIT...</span>
            </div>
          </div>
        ) : (
          <div id="wpsafe-link" className="flex flex-col items-center justify-center select-none animate-fadeIn">
            <a
              href="#proceed"
              data-google-vignette="false"
              onClick={handleBottomClick}
              className="group inline-flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
            >
              {/* Official WP-Safelink target4.png (LINK DOWNLOAD / GET LINK) graphic */}
              <img
                id="image3"
                src="/assets/safelink/target4.png"
                alt={currentStep === 3 ? "GET LINK" : "CONTINUE"}
                className="h-12 sm:h-14 w-auto object-contain drop-shadow"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = document.getElementById('bot-target-fallback');
                  if (fallback) fallback.style.display = 'inline-flex';
                }}
              />

              {/* Fallback button */}
              <div
                id="bot-target-fallback"
                className="hidden items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black rounded-xl shadow-md text-sm uppercase tracking-wider"
              >
                <span>{currentStep === 3 ? "GET LINK ➔" : "CONTINUE TO NEXT STEP ➔"}</span>
              </div>
            </a>
          </div>
        )}
      </div>

      {/* ── Bottom Ad Unit in Bottom Section (Closely Attached) ── */}
      <div className="w-full max-w-[728px] mx-auto overflow-hidden">
        <AdUnit variant="banner" slot="8301948271" minHeight="90px" className="!my-0.5" />
      </div>

    </div>
  );
}
