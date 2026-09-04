import React from 'react';
import { useSafelink } from '../context/SafelinkContext';
import { ShieldCheck, ShieldAlert, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export default function StepHeader({ timerActive, timeLeft, totalTime = 15 }) {
  const { currentStep } = useSafelink();

  if (!currentStep) return null;

  const progressPercent = timerActive
    ? Math.min(100, Math.max(0, ((totalTime - timeLeft) / totalTime) * 100))
    : 100;

  const stepsInfo = [
    { num: 1, title: 'Security Scan' },
    { num: 2, title: 'Safety Verification' },
    { num: 3, title: 'Link Decryption' },
  ];

  return (
    <div className="sticky top-[64px] sm:top-[80px] z-30 w-full flex flex-col shadow-md">
      {/* Top Status Bar */}
      <div className="w-full bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white text-xs font-bold py-2 px-4 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="tracking-wide">SafeLink Transit Gateway</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-[10px] uppercase font-black tracking-wider text-indigo-200 border border-indigo-400/20">
              Step {currentStep} of 3
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {timerActive ? (
              <span className="text-amber-300 font-mono flex items-center gap-1">
                ⏳ Verifying safety... {timeLeft}s
              </span>
            ) : (
              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Step {currentStep} Verified!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Steps Visual Progress Bar */}
      <div className="w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 px-4 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Step Pills */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            {stepsInfo.map((s) => {
              const isPassed = currentStep > s.num;
              const isCurrent = currentStep === s.num;

              return (
                <div key={s.num} className="flex items-center gap-1.5 shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isPassed
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 animate-pulse'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {isPassed ? '✓' : s.num}
                  </div>
                  <span
                    className={`text-xs font-bold hidden sm:inline ${
                      isCurrent
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : isPassed
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    {s.title}
                  </span>
                  {s.num < 3 && <span className="text-zinc-300 dark:text-zinc-700 text-xs hidden sm:inline">›</span>}
                </div>
              );
            })}
          </div>

          {/* Linear Progress Bar */}
          <div className="w-32 sm:w-48 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden shrink-0">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
