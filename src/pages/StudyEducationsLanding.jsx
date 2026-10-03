import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSafelink } from '../context/SafelinkContext';
import { getRandomSafelinkPost } from '../services/postService';
import AdUnit from '../components/AdUnit';
import { AD_CONFIG } from '../config/adConfig';

/**
 * Authentic TechMint Gateway Landing Page (/studyeducations)
 * 
 * Matches TechMint's gateway HTML:
 * - Title: Landing..
 * - Centered "Generating.... Please Wait." screen with Banner Ad
 * - Automatically initializes session cookies (uopusi)
 * - Auto-redirects to Step 1 or Step 2 Article after 1.5s
 */
export default function StudyEducationsLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { startSafelink, currentStep, totalSteps } = useSafelink();
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Animated dots
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('universtityeducations') || 
                  params.get('educationsscholorships') || 
                  params.get('sarkaritrend') || 
                  params.get('alias') || 
                  params.get('code') || 
                  params.get('url') || 
                  params.get('link') || 
                  params.get('target');

    const stepParam = Number(params.get('st')) || Number(params.get('step')) || 1;
    const dest = token ? (token.startsWith('http') ? token : `https://sarkaritrend.boats/${token}`) : 'https://sarkaritrend.boats/';

    // Set high-CPC ad keyword cookie (exact TechMint behavior)
    try {
      document.cookie = "uopusi=education%2Cloan%2Cinsurance%2Cjobvacancy; path=/; max-age=10000";
    } catch {}

    startSafelink(dest, stepParam, 2);

    // Redirect to a random post article after brief splash delay
    const redirectTimer = setTimeout(async () => {
      const chosenPost = await getRandomSafelinkPost();
      const postId = chosenPost?.id || 'emrs-teaching-post';
      navigate(`/post/${postId}?step=${stepParam}`, { replace: true });
    }, 1500);

    return () => clearTimeout(redirectTimer);
  }, [location.search, navigate, startSafelink]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      {/* Top Banner Ad */}
      <div className="w-full max-w-[728px] mb-8">
        <AdUnit variant="banner" slot={AD_CONFIG.SLOTS.TOP_BANNER} minHeight="90px" />
      </div>

      {/* TechMint Splash Box */}
      <div className="text-center p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm max-w-md w-full">
        <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
          Generating{dots}
        </h2>
        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-4">
          Please Wait...
        </p>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono">
          Securing Link Gateway
        </span>
      </div>

      {/* Bottom Banner Ad */}
      <div className="w-full max-w-[728px] mt-8">
        <AdUnit variant="banner" slot={AD_CONFIG.SLOTS.BELOW_VERIFY} minHeight="90px" />
      </div>
    </div>
  );
}
