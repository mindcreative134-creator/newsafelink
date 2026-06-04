import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-200 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-0.5 font-heading w-fit">
              <span className="text-indigo-600 dark:text-indigo-400">Sarkari</span><span className="text-amber-500 font-black">Trend</span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
              Premium career guidance, sarkari job notifications, exam updates, and educational resources for every aspirant.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Quick Links</h3>
            <div className="flex flex-col gap-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Legal</h3>
            <div className="flex flex-col gap-2">
              {[
                { to: '/privacy-policy', label: 'Privacy Policy' },
                { to: '/disclaimer', label: 'Disclaimer' },
                { to: '/terms-conditions', label: 'Terms & Conditions' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400 dark:text-zinc-500">
          <p>© {currentYear} SarkariTrend. All rights reserved.</p>
          <p>AdSense Policy Compliant · Secure Gateway Platform</p>
        </div>
      </div>
    </footer>
  );
}
