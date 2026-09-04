import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../services/bloggerApi';
import { getPostThumbnail } from '../utils/postThumbnail';
import { Folder, ShieldCheck, Send, ArrowUpRight, Flame } from 'lucide-react';
import AdUnit from './AdUnit';

export default function Sidebar({ hideAds = false }) {
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getPosts({ maxResults: 6 })
      .then((data) => {
        if (data.items) {
          setRecentPosts(data.items);
          const labelsSet = new Set();
          data.items.forEach((post) => {
            if (post.labels) {
              post.labels.forEach((label) => labelsSet.add(label));
            }
          });
          setCategories(Array.from(labelsSet).slice(0, 10));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-8">
      
      {/* ── Official Trust & Portal Info Widget ── */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-700/40 rounded-[28px] p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-3">
          <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-indigo-200">Official Portal</span>
        </div>

        <h3 className="text-lg font-black font-heading text-white mb-2 leading-tight">
          SarkariTrend Alerts
        </h3>
        
        <p className="text-xs text-indigo-200/90 leading-relaxed mb-4 font-medium">
          India's verified career destination for official government job vacancy notices, exam dates, admit cards, answer keys, and education updates.
        </p>

        <div className="flex items-center gap-4 pt-2 border-t border-indigo-800/60 text-[11px] font-bold text-indigo-300">
          <span className="flex items-center gap-1">✅ 100% Genuine</span>
          <span className="flex items-center gap-1">⚡ Daily Updates</span>
        </div>
      </div>

      {/* ── Instant Telegram Join Widget ── */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[28px] p-6 text-white shadow-lg shadow-blue-600/20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
            FREE JOB NOTIFICATIONS
          </span>
          <Send className="w-5 h-5 text-blue-200" />
        </div>
        <h4 className="text-base font-black font-heading leading-tight">
          Get Instant Sarkari Alerts on Telegram
        </h4>
        <p className="text-xs text-blue-100 font-medium">
          Never miss an application deadline! Join 50,000+ candidates today.
        </p>
        <a
          href="https://t.me"
          target="_blank"
          rel="noreferrer"
          className="mt-1 px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs text-center uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
        >
          Join Telegram Channel <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      {/* ── Trending Categories Widget ── */}
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[28px] p-6 shadow-sm">
        <h3 className="text-base font-black text-zinc-900 dark:text-white mb-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-3 flex items-center gap-2 font-heading">
          <Folder className="w-4.5 h-4.5 text-indigo-600" /> Trending Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/category/${encodeURIComponent(cat)}`}
              className="inline-block px-3 py-1.5 text-xs font-extrabold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Compliant Ad Unit Slot (Mid-Sidebar) ── */}
      {!hideAds && (
        <AdUnit variant="sidebar" slot="7317709042" minHeight="250px" />
      )}

      {/* ── Recent Articles Widget ── */}
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[28px] p-6 shadow-sm">
        <h3 className="text-base font-black text-zinc-900 dark:text-white mb-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-3 flex items-center gap-2 font-heading">
          <Flame className="w-4.5 h-4.5 text-amber-500" /> Recent Updates
        </h3>
        <ul className="flex flex-col gap-4">
          {recentPosts.map((post) => {
            const postImg = getPostThumbnail(post);
            return (
              <li key={post.id} className="flex gap-3.5 group items-center">
                <Link to={`/post/${post.id}`} className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-200/60 dark:border-zinc-800 shadow-sm relative block bg-zinc-100 dark:bg-zinc-800">
                  <img src={postImg} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </Link>
                <div className="flex flex-col gap-1 min-w-0">
                  <Link to={`/post/${post.id}`} className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 leading-snug transition-colors">
                    {post.title}
                  </Link>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-wider">
                    {new Date(post.published).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── BiharHelp-Style Sticky Sidebar Ad (Stays in viewport while scrolling long content) ── */}
      {!hideAds && (
        <AdUnit
          variant="sticky-sidebar"
          slot="1909584638"
          minHeight="300px"
          className="mt-2"
        />
      )}

    </aside>
  );
}
