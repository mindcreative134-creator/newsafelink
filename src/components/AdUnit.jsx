import React, { useEffect, useRef } from 'react';

/**
 * Authentic Ad Unit Component (TechMint Style)
 * 
 * 1. Clean, native ad wrapper that mimics GeneratePress / TechMint ad inserter blocks.
 * 2. Does NOT show fake "Advertisement" labels when ads are empty or loading.
 * 3. Gracefully pushes to window.adsbygoogle queue.
 * 4. Zero artificial borders or empty gray dummy boxes.
 */

const DEFAULT_CLIENT = import.meta.env?.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9543073887536718';

function AdUnitComponent({
  slot = '9320506924',
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

    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      } catch (err) {
        // Silently catch adblock / loading exceptions
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [slot]);

  const isFluid = variant === 'fluid';
  const isInArticle = variant === 'in-article';

  return (
    <div
      className={`ad-container text-center overflow-hidden clear-both ${className}`}
      style={{ minHeight: minHeight || '90px', ...style }}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          minHeight: minHeight || '90px',
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
