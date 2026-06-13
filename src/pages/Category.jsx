import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPosts, getPostImage } from '../services/bloggerApi';
import Sidebar from '../components/Sidebar';
import { Calendar, User, ArrowRight } from 'lucide-react';

// Shimmer skeleton card for grid archives
function PostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col animate-pulse">
      <div className="aspect-video w-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          <div className="h-5 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="space-y-2 mt-2">
            <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
        <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded mt-2" />
      </div>
    </div>
  );
}

export default function Category() {
  const { label } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [nextPageToken, setNextPageToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const decoded = decodeURIComponent(label);
    document.title = `${decoded} Articles - SarkariTrend`;
    
    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    const descText = `Browse all articles, reviews, guides and resources under the ${decoded} category on Studyaf Portal.`;
    if (metaDesc) {
      metaDesc.setAttribute('content', descText);
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      metaDesc.content = descText;
      document.head.appendChild(metaDesc);
    }

    // Update Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', window.location.href);
    } else {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = window.location.href;
      document.head.appendChild(canonical);
    }

    getPosts({ maxResults: 12, label })
      .then((data) => {
        if (data.items) {
          setPosts(data.items);
          setNextPageToken(data.nextPageToken || '');
        } else {
          setPosts([]);
          setNextPageToken('');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch category posts.');
        setLoading(false);
      });
  }, [label]);

  const loadMore = () => {
    if (!nextPageToken) return;
    setLoading(true);
    getPosts({ pageToken: nextPageToken, maxResults: 9, label })
      .then((data) => {
        if (data.items) {
          setPosts((prev) => [...prev, ...data.items]);
          setNextPageToken(data.nextPageToken || '');
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };



  const getExcerpt = (content, limit = 120) => {
    if (!content) return '';
    let clean = content.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
    clean = clean.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
    const plainText = clean.replace(/<\/?[^>]+(>|$)/g, "");
    return plainText.length > limit ? plainText.substring(0, limit) + '...' : plainText;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Posts Grid Column */}
        <main className="flex-1 flex flex-col gap-8">
          <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Category Archive
            </span>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1 leading-tight font-heading">
              {decodeURIComponent(label)}
            </h1>
          </div>

          {loading && posts.length === 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 font-semibold">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
              <p className="text-zinc-500 dark:text-zinc-400 text-lg">No articles found in this category.</p>
              <button
                onClick={() => navigate('/')}
                 className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl"
              >
                Back to Home
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                  >
                    {/* Image */}
                    <div
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="aspect-video w-full overflow-hidden cursor-pointer relative"
                    >
                      <img
                        src={getPostImage(post, 500)}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {post.labels && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-indigo-600 text-white">
                          {post.labels[0]}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center text-xs text-zinc-400 dark:text-zinc-500 gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(post.published).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            Staff
                          </span>
                        </div>
                        <h3
                          onClick={() => navigate(`/post/${post.id}`)}
                          className="text-base font-bold text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 leading-snug cursor-pointer font-heading"
                        >
                          {post.title}
                        </h3>
                        <p className="text-zinc-650 dark:text-zinc-400 text-sm line-clamp-3">
                          {getExcerpt(post.content, 100)}
                        </p>
                      </div>

                      <button
                        onClick={() => navigate(`/post/${post.id}`)}
                        className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm gap-1 self-start group-hover:translate-x-1 transition-transform"
                      >
                        Read More <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Load More Button */}
              {nextPageToken && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load More Articles'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
}
