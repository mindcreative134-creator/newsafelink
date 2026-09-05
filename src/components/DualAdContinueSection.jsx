import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSafelink } from '../context/SafelinkContext';
import { ArrowRight, ExternalLink, Lock, CheckCircle2 } from 'lucide-react';
import AdUnit from './AdUnit';

export default function DualAdContinueSection({ currentPostId = '' }) {
  const {
    currentStep,
    isSafelinkActive,
    step1Verified,
    step2TimerDone,
    step3TimerDone,
    goToNextStep,
    completeAndRedirect,
  } = useSafelink();

  const navigate = useNavigate();

  if (!isSafelinkActive || currentStep < 1) return null;

  const isReady =
    (currentStep === 1 && step1Verified) ||
    (currentStep === 2 && step2TimerDone) ||
    (currentStep === 3 && step3TimerDone);

  const handleClick = () => {
    if (!isReady) return;

    if (currentStep === 1 || currentStep === 2) {
      goToNextStep(navigate, currentPostId);
    } else if (currentStep === 3) {
      completeAndRedirect();
    }
  };

  return (
    <section
      id="safelink-bottom-action"
      aria-label="Secure Link Action Gateway"
      className="w-full my-8 p-4 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center gap-4 transition-colors"
    >
      <div className="text-center">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
          Step {currentStep} of 3 Gateway
        </span>
      </div>

      {/* ── 1. Top High-CTR Ad Slot ── */}
      <div className="w-full">
        <AdUnit
          variant="fluid"
          slot="7317709042"
          minHeight="120px"
          className="w-full max-w-2xl mx-auto"
        />
      </div>

      {/* ── 2. Primary Action Button (Between Both Ads) ── */}
      <div className="w-full flex flex-col items-center py-2 text-center">
        {isReady ? (
          <button
            onClick={handleClick}
            className="w-full sm:w-auto min-w-[280px] sm:min-w-[340px] px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 animate-pulse cursor-pointer"
          >
            {currentStep === 1 && (
              <>
                <span>Continue to Step 2</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
            {currentStep === 2 && (
              <>
                <span>Verify & Continue to Step 3</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
            {currentStep === 3 && (
              <>
                <ExternalLink className="w-5 h-5" />
                <span>Get Link (Proceed to Destination)</span>
              </>
            )}
          </button>
        ) : (
          <div className="w-full sm:w-auto min-w-[280px] sm:min-w-[340px] px-6 py-3.5 rounded-2xl bg-zinc-200 dark:bg-zinc-800/90 text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 select-none border border-zinc-300 dark:border-zinc-700">
            <Lock className="w-4 h-4" />
            <span>
              {currentStep === 1
                ? 'Complete "I am not a robot" check above to unlock'
                : 'Waiting for timer to complete above...'}
            </span>
          </div>
        )}

        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-2 font-medium">
          {currentStep === 1 && 'Click continue to proceed to the secure verification post.'}
          {currentStep === 2 && 'Proceed to the final link decryption step.'}
          {currentStep === 3 && 'Unlocked! Click to access your destination website.'}
        </p>
      </div>

      {/* ── 3. Bottom High-CTR Ad Slot ── */}
      <div className="w-full">
        <AdUnit
          variant="fluid"
          slot="9320506924"
          minHeight="120px"
          className="w-full max-w-2xl mx-auto"
        />
      </div>
    </section>
  );
}
