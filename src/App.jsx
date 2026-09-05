import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Category from './pages/Category';
import StaticPages from './pages/StaticPages';
import StickyBottomAd from './components/StickyBottomAd';
import { useSafelink } from './context/SafelinkContext';

export default function App() {
  const { currentStep } = useSafelink();
  const location = useLocation();

  // Prevent Google AdSense from hijacking page navigation with empty full-screen Vignettes
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const clickable = e.target.closest('a, button, [role="button"]');
      if (clickable && !clickable.hasAttribute('data-google-vignette')) {
        clickable.setAttribute('data-google-vignette', 'false');
      }
    };
    document.addEventListener('click', handleGlobalClick, true);
    return () => document.removeEventListener('click', handleGlobalClick, true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
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

      {/* Persistent Sticky Bottom Banner Ad (matching stick-dt & stick-mob) */}
      <StickyBottomAd />
    </div>
  );
}
