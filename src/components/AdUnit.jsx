import React, { useEffect, useRef, useState } from 'react';

/**
 * Authentic Ad Unit Component (TechMint Style)
 * 
 * 1. Clean, native ad wrapper that mimics GeneratePress / TechMint ad inserter blocks.
 * 2. Does NOT show fake "Advertisement" labels when ads are empty or loading.
 * 3. Gracefully pushes to window.adsbygoogle queue.
 * 4. Automatically collapses to zero height if Google AdSense marks the slot unfilled.
 */

const DEFAULT_CLIENT = import.meta.env?.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9543073887536718';

function AdUnitComponent({
  slot = '9320506924',
  client = DEFAULT_CLIENT,
  variant = 'banner', // 'banner' | 'fluid' | 'in-article' | 'rectangle'
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

    const timeout = setTimeout(checkStatus, 3000);

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
        data-ad-format={isFluid || isInArticle ? 'fluid' : format}
        {...(isInArticle ? { 'data-ad-layout': 'in-article' } : {})}
        data-full-width-responsive="true"
      />
    </div>
  );
}

const AdUnit = React.memo(AdUnitComponent);
export default AdUnit;

