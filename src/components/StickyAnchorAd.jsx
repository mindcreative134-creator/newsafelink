import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const DEFAULT_CLIENT = import.meta.env?.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9543073887536718';

/**
 * Sticky Bottom Anchor Ad (BiharHelp-style)
 * Fixed to the bottom of the viewport with a close button.
 * Increases mobile and desktop CTR significantly while remaining compliant.
 */
export default function StickyAnchorAd({ slot = '7317709042', client = DEFAULT_CLIENT }) {
  const [closed, setClosed] = useState(false);
  const insRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    let active = true;
    if (closed || pushed.current) return;
    pushed.current = true;

    requestAnimationFrame(() => {
      if (!active) return;
      try {
        if (typeof window !== 'undefined') {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e) {
        // Ignored
      }
    });

    return () => {
      active = false;
    };
  }, [closed]);

  if (closed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 shadow-2xl py-1 px-2 transition-all">
      <div className="w-full max-w-4xl flex items-center justify-between px-2 mb-0.5">
        <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>Advertisement</span>
        </div>
        <button
          onClick={() => setClosed(true)}
          aria-label="Close Advertisement"
          className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-full max-w-3xl min-h-[50px] sm:min-h-[90px] flex items-center justify-center overflow-hidden">
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block', minWidth: 0, width: '100%', margin: '0 auto', maxHeight: '90px' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
