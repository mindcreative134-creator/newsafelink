import React, { useState, useEffect } from 'react';
import { useSafelink } from '../context/SafelinkContext';
import { Clock, CheckCircle2, ArrowDown, ShieldAlert, Sparkles } from 'lucide-react';
import AdUnit from './AdUnit';

export default function WaitingTimerWidget({ initialSeconds = 8, stepNumber = 2 }) {
  const { setStep2TimerDone, setStep3TimerDone } = useSafelink();
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setIsDone(false);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsDone(true);
          if (stepNumber === 2) setStep2TimerDone(true);
          if (stepNumber === 3) setStep3TimerDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [initialSeconds, stepNumber, setStep2TimerDone, setStep3TimerDone]);

  const handleScrollToBottom = () => {
    const bottomSection = document.getElementById('safelink-bottom-action');
    if (bottomSection) {
      bottomSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const progress = Math.min(100, Math.max(0, ((initialSeconds - secondsLeft) / initialSeconds) * 100));

  return (
    <div className="w-full max-w-2xl mx-auto my-6 flex flex-col items-center gap-3">
      
      {/* ── Ad Unit Above Waiting Widget (High Visibility & Revenue) ── */}
      <AdUnit
        variant="fluid"
        slot="9320506924"
        minHeight="110px"
        className="w-full"
      />

      {/* ── Waiting Animation Card ── */}
      <div className="w-full p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-white to-indigo-50/40 dark:from-zinc-900 dark:via-zinc-850 dark:to-zinc-900 border border-indigo-200/80 dark:border-indigo-900/60 shadow-lg text-center transition-all">
        
        {!isDone ? (
          <div className="flex flex-col items-center">
            {/* Pulsing Timer Ring */}
            <div className="relative w-16 h-16 flex items-center justify-center mb-3">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-200 dark:text-zinc-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000 ease-linear"
                  strokeDasharray={`${progress}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono font-black text-lg text-indigo-600 dark:text-indigo-300">
                {secondsLeft}s
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Step {stepNumber} of 3: {stepNumber === 2 ? 'Generating Link' : 'Finalizing Gateway'}</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white font-heading">
              Please wait while your secure link is generated...
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">
              Verifying link destination integrity. Your continue button will activate at the bottom of the page in {secondsLeft} seconds.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-emerald-700 dark:text-emerald-300 font-heading">
              {stepNumber === 2 ? 'Security Check Complete!' : 'Destination Link Unlocked!'}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 mb-4">
              Please scroll down to the bottom of the page to access your link.
            </p>

            <button
              onClick={handleScrollToBottom}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 animate-bounce-short"
            >
              <ArrowDown className="w-4 h-4 animate-bounce" />
              Scroll Down to Continue ↓
            </button>
          </div>
        )}

      </div>

      {/* ── Ad Unit Below Waiting Widget (High Engagement Placement) ── */}
      <AdUnit
        variant="in-article"
        slot="4392273015"
        minHeight="120px"
        className="w-full"
      />

    </div>
  );
}
