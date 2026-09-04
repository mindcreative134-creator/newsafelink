import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUnifiedPosts } from '../services/postService';
import Sidebar from '../components/Sidebar';
import { Calendar, ArrowRight, Folder, RefreshCw, Clock } from 'lucide-react';
import AdUnit from '../components/AdUnit';

function PostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[28px] overflow-hidden shadow-sm flex flex-col animate-pulse">
      <div className="aspect-video w-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="p-6 flex-1 flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="h-3.5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-3.5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          </div>
          <div className="h-5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <div className="space-y-2 mt-2">
            <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
        <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2" />
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
    document.title = `${decoded} Notifications & Updates – SarkariTrend`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    const descText = `Browse all official updates, job notices, admit cards, and resources under ${decoded} on SarkariTrend.`;
    if (metaDesc) {
      metaDesc.setAttribute('content', descText);
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      metaDesc.content = descText;
      document.head.appendChild(metaDesc);
    }

    getUnifiedPosts({ maxResults: 12, label })
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
    getUnifiedPosts({ pageToken: nextPageToken, maxResults: 9, label })
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

  const getPostImage = (post) => {
    if (!post.content) return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80';
    const match = post.content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80';
  };

  const getExcerpt = (content, limit = 120) => {
    if (!content) return '';
    const plainText = content.replace(/<\/?[^>]+(>|$)/g, "");
    return plainText.length > limit ? plainText.substring(0, limit) + '...' : plainText;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Posts Grid Column */}
        <main className="flex-1 flex flex-col gap-8">
          <div className="pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              <Folder className="w-4 h-4" /> Category Archive
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mt-1 leading-tight font-heading">
              {decodeURIComponent(label)}
            </h1>
          </div>

          {loading && posts.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="text-center py-16 bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[32px] p-8 shadow-sm">
              <p className="text-zinc-500 dark:text-zinc-400 text-base font-medium">No articles found under this topic.</p>
              <button
                onClick={() => navigate('/')}
                className="mt-5 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-600/20 transition-all"
              >
                Return to Home
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => (
                  <React.Fragment key={post.id}>
                    <article
                      className="bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[28px] overflow-hidden shadow-sm hover-lift flex flex-col group"
                    >
                      <div
                        onClick={() => navigate(`/post/${post.id}`)}
                        className="aspect-video w-full overflow-hidden cursor-pointer relative bg-zinc-100 dark:bg-zinc-800"
                      >
                        <img
                          src={getPostImage(post)}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        {post.labels && (
                          <span className="absolute top-3.5 left-3.5 px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-xl bg-indigo-600/90 text-white backdrop-blur-md shadow-md shadow-indigo-600/20">
                            {post.labels[0]}
                          </span>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 gap-3 uppercase tracking-wider">
                            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                              <Calendar className="w-3 h-3" />
                              {new Date(post.published).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> 3 min read
                            </span>
                          </div>

                          <h3
                            onClick={() => navigate(`/post/${post.id}`)}
                            className="text-base sm:text-lg font-black text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 leading-snug cursor-pointer font-heading transition-colors"
                          >
                            {post.title}
                          </h3>

                          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm line-clamp-3 leading-relaxed font-medium">
                            {getExcerpt(post.content, 120)}
                          </p>
                        </div>

                        <button
                          onClick={() => navigate(`/post/${post.id}`)}
                          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-extrabold text-xs gap-1.5 self-start group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors pt-1"
                        >
                          Read Full Story <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </article>

                    {index === 2 && (
                      <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <AdUnit slot="1909584638" format="auto" minHeight="120px" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {nextPageToken && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-7 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Fetching More Articles...
                      </>
                    ) : (
                      'Load More Articles'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <Sidebar />
      </div>
    </div>
  );
}
