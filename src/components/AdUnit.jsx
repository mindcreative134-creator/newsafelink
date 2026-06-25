import React, { useEffect, useRef } from 'react';

/**
 * Universal AdSense Ad Unit
 * Works reliably on mobile, tablet, and desktop.
 *
 * Props:
 *   slot     — AdSense ad-slot ID (string)
 *   format   — 'auto' | 'fluid' | 'autorelaxed'
 *   layout   — for fluid: 'in-article' (optional)
 *   layoutKey— for fluid in-feed: '-6t+ed+2i-1n-4w' (optional)
 *   style    — extra inline styles for outer wrapper (optional)
 */
const AD_CLIENT = 'ca-pub-9543073887536718';

export default function AdUnit({
  slot,
  format = 'auto',
  layout = '',
  layoutKey = '',
  style = {},
  minHeight = '120px',
}) {
  const insRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    let active = true;
    if (pushed.current) return;
    pushed.current = true;

    // Use rAF to ensure the DOM has painted and the element has real dimensions
    requestAnimationFrame(() => {
      if (!active) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense push error:', err);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const insProps = {
    className: 'adsbygoogle',
    style: { display: 'block', minWidth: 0, width: '100%' },
    'data-ad-client': AD_CLIENT,
    'data-ad-slot': slot,
    'data-ad-format': format,
    'data-full-width-responsive': 'true',
  };

  if (layout) insProps['data-ad-layout'] = layout;
  if (layoutKey) insProps['data-ad-layout-key'] = layoutKey;

  return (
    <div
      className="ad-unit-wrapper"
      style={{
        display: 'block',
        width: '100%',
        minWidth: 0,
        minHeight: minHeight,
        overflow: 'hidden',
        lineHeight: 0,
        fontSize: 0,
        ...style,
      }}
    >
      <ins ref={insRef} {...insProps} />
    </div>
  );
}
