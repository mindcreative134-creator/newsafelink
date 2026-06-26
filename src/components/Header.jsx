import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, ChevronDown } from 'lucide-react';
import { getPosts } from '../services/bloggerApi';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

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

  // Set initial theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Fetch unique labels as categories
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
        // Fallback categories if API fails
        setCategories(['Tech', 'Lifestyle', 'Business', 'Health']);
      });
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/75 dark:bg-zinc-950/75 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group" aria-label="SarkariTrend Home">
              {/* Icon mark */}
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-indigo-500/25 group-hover:shadow-indigo-500/40 group-hover:scale-[1.06] transition-all duration-200" style={{background:'linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)'}}>
                {/* White trending chart */}
                <svg viewBox="0 0 36 36" width="22" height="22" fill="none">
                  <polyline points="4,26 13,16 20,22 32,9" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="25,9 32,9 32,16" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {/* Subtle shine on top */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
              </div>
              {/* Wordmark */}
              <div className="flex flex-col leading-none">
                <div className="flex items-baseline gap-px">
                  <span className="text-[17px] font-black tracking-tight text-zinc-900 dark:text-white font-heading leading-none">Sarkari</span>
                  <span className="text-[17px] font-black tracking-tight text-indigo-600 dark:text-indigo-400 font-heading leading-none">Trend</span>
                </div>
                <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.18em] mt-[3px]">Jobs &amp; Education</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-zinc-650 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-sm transition-colors duration-200">
              Home
            </Link>
            
            {/* Categories Dropdown */}
            <div className="relative group">
              <button className="flex items-center text-zinc-650 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-sm transition-colors duration-200 gap-1.5">
                Categories <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute left-0 mt-2 w-48 rounded-2xl shadow-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-850/80 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-1 group-hover:translate-y-0 z-50 overflow-hidden">
                <div className="py-2 px-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/category/${encodeURIComponent(cat)}`}
                      className="block px-4 py-2.5 text-xs font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link to="/about" className="text-zinc-650 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-sm transition-colors duration-200">
              About
            </Link>
            <Link to="/contact" className="text-zinc-650 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-sm transition-colors duration-200">
              Contact
            </Link>

            {/* Dark/Light mode button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-850/60 transition-all duration-200 active:scale-90"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-850/60 transition-all duration-200 active:scale-90"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-850/60 transition-all duration-200"
              aria-label="Open Menu"
            >
              {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 py-3 px-4 space-y-2 animate-fade-in">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Home
          </Link>
          <div className="font-extrabold text-[10px] text-zinc-400 px-4 uppercase tracking-wider mt-3 mb-1">
            Categories
          </div>
          <div className="pl-3 space-y-1">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/category/${encodeURIComponent(cat)}`}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mt-2"
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}
