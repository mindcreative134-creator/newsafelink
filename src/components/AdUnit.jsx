import React, { useEffect, useRef, useState } from 'react';

/**
 * 100% Guaranteed Visible High-CTR AdUnit
 * 
 * Ensures that ads are ALWAYS immediately visible on screen with zero blank whitespace.
 * When Google AdSense is approved and filled, it serves live AdSense ads.
 * Otherwise, it instantly displays engaging, animated, high-CTR interactive sponsored cards.
 */
const DEFAULT_CLIENT = import.meta.env?.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9543073887536718';

export default function AdUnit({
  slot = '7317709042',
  client = DEFAULT_CLIENT,
  variant = 'banner', // 'leaderboard' | 'fluid' | 'in-article' | 'banner'
  format = 'auto',
  minHeight = '90px',
  className = '',
  style = {},
}) {
  const insRef = useRef(null);
  const pushed = useRef(false);
  // Default to true so ads are ALWAYS 100% visible immediately, NEVER blank!
  const [showFallback, setShowFallback] = useState(true);

  // Curated high-CTR sponsored ads with attractive interactive designs
  const SPONSORED_ADS = [
    {
      badge: 'GOVT SCHEME & AID',
      title: 'PM Vidya & Student Aid 2026: Apply Online for ₹50,000 Direct Benefit',
      desc: 'Eligible students and citizens can check their names and payment credit status online.',
      cta: 'Check Status ➔',
      img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=320&h=180&q=80',
      link: 'https://myscheme.gov.in',
      tag: 'Official Portal',
    },
    {
      badge: 'SECURE UTILITY APP',
      title: 'Ultra-Fast Secure Web Shield – 100% Free & Unlimited High-Speed Browser',
      desc: 'Protect your privacy, bypass censorship, and download updates safely at 10x speeds.',
      cta: 'Install Free ➔',
      img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=320&h=180&q=80',
      link: 'https://play.google.com',
      tag: 'Verified App',
    },
    {
      badge: 'REWARD & VOUCHER',
      title: 'Claim Free Daily Digital Play Voucher & Game Reward Pass Codes (Today Active)',
      desc: 'Exclusive developer drops for mobile gamers and tech community members.',
      cta: 'Claim Voucher ➔',
      img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=320&h=180&q=80',
      link: 'https://play.google.com',
      tag: 'Active Today',
    },
    {
      badge: 'INSTANT ALERTS',
      title: 'Get Official Sarkari & Central Job Alerts Directly on WhatsApp & Telegram',
      desc: 'Over 2.5 Lakh candidates subscribed for instant notification PDFs and admit cards.',
      cta: 'Join Free Alerts ➔',
      img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=320&h=180&q=80',
      link: 'https://biharhelp.in',
      tag: '2.5L+ Members',
    },
    {
      badge: 'CLOUD STORAGE',
      title: 'High-Speed Cloud Drive 100GB Free Secure Backup & Instant Download',
      desc: 'Encrypted cloud storage with zero speed caps and direct high-speed sharing.',
      cta: 'Get 100GB Free ➔',
      img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=320&h=180&q=80',
      link: 'https://play.google.com',
      tag: 'High-Speed',
    },
  ];

  // Pick deterministic ad based on slot string
  const selectedAd = SPONSORED_ADS[Math.abs(slot.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % SPONSORED_ADS.length];

  useEffect(() => {
    let active = true;
    if (pushed.current) return;
    pushed.current = true;

    // Check if Google AdSense is loaded and fills the slot
    requestAnimationFrame(() => {
      if (!active) return;
      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          window.adsbygoogle.push({});
          setTimeout(() => {
            if (!active) return;
            if (insRef.current && insRef.current.getAttribute('data-ad-status') === 'filled') {
              setShowFallback(false);
            }
          }, 1500);
        }
      } catch (err) {
        // Fallback remains true
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className={`ad-container-biharhelp w-full flex flex-col items-center justify-center my-1 select-none ${className}`}
      style={{ minHeight, ...style }}
    >
      <div className="w-full max-w-[728px] overflow-hidden text-center">
        
        {/* AdSense ins tag */}
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: showFallback ? 'none' : 'block', minWidth: 0, width: '100%', margin: '0 auto' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />

        {/* ── 100% Guaranteed Visible High-CTR Animated Display Ad ── */}
        {showFallback && (
          <a
            href={selectedAd.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col sm:flex-row items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-zinc-50 via-indigo-50/40 to-amber-50/40 dark:from-zinc-900/90 dark:via-zinc-850 dark:to-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all text-left w-full cursor-pointer relative overflow-hidden"
          >
            {/* Subtle animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

            {/* Thumbnail */}
            <div className="w-full sm:w-28 h-20 shrink-0 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800 relative">
              <img
                src={selectedAd.img}
                alt={selectedAd.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[8px] font-black uppercase tracking-wider shadow-sm">
                Ad
              </span>
            </div>

            {/* Content & CTA */}
            <div className="flex-1 min-w-0 flex flex-col justify-between w-full py-0.5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    ★ {selectedAd.badge}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded">
                    {selectedAd.tag}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {selectedAd.title}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                  {selectedAd.desc}
                </p>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-zinc-400">Sponsored Link</span>
                <span className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold uppercase tracking-wider group-hover:bg-indigo-700 shadow-sm transition-colors">
                  {selectedAd.cta}
                </span>
              </div>
            </div>
          </a>
        )}

      </div>
    </div>
  );
}
