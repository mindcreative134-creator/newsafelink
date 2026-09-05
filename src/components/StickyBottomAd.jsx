import React, { useState } from 'react';
import { useSafelink } from '../context/SafelinkContext';
import { X, Sparkles } from 'lucide-react';
import AdUnit from './AdUnit';

export default function StickyBottomAd() {
  const { isSafelinkActive } = useSafelink();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isSafelinkActive || isDismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center items-center pointer-events-none pb-1 sm:pb-2 px-2">
      <div className="pointer-events-auto relative w-full max-w-[728px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-t-xl sm:rounded-xl shadow-2xl border border-zinc-200/90 dark:border-zinc-800 p-1.5 transition-all">
        
        {/* Top Header Tag & Dismiss Button */}
        <div className="flex items-center justify-between px-2 py-0.5 mb-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Sponsored Advertisement
          </span>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
            title="Close Ad"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Desktop Sticky Banner (728px) */}
        <div className="hidden sm:block overflow-hidden">
          <AdUnit variant="banner" slot="6190284715" minHeight="90px" />
        </div>

        {/* Mobile Sticky Banner (320px) */}
        <div className="block sm:hidden overflow-hidden">
          <AdUnit variant="banner" slot="6190284715" minHeight="50px" />
        </div>

      </div>
    </div>
  );
}
