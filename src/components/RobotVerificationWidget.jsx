import React, { useState } from 'react';
import { useSafelink } from '../context/SafelinkContext';
import { CheckCircle2, ShieldCheck, ArrowDown, RefreshCw } from 'lucide-react';

export default function RobotVerificationWidget() {
  const { step1Verified, markStep1Verified } = useSafelink();
  const [checking, setChecking] = useState(false);

  const handleCheckboxClick = () => {
    if (step1Verified || checking) return;
    setChecking(true);

    setTimeout(() => {
      setChecking(false);
      markStep1Verified();

      // Smooth scroll automatically towards the bottom action section
      setTimeout(() => {
        const bottomSection = document.getElementById('safelink-bottom-action');
        if (bottomSection) {
          bottomSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
    }, 1200);
  };

  const handleManualScroll = () => {
    const bottomSection = document.getElementById('safelink-bottom-action');
    if (bottomSection) {
      bottomSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto my-6 p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg text-center transition-all animate-fadeIn">
      
      {/* Header Info */}
      <div className="flex items-center justify-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <span className="text-xs font-black uppercase tracking-wider">
          Security Protocol Verification
        </span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white font-heading mb-1">
        Please Confirm You Are Human
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
        Complete the fast verification check below to generate your secure destination gateway.
      </p>

      {/* ── ReCAPTCHA / Cloudflare Style On-Page Box (NO POPUPS) ── */}
      <div
        onClick={handleCheckboxClick}
        className={`mx-auto max-w-sm p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none ${
          step1Verified
            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
            : checking
            ? 'bg-indigo-50/50 dark:bg-zinc-800/60 border-indigo-300 dark:border-indigo-700'
            : 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800'
        }`}
      >
        <div className="flex items-center gap-3.5">
          {/* Checkbox box */}
          <div
            className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
              step1Verified
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : checking
                ? 'border-indigo-500 bg-white dark:bg-zinc-900'
                : 'border-zinc-400 dark:border-zinc-500 bg-white dark:bg-zinc-900'
            }`}
          >
            {step1Verified ? (
              <CheckCircle2 className="w-5 h-5 text-white" />
            ) : checking ? (
              <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
            ) : null}
          </div>

          {/* Label */}
          <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {step1Verified
              ? 'Verification Completed'
              : checking
              ? 'Verifying human response...'
              : "I'm not a robot"}
          </span>
        </div>

        {/* reCAPTCHA style logo mark */}
        <div className="flex flex-col items-center pl-2 shrink-0 border-l border-zinc-200 dark:border-zinc-700 text-right">
          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
            🛡️
          </div>
          <span className="text-[8px] text-zinc-400 font-semibold tracking-tighter mt-0.5">
            Privacy • Terms
          </span>
        </div>
      </div>

      {/* ── Post-Verification Guidance Prompt ── */}
      {step1Verified && (
        <div className="mt-5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col items-center gap-2 animate-bounce-short">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-extrabold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Verification Successful! Scroll down to continue.</span>
          </div>

          <button
            onClick={handleManualScroll}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
          >
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            Scroll Down to Continue ↓
          </button>
        </div>
      )}

    </div>
  );
}
