import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../services/bloggerApi';
import { Tag, Clock } from 'lucide-react';

// Sidebar Ad Slot
function SidebarAdSlot() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);

  return (
    <div className="adsense-container w-full overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-9543073887536718"
        data-ad-slot="7317709042"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export default function Sidebar() {
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts({ maxResults: 6 })
      .then((data) => {
        if (data.items) {
          setRecentPosts(data.items.slice(0, 5));
          const labelsSet = new Set();
          data.items.forEach((post) => {
            if (post.labels) post.labels.forEach((l) => labelsSet.add(l));
          });
          setCategories(Array.from(labelsSet).slice(0, 10));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getPostImage = (post) => {
    const match = post.content?.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : `https://picsum.photos/seed/${post.id}/80/80`;
  };

  if (loading) {
    return (
      <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col gap-6 animate-pulse">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-3 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col gap-6">

      {/* About Widget */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50/30 dark:from-indigo-950/20 dark:to-zinc-900 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">
          About SarkariTrend
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Your trusted source for sarkari job updates, exam schedules, career tips, and educational resources — all in one place.
        </p>
      </div>

      {/* Categories Widget */}
      {categories.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4">
            <Tag className="w-3.5 h-3.5" /> Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/category/${encodeURIComponent(cat)}`}
                className="inline-block px-3 py-1.5 text-xs font-semibold rounded-full bg-zinc-100 hover:bg-indigo-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 hover:text-indigo-700 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ad Slot */}
      <SidebarAdSlot />

      {/* Recent Posts Widget */}
      {recentPosts.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4">
            <Clock className="w-3.5 h-3.5" /> Recent Posts
          </h3>
          <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentPosts.map((post) => (
              <li key={post.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <Link
                  to={`/post/${post.id}`}
                  className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-100 dark:bg-zinc-800"
                >
                  <img
                    src={getPostImage(post)}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </Link>
                <div className="flex flex-col gap-1 min-w-0">
                  <Link
                    to={`/post/${post.id}`}
                    className="text-sm font-semibold text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 leading-snug transition-colors"
                  >
                    {post.title}
                  </Link>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {new Date(post.published).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
