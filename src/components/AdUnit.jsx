import React, { useEffect, useRef } from 'react';

/**
 * Real Google AdSense AdUnit Component
 * 
 * Renders official, compliant Google AdSense <ins> tags with ca-pub-9543073887536718.
 * Supports fluid, banner, in-article, and leaderboard formats.
 * Automatically pushes ads to window.adsbygoogle on mount.
 */
const DEFAULT_CLIENT = import.meta.env?.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9543073887536718';

export default function AdUnit({
  slot = '7317709042',
  client = DEFAULT_CLIENT,
  variant = 'banner', // 'leaderboard' | 'fluid' | 'in-article' | 'banner'
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

    // Small delay to ensure DOM element is mounted before pushing to AdSense
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({});
        }
      } catch (err) {
        // Suppress AdSense duplicate push errors in dev/StrictMode
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[AdSense] push handled:', err?.message || err);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`ad-unit-wrapper w-full flex flex-col items-center justify-center my-1.5 select-none ${className}`}
      style={{ minHeight, ...style }}
    >
      <div className="w-full max-w-[728px] overflow-hidden text-center">
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
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
