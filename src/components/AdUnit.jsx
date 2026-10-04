import React, { useEffect, useRef } from 'react';
import { AD_CONFIG } from '../config/adConfig';

/**
 * 100% Authentic Google AdSense Ad Unit Component
 * Strictly Real AdSense — NO fake cards, NO fallback banners.
 *
 * Publisher: ca-pub-9543073887536718
 */
function AdUnitComponent({
  slot = AD_CONFIG.SLOTS.TOP_BANNER,
  minHeight = '100px',
  style = {},
  className = '',
}) {
  const insRef = useRef(null);

  useEffect(() => {
    const el = insRef.current;
    if (!el) return;

    // Check if this ad element was already processed by Google AdSense
    if (el.getAttribute('data-adsbygoogle-status')) return;

    // Allow DOM layout to measure width before pushing to AdSense
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && el && !el.getAttribute('data-adsbygoogle-status')) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (err) {
        console.debug('AdSense push error:', err);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [slot]);

  const effectiveMinHeight = style.minHeight || (minHeight && minHeight !== 'auto' ? minHeight : '100px');

  return (
    <div
      className={`adsense-unit ${className}`}
      style={{
        display: 'block',
        width: '100%',
        minHeight: effectiveMinHeight,
        textAlign: 'center',
        margin: '0 auto',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{
          display: 'block',
        }}
        data-ad-client={AD_CONFIG.CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

const AdUnit = React.memo(AdUnitComponent);
export default AdUnit;
