import React, { useEffect, useRef } from 'react';

/**
 * Google AdSense Compliant AdUnit
 * 
 * Features:
 * - Clear, compliant "ADVERTISEMENT" header label (as permitted by AdSense policy)
 * - Safe margins (at least 24px) ensuring zero accidental clicks with surrounding interactive elements
 * - Responsive container with proper centering
 * - Graceful execution and error handling
 */
const AD_CLIENT = 'ca-pub-9543073887536718';

export default function AdUnit({
  slot,
  format = 'auto',
  layout = '',
  layoutKey = '',
  style = {},
  minHeight = '120px',
  fullWidthResponsive = 'true',
  showLabel = true,
  className = '',
}) {
  const insRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    let active = true;
    if (pushed.current) return;
    pushed.current = true;

    // Use requestAnimationFrame so the container has accurate bounding width before AdSense renders
    requestAnimationFrame(() => {
      if (!active) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
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
    'data-ad-client': AD_CLIENT,
    'data-ad-slot': slot,
    'data-ad-format': format,
    'data-full-width-responsive': fullWidthResponsive,
  };

  if (layout) insProps['data-ad-layout'] = layout;
  if (layoutKey) insProps['data-ad-layout-key'] = layoutKey;

  return (
    <div
      className={`ad-container-outer my-6 w-full flex flex-col items-center justify-center ${className}`}
      style={{ minHeight, ...style }}
    >
      {showLabel && (
        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5 select-none flex items-center gap-1">
          <span>Advertisement</span>
        </div>
      )}
      <div className="ad-unit-inner w-full max-w-4xl overflow-hidden rounded-2xl bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 p-2 flex items-center justify-center transition-colors">
        <ins ref={insRef} {...insProps} />
      </div>
    </div>
  );
}
