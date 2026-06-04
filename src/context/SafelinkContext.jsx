import React, { createContext, useContext, useState, useEffect } from 'react';

const SafelinkContext = createContext();

export function SafelinkProvider({ children }) {
  const [targetUrl, setTargetUrl] = useState(() => sessionStorage.getItem('SAFE_L') || '');
  const [currentStep, setCurrentStep] = useState(() => Number(sessionStorage.getItem('SAFE_STEP')) || 0);

  const startSafelink = (url) => {
    // If the url is base64 encoded, decode it. Else, keep it as is.
    let decodedUrl = url;
    try {
      // Check if it's base64 (standard URL search)
      if (url.match(/^[A-Za-z0-9+/=]+$/)) {
        decodedUrl = atob(url);
      }
    } catch (e) {
      // Not base64
    }

    sessionStorage.setItem('SAFE_L', decodedUrl);
    sessionStorage.setItem('SAFE_STEP', '1');
    setTargetUrl(decodedUrl);
    setCurrentStep(1);
  };

  const nextStep = () => {
    const nextVal = currentStep + 1;
    if (nextVal <= 3) {
      sessionStorage.setItem('SAFE_STEP', String(nextVal));
      setCurrentStep(nextVal);
    }
  };

  const clearSafelink = () => {
    sessionStorage.removeItem('SAFE_L');
    sessionStorage.removeItem('SAFE_STEP');
    setTargetUrl('');
    setCurrentStep(0);
  };

  // Synchronize on load/changes
  useEffect(() => {
    const handleStorage = () => {
      setTargetUrl(sessionStorage.getItem('SAFE_L') || '');
      setCurrentStep(Number(sessionStorage.getItem('SAFE_STEP')) || 0);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <SafelinkContext.Provider value={{ targetUrl, currentStep, startSafelink, nextStep, clearSafelink }}>
      {children}
    </SafelinkContext.Provider>
  );
}

export function useSafelink() {
  return useContext(SafelinkContext);
}
