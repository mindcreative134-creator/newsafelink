import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, ChevronDown, Flame, Search, Bell, Sparkles } from 'lucide-react';
import { getPosts } from '../services/bloggerApi';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const navigate = useNavigate();

  // Ticker announcements list
  const tickerItems = [
    '🔥 SSC CGL Tier-1 Exam Results & Cutoff 2026 Declared',
    '📢 UPSC Civil Services Notification 2026 - Online Form Active',
    '🎯 Railway RRB Recruitment 2026: 12,000+ Vacancies Announced',
    '📝 SBI PO Prelims Answer Key & Response Sheet Out',
    '🎓 NEET UG Counseling Schedule & Seat Allotment Released'
  ];
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Toggle Dark Mode
  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    getPosts({ maxResults: 50 })
      .then((data) => {
        if (data.items) {
          const labelsSet = new Set();
          data.items.forEach((post) => {
            if (post.labels) {
              post.labels.forEach((label) => labelsSet.add(label));
            }
          });
          setCategories(Array.from(labelsSet));
        }
      })
      .catch(() => {
        setCategories(['Tech', 'Jobs', 'Admit Card', 'Results']);
      });
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category/${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchModal(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* ── Top Breaking News / Ticker Bar ── */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white text-xs border-b border-indigo-700/50 py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black tracking-wider text-[10px] uppercase shadow-sm shrink-0">
              <Flame className="w-3 h-3 text-red-600 fill-red-600 animate-pulse" /> LIVE ALERT
            </span>
            <div className="truncate font-medium text-zinc-100 transition-all duration-500">
              {tickerItems[tickerIndex]}
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-indigo-200 shrink-0">
            <span>📅 {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <a 
              href="https://t.me" 
              target="_blank" 
              rel="noreferrer" 
              className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-300" /> Join Telegram
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Sticky Header Navigation ── */}
      <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-3 group" aria-label="SarkariTrend Home">
                <img 
                  src="/favicon.svg" 
                  alt="SarkariTrend Logo" 
                  className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-300" 
                />
                <div className="flex flex-col leading-none">
                  <div className="flex items-baseline gap-px">
                    <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white font-heading leading-none">Sarkari</span>
                    <span className="text-xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 font-heading leading-none">Trend</span>
                  </div>
                  <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] mt-1">India's Govt Job Portal</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex space-x-7 items-center">
              <Link to="/" className="text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors duration-200">
                Home
              </Link>
              
              {/* Category Links Pill Dropdown */}
              <div className="relative group">
                <button className="flex items-center text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors duration-200 gap-1.5 py-2">
                  Categories <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 text-zinc-400" />
                </button>
                <div className="absolute left-0 mt-1 w-56 rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden p-2">
                  <div className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 px-3 py-1.5 tracking-wider">Explore Topics</div>
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/category/${encodeURIComponent(cat)}`}
                      className="block px-3 py-2 text-xs font-bold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>

              <Link to="/about" className="text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors duration-200">
                About Us
              </Link>

              <Link to="/contact" className="text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors duration-200">
                Contact
              </Link>
            </nav>

            {/* Right Action Icons & Dark Mode Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Trigger Button */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 text-xs font-semibold transition-all"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline font-medium text-zinc-500 dark:text-zinc-400">Search articles...</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 transition-all active:scale-95 shadow-sm"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-indigo-600" />}
              </button>

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 rounded-xl text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 transition-all"
                aria-label="Open Menu"
              >
                {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        {isOpen && (
          <div className="lg:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 py-4 px-5 space-y-3 shadow-xl">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-800 dark:text-zinc-100 hover:bg-indigo-50 dark:hover:bg-zinc-900 transition-colors"
            >
              🏠 Home
            </Link>
            
            <div className="font-black text-[10px] text-zinc-400 uppercase tracking-widest px-4 pt-2">
              Browse Categories
            </div>
            <div className="flex flex-wrap gap-2 px-2">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/category/${encodeURIComponent(cat)}`}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white transition-all"
                >
                  {cat}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-1">
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Search Modal ── */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl w-full max-w-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" /> Search Articles & Notifications
              </h3>
              <button 
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Type job, admit card, or exam name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
