import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../services/bloggerApi';
import { getPostThumbnail } from '../utils/postThumbnail';
import { Folder, Flame } from 'lucide-react';
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
    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
      
      {/* ── Recent Stories Widget ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3.5 pb-2.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 font-heading">
          <Flame className="w-4 h-4 text-indigo-500" /> Recent Stories
        </h3>
        <ul className="flex flex-col gap-3.5">
          {recentPosts.length === 0 ? (
            <li className="text-xs text-zinc-400 py-2">Loading updates...</li>
          ) : (
            recentPosts.map((post) => {
              const postImg = getPostThumbnail(post);
              return (
                <li key={post.id} className="flex gap-3 group items-center">
                  <Link to={`/post/${post.id}`} className="w-13 h-13 w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-200/60 dark:border-zinc-800 relative block bg-zinc-100 dark:bg-zinc-800">
                    <img src={postImg} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  </Link>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <Link to={`/post/${post.id}`} className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 leading-snug transition-colors">
                      {post.title}
                    </Link>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {new Date(post.published).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* ── Trending Categories Widget ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3 pb-2.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 font-heading">
          <Folder className="w-4 h-4 text-indigo-500" /> Browse Categories
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {categories.length === 0 ? (
            ['News', 'Jobs', 'Admit Cards', 'Results', 'Schemes', 'Technology'].map((cat) => (
              <Link
                key={cat}
                to={`/category/${encodeURIComponent(cat)}`}
                className="inline-block px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {cat}
              </Link>
            ))
          ) : (
            categories.map((cat) => (
              <Link
                key={cat}
                to={`/category/${encodeURIComponent(cat)}`}
                className="inline-block px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {cat}
              </Link>
            ))
          )}
        </div>
      </div>

      {/* ── Compliant Single Ad Slot ── */}
      {!hideAds && (
        <AdUnit variant="sidebar" slot="7317709042" minHeight="250px" />
      )}

    </aside>
  );
}
