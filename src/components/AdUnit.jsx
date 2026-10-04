import React, { useState, useEffect, useRef } from 'react';
import { AD_CONFIG } from '../config/adConfig';

// High-converting sponsored fallback ads displayed whenever Google AdSense is unfilled or pending domain approval
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
    desc: 'Access verified government recruitment notifications, syllabus, exam patterns, and direct application links.',
    cta: 'View All Jobs ➔',
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=320&h=200&q=80',
    tag: 'Daily Updates',
    url: '/',
  },
  {
    badge: 'Yojana Portal 2026',
    title: 'Pradhan Mantri Awas & Central Welfare Schemes 2026 Registration',
    desc: 'Complete online beneficiary application portal, eligibility verification, and beneficiary list download.',
    cta: 'Apply Online ➔',
    img: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?auto=format&fit=crop&w=320&h=200&q=80',
    tag: 'Official Portal',
    url: 'https://myscheme.gov.in',
  }
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
 * Google AdSense Ad Unit Component
 *
 * Publisher: ca-pub-9543073887536718
 *
 * Features:
 * 1. Executes authentic Google AdSense responsive display ads with data-ad-client and data-ad-slot.
 * 2. Safely triggers (adsbygoogle = window.adsbygoogle || []).push({}).
 * 3. Observes AdSense status: if AdSense returns 'unfilled' (or on unapproved domains like Vercel preview,
 *    ad blocker, or network failure), automatically switches to high-converting sponsored ad card.
 * 4. Ensures ads above and below the Continue button and across all pages NEVER disappear or stay blank.
 */
function AdUnitComponent({
  slot = AD_CONFIG.SLOTS.TOP_BANNER,
  minHeight = '100px',
  style = {},
  className = '',
}) {
  const insRef = useRef(null);
  const [isUnfilled, setIsUnfilled] = useState(false);

  const effectiveMinHeight = style.minHeight || (minHeight && minHeight !== 'auto' ? minHeight : '100px');

  useEffect(() => {
    setIsUnfilled(false);
    const el = insRef.current;
    if (!el) return;

    // Check if AdSense already initialized this <ins>
    if (!el.getAttribute('data-adsbygoogle-status')) {
      const timer = setTimeout(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          // Silently catch push errors
        }
      }, 100);

      // Status observer for unfilled status
      let observer = null;
      try {
        observer = new MutationObserver(() => {
          const status = el.getAttribute('data-ad-status');
          const isHidden = el.style.display === 'none' || window.getComputedStyle(el).display === 'none';
          if (status === 'unfilled' || isHidden) {
            setIsUnfilled(true);
          } else if (status === 'filled' || el.querySelector('iframe')) {
            setIsUnfilled(false);
          }
        });
        observer.observe(el, { attributes: true, childList: true, subtree: true, attributeFilter: ['data-ad-status', 'style'] });
      } catch {}

      // Fallback timer: if AdSense doesn't populate creative within 2.5s (due to 403 on unapproved domain or ad blocker)
      const fallbackTimer = setTimeout(() => {
        if (el) {
          const status = el.getAttribute('data-ad-status');
          const hasCreative = el.querySelector('iframe') || (el.innerText && el.innerText.trim().length > 10);
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
    }
  }, [slot]);

  return (
    <div
      className={`adsense-unit ${className}`}
      style={{
        display: 'block',
        width: '100%',
        minHeight: isUnfilled ? 'auto' : effectiveMinHeight,
        textAlign: 'center',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{
          display: isUnfilled ? 'none' : 'block',
          width: '100%',
          minHeight: effectiveMinHeight,
          margin: '0 auto',
        }}
        data-ad-client={AD_CONFIG.CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />

      {isUnfilled && (
        <SponsoredFallbackCard slot={slot} />
      )}
    </div>
  );
}

const AdUnit = React.memo(AdUnitComponent);
export default AdUnit;
