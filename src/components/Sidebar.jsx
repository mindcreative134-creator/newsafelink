import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../services/bloggerApi';
import { Rss, Folder, Image, Star } from 'lucide-react';
import AdUnit from './AdUnit';

export default function Sidebar({ hideAds = false }) {
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getPosts({ maxResults: 5 })
      .then((data) => {
        if (data.items) {
          setRecentPosts(data.items);
          const labelsSet = new Set();
          data.items.forEach((post) => {
            if (post.labels) {
              post.labels.forEach((label) => labelsSet.add(label));
            }
          });
          setCategories(Array.from(labelsSet).slice(0, 8));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-8">
      {/* About Me Widget */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm backdrop-blur-sm">
        <h3 className="text-base font-extrabold text-zinc-900 dark:text-white mb-4 border-b border-zinc-100 dark:border-zinc-800/60 pb-3 flex items-center gap-2 font-heading">
          <Star className="w-4 h-4 text-indigo-500" /> About SarkariTrend
        </h3>
        <p className="text-sm text-zinc-655 dark:text-zinc-400 leading-relaxed font-medium">
          Welcome to SarkariTrend! We provide official exam updates, government job vacancies notifications, career counseling guides, and secure web gateways.
        </p>
      </div>

      {/* Categories Widget */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm backdrop-blur-sm">
        <h3 className="text-base font-extrabold text-zinc-900 dark:text-white mb-4 border-b border-zinc-100 dark:border-zinc-800/60 pb-3 flex items-center gap-2 font-heading">
          <Folder className="w-4 h-4 text-indigo-500" /> Categories
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => {
            // Pick a styling based on tag
            let tagClass = 'bg-zinc-100/60 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800/50 hover:border-indigo-250 dark:hover:border-indigo-900/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 hover:text-indigo-650 dark:hover:text-indigo-400';
            if (cat.toLowerCase().includes('tech')) {
              tagClass = 'badge-tech';
            } else if (cat.toLowerCase().includes('design')) {
              tagClass = 'badge-design';
            } else if (cat.toLowerCase().includes('work') || cat.toLowerCase().includes('job')) {
              tagClass = 'badge-work';
            } else if (cat.toLowerCase().includes('analytics')) {
              tagClass = 'badge-analytics';
            }
            return (
              <Link
                key={cat}
                to={`/category/${encodeURIComponent(cat)}`}
                className={`inline-block px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${tagClass}`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Ad Placement */}
      {!hideAds && (
        <div className="adsense-container w-full overflow-hidden flex items-center justify-center p-2">
          <AdUnit slot="7317709042" format="auto" minHeight="250px" />
        </div>
      )}

      {/* Recent Posts Widget */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm backdrop-blur-sm">
        <h3 className="text-base font-extrabold text-zinc-900 dark:text-white mb-4 border-b border-zinc-100 dark:border-zinc-800/60 pb-3 flex items-center gap-2 font-heading">
          <Rss className="w-4 h-4 text-indigo-500" /> Recent Posts
        </h3>
        <ul className="flex flex-col gap-5">
          {recentPosts.map((post) => {
            // Extract image or use fallback
            const postImg = post.content?.match(/<img[^>]+src="([^">]+)"/) ? post.content.match(/<img[^>]+src="([^">]+)"/)[1] : 'https://picsum.photos/400/250';
            return (
              <li key={post.id} className="flex gap-4 group">
                <Link to={`/post/${post.id}`} className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-150 dark:border-zinc-800 shadow-sm relative block">
                  <img src={postImg} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </Link>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <Link to={`/post/${post.id}`} className="text-xs font-bold text-zinc-900 dark:text-white hover:text-indigo-650 dark:hover:text-indigo-400 line-clamp-2 leading-snug transition-colors">
                    {post.title}
                  </Link>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider">
                    {new Date(post.published).toLocaleDateString()}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
