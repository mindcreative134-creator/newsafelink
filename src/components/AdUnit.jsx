import React, { useEffect, useRef, useState } from 'react';

/**
 * 1:1 BiharHelp-Style Google AdSense AdUnit
 * 
 * Supports all high-CTR placement variants seen on BiharHelp.in:
 * - 'leaderboard': Top below-header horizontal banner (728x90 desktop / 320x50 mobile)
 * - 'fluid': Native In-Feed card with layout-key (BiharHelp Ad #1)
 * - 'in-article': Native In-Article ad between paragraphs (BiharHelp Ad #2)
 * - 'pre-link': High-CTR action banner above official download/apply links (BiharHelp Ad #3)
 * - 'sidebar': Standard 300x250 medium rectangle
 * - 'sticky-sidebar': 300x600 or 300x250 unit that sticks while scrolling long articles
 */
const DEFAULT_CLIENT = import.meta.env?.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9543073887536718';

export default function AdUnit({
  slot = '7317709042',
  client = DEFAULT_CLIENT,
  variant = 'banner', // 'leaderboard' | 'fluid' | 'in-article' | 'pre-link' | 'sidebar' | 'sticky-sidebar' | 'banner'
  format,
  layout = '',
  layoutKey = '',
  style = {},
  minHeight,
  fullWidthResponsive = 'true',
  showLabel = true,
  className = '',
}) {
  const insRef = useRef(null);
  const pushed = useRef(false);
  const [adLoaded, setAdLoaded] = useState(false);

  // Variant-specific sensible defaults matching BiharHelp
  let finalFormat = format;
  let finalLayout = layout;
  let finalLayoutKey = layoutKey;
  let finalMinHeight = minHeight;
  let containerMaxW = 'max-w-4xl';

  switch (variant) {
    case 'leaderboard':
      finalFormat = finalFormat || 'auto';
      finalMinHeight = finalMinHeight || '90px';
      containerMaxW = 'max-w-5xl';
      break;
    case 'fluid':
      finalFormat = finalFormat || 'fluid';
      finalLayoutKey = finalLayoutKey || '-6t+ed+2i-1n-4w';
      finalMinHeight = finalMinHeight || '130px';
      containerMaxW = 'max-w-4xl';
      break;
    case 'in-article':
      finalFormat = finalFormat || 'fluid';
      finalLayout = finalLayout || 'in-article';
      finalMinHeight = finalMinHeight || '140px';
      containerMaxW = 'max-w-3xl';
      break;
    case 'pre-link':
      finalFormat = finalFormat || 'auto';
      finalMinHeight = finalMinHeight || '120px';
      containerMaxW = 'max-w-4xl';
      break;
    case 'sidebar':
      finalFormat = finalFormat || 'auto';
      finalMinHeight = finalMinHeight || '250px';
      containerMaxW = 'max-w-sm';
      break;
    case 'sticky-sidebar':
      finalFormat = finalFormat || 'auto';
      finalMinHeight = finalMinHeight || '300px';
      containerMaxW = 'max-w-sm';
      break;
    default:
      finalFormat = finalFormat || 'auto';
      finalMinHeight = finalMinHeight || '100px';
  }

  const [showFallback, setShowFallback] = useState(false);

  // Curated high-CTR sponsored promotions for instant engagement & conversions
  const SPONSORED_ADS = [
    {
      badge: 'GOVT SCHEME & AID',
      title: 'PM Vidya & Student Aid 2026: Apply Online for ₹50,000 Direct Benefit',
      desc: 'Eligible students and citizens can check their names and payment credit status online.',
      cta: 'Check Status ➔',
      img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=300&h=180&q=80',
      link: 'https://myscheme.gov.in',
    },
    {
      badge: 'SECURE UTILITY APP',
      title: 'Ultra-Fast Secure Web Shield – 100% Free & Unlimited High-Speed Browser',
      desc: 'Protect your privacy, bypass censorship, and download updates safely at 10x speeds.',
      cta: 'Install Free ➔',
      img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&h=180&q=80',
      link: 'https://play.google.com',
    },
    {
      badge: 'REWARD & VOUCHER',
      title: 'Claim Free Daily Digital Play Voucher & Game Reward Pass Codes (Today Active)',
      desc: 'Exclusive developer drops for mobile gamers and tech community members.',
      cta: 'Claim Voucher ➔',
      img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&h=180&q=80',
      link: 'https://play.google.com',
    },
    {
      badge: 'INSTANT ALERTS',
      title: 'Get Official Sarkari & Central Job Alerts Directly on WhatsApp & Telegram',
      desc: 'Over 2.5 Lakh candidates subscribed for instant notification PDFs and admit cards.',
      cta: 'Join Free Alerts ➔',
      img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&h=180&q=80',
      link: 'https://biharhelp.in',
    },
  ];

  const selectedAd = SPONSORED_ADS[Math.abs(slot.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % SPONSORED_ADS.length];

  useEffect(() => {
    let active = true;
    if (pushed.current) return;
    pushed.current = true;

    requestAnimationFrame(() => {
      if (!active) return;
      try {
        if (typeof window !== 'undefined') {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setTimeout(() => {
            if (!active) return;
            if (insRef.current && insRef.current.getAttribute('data-ad-status') === 'filled') {
              setAdLoaded(true);
              setShowFallback(false);
            } else if (insRef.current && (!insRef.current.innerHTML || insRef.current.clientHeight < 30)) {
              setShowFallback(true);
            }
          }, 1200);
        }
      } catch (err) {
        setShowFallback(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const insProps = {
    className: 'adsbygoogle',
    style: { display: showFallback ? 'none' : 'block', minWidth: 0, width: '100%', margin: '0 auto' },
    'data-ad-client': client,
    'data-ad-slot': slot,
    'data-ad-format': finalFormat,
    'data-full-width-responsive': fullWidthResponsive,
  };

  if (finalLayout) insProps['data-ad-layout'] = finalLayout;
  if (finalLayoutKey) insProps['data-ad-layout-key'] = finalLayoutKey;

  const isSticky = variant === 'sticky-sidebar';

  return (
    <div
      className={`ad-container-biharhelp my-3 w-full flex flex-col items-center justify-center ${
        isSticky ? 'sticky top-20 z-20' : ''
      } ${className}`}
      style={{ minHeight: finalMinHeight, ...style }}
    >
      {showLabel && (
        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1 select-none flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/80 animate-pulse"></span>
          <span>Sponsored Advertisement</span>
        </div>
      )}
      <div
        className={`ad-unit-inner w-full ${containerMaxW} overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 transition-all shadow-sm hover:shadow-md`}
      >
        <ins ref={insRef} {...insProps} />

        {/* High-CTR Interactive Fallback Card (renders when AdSense hasn't served, ensuring 100% clickable ads & revenue) */}
        {showFallback && (
          <a
            href={selectedAd.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col sm:flex-row items-center gap-3.5 p-3 rounded-xl bg-gradient-to-br from-indigo-50/50 via-white to-amber-50/30 dark:from-zinc-800/80 dark:via-zinc-900 dark:to-zinc-800/50 border border-indigo-100 dark:border-zinc-700/60 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all text-left w-full cursor-pointer"
          >
            <div className="w-full sm:w-28 h-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 relative">
              <img
                src={selectedAd.img}
                alt={selectedAd.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[8px] font-black uppercase tracking-wider shadow">
                Ad
              </span>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between w-full">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  ★ {selectedAd.badge}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-0.5">
                  {selectedAd.title}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-1">
                  {selectedAd.desc}
                </p>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-zinc-400">Verified Partner</span>
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
