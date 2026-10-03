import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import defaultJobs from '../data/liveJobs.json';
import { getRandomSafelinkPost } from '../services/postService';

const SafelinkContext = createContext();

export function SafelinkProvider({ children }) {
  const location = useLocation();

  const [targetUrl, setTargetUrl] = useState(() => sessionStorage.getItem('SAFE_L') || '');
  const [currentStep, setCurrentStep] = useState(() => Number(sessionStorage.getItem('SAFE_STEP')) || 0);
  const [isSafelinkActive, setIsSafelinkActive] = useState(() => sessionStorage.getItem('SAFE_ACTIVE') === '1');
  const [step1Verified, setStep1Verified] = useState(() => sessionStorage.getItem('SAFE_S1_VERIFIED') === '1');
  const [visitedPostIds, setVisitedPostIds] = useState(() => {
    try {
      const saved = sessionStorage.getItem('SAFE_VISITED');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [step2TimerDone, setStep2TimerDone] = useState(false);
  const [step3TimerDone, setStep3TimerDone] = useState(false);
  const [totalSteps, setTotalSteps] = useState(() => Number(sessionStorage.getItem('SAFE_TOTAL_STEPS')) || 3);

  // Helper to safely extract destination URL from varied query params / base64 payloads
  const extractDestination = (raw) => {
    if (!raw) return '';
    let candidate = raw;
    try {
      if (candidate.match(/^[A-Za-z0-9+/=]+$/) && candidate.length > 8) {
        const decoded = atob(candidate);
        if (decoded.startsWith('{') && decoded.endsWith('}')) {
          const parsed = JSON.parse(decoded);
          candidate = parsed.safelink || parsed.second_safelink_url || parsed.url || candidate;
        } else if (decoded.startsWith('http')) {
          candidate = decoded;
        }
      }
    } catch {}
    return candidate;
  };

  // Auto-detect URL queries and referrer to strictly distinguish shortener redirects from normal site visitors
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const oParam = params.get('o');
      const urlParam = params.get('url') || params.get('target') || params.get('link') || params.get('safelink') || params.get('dest');
      const adlinkflyParam = params.get('adlinkfly');
      const wpsafeParam = params.get('wpsafelink') || params.get('safelink_redirect') || params.get('go') || params.get('newwpsafelink');
      
      // Sarkaritrend.boats & TechMint-style Shortener Parameters
      const sarkariParam = params.get('sarkaritrend') || params.get('code') || params.get('alias') || params.get('short') || params.get('universtityeducations') || params.get('educationsscholorships');
      
      const stepParam = params.get('step') !== null ? Number(params.get('step')) : (params.get('st') !== null ? Number(params.get('st')) : null);
      const stepsConfigParam = Number(params.get('steps'));
      const activeTotalSteps = stepsConfigParam && stepsConfigParam >= 1 && stepsConfigParam <= 3 ? stepsConfigParam : 3;

      setTotalSteps(activeTotalSteps);
      sessionStorage.setItem('SAFE_TOTAL_STEPS', String(activeTotalSteps));

      const referrer = typeof document !== 'undefined' ? (document.referrer || '') : '';
      const isFromShortenerReferrer = referrer.includes('sarkaritrend') || referrer.includes('boats');

      // Check if this request has signals of being a shortener redirect
      const hasShortenerSignal = !!(sarkariParam || oParam || urlParam || wpsafeParam || adlinkflyParam || stepParam !== null || isFromShortenerReferrer);
      const hasExistingActiveSession = sessionStorage.getItem('SAFE_ACTIVE') === '1' && !!sessionStorage.getItem('SAFE_L');

      if (hasShortenerSignal || hasExistingActiveSession) {
        setIsSafelinkActive(true);
        sessionStorage.setItem('SAFE_ACTIVE', '1');

        let rawTarget = '';
        if (sarkariParam) {
          rawTarget = urlParam || (sarkariParam.startsWith('http') ? sarkariParam : `https://sarkaritrend.boats/${sarkariParam}`);
        } else if (oParam) {
          rawTarget = `https://piko.site.je/?o=${oParam}`;
        } else if (urlParam) {
          rawTarget = urlParam;
        } else if (wpsafeParam) {
          rawTarget = extractDestination(wpsafeParam);
        } else if (adlinkflyParam) {
          rawTarget = `https://sarkaritrend.boats/${adlinkflyParam}`;
        } else if (isFromShortenerReferrer && !rawTarget) {
          rawTarget = referrer || 'https://sarkaritrend.boats/';
        } else if (hasExistingActiveSession) {
          rawTarget = sessionStorage.getItem('SAFE_L');
        }

        const finalDecoded = extractDestination(rawTarget) || sessionStorage.getItem('SAFE_L') || 'https://sarkaritrend.boats/';
        sessionStorage.setItem('SAFE_L', finalDecoded);
        setTargetUrl(finalDecoded);

        // Inject High-CPC Ad keyword cookies
        try {
          document.cookie = "uopusi=education%2Cloan%2Cinsurance%2Cjobvacancy; path=/; max-age=10000";
        } catch {}

        let initialStep = 1;
        if (stepParam !== null && stepParam >= 1 && stepParam <= activeTotalSteps) {
          initialStep = stepParam;
        } else if (hasExistingActiveSession) {
          initialStep = Number(sessionStorage.getItem('SAFE_STEP')) || 1;
        }

        sessionStorage.setItem('SAFE_STEP', String(initialStep));
        setCurrentStep(initialStep);
        sessionStorage.setItem('SAFE_S1_VERIFIED', '1');
        setStep1Verified(true);
      } else {
        // Pure organic / normal visitor browsing the site directly: NO timer, NO popup, NO safelink
        setIsSafelinkActive(false);
        setCurrentStep(0);
        setTargetUrl('');
        sessionStorage.removeItem('SAFE_ACTIVE');
        sessionStorage.removeItem('SAFE_L');
        sessionStorage.removeItem('SAFE_STEP');
        sessionStorage.removeItem('SAFE_S1_VERIFIED');
        sessionStorage.removeItem('SAFE_VISITED');
        sessionStorage.removeItem('SAFE_POPUP_DONE');
        sessionStorage.removeItem('TECHMINT_POPUP_DISMISSED');
      }
    } catch {}
  }, [location.search]);

  const startSafelink = useCallback((url, step = 1, configSteps = 3) => {
    let decodedUrl = url;
    try {
      if (url && url.match(/^[A-Za-z0-9+/=]+$/) && url.length > 8) {
        decodedUrl = atob(url);
      }
    } catch {}

    const finalTarget = decodedUrl || 'https://sarkaritrend.boats/';
    sessionStorage.setItem('SAFE_ACTIVE', '1');
    sessionStorage.setItem('SAFE_L', finalTarget);
    sessionStorage.setItem('SAFE_STEP', String(step));
    sessionStorage.setItem('SAFE_TOTAL_STEPS', String(configSteps));
    sessionStorage.setItem('SAFE_S1_VERIFIED', '1');
    sessionStorage.removeItem('SAFE_VISITED');
    setIsSafelinkActive(true);
    setVisitedPostIds([]);
    setTargetUrl(finalTarget);
    setCurrentStep(step);
    setTotalSteps(configSteps);
    setStep1Verified(true);
    setStep2TimerDone(false);
    setStep3TimerDone(false);
  }, []);

  const markStep1Verified = useCallback(async (navigate, currentPostId = '') => {
    sessionStorage.setItem('SAFE_S1_VERIFIED', '1');
    setStep1Verified(true);
    setCurrentStep(1);
    sessionStorage.setItem('SAFE_STEP', '1');

    const chosenPost = await getRandomSafelinkPost([currentPostId]);
    const chosenId = chosenPost?.id || 'emrs-teaching-post';
    const updatedVisited = [chosenId];
    setVisitedPostIds(updatedVisited);
    sessionStorage.setItem('SAFE_VISITED', JSON.stringify(updatedVisited));

    if (navigate) {
      navigate(`/post/${chosenId}?step=1`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const clearSafelink = useCallback(() => {
    sessionStorage.removeItem('SAFE_ACTIVE');
    sessionStorage.removeItem('SAFE_L');
    sessionStorage.removeItem('SAFE_STEP');
    sessionStorage.removeItem('SAFE_S1_VERIFIED');
    sessionStorage.removeItem('SAFE_VISITED');
    sessionStorage.removeItem('SAFE_POPUP_DONE');
    sessionStorage.removeItem('TECHMINT_POPUP_DISMISSED');
    setIsSafelinkActive(false);
    setVisitedPostIds([]);
    setTargetUrl('');
    setCurrentStep(0);
    setStep1Verified(false);
    setStep2TimerDone(false);
    setStep3TimerDone(false);
  }, []);

  const completeAndRedirect = useCallback(() => {
    const dest = targetUrl || sessionStorage.getItem('SAFE_L') || 'https://sarkaritrend.boats/';
    clearSafelink();
    window.location.href = dest;
  }, [targetUrl, clearSafelink]);

  const goToNextStep = useCallback(async (navigate, currentPostId = '') => {
    const nextVal = currentStep + 1;
    if (nextVal > totalSteps) {
      completeAndRedirect();
      return;
    }

    sessionStorage.setItem('SAFE_STEP', String(nextVal));
    setCurrentStep(nextVal);

    const exclude = [currentPostId, ...visitedPostIds];
    const chosenPost = await getRandomSafelinkPost(exclude);
    const chosenId = chosenPost?.id || defaultJobs[0]?.id || 'emrs-teaching-post';

    const updatedVisited = [...visitedPostIds, chosenId];
    setVisitedPostIds(updatedVisited);
    sessionStorage.setItem('SAFE_VISITED', JSON.stringify(updatedVisited));

    if (navigate) {
      navigate(`/post/${chosenId}?step=${nextVal}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, totalSteps, visitedPostIds, completeAndRedirect]);

  return (
    <SafelinkContext.Provider
      value={{
        targetUrl,
        currentStep,
        totalSteps,
        isSafelinkActive,
        step1Verified,
        markStep1Verified,
        step2TimerDone,
        setStep2TimerDone,
        step3TimerDone,
        setStep3TimerDone,
        startSafelink,
        goToNextStep,
        clearSafelink,
        completeAndRedirect,
      }}
    >
      {children}
    </SafelinkContext.Provider>
  );
}

export function useSafelink() {
  return useContext(SafelinkContext);
}
