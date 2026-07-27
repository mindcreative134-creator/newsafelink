import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Shield, AlertTriangle, FileText, ArrowUpRight, Heart, ArrowUp, Sparkles, Send } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-zinc-900 dark:bg-zinc-950 text-zinc-300 border-t border-zinc-800 pt-16 pb-12 transition-colors duration-200 mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-zinc-800">
          
          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3 group" aria-label="SarkariTrend Home">
              <img 
                src="/favicon.svg" 
                alt="SarkariTrend Logo" 
                className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all duration-300" 
              />
              <div className="flex flex-col leading-none">
                <div className="flex items-baseline gap-px">
                  <span className="text-xl font-black tracking-tight text-white font-heading leading-none">Sarkari</span>
                  <span className="text-xl font-black tracking-tight text-indigo-400 font-heading leading-none">Trend</span>
                </div>
                <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-[0.2em] mt-1">Jobs &amp; Education Portal</span>
              </div>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              SarkariTrend is India's leading career portal providing official government job notifications, exam results, admit cards, answer keys, and career counseling guides.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://t.me" 
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Join Telegram
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white font-heading">
              Quick Navigation
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs font-bold text-zinc-400">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                  › Home Page
                </Link>
              </li>
              <li>
                <Link to="/category/Latest%20Jobs" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                  › Latest Jobs 2026
                </Link>
              </li>
              <li>
                <Link to="/category/Admit%20Cards" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                  › Download Admit Cards
                </Link>
              </li>
              <li>
                <Link to="/category/Results" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                  › Exam Results & Cutoffs
                </Link>
              </li>
              <li>
                <Link to="/category/Syllabus" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                  › Exam Syllabus & Pattern
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal Policies */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white font-heading">
              Company &amp; Legal
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs font-bold text-zinc-400">
              <li>
                <Link to="/about" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" /> About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> Contact Support
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" /> Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-indigo-400" /> Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Disclaimer Note */}
          <div className="flex flex-col gap-3 bg-zinc-850/50 p-5 rounded-2xl border border-zinc-800">
            <h4 className="text-xs font-black uppercase tracking-widest text-white font-heading flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Disclaimer Notice
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
              SarkariTrend is an independent news &amp; informational portal. We are not affiliated with any government department or organization. All job notices are sourced from official government press releases and recruitment portals.
            </p>
          </div>

        </div>

        {/* Bottom Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-500">
          <p>© {currentYear} SarkariTrend Services. All Rights Reserved.</p>
          
          <div className="flex items-center gap-4">
            <span>Made for Job Seekers across India</span>
            <button
              onClick={scrollToTop}
              className="p-2.5 rounded-xl bg-zinc-800 hover:bg-indigo-600 text-white transition-all shadow-md active:scale-95 flex items-center gap-1"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
