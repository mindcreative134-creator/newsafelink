import React from 'react';
import { useSafelink } from '../context/SafelinkContext';
import { ShieldCheck, Lock, CheckCircle2, ChevronRight, X } from 'lucide-react';

export default function SafelinkStepIndicator() {
  const { currentStep, isSafelinkActive, clearSafelink } = useSafelink();

  if (!isSafelinkActive || currentStep < 1) return null;

  const stepMeta = [
    { num: 1, name: 'Human Verification', short: 'Verification' },
    { num: 2, name: 'Secure Link Generation', short: 'Security Check' },
    { num: 3, name: 'Link Decryption & Access', short: 'Get Link' },
  ];

  const activeMeta = stepMeta.find((s) => s.num === currentStep) || stepMeta[0];
  const progressPercent = Math.round((currentStep / 3) * 100);

  return (
    <aside
      aria-label="Secure Transit Progress"
      className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Current Step Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40">
            {currentStep === 3 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <span>Page {currentStep} of 3</span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-tight font-heading">
              {activeMeta.name}
            </h3>
          </div>
        </div>

        {/* Center: 3 Steps Breadcrumb */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {stepMeta.map((s, idx) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <React.Fragment key={s.num}>
                {idx > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 shrink-0" />
                )}
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 dark:ring-indigo-900'
                      : isCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  <span>{s.num}.</span>
                  <span className="hidden sm:inline">{s.short}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Exit / Dismiss Button */}
        <button
          onClick={clearSafelink}
          title="Cancel Transit & Browse Portal"
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Exit Transit</span>
        </button>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </aside>
  );
}
