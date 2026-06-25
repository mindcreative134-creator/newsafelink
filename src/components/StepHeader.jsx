import React from 'react';
import { useSafelink } from '../context/SafelinkContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function StepHeader({ timerActive, timeLeft, totalTime = 15 }) {
  const { currentStep } = useSafelink();

  if (!currentStep) return null;

  const progressPercent = timerActive
    ? ((totalTime - timeLeft) / totalTime) * 100
    : 100;

  return (
    <div className="sticky top-[64px] z-30 w-full flex flex-col shadow-sm">
      {/* Top Warning Banner */}
      <div className="w-full bg-red-650 text-white text-xs font-black py-2.5 text-center tracking-wider uppercase font-heading flex items-center justify-center gap-1.5 shadow-inner">
        <AlertCircle className="w-4 h-4" /> You are on step {currentStep} of 3 (Security Transit)
      </div>
      
      {/* Step Info Sub-banner */}
      <div className="w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors duration-300">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <span className="inline-flex items-center justify-center px-3 py-1 text-[10px] font-black uppercase rounded-full bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-400 border border-red-200/50 dark:border-red-800/40">
            Step {currentStep}/3
          </span>
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            {!timerActive && <ShieldCheck className="w-4 h-4 text-green-500 animate-pulse" />}
            {currentStep === 3
              ? timerActive
                ? `Securing target link: ${timeLeft}s left`
                : 'Secured! Scroll down and click "Go to Secured Link"'
              : timerActive
                ? `Analyzing transit tags: ${timeLeft}s left`
                : `Verified! Scroll down and click "Continue to Step ${currentStep + 1}"`}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full sm:w-44 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden shadow-inner relative">
          <div
            className="bg-red-600 h-full rounded-full transition-all duration-300 ease-linear shadow-md"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
