import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import defaultJobs from '../data/liveJobs.json';

const SafelinkContext = createContext();

export function SafelinkProvider({ children }) {
  const [targetUrl, setTargetUrl] = useState(() => sessionStorage.getItem('SAFE_L') || '');
  const [currentStep, setCurrentStep] = useState(() => Number(sessionStorage.getItem('SAFE_STEP')) || 0);
  const [step1Verified, setStep1Verified] = useState(() => sessionStorage.getItem('SAFE_S1_VERIFIED') === '1');
  const [step2TimerDone, setStep2TimerDone] = useState(false);
  const [step3TimerDone, setStep3TimerDone] = useState(false);

  // Auto-detect URL queries on page load or query change (?o=..., ?url=..., ?target=..., ?step=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const oParam = params.get('o');
      const urlParam = params.get('url') || params.get('target') || params.get('link');
      const stepParam = Number(params.get('step'));

      let detectedTarget = '';
      if (oParam) {
        detectedTarget = `https://piko.site.je/?o=${oParam}`;
      } else if (urlParam) {
        detectedTarget = urlParam;
      }

      if (detectedTarget) {
        // Decode base64 if passed as base64 string
        let finalDecoded = detectedTarget;
        try {
          if (detectedTarget.match(/^[A-Za-z0-9+/=]+$/) && detectedTarget.length > 8) {
            finalDecoded = atob(detectedTarget);
          }
        } catch {}

        sessionStorage.setItem('SAFE_L', finalDecoded);
        setTargetUrl(finalDecoded);

        const initialStep = (stepParam >= 1 && stepParam <= 3) ? stepParam : 1;
        sessionStorage.setItem('SAFE_STEP', String(initialStep));
        setCurrentStep(initialStep);
      } else if (stepParam >= 1 && stepParam <= 3) {
        setCurrentStep(stepParam);
        sessionStorage.setItem('SAFE_STEP', String(stepParam));
      }
    } catch {}
  }, []);

  const startSafelink = useCallback((url, step = 1) => {
    let decodedUrl = url;
    try {
      if (url && url.match(/^[A-Za-z0-9+/=]+$/) && url.length > 8) {
        decodedUrl = atob(url);
      }
    } catch {}

    sessionStorage.setItem('SAFE_L', decodedUrl || '');
    sessionStorage.setItem('SAFE_STEP', String(step));
    sessionStorage.removeItem('SAFE_S1_VERIFIED');
    setTargetUrl(decodedUrl || '');
    setCurrentStep(step);
    setStep1Verified(false);
    setStep2TimerDone(false);
    setStep3TimerDone(false);
  }, []);

  const markStep1Verified = useCallback(() => {
    sessionStorage.setItem('SAFE_S1_VERIFIED', '1');
    setStep1Verified(true);
  }, []);

  const goToNextStep = useCallback((navigate, currentPostId = '') => {
    const nextVal = currentStep + 1;
    if (nextVal > 3) return;

    sessionStorage.setItem('SAFE_STEP', String(nextVal));
    setCurrentStep(nextVal);

    // Pick a random real post from live jobs so it looks 100% natural
    const postsPool = (defaultJobs && defaultJobs.length > 0) ? defaultJobs : [];
    const candidates = postsPool.filter(p => p && p.id !== currentPostId);
    const chosenPost = (candidates.length > 0)
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : (postsPool[0] || { id: 'emrs-teaching-post' });

    if (navigate) {
      navigate(`/post/${chosenPost.id}?step=${nextVal}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const clearSafelink = useCallback(() => {
    sessionStorage.removeItem('SAFE_L');
    sessionStorage.removeItem('SAFE_STEP');
    sessionStorage.removeItem('SAFE_S1_VERIFIED');
    setTargetUrl('');
    setCurrentStep(0);
    setStep1Verified(false);
    setStep2TimerDone(false);
    setStep3TimerDone(false);
  }, []);

  const completeAndRedirect = useCallback(() => {
    const dest = targetUrl || sessionStorage.getItem('SAFE_L');
    if (dest) {
      clearSafelink();
      window.location.href = dest;
    }
  }, [targetUrl, clearSafelink]);

  return (
    <SafelinkContext.Provider
      value={{
        targetUrl,
        currentStep,
        isSafelinkActive: currentStep > 0 && Boolean(targetUrl || sessionStorage.getItem('SAFE_L')),
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

