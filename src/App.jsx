import React, { useRef, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSafelink } from './context/SafelinkContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Category from './pages/Category';
import StaticPages from './pages/StaticPages';
import StepHeader from './components/StepHeader';

// ── Top Header Ad Slot ───────────────────────────────────────────────────────
function HeaderAdSlot() {
  const ref = useRef(null);
  useEffect(() => {
    const ins = ref.current;
    if (!ins || ins.getAttribute('data-ad-status')) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {}
  }, []);

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 py-1 flex justify-center items-center overflow-hidden">
      <div className="max-w-7xl w-full px-4 adsense-container">
        <ins
          ref={ref}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="ca-pub-9543073887536718"
          data-ad-slot="7317709042"
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

export default function App() {
  const { currentStep } = useSafelink();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Step Header at the absolute top of screen */}
      <StepHeader />

      {/* Top Banner Ad above navigation header - only visible during active safelink redirection */}
      {currentStep > 0 && <HeaderAdSlot />}

      {/* Dynamic Navigation Header */}
      <Header />

      {/* Main Page Area */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="/category/:label" element={<Category />} />
          <Route path="/about" element={<StaticPages type="about" />} />
          <Route path="/contact" element={<StaticPages type="contact" />} />
          <Route path="/privacy-policy" element={<StaticPages type="privacy" />} />
          <Route path="/disclaimer" element={<StaticPages type="disclaimer" />} />
          <Route path="/terms-conditions" element={<StaticPages type="terms" />} />
        </Routes>
      </div>

      {/* Policy compliant Footer */}
      <Footer />
    </div>
  );
}
