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
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-1 font-heading">
              <span className="text-indigo-600 dark:text-indigo-400">Sarkari</span><span className="text-amber-500 font-black">Trend</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
              Home
            </Link>
            
            {/* Categories Dropdown */}
            <div className="relative group">
              <button className="flex items-center text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors gap-1">
                Categories <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-zinc-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/category/${encodeURIComponent(cat)}`}
                      className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-zinc-700 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link to="/about" className="text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
              Contact
            </Link>

            {/* Dark/Light mode button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Open Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 py-3 px-4 space-y-2">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Home
          </Link>
          <div className="font-semibold text-xs text-zinc-400 px-3 uppercase tracking-wider mt-2">
            Categories
          </div>
          <div className="pl-4 space-y-1">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/category/${encodeURIComponent(cat)}`}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {cat}
              </Link>
            ))}
          </div>
          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 mt-2"
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}
