import React, { useEffect, useRef, useState } from 'react';
import { AD_CONFIG } from '../config/adConfig';

/**
 * Authentic Ad Unit Component (TechMint Style)
 * 
 * 1. Clean, native ad wrapper that mimics TechMint & GeneratePress ad inserter blocks.
 * 2. Uses authentic Google AdSense publisher tags (ca-pub-9543073887536718).
 * 3. Does NOT show fake "Advertisement" labels or placeholder text.
 * 4. Gracefully pushes to window.adsbygoogle queue.
 * 5. Automatically collapses to zero height if Google AdSense marks the slot unfilled.
 */

function AdUnitComponent({
  slot = AD_CONFIG.SLOTS.TOP_BANNER,
  client = AD_CONFIG.CLIENT_ID,
  variant = 'banner', // 'banner' | 'fluid' | 'in-article' | 'rectangle' | 'sidebar'
  format = 'auto',
  minHeight = '0px',
  className = '',
  style = {},
}) {
  const insRef = useRef(null);
  const pushedRef = useRef(false);
  const [unfilled, setUnfilled] = useState(false);

  useEffect(() => {
    if (pushedRef.current) return;
    pushedRef.current = true;

    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      } catch (err) {
        // Silently catch adblock / loading exceptions
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [slot]);

  // Monitor for Google AdSense unfilled status to collapse zero height immediately
  useEffect(() => {
    const el = insRef.current;
    if (!el) return;

    const checkStatus = () => {
      if (el.getAttribute('data-ad-status') === 'unfilled') {
        setUnfilled(true);
      }
    };

    const observer = new MutationObserver(checkStatus);
    observer.observe(el, { attributes: true, attributeFilter: ['data-ad-status', 'style'] });

    const timeout = setTimeout(checkStatus, 3500);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  if (unfilled) {
    // If ad is unfilled, collapse completely with ZERO margin/padding/gap!
    return null;
  }

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
      className={`ad-container text-center overflow-hidden clear-both ${className}`}
      style={{ minHeight: style.minHeight !== undefined ? style.minHeight : minHeight, ...style }}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
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
