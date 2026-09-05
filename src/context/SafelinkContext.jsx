import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import defaultJobs from '../data/liveJobs.json';

const SafelinkContext = createContext();

export function SafelinkProvider({ children }) {
  const [targetUrl, setTargetUrl] = useState(() => sessionStorage.getItem('SAFE_L') || '');
  const [currentStep, setCurrentStep] = useState(() => Number(sessionStorage.getItem('SAFE_STEP')) || 0);
  const [step1Verified, setStep1Verified] = useState(() => sessionStorage.getItem('SAFE_S1_VERIFIED') === '1');
  const [step2TimerDone, setStep2TimerDone] = useState(false);
  const [step3TimerDone, setStep3TimerDone] = useState(false);

  // Helper to safely extract destination URL from varied query params / base64 payloads
  const extractDestination = (raw) => {
    if (!raw) return '';
    let candidate = raw;
    try {
      // Check if it's base64 encoded
      if (candidate.match(/^[A-Za-z0-9+/=]+$/) && candidate.length > 8) {
        const decoded = atob(candidate);
        // Check if decoded string is JSON (WP-Safelink format)
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

  // Auto-detect URL queries on page load or query change (?o=..., ?url=..., ?target=..., ?safelink=..., ?adlinkfly=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const oParam = params.get('o');
      const urlParam = params.get('url') || params.get('target') || params.get('link') || params.get('safelink');
      const adlinkflyParam = params.get('adlinkfly');
      const wpsafeParam = params.get('wpsafelink') || params.get('safelink_redirect') || params.get('go');
      const stepParam = Number(params.get('step'));

      let rawTarget = '';
      if (oParam) {
        rawTarget = `https://piko.site.je/?o=${oParam}`;
      } else if (urlParam) {
        rawTarget = urlParam;
      } else if (wpsafeParam) {
        rawTarget = extractDestination(wpsafeParam);
      } else if (adlinkflyParam) {
        rawTarget = `https://shortxlinks.com/${adlinkflyParam}`;
      }

      const finalDecoded = extractDestination(rawTarget);

      if (finalDecoded) {
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

