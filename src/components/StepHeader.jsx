import React from 'react';
import { useSafelink } from '../context/SafelinkContext';

export default function StepHeader({ timerActive, timeLeft, totalTime = 15 }) {
  const { currentStep } = useSafelink();

  if (!currentStep) return null;

  const progressPercent = timerActive
    ? ((totalTime - timeLeft) / totalTime) * 100
    : 100;

  return (
    <div className="sticky top-[64px] z-30 w-full flex flex-col shadow-sm">
      {/* Top Warning Banner */}
      <div className="w-full bg-red-600 text-white text-xs sm:text-sm font-extrabold py-2 text-center tracking-wide uppercase font-heading">
        You are currently on step {currentStep}/3
      </div>
      
      {/* Step Info Sub-banner */}
      <div className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
          <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-black uppercase rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
            Step {currentStep} of 3
          </span>
          <span className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {currentStep === 3
              ? timerActive
                ? `Securing gateway destination link... ${timeLeft}s remaining`
                : 'Gate unlocked! Scroll to the bottom and click "Go to Secured Link"'
              : timerActive
                ? `Verifying page parameters... ${timeLeft}s remaining`
                : `Verified! Scroll to the bottom and click "Continue to Step ${currentStep + 1}"`}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full sm:w-40 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-red-600 h-full rounded-full transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
