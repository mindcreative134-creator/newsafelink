import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSafelink } from '../context/SafelinkContext';
import { getRandomSafelinkPost } from '../services/postService';
import AdUnit from '../components/AdUnit';
import { AD_CONFIG } from '../config/adConfig';

/**
 * Authentic TechMint Intermediary Step Router (/readmore)
 * 
 * In TechMint's architecture:
 * - Visiting /readmore validates the completed step.
 * - If Step 1 -> increments to Step 2 and redirects to a fresh Article.
 * - If Step 2 (Final) -> completes safelink verification and redirects to target destination.
 */
export default function ReadMoreHandler() {
  const navigate = useNavigate();
  const { currentStep, totalSteps, goToNextStep, completeAndRedirect, targetUrl } = useSafelink();

  useEffect(() => {
    const rawStep = Number(sessionStorage.getItem('SAFE_STEP')) || currentStep || 1;
    const maxSteps = Number(sessionStorage.getItem('SAFE_TOTAL_STEPS')) || totalSteps || 3;

    const timer = setTimeout(async () => {
      if (rawStep >= maxSteps) {
        // All steps completed! Redirect to destination
        const dest = sessionStorage.getItem('SAFE_L') || targetUrl || 'https://sarkaritrend.boats/';
        sessionStorage.removeItem('SAFE_L');
        sessionStorage.removeItem('SAFE_STEP');
        sessionStorage.removeItem('SAFE_S1_VERIFIED');
        window.location.href = dest;
      } else {
        // Move to Step 2
        const nextStep = rawStep + 1;
        sessionStorage.setItem('SAFE_STEP', String(nextStep));

        // Retrieve visited posts to pick an unvisited one
        let visited = [];
        try {
          visited = JSON.parse(sessionStorage.getItem('SAFE_VISITED') || '[]');
        } catch {}

        const chosenPost = await getRandomSafelinkPost(visited);
        if (!chosenPost?.id) {
          // No valid post found — go home rather than landing on a fake/spam page
          navigate('/', { replace: true });
          return;
        }
        const nextId = chosenPost.id;
        
        visited.push(nextId);
        sessionStorage.setItem('SAFE_VISITED', JSON.stringify(visited));

        navigate(`/post/${nextId}?step=${nextStep}`, { replace: true });
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [navigate, currentStep, totalSteps, targetUrl]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      {/* Banner Ad */}
      <div className="w-full max-w-[728px] mb-8">
        <AdUnit variant="banner" slot={AD_CONFIG.SLOTS.TOP_BANNER} minHeight="90px" />
      </div>

      <div className="text-center p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm max-w-md w-full">
        <div className="inline-block w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
          Verifying Progress...
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Redirecting to next step...
        </p>
      </div>

      {/* Banner Ad */}
      <div className="w-full max-w-[728px] mt-8">
        <AdUnit variant="banner" slot={AD_CONFIG.SLOTS.BELOW_VERIFY} minHeight="90px" />
      </div>
    </div>
  );
}
