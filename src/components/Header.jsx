import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, ChevronDown, Flame, Search, Send, Briefcase, FileCheck, Award, BookOpen } from 'lucide-react';
import { getPosts } from '../services/bloggerApi';
import { searchUpdates } from '../services/rssService';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const navigate = useNavigate();

  // Breaking news ticker items
  const tickerItems = [
    '🔥 SSC CGL 2026 Notification Released: 14,500+ Group B & C Vacancies',
    '📢 Railway RRB ALP & Technician 2026: 18,799 Posts Apply Online',
    '🎯 UPSC Civil Services Prelims 2026 Admit Card & Exam Guidelines Out',
    '📝 SBI PO Prelims 2026 Results & Cutoff Marks Declared',
    '⚡ UP Police Constable Official Answer Key Released - Check Score'
  ];
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [tickerItems.length]);

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
        setCategories(['Latest Jobs', 'Admit Cards', 'Results', 'Answer Key', 'Syllabus', 'Tech']);
      });
  }, []);

  // Live search inside modal
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchUpdates(searchQuery);
      setSearchResults(results.slice(0, 6));
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-950 text-white text-xs border-b border-indigo-800/40 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 overflow-hidden flex-1">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black tracking-wider text-[10px] uppercase shadow-sm shrink-0">
              <Flame className="w-3 h-3 text-red-600 fill-red-600 animate-pulse" /> LIVE
            </span>
            <div className="truncate font-semibold text-zinc-100 text-xs sm:text-[13px] transition-all duration-500">
              {tickerItems[tickerIndex]}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-indigo-200 shrink-0">
            <span className="hidden md:inline">📅 {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <a 
              href="https://t.me" 
              target="_blank" 
              rel="noreferrer" 
              className="px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center gap-1.5 shadow-sm text-xs"
            >
              <Send className="w-3 h-3 text-amber-300" /> Join Telegram
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Header ── */}
      <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-3 group" aria-label="SarkariTrend Home">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-heading font-black text-xl shadow-lg shadow-indigo-500/25 group-hover:scale-105 group-hover:rotate-3 transition-transform">
                  ST
                </div>
                <div className="flex flex-col leading-none">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white font-heading leading-none">
                      Sarkari
                    </span>
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 font-heading leading-none">
                      Trend
                    </span>
                  </div>
                  <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.22em] mt-1">
                    Official Career & News
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex space-x-6 items-center">
              <Link 
                to="/" 
                className="text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors duration-200"
              >
                Home
              </Link>

              <Link 
                to="/category/Latest%20Jobs" 
                className="text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors duration-200 flex items-center gap-1.5"
              >
                <Briefcase className="w-4 h-4 text-indigo-500" /> Latest Jobs
              </Link>

              <Link 
                to="/category/Admit%20Cards" 
                className="text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors duration-200 flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4 text-amber-500" /> Admit Cards
              </Link>

              <Link 
                to="/category/Results" 
                className="text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors duration-200 flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 text-emerald-500" /> Results
              </Link>
              
              {/* Category Dropdown */}
              <div className="relative group">
                <button className="flex items-center text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors duration-200 gap-1 py-2">
                  <span>More Topics</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 text-zinc-400" />
                </button>
                <div className="absolute left-0 mt-1 w-60 rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden p-2">
                  <div className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 px-3 py-1.5 tracking-wider">
                    Categories & Syllabus
                  </div>
                  {categories.slice(0, 8).map((cat) => (
                    <Link
                      key={cat}
                      to={`/category/${encodeURIComponent(cat)}`}
                      className="block px-3 py-2 text-xs font-bold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                    >
                      {cat}
                    </Link>
                  ))}
                  <div className="border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1">
                    <Link
                      to="/category/Syllabus"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Exam Syllabus PDF
                    </Link>
                  </div>
                </div>
              </div>

              <Link 
                to="/about" 
                className="text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors duration-200"
              >
                About
              </Link>
            </nav>

            {/* Right Actions: Search & Theme Toggle & Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Trigger Button */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-zinc-500 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-800 text-xs font-semibold transition-all"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline font-medium text-zinc-600 dark:text-zinc-400">Search Sarkari jobs...</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-800 transition-all active:scale-95 shadow-sm"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-indigo-600" />}
              </button>

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 rounded-xl text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-800 transition-all"
                aria-label="Open Menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              🏠 Home Page
            </Link>
            
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/category/Latest%20Jobs"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" /> Latest Jobs
              </Link>
              <Link
                to="/category/Admit%20Cards"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5" /> Admit Cards
              </Link>
              <Link
                to="/category/Results"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" /> Results
              </Link>
              <Link
                to="/category/Syllabus"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" /> Syllabus
              </Link>
            </div>

            <div className="font-black text-[10px] text-zinc-400 uppercase tracking-widest px-4 pt-2">
              All Categories
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
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Instant Live Search Modal ── */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-zinc-950/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl w-full max-w-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2 font-heading">
                <Search className="w-5 h-5 text-indigo-600" /> Search Sarkari Jobs & Updates
              </h3>
              <button 
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="E.g., SSC CGL, Railway ALP, UPSC, Admit Card..."
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

            {/* Instant Live Search Results */}
            {searchResults.length > 0 && (
              <div className="flex flex-col gap-2 mt-2 max-h-72 overflow-y-auto pr-1">
                <div className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider">Matching Notifications:</div>
                {searchResults.map((item) => (
                  <a
                    key={item.id}
                    href={item.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-zinc-200/60 dark:border-zinc-800 flex flex-col gap-1 transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      <span>{item.organization}</span>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-700 text-[10px] text-zinc-700 dark:text-zinc-300">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{item.title}</div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
