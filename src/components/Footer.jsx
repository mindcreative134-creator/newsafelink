import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-12 transition-colors duration-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Description */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
            <Link to="/" className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-0.5 font-heading">
              <span className="text-indigo-655 dark:text-indigo-400">Sarkari</span><span className="text-amber-555 font-black">Trend</span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              Professional career guidelines, educational updates, trending news, and job notification updates.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Home
            </Link>
            <Link to="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Contact Us
            </Link>
            <Link to="/privacy-policy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/disclaimer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Disclaimer
            </Link>
            <Link to="/terms-conditions" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <p>© {currentYear} SarkariTrend. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Premium career news, job notifications, and secured transit gateway platform. Fully AdSense Policy Compliant.
          </p>
        </div>
      </div>
    </footer>
  );
}
