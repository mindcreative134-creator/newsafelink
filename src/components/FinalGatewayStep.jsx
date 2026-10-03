import React, { useState, useEffect } from 'react';
import { useSafelink } from '../context/SafelinkContext';
import AdUnit from './AdUnit';
import { ExternalLink, CheckCircle2, ShieldCheck, Sparkles, Heart } from 'lucide-react';

export default function FinalGatewayStep() {
  const { targetUrl, completeAndRedirect } = useSafelink();
  const [seconds, setSeconds] = useState(2);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGetLink = () => {
    completeAndRedirect();
  };


  return (
    <div className="w-full max-w-2xl mx-auto my-8 flex flex-col items-center text-center space-y-6 animate-fadeIn">
      
      {/* ── Top Ad Unit ── */}
      <div className="w-full overflow-hidden">
        <AdUnit variant="banner" slot="3056127394" minHeight="120px" />
      </div>

      {/* ── Exact Replica of Shortxlinks Final Content Box ── */}
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 sm:p-9 shadow-lg">
        
        {/* Friendly Heading & Subheading */}
        <div className="mb-6 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/40 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Link Decrypted &amp; Verified
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-heading tracking-tight flex items-center justify-center gap-2">
            Smile Please! <Heart className="w-6 h-6 text-rose-500 fill-rose-500 inline" />
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Enjoy every moment, because death is unexpected.
          </p>
        </div>

        {/* Countdown Box */}
        <div className="mb-6">
          {!isReady ? (
            <div className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-extrabold text-xl sm:text-2xl shadow-inner border border-zinc-200 dark:border-zinc-700">
              <span>{seconds}</span>
              <span className="text-xs sm:text-sm text-zinc-500 ml-2 font-medium">Seconds</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
              <span>Link is ready to open</span>
            </div>
          )}
        </div>

        {/* Action Button: Please Wait... -> Get Link */}
        <div>
          {!isReady ? (
            <button
              disabled
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-400 font-bold text-sm uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
            >
              <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              <span>Please wait...</span>
            </button>
          ) : (
            <button
              onClick={handleGetLink}
              id="waiting-btn"
              className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-base uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 mx-auto"
            >
              <span>Get Link</span>
              <ExternalLink className="w-5 h-5" />
            </button>
          )}
        </div>

      </div>

      {/* ── Mid Ad Unit ── */}
      <div className="w-full overflow-hidden">
        <AdUnit variant="banner" slot="9320506924" minHeight="120px" />
      </div>



    </div>
  );
}
