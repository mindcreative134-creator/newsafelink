import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../services/bloggerApi';

export default function Sidebar() {
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
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 font-heading">
          About SarkariTrend
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Welcome to SarkariTrend! We provide premium career updates, job notifications, exam reviews, educational guides and trending stories to keep you ahead.
        </p>
      </div>

      {/* Categories Widget */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
          Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/category/${encodeURIComponent(cat)}`}
              className="inline-block px-3 py-1.5 text-xs font-semibold rounded-full bg-zinc-100 hover:bg-indigo-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Ad Placement */}
      <div className="adsense-container w-full">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
          {/* AdSense Unit */}
          <div className="w-full flex items-center justify-center overflow-hidden">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-9543073887536718"
              data-ad-slot="7317709042"
              data-ad-format="auto"
            />
          </div>
        </div>
      </div>

      {/* Recent Posts Widget */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
          Recent Posts
        </h3>
        <ul className="flex flex-col gap-4">
          {recentPosts.map((post) => {
            // Extract image or use fallback
            const postImg = post.content?.match(/<img[^>]+src="([^">]+)"/) ? post.content.match(/<img[^>]+src="([^">]+)"/)[1] : 'https://picsum.photos/400/250';
            return (
              <li key={post.id} className="flex gap-3">
                <Link to={`/post/${post.id}`} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={postImg} alt={post.title} className="w-full h-full object-cover" />
                </Link>
                <div className="flex flex-col gap-1">
                  <Link to={`/post/${post.id}`} className="text-sm font-semibold text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 leading-snug">
                    {post.title}
                  </Link>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
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
