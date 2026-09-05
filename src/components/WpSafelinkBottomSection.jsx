import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSafelink } from '../context/SafelinkContext';
import AdUnit from './AdUnit';
import { Download, ArrowRight, ExternalLink } from 'lucide-react';

export default function WpSafelinkBottomSection({ currentPostId }) {
  const { currentStep, isSafelinkActive, goToNextStep, completeAndRedirect } = useSafelink();
  const navigate = useNavigate();

  // In Step 2 bottom: initially show wait4.png for 2.5s, then reveal target4.png (DOWNLOAD LINK)
  const [isWaiting, setIsWaiting] = useState(true);

  useEffect(() => {
    if (currentStep === 2) {
      setIsWaiting(true);
      const timer = setTimeout(() => {
        setIsWaiting(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, currentPostId]);

  if (!isSafelinkActive || currentStep !== 2) return null;

  const handleLinkClick = (e) => {
    e.preventDefault();
    // Navigate to Step 3 (The final Smile Please! gateway)
    goToNextStep(navigate, currentPostId);
  };

  return (
    <div
      id="wpsafegenerate"
      tabIndex="-1"
      className="w-full my-8 flex flex-col items-center justify-center text-center space-y-5 focus:outline-none"
    >
      
      {/* ── Top Ad Unit in Bottom Section (Ad Slot 3) ── */}
      <div className="w-full max-w-[728px] mx-auto overflow-hidden">
        <AdUnit variant="banner" slot="5930219482" minHeight="130px" />
      </div>

      {/* ── Action Box: Wait Graphic -> Download Link Graphic ── */}
      <div className="w-full max-w-md mx-auto py-2">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-md flex flex-col items-center justify-center min-h-[140px]">
          
          {isWaiting ? (
            <div id="wpsafe-wait2" className="flex flex-col items-center space-y-2">
              {/* Official WP-Safelink wait4.png graphic */}
              <img
                id="image2"
                src="/assets/safelink/wait4.png"
                alt="PLEASE WAIT ..."
                className="h-12 sm:h-14 w-auto object-contain drop-shadow"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = document.getElementById('wait-fallback-ui');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              
              {/* Fallback animated wait banner */}
              <div
                id="wait-fallback-ui"
                className="hidden items-center gap-2.5 px-6 py-3 bg-amber-500 text-white font-bold rounded-xl shadow text-sm uppercase tracking-wider animate-pulse"
              >
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>PLEASE WAIT ...</span>
              </div>

              <span className="text-[11px] font-semibold text-zinc-400 mt-1">
                Decrypting your high-speed destination link...
              </span>
            </div>
          ) : (
            <div id="wpsafe-link" className="flex flex-col items-center space-y-2 animate-fadeIn">
              <a
                href="#download-link"
                onClick={handleLinkClick}
                className="group inline-flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
              >
                {/* Official WP-Safelink target4.png graphic */}
                <img
                  id="image3"
                  src="/assets/safelink/target4.png"
                  alt="DOWNLOAD LINK"
                  className="h-12 sm:h-14 w-auto object-contain drop-shadow-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = document.getElementById('target-fallback-btn');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />

                {/* Fallback vibrant button */}
                <div
                  id="target-fallback-btn"
                  className="hidden items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black rounded-xl shadow-lg text-sm uppercase tracking-wider"
                >
                  <Download className="w-5 h-5" />
                  <span>GET LINK / DOWNLOAD NOW ➔</span>
                </div>
              </a>

              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                ✓ Destination ready! Click above to proceed
              </span>
            </div>
          )}

        </div>
      </div>

      {/* ── Bottom Ad Unit in Bottom Section (Ad Slot 4) ── */}
      <div className="w-full max-w-[728px] mx-auto overflow-hidden">
        <AdUnit variant="banner" slot="8301948271" minHeight="130px" />
      </div>

    </div>
  );
}
