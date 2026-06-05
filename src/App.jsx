import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSafelink } from './context/SafelinkContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Category from './pages/Category';
import StaticPages from './pages/StaticPages';
import StepHeader from './components/StepHeader';
import AdUnit from './components/AdUnit';

export default function App() {
  const { currentStep } = useSafelink();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Step indicator bar — sticky at absolute top when active */}
      <StepHeader />

      {/* Top Banner Ad — visible during safelink flow only */}
      {currentStep > 0 && (
        <div style={{ width: '100%', display: 'block', background: '#fff', borderBottom: '1px solid #e4e4e7', padding: '4px 0' }}>
          <div style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '0 16px', display: 'block' }}>
            <AdUnit slot="7317709042" format="auto" />
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Header />

      {/* Page Content */}
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
