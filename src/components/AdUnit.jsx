import React, { useEffect, useRef } from 'react';
import { AD_CONFIG } from '../config/adConfig';

// Exact specifications matching publisher ca-pub-9543073887536718 units in AdSense
const SLOT_SPECS = {
  // In-Feed Native Units (Require layout-key and format=fluid)
  '9320506924': {
    format: 'fluid',
    layoutKey: '-6t+ed+2i-1n-4w',
  },
  '1909584638': {
    format: 'fluid',
    layoutKey: '-6t+ed+2i-1n-4w',
  },
  // In-Article Native Units (Require data-ad-layout="in-article" and format=fluid)
  '4392273015': {
    format: 'fluid',
    layout: 'in-article',
  },
  '1641433819': {
    format: 'fluid',
    layout: 'in-article',
  },
  // Responsive Display Units (Require format=auto and full-width-responsive)
  '5754054742': {
    format: 'auto',
    fullWidthResponsive: true,
  },
  '7317709042': {
    format: 'auto',
    fullWidthResponsive: true,
  },
  // Multiplex Units
  '8617081290': {
    format: 'autorelaxed',
    fullWidthResponsive: true,
  },
  // Other verified units
  '4969186882': {
    format: 'auto',
    fullWidthResponsive: true,
  },
  '6529422128': {
    format: 'auto',
    fullWidthResponsive: true,
  },
};

/**
 * Authentic Ad Unit Component (TechMint Style)
 * 
 * 1. Clean, authentic Google AdSense container (ca-pub-9543073887536718).
 * 2. Matches exact required AdSense formats (in-article, in-feed layout keys, display responsive).
 * 3. Includes data-ad-host="ca-host-pub-1556223355139109" for Blogger hosted publisher accounts.
 * 4. Reliable (window.adsbygoogle = window.adsbygoogle || []).push({}) execution with full block width.
 * 5. Strictly displays authentic Google AdSense ads — NO mock cards, NO fake degree/scholarship fallbacks.
 */
function AdUnitComponent({
  slot = AD_CONFIG.SLOTS.TOP_BANNER,
  client = AD_CONFIG.CLIENT_ID,
  host = AD_CONFIG.HOST_ID || 'ca-host-pub-1556223355139109',
  variant,
  format,
  minHeight = 'auto',
  className = '',
  style = {},
}) {
  const insRef = useRef(null);
  const isPushedRef = useRef(false);

  // Derive specs
  const spec = SLOT_SPECS[slot] || {};
  const adFormat = format || spec.format || (variant === 'fluid' || variant === 'in-article' ? 'fluid' : 'auto');
  const layout = spec.layout || (variant === 'in-article' ? 'in-article' : undefined);
  const layoutKey = spec.layoutKey;
  const isResponsive = spec.fullWidthResponsive !== undefined ? spec.fullWidthResponsive : true;

  useEffect(() => {
    isPushedRef.current = false;

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
        console.debug('AdSense push caught:', err);
      }
    };

    const timer = setTimeout(pushAd, 80);

    return () => {
      clearTimeout(timer);
    };
  }, [slot]);

  const effectiveMinHeight = style.minHeight !== undefined ? style.minHeight : minHeight;

  return (
    <div
      className={`ad-container text-center mx-auto overflow-hidden clear-both ${className}`}
      style={{
        width: '100%',
        minHeight: effectiveMinHeight,
        display: 'block',
        textAlign: 'center',
        position: 'relative',
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
          minHeight: effectiveMinHeight,
          margin: '0 auto',
        }}
        data-ad-client={client}
        data-ad-host={host}
        data-ad-slot={slot}
        data-ad-format={adFormat}
        {...(layout ? { 'data-ad-layout': layout } : {})}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
        {...(isResponsive ? { 'data-full-width-responsive': 'true' } : {})}
      />
    </div>
  );
}

const AdUnit = React.memo(AdUnitComponent);
export default AdUnit;
