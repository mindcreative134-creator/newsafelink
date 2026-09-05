import React, { useEffect, useRef, useState } from 'react';

/**
 * Real Google AdSense AdUnit Component with High-Visibility Fallback
 * 
 * Renders official, compliant Google AdSense <ins> tags with ca-pub-9543073887536718.
 * Automatically pushes ads to window.adsbygoogle on mount.
 * When AdSense is unfilled (e.g. localhost, unapproved dev domains, adblockers),
 * seamlessly displays a premium sponsored ad creative so the slot is always filled and attractive.
 */
const DEFAULT_CLIENT = import.meta.env?.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9543073887536718';

const SPONSORED_ADS = [
  {
    tag: 'Official Portal',
    headline: 'Sarkari Job Free Practice Tests & Mock Exams',
    desc: 'Prepare for UPSC, SSC, Railways, Banking & State PSC with full-length verified question banks.',
    cta: 'Start Test Now',
    color: 'from-blue-600 to-indigo-600',
    url: 'https://biharhelp.in',
  },
  {
    tag: 'Govt Portal',
    headline: 'PM Direct Welfare Schemes & Citizen Benefits',
    desc: 'Check Aadhaar seeding, scholarship status, and direct installment bank transfer guidelines.',
    cta: 'Check Status',
    color: 'from-emerald-600 to-teal-600',
    url: 'https://pmkisan.gov.in',
  },
  {
    tag: 'Sponsored Gateway',
    headline: 'All-India University Admission & Entrance Portal',
    desc: 'Direct merit list, counseling updates, and registration guidelines for central universities.',
    cta: 'View Details',
    color: 'from-purple-600 to-indigo-600',
    url: 'https://cuet.samarth.ac.in',
  }
];

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
  const pushedRef = useRef(false);
  const [isAdFilled, setIsAdFilled] = useState(false);

  // Pick a stable fallback ad creative based on the slot number
  const adIndex = Math.abs(slot.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % SPONSORED_ADS.length;
  const sponsored = SPONSORED_ADS[adIndex];

  useEffect(() => {
    if (pushedRef.current) return;
    pushedRef.current = true;

    // Small delay to ensure DOM element is mounted before pushing to AdSense
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({});
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[AdSense] push handled:', err?.message || err);
        }
      }
    }, 100);

    // Check if Google AdSense rendered a live ad iframe
    const checkTimer = setTimeout(() => {
      if (insRef.current) {
        const iframe = insRef.current.querySelector('iframe');
        const status = insRef.current.getAttribute('data-ad-status');
        if (iframe || status === 'filled') {
          setIsAdFilled(true);
        }
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(checkTimer);
    };
  }, []);

  return (
    <div
      className={`ad-unit-wrapper w-full flex flex-col items-center justify-center my-1.5 select-none ${className}`}
      style={{ minHeight, ...style }}
    >
      <div className="w-full max-w-[728px] overflow-hidden text-center relative">
        {/* Real Official Google AdSense Tag */}
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{
            display: isAdFilled ? 'block' : 'none',
            width: '100%',
            minHeight,
            margin: '0 auto',
            textAlign: 'center',
          }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />

        {/* High-Converting Display Banner when AdSense is unfilled / local testing */}
        {!isAdFilled && (
          <a
            href={sponsored.url}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            data-google-vignette="false"
            className="group block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all p-3 sm:p-4 text-left overflow-hidden relative"
          >
            {/* Ad Badge */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                Sponsored Ad
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                {sponsored.tag}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {sponsored.headline}
                </h4>
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                  {sponsored.desc}
                </p>
              </div>

              <div className="shrink-0 self-start sm:self-auto">
                <span className={`inline-flex items-center px-3.5 py-1.5 rounded-lg bg-gradient-to-r ${sponsored.color} text-white font-bold text-xs uppercase tracking-wider shadow-sm group-hover:scale-105 transition-transform`}>
                  {sponsored.cta} ➔
                </span>
              </div>
            </div>
          </a>
        )}
      </div>
    </div>
  );
}

