import React, { useEffect, useRef, useState } from 'react';
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

// High-CTR authentic sponsored fallbacks displayed whenever AdSense returns unfilled
const SPONSORED_FALLBACKS = [
  {
    badge: 'Govt Scholarship 2026',
    title: 'PM Vidya & National Higher Education Aid: Direct Grant Portal 2026',
    desc: 'Check eligibility criteria, required documents, and online direct registration guide for all students.',
    cta: 'Check Eligibility ➔',
    img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=320&h=200&q=80',
    tag: 'National Portal',
    url: 'https://myscheme.gov.in',
  },
  {
    badge: 'Education Finance',
    title: 'Zero-Collateral Education Loans & Subsidized Interest Rates Guide',
    desc: 'Official central interest subsidy scheme details for undergraduate and postgraduate aspirants.',
    cta: 'View Guidelines ➔',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=320&h=200&q=80',
    tag: 'Financial Aid',
    url: 'https://myscheme.gov.in',
  },
  {
    badge: 'Online Degree 2026',
    title: 'Highest Paying Online Degrees & Certifications: 100% Flexible Programs',
    desc: 'Explore top accredited universities offering computer science, management, and healthcare credentials.',
    cta: 'Explore Programs ➔',
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=320&h=200&q=80',
    tag: 'Accredited 2026',
    url: 'https://myscheme.gov.in',
  },
  {
    badge: 'Job Notification',
    title: 'Instant Sarkari Job Updates & Admit Card Alerts Portal',
    desc: 'Access verified government recruitment notifications, syllabus, exam patterns, and direct links.',
    cta: 'View All Jobs ➔',
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=320&h=200&q=80',
    tag: 'Daily Updates',
    url: '/',
  },
];

function SponsoredFallbackCard({ slot }) {
  const hash = String(slot || '5754054742')
    .split('')
    .reduce((acc, c, idx) => acc + c.charCodeAt(0) * (idx + 1), 0);
  const ad = SPONSORED_FALLBACKS[hash % SPONSORED_FALLBACKS.length];

  return (
    <a
      href={ad.url}
      target={ad.url.startsWith('http') ? '_blank' : '_self'}
      rel="noopener noreferrer"
      className="techmint-fallback-ad-card group block text-left"
    >
      <div className="techmint-fallback-ad-badge-row">
        <span className="techmint-fallback-ad-tag">Ad</span>
        <span className="techmint-fallback-ad-category">{ad.badge}</span>
      </div>
      <div className="techmint-fallback-ad-content">
        <div className="techmint-fallback-ad-thumb">
          <img src={ad.img} alt={ad.title} loading="lazy" />
        </div>
        <div className="techmint-fallback-ad-text">
          <h4 className="techmint-fallback-ad-title">{ad.title}</h4>
          <p className="techmint-fallback-ad-desc">{ad.desc}</p>
          <div className="techmint-fallback-ad-cta-row">
            <span className="techmint-fallback-ad-sub">{ad.tag}</span>
            <span className="techmint-fallback-ad-btn">{ad.cta}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

/**
 * Authentic Ad Unit Component (TechMint Style)
 * 
 * 1. Clean, native Google AdSense container (ca-pub-9543073887536718).
 * 2. Matches exact required AdSense formats (in-article, in-feed layout keys, display responsive).
 * 3. Includes data-ad-host="ca-host-pub-1556223355139109" for Blogger hosted publisher accounts.
 * 4. Reliable (window.adsbygoogle = window.adsbygoogle || []).push({}) execution with full block width.
 * 5. If Google marks slot as unfilled, renders high-CTR sponsored fallback so ads NEVER disappear.
 */
function AdUnitComponent({
  slot = AD_CONFIG.SLOTS.TOP_BANNER,
  client = AD_CONFIG.CLIENT_ID,
  host = AD_CONFIG.HOST_ID || 'ca-host-pub-1556223355139109',
  variant,
  format,
  minHeight = '250px',
  className = '',
  style = {},
}) {
  const insRef = useRef(null);
  const isPushedRef = useRef(false);
  const [isUnfilled, setIsUnfilled] = useState(false);

  // Derive specs
  const spec = SLOT_SPECS[slot] || {};
  const adFormat = format || spec.format || (variant === 'fluid' || variant === 'in-article' ? 'fluid' : 'auto');
  const layout = spec.layout || (variant === 'in-article' ? 'in-article' : undefined);
  const layoutKey = spec.layoutKey;
  const isResponsive = spec.fullWidthResponsive !== undefined ? spec.fullWidthResponsive : true;

  useEffect(() => {
    isPushedRef.current = false;
    setIsUnfilled(false);

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

    // Watch for AdSense status changes
    let observer = null;
    const el = insRef.current;
    if (el) {
      observer = new MutationObserver(() => {
        const status = el.getAttribute('data-ad-status');
        if (status === 'unfilled') {
          setIsUnfilled(true);
        } else if (status === 'filled' || status === 'unfill-optimized' || el.querySelector('iframe') || el.querySelector('.google-aiuf')) {
          setIsUnfilled(false);
        }
      });
      observer.observe(el, { attributes: true, childList: true, subtree: true, attributeFilter: ['data-ad-status'] });
    }

    // Fallback timer: if AdSense returns unfilled or fails to populate after 2.5s, display sponsored unit
    const fallbackTimer = setTimeout(() => {
      if (insRef.current) {
        const status = insRef.current.getAttribute('data-ad-status');
        const hasCreative = insRef.current.querySelector('iframe') || insRef.current.querySelector('.google-aiuf') || (insRef.current.innerText && insRef.current.innerText.trim().length > 10);
        if (status === 'unfilled' || (!hasCreative && status !== 'filled')) {
          setIsUnfilled(true);
        }
      }
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
      if (observer) observer.disconnect();
    };
  }, [slot]);

  const effectiveMinHeight = style.minHeight !== undefined ? style.minHeight : minHeight;

  return (
    <div
      className={`ad-container text-center mx-auto overflow-hidden clear-both ${className}`}
      style={{
        width: '100%',
        minHeight: isUnfilled ? 'auto' : effectiveMinHeight,
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
          display: isUnfilled ? 'none' : 'block',
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

      {isUnfilled && (
        <SponsoredFallbackCard slot={slot} />
      )}
    </div>
  );
}

const AdUnit = React.memo(AdUnitComponent);
export default AdUnit;
