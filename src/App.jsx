import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Category from './pages/Category';
import StaticPages from './pages/StaticPages';
import { useSafelink } from './context/SafelinkContext';
import AdUnit from './components/AdUnit';

export default function App() {
  const { currentStep } = useSafelink();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Top Banner Ad — visible during safelink flow only after popup verification */}
      {currentStep > 0 && sessionStorage.getItem('SAFELINK_POPUP_SHOWN') === 'true' && (
        <div className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AdUnit key={`global-top-ad-${currentStep}`} slot="7317709042" format="auto" minHeight="90px" />
          </div>
        </div>
      )}

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
