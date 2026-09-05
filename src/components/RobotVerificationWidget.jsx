import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSafelink } from '../context/SafelinkContext';
import AdUnit from './AdUnit';
import { CheckCircle2, RefreshCw } from 'lucide-react';

export default function RobotVerificationWidget({ currentPostId = '' }) {
  const { step1Verified, markStep1Verified } = useSafelink();
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  const handleCheckboxClick = () => {
    if (step1Verified || checking) return;
    setChecking(true);

    setTimeout(() => {
      setChecking(false);
      markStep1Verified(navigate, currentPostId);
    }, 1100);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-6 flex flex-col items-center justify-center text-center space-y-1.5 select-none animate-fadeIn">
      
      {/* ── Top Ad directly above I am not a robot (Closely Attached) ── */}
      <div className="w-full max-w-[728px] mx-auto overflow-hidden">
        <AdUnit variant="banner" slot="3056127394" minHeight="90px" className="!my-0.5" />
      </div>

      {/* ── ReCAPTCHA Style Checkbox (Directly in center, NO big card wrapper) ── */}
      <div className="w-full max-w-sm mx-auto py-1">
        <div
          onClick={handleCheckboxClick}
          data-google-vignette="false"
          className={`w-full p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer shadow-sm ${
            step1Verified
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
              : checking
              ? 'bg-indigo-50/50 dark:bg-zinc-850 border-indigo-300 dark:border-indigo-700'
              : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 hover:shadow'
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
                ? 'Verification Complete'
                : checking
                ? 'Checking browser credentials...'
                : "I'm not a robot"}
            </span>
          </div>

          {/* reCAPTCHA style badge */}
          <div className="flex flex-col items-center pl-3 shrink-0 border-l border-zinc-200 dark:border-zinc-800 text-right">
            <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
              🛡️
            </div>
            <span className="text-[8px] text-zinc-400 font-semibold tracking-tighter mt-0.5">
              reCAPTCHA
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom Ad directly below I am not a robot (Closely Attached) ── */}
      <div className="w-full max-w-[728px] mx-auto overflow-hidden">
        <AdUnit variant="banner" slot="7489201934" minHeight="90px" className="!my-0.5" />
      </div>

    </div>
  );
}
