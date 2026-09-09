import React, { useEffect, useRef } from 'react';

/**
 * Real Google AdSense & Direct Ad Unit Component
 * 
 * 1. Renders official, compliant Google AdSense <ins> tags with display:block so Google crawler
 *    and JavaScript can properly calculate viewports and serve genuine live ads.
 * 2. Safely executes window.adsbygoogle.push({}) on mount for every ad slot.
 * 3. Supports responsive formats: 'auto', 'fluid', 'in-article', 'rectangle'.
 * 4. Completely free of fake/dummy placeholder sponsored ads.
 */

const DEFAULT_CLIENT = import.meta.env?.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9543073887536718';

export default function AdUnit({
  slot = '7317709042',
  client = DEFAULT_CLIENT,
  variant = 'banner', // 'banner' | 'fluid' | 'in-article' | 'rectangle'
  format = 'auto',
  minHeight = '90px',
  className = '',
  style = {},
}) {
  const insRef = useRef(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    pushedRef.current = true;

    // Push ad request to Google AdSense queue
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({});
        }
      } catch (err) {
        // Prevent uncaught errors if adblocker is active
      }
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const isFluid = variant === 'fluid';
  const isInArticle = variant === 'in-article';

  return (
    <div
      className={`real-ad-unit-container w-full flex flex-col items-center justify-center my-2 select-none overflow-hidden ${className}`}
      style={{ minHeight, ...style }}
    >
      <div className="w-full max-w-[728px] mx-auto text-center relative">
        <div className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold mb-1 select-none">
          Advertisement
        </div>

        {/* Real Official Google AdSense Tag */}
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
            minHeight,
            margin: '0 auto',
            textAlign: 'center',
          }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={isFluid || isInArticle ? 'fluid' : format}
          {...(isInArticle ? { 'data-ad-layout': 'in-article' } : {})}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
