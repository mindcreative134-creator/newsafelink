import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Category from './pages/Category';
import StaticPages from './pages/StaticPages';
import { useSafelink } from './context/SafelinkContext';
import AdUnit from './components/AdUnit';
import StickyAnchorAd from './components/StickyAnchorAd';

export default function App() {
  const { currentStep } = useSafelink();
  const location = useLocation();

  // Determine if static policy pages (keep them clean for AdSense approval policy)
  const isStaticPage = ['/privacy-policy', '/disclaimer', '/terms-conditions', '/contact'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200 pb-14 sm:pb-16">
      {/* Dynamic Navigation Header */}
      <Header />

      {/* ── BiharHelp-Style Top Leaderboard Banner (Below Header) ── */}
      {!isStaticPage && (
        <div className="w-full bg-white/70 dark:bg-zinc-900/70 border-b border-zinc-200/70 dark:border-zinc-800/70 py-2 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
            <AdUnit
              key={`header-leaderboard-${location.pathname}-${currentStep}`}
              variant="leaderboard"
              slot="7317709042"
              className="!my-1"
            />
          </div>
        </div>
      )}

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

      {/* ── BiharHelp-Style Sticky Bottom Anchor Ad ── */}
      {!isStaticPage && <StickyAnchorAd slot="7317709042" />}
    </div>
  );
}
