import React, { useEffect, useRef } from 'react';
import { AD_CONFIG } from '../config/adConfig';

/**
 * Authentic Ad Unit Component (TechMint Style)
 * 
 * 1. Clean, native Google AdSense container (ca-pub-9543073887536718).
 * 2. Reliable (window.adsbygoogle = window.adsbygoogle || []).push({}) execution.
 * 3. Does NOT prematurely delete or collapse ads with short timeouts.
 * 4. Checks data-adsbygoogle-status to prevent duplicate initialization.
 * 5. Full responsiveness across mobile, tablet, and desktop.
 */
function AdUnitComponent({
  slot = AD_CONFIG.SLOTS.TOP_BANNER,
  client = AD_CONFIG.CLIENT_ID,
  variant = 'banner', // 'banner' | 'fluid' | 'in-article' | 'rectangle' | 'sidebar'
  format = 'auto',
  minHeight = '90px',
  className = '',
  style = {},
}) {
  const insRef = useRef(null);
  const isPushedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate push to the same element instance
    if (isPushedRef.current) return;

    const pushAd = () => {
      const el = insRef.current;
      if (!el) return;

      // If Google AdSense already processed this ins element, don't push again
      if (el.getAttribute('data-adsbygoogle-status')) {
        isPushedRef.current = true;
        return;
      }

      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        isPushedRef.current = true;
      } catch (err) {
        // Silently catch in case of adblockers or network interruptions
        console.debug('AdSense push caught:', err);
      }
    };

    // Push with a microtask delay so DOM is completely mounted
    const timer = setTimeout(pushAd, 80);

    return () => clearTimeout(timer);
  }, [slot]);

  const isFluid = variant === 'fluid';
  const isInArticle = variant === 'in-article';
  const isRectangle = variant === 'rectangle';

  // Format mapping
  let adFormat = format;
  if (isFluid || isInArticle) {
    adFormat = 'fluid';
  } else if (isRectangle) {
    adFormat = 'rectangle';
  }

  return (
    <div
      className={`ad-container text-center mx-auto overflow-hidden clear-both ${className}`}
      style={{
        width: '100%',
        minHeight: style.minHeight !== undefined ? style.minHeight : minHeight,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style
      }}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          minHeight: minHeight,
          margin: '0 auto',
        }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={adFormat}
        {...(isInArticle ? { 'data-ad-layout': 'in-article' } : {})}
        data-full-width-responsive="true"
      />
    </div>
  );
}

const AdUnit = React.memo(AdUnitComponent);
export default AdUnit;
