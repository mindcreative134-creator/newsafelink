import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Sun, Moon, Search, 
  Briefcase, FileCheck, Award, 
  Landmark, GraduationCap, Zap, Newspaper
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
    getPosts({ maxResults: 40 })
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
        setCategories(['News & Updates', 'Latest Jobs', 'Admit Cards', 'Results', 'Govt Schemes', 'University & Admissions']);
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
    { name: 'News', path: '/category/News%20%26%20Updates', icon: Newspaper },
    { name: 'Jobs', path: '/category/Latest%20Jobs', icon: Briefcase },
    { name: 'Admit Cards', path: '/category/Admit%20Cards', icon: FileCheck },
    { name: 'Results', path: '/category/Results', icon: Award },
    { name: 'University', path: '/category/University%20%26%20Admissions', icon: GraduationCap },
    { name: 'Schemes', path: '/category/Govt%20Schemes%20%26%20Yojana', icon: Landmark },
  ];

  return (
    <>
      {/* ── Modern Clean Navigation Header ── */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
            
            {/* Brand Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-3 group" aria-label="Home">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
                  ⚡
                </div>
                <div className="flex flex-col leading-none">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white font-heading">
                      SafeLink
                    </span>
                    <span className="text-xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 font-heading">
                      Portal
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider mt-0.5">
                    News &amp; Information
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex space-x-1 items-center">
              <Link 
                to="/" 
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname === '/' 
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-bold' 
                    : 'text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
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
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive 
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-bold' 
                        : 'text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions: Search Modal Trigger, Theme Toggle & Mobile Menu */}
            <div className="flex items-center gap-2">
              
              {/* Search Trigger Button */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-medium transition-all"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400">Search posts...</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded">
                  ⌘K
                </kbd>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
              </button>

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all"
                aria-label="Open Menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        {isOpen && (
          <div className="lg:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 py-3 px-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Home
            </Link>
            
            <div className="grid grid-cols-2 gap-2 pt-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
                  >
                    <Icon className="w-3.5 h-3.5 text-indigo-500" /> {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-xs text-zinc-500 px-1">
              <Link to="/about" onClick={() => setIsOpen(false)} className="hover:underline">About</Link>
              <Link to="/contact" onClick={() => setIsOpen(false)} className="hover:underline">Contact</Link>
              <Link to="/privacy-policy" onClick={() => setIsOpen(false)} className="hover:underline">Privacy Policy</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Search Modal ── */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-zinc-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-2xl w-full max-w-xl flex flex-col gap-4 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-500" /> Search Articles &amp; Updates
              </h3>
              <button 
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Type keyword and press Enter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider"
              >
                Search
              </button>
            </form>

            {/* Live Search Results */}
            {searchResults.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-1 max-h-72 overflow-y-auto">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      navigate(`/post/${item.id}`);
                      setShowSearchModal(false);
                      setSearchQuery('');
                    }}
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-zinc-200/60 dark:border-zinc-800 flex flex-col gap-0.5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      <span>{item.organization || item.sourceName}</span>
                      <span className="text-zinc-500">{item.category}</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 line-clamp-1">
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
