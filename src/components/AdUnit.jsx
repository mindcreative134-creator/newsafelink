import React, { useEffect, useRef } from 'react';
import { AD_CONFIG } from '../config/adConfig';

// Exact specifications matching publisher ca-pub-9543073887536718 units in AdSense
const SLOT_SPECS = {
  // In-Feed Native Units (Require layout-key and format=fluid)
  // These are Blogger-hosted native units — need data-ad-host
  '9320506924': {
    format: 'fluid',
    layoutKey: '-6t+ed+2i-1n-4w',
    needsHost: true,
  },
  '1909584638': {
    format: 'fluid',
    layoutKey: '-6t+ed+2i-1n-4w',
    needsHost: true,
  },
  // In-Article Native Units (Require data-ad-layout="in-article" and format=fluid)
  // These are Blogger-hosted native units — need data-ad-host
  '4392273015': {
    format: 'fluid',
    layout: 'in-article',
    needsHost: true,
  },
  '1641433819': {
    format: 'fluid',
    layout: 'in-article',
    needsHost: true,
  },
  // Standard Responsive Display Units (format=auto, full-width-responsive)
  // DO NOT use data-ad-host for display units on non-Blogger sites
  '5754054742': {
    format: 'auto',
    fullWidthResponsive: true,
    needsHost: false,
    minH: 100,
  },
  '7317709042': {
    format: 'auto',
    fullWidthResponsive: true,
    needsHost: false,
    minH: 100,
  },
  // Multiplex / Matched Content Units
  '8617081290': {
    format: 'autorelaxed',
    fullWidthResponsive: true,
    needsHost: false,
    minH: 250,
  },
  // Other verified display units
  '4969186882': {
    format: 'auto',
    fullWidthResponsive: true,
    needsHost: false,
    minH: 100,
  },
  '6529422128': {
    format: 'auto',
    fullWidthResponsive: true,
    needsHost: false,
    minH: 100,
  },
};

/**
 * Authentic Ad Unit Component (TechMint Style)
 *
 * Rules:
 * 1. Display (auto) slots: NO data-ad-host — host param blocks display ads on non-Blogger sites.
 * 2. Native (fluid) slots: use data-ad-host for Blogger-hosted publishers.
 * 3. Display slots always get a minimum height so AdSense can render into visible space.
 * 4. Strictly authentic Google AdSense — NO fake fallbacks, NO sponsored cards.
 */
function AdUnitComponent({
  slot = AD_CONFIG.SLOTS.TOP_BANNER,
  client = AD_CONFIG.CLIENT_ID,
  variant,
  format,
  minHeight,
  className = '',
  style = {},
}) {
  const insRef = useRef(null);
  const isPushedRef = useRef(false);

  // Derive specs from slot lookup
  const spec = SLOT_SPECS[slot] || {};
  const adFormat = format || spec.format || 'auto';
  const layout = spec.layout || (variant === 'in-article' ? 'in-article' : undefined);
  const layoutKey = spec.layoutKey;
  const isResponsive = spec.fullWidthResponsive !== undefined ? spec.fullWidthResponsive : true;

  // Only attach data-ad-host for native fluid units (Blogger-hosted)
  const useHost = spec.needsHost === true;
  const host = AD_CONFIG.HOST_ID || 'ca-host-pub-1556223355139109';

  // Minimum height: caller can override; otherwise use spec default; display slots get 100px min
  const effectiveMinHeight =
    style.minHeight !== undefined
      ? style.minHeight
      : minHeight !== undefined
      ? minHeight
      : spec.minH
      ? `${spec.minH}px`
      : adFormat === 'auto'
      ? '100px'   // display responsive needs visible space
      : 'auto';

  useEffect(() => {
    isPushedRef.current = false;

    const pushAd = () => {
      const el = insRef.current;
      if (!el) return;

      // If AdSense already processed this ins element, skip
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

    const timer = setTimeout(pushAd, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [slot]);

  return (
    <div
      className={`ad-container text-center mx-auto overflow-hidden clear-both ${className}`}
      style={{
        width: '100%',
        minHeight: effectiveMinHeight,
        display: 'block',
        textAlign: 'center',
        position: 'relative',
        ...style,
      }}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          minHeight: effectiveMinHeight,
          textAlign: 'center',
          margin: '0 auto',
        }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={adFormat}
        {...(useHost ? { 'data-ad-host': host } : {})}
        {...(layout ? { 'data-ad-layout': layout } : {})}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
        {...(isResponsive ? { 'data-full-width-responsive': 'true' } : {})}
      />
    </div>
  );
}

const AdUnit = React.memo(AdUnitComponent);
export default AdUnit;
