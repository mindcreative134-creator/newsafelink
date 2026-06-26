import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Shield, AlertTriangle, FileText, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200/80 dark:border-zinc-850/80 py-16 transition-colors duration-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* Logo & Description */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-3 max-w-sm">
            <Link to="/" className="flex items-center gap-2.5 group justify-center lg:justify-start" aria-label="SarkariTrend Home">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-indigo-500/25 group-hover:scale-[1.06] transition-all duration-200" style={{background:'linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)'}}>
                <svg viewBox="0 0 36 36" width="22" height="22" fill="none">
                  <polyline points="4,26 13,16 20,22 32,9" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="25,9 32,9 32,16" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
              </div>
              <div className="flex flex-col leading-none">
                <div className="flex items-baseline gap-px">
                  <span className="text-[17px] font-black tracking-tight text-zinc-900 dark:text-white font-heading leading-none">Sarkari</span>
                  <span className="text-[17px] font-black tracking-tight text-indigo-600 dark:text-indigo-400 font-heading leading-none">Trend</span>
                </div>
                <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.18em] mt-[3px]">Jobs &amp; Education</span>
              </div>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Your premier gateway for official job announcements, career resources, technical insights, and secure gateway redirections.
            </p>
          </div>

          {/* Links Grid */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
              Home <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </Link>
            <Link to="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
              About <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </Link>
            <Link to="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
              Contact <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </Link>
            <Link to="/privacy-policy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
              Privacy <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </Link>
            <Link to="/disclaimer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
              Disclaimer <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </Link>
            <Link to="/terms-conditions" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
              Terms <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </Link>
          </div>
        </div>

        {/* Bottom copyright and compliance information */}
        <div className="mt-12 border-t border-zinc-200/60 dark:border-zinc-800/60 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 gap-4 text-center md:text-left">
          <p>© {currentYear} SarkariTrend Services. All Rights Reserved.</p>
          <p className="max-w-md leading-relaxed">
            Headless CMS Architecture integration powered by Google Blogger API v3. 
            All standard AdSense placements are policy-compliant.
          </p>
        </div>
      </div>
    </footer>
  );
}
