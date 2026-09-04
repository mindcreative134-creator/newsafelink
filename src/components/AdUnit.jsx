import React, { useEffect, useRef, useState } from 'react';

/**
 * 1:1 BiharHelp-Style Google AdSense AdUnit
 * 
 * Supports all high-CTR placement variants seen on BiharHelp.in:
 * - 'leaderboard': Top below-header horizontal banner (728x90 desktop / 320x50 mobile)
 * - 'fluid': Native In-Feed card with layout-key (BiharHelp Ad #1)
 * - 'in-article': Native In-Article ad between paragraphs (BiharHelp Ad #2)
 * - 'pre-link': High-CTR action banner above official download/apply links (BiharHelp Ad #3)
 * - 'sidebar': Standard 300x250 medium rectangle
 * - 'sticky-sidebar': 300x600 or 300x250 unit that sticks while scrolling long articles
 */
const DEFAULT_CLIENT = import.meta.env?.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9543073887536718';

export default function AdUnit({
  slot = '7317709042',
  client = DEFAULT_CLIENT,
  variant = 'banner', // 'leaderboard' | 'fluid' | 'in-article' | 'pre-link' | 'sidebar' | 'sticky-sidebar' | 'banner'
  format,
  layout = '',
  layoutKey = '',
  style = {},
  minHeight,
  fullWidthResponsive = 'true',
  showLabel = true,
  className = '',
}) {
  const insRef = useRef(null);
  const pushed = useRef(false);
  const [adLoaded, setAdLoaded] = useState(false);

  // Variant-specific sensible defaults matching BiharHelp
  let finalFormat = format;
  let finalLayout = layout;
  let finalLayoutKey = layoutKey;
  let finalMinHeight = minHeight;
  let containerMaxW = 'max-w-4xl';

  switch (variant) {
    case 'leaderboard':
      finalFormat = finalFormat || 'auto';
      finalMinHeight = finalMinHeight || '90px';
      containerMaxW = 'max-w-5xl';
      break;
    case 'fluid':
      finalFormat = finalFormat || 'fluid';
      finalLayoutKey = finalLayoutKey || '-6t+ed+2i-1n-4w';
      finalMinHeight = finalMinHeight || '130px';
      containerMaxW = 'max-w-4xl';
      break;
    case 'in-article':
      finalFormat = finalFormat || 'fluid';
      finalLayout = finalLayout || 'in-article';
      finalMinHeight = finalMinHeight || '140px';
      containerMaxW = 'max-w-3xl';
      break;
    case 'pre-link':
      finalFormat = finalFormat || 'auto';
      finalMinHeight = finalMinHeight || '120px';
      containerMaxW = 'max-w-4xl';
      break;
    case 'sidebar':
      finalFormat = finalFormat || 'auto';
      finalMinHeight = finalMinHeight || '250px';
      containerMaxW = 'max-w-sm';
      break;
    case 'sticky-sidebar':
      finalFormat = finalFormat || 'auto';
      finalMinHeight = finalMinHeight || '300px';
      containerMaxW = 'max-w-sm';
      break;
    default:
      finalFormat = finalFormat || 'auto';
      finalMinHeight = finalMinHeight || '100px';
  }

  useEffect(() => {
    let active = true;
    if (pushed.current) return;
    pushed.current = true;

    requestAnimationFrame(() => {
      if (!active) return;
      try {
        if (typeof window !== 'undefined') {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          // Check if ad filled after a brief moment
          setTimeout(() => {
            if (insRef.current && insRef.current.getAttribute('data-ad-status') === 'filled') {
              setAdLoaded(true);
            }
          }, 1500);
        }
      } catch (err) {
        // Adsbygoogle push error or adblocker detected
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const insProps = {
    className: 'adsbygoogle',
    style: { display: 'block', minWidth: 0, width: '100%', margin: '0 auto' },
    'data-ad-client': client,
    'data-ad-slot': slot,
    'data-ad-format': finalFormat,
    'data-full-width-responsive': fullWidthResponsive,
  };

  if (finalLayout) insProps['data-ad-layout'] = finalLayout;
  if (finalLayoutKey) insProps['data-ad-layout-key'] = finalLayoutKey;

  const isSticky = variant === 'sticky-sidebar';

  return (
    <div
      className={`ad-container-biharhelp my-4 w-full flex flex-col items-center justify-center ${
        isSticky ? 'sticky top-20 z-20' : ''
      } ${className}`}
      style={{ minHeight: finalMinHeight, ...style }}
    >
      {showLabel && (
        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1 select-none flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/70"></span>
          <span>Advertisement</span>
        </div>
      )}
      <div
        className={`ad-unit-inner w-full ${containerMaxW} overflow-hidden rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/70 p-2 flex items-center justify-center transition-colors shadow-sm`}
      >
        <ins ref={insRef} {...insProps} />
      </div>
    </div>
  );
}
