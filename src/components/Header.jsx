import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Sun, Moon, ChevronDown, Flame, Search, 
  Send, Briefcase, FileCheck, Award, BookOpen, 
  Sparkles, Landmark, GraduationCap, ArrowRight, Zap
} from 'lucide-react';
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
  const location = useLocation();

  // Breaking news ticker items (continuous marquee)
  const tickerItems = [
    '🚀 SSC CGL 2026 Notification Released: 14,500+ Group B & C Vacancies',
    '⚡ Railway RRB ALP & Technician 2026: 18,799 Posts Apply Online Portal Live',
    '🎯 UPSC Civil Services Prelims 2026 Admit Card & Exam Guidelines Out',
    '📢 SBI PO Prelims 2026 Results & Cutoff Marks Declared',
    '🏛️ PM Kisan 17th Installment & Bihar Udyami Yojana Beneficiary List Active',
    '🔥 UP Police Constable Official Answer Key Released - Check Normalized Score'
  ];

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

  // Keyboard shortcut (Ctrl+K or Cmd+K) to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        setCategories(['Latest Jobs', 'Admit Cards', 'Results', 'Govt Schemes', 'Answer Key', 'Syllabus']);
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
    }, 180);
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

  const navLinks = [
    { name: 'Live Updates', path: '/category/Live%20Updates', icon: Zap, color: 'text-amber-400', badge: 'LIVE' },
    { name: 'Latest Jobs', path: '/category/Latest%20Jobs', icon: Briefcase, color: 'text-indigo-400' },
    { name: 'Admit Cards', path: '/category/Admit%20Cards', icon: FileCheck, color: 'text-amber-400' },
    { name: 'Results', path: '/category/Results', icon: Award, color: 'text-emerald-400' },
    { name: 'University (Munger/Bihar)', path: '/category/University%20%26%20Admissions', icon: GraduationCap, color: 'text-purple-400' },
    { name: 'Schemes (योजना)', path: '/category/Govt%20Schemes%20%26%20Yojana', icon: Landmark, color: 'text-cyan-400' },
  ];

  return (
    <>
      {/* ── 1. Futuristic Live Marquee Ticker Bar ── */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-950 to-indigo-950 text-white text-xs border-b border-indigo-800/30 py-2 px-4 relative z-50 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Live indicator badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-radar"></span>
              LIVE
            </span>
            <span className="hidden sm:inline-block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              FEED:
            </span>
          </div>

          {/* Continuous scrolling marquee */}
          <div className="ticker-wrap flex-1 overflow-hidden">
            <div className="ticker-content font-medium text-zinc-200 text-xs sm:text-[13px] gap-8">
              {tickerItems.map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-2 hover:text-indigo-300 transition-colors cursor-pointer">
                  {item} <span className="text-zinc-600">•</span>
                </span>
              ))}
              {/* Duplicate for infinite seamless scroll */}
              {tickerItems.map((item, idx) => (
                <span key={`dup-${idx}`} className="inline-flex items-center gap-2 hover:text-indigo-300 transition-colors cursor-pointer">
                  {item} <span className="text-zinc-600">•</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right VIP Callouts */}
          <div className="flex items-center gap-3 shrink-0">
            <a 
              href="https://t.me" 
              target="_blank" 
              rel="noreferrer" 
              className="btn-shimmer px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 text-xs"
            >
              <Send className="w-3 h-3 text-amber-300" />
              <span className="hidden sm:inline">Join</span> Telegram
            </a>
          </div>

        </div>
      </div>

      {/* ── 2. Futuristic Glassmorphic Navigation Header ── */}
      <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Glowing Brand Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-3 group" aria-label="SarkariTrend Home">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-2xl bg-indigo-500/30 blur-md group-hover:bg-indigo-500/50 transition-all opacity-70 group-hover:opacity-100"></div>
                  <img 
                    src="/favicon.svg" 
                    alt="SarkariTrend" 
                    className="relative w-10 h-10 rounded-2xl shadow-lg group-hover:scale-105 group-hover:rotate-3 transition-transform" 
                  />
                </div>
                <div className="flex flex-col leading-none">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white font-heading">
                      Sarkari
                    </span>
                    <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent font-heading">
                      Trend
                    </span>
                  </div>
                  <span className="text-[9px] font-extrabold text-zinc-400 dark:text-indigo-300/60 uppercase tracking-[0.22em] mt-0.5">
                    Official Intelligence Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex space-x-1 items-center">
              <Link 
                to="/" 
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  location.pathname === '/' 
                    ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 shadow-sm' 
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                }`}
              >
                Home
              </Link>

              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link 
                    key={link.name}
                    to={link.path} 
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive 
                        ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 shadow-sm' 
                        : 'text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${link.color}`} />
                    {link.name}
                  </Link>
                );
              })}
              
              {/* Category Dropdown */}
              <div className="relative group">
                <button className="flex items-center text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-white font-bold text-xs transition-colors gap-1 px-3 py-2 rounded-xl hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60">
                  <span>More Topics</span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 text-zinc-400" />
                </button>

                <div className="absolute left-0 mt-2 w-64 rounded-2xl shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-indigo-900/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden p-2">
                  <div className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 px-3 py-1.5 tracking-wider">
                    Categories &amp; Exams
                  </div>
                  {categories.slice(0, 8).map((cat) => (
                    <Link
                      key={cat}
                      to={`/category/${encodeURIComponent(cat)}`}
                      className="block px-3 py-2 text-xs font-bold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all"
                    >
                      {cat}
                    </Link>
                  ))}
                  <div className="border-t border-zinc-100 dark:border-zinc-800/80 mt-1 pt-1">
                    <Link
                      to="/category/Syllabus"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Exam Syllabus PDF
                    </Link>
                  </div>
                </div>
              </div>

              <Link 
                to="/about" 
                className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-white transition-colors"
              >
                About
              </Link>
            </nav>

            {/* Right Actions: Search Modal Trigger, Theme Toggle & Mobile Menu */}
            <div className="flex items-center gap-2.5">
              
              {/* Search Trigger Button */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-zinc-500 dark:text-zinc-400 bg-zinc-100/90 dark:bg-zinc-900/80 hover:bg-zinc-200/90 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold transition-all hover:border-indigo-400/50"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline font-medium text-zinc-600 dark:text-zinc-400">Search Sarkari jobs...</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-bold text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md">
                  ⌘K
                </kbd>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 transition-all active:scale-95 shadow-sm"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-indigo-600" />}
              </button>

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 rounded-xl text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 transition-all"
                aria-label="Open Menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        {isOpen && (
          <div className="lg:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border-b border-zinc-200 dark:border-zinc-800 py-4 px-5 space-y-3 shadow-2xl">
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
                className="px-3 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" /> Latest Jobs
              </Link>
              <Link
                to="/category/Govt%20Schemes%20%26%20Yojana"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center gap-1.5"
              >
                <Landmark className="w-3.5 h-3.5" /> Schemes (योजना)
              </Link>
              <Link
                to="/category/University%20%26%20Admissions"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5" /> Admissions
              </Link>
              <Link
                to="/category/Admit%20Cards"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2.5 rounded-xl text-xs font-bold bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5" /> Admit Cards
              </Link>
              <Link
                to="/category/Results"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" /> Results
              </Link>
              <Link
                to="/category/Syllabus"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center gap-1.5"
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

      {/* ── 3. Instant Live Search Modal ── */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-zinc-950/75 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-elevated rounded-3xl p-6 shadow-2xl w-full max-w-xl flex flex-col gap-4 border border-indigo-500/30">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2 font-heading">
                <Search className="w-5 h-5 text-indigo-500" /> Search Sarkari Jobs &amp; Updates
              </h3>
              <button 
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="E.g., SSC CGL, Railway ALP, UPSC, PM Kisan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="btn-shimmer px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20"
              >
                Search
              </button>
            </form>

            {/* Instant Live Search Results */}
            {searchResults.length > 0 && (
              <div className="flex flex-col gap-2 mt-1 max-h-72 overflow-y-auto pr-1">
                <div className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider">Matching Notifications:</div>
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      navigate(`/post/${item.id}`);
                      setShowSearchModal(false);
                      setSearchQuery('');
                    }}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-zinc-200/60 dark:border-zinc-800 flex flex-col gap-1 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      <span>{item.organization}</span>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-700 text-[10px] text-zinc-700 dark:text-zinc-300">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors line-clamp-1">
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
