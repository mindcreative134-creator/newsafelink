import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUnifiedPosts } from '../services/postService';
import { getPostThumbnail } from '../utils/postThumbnail';
import Sidebar from '../components/Sidebar';
import { Calendar, ChevronRight, Folder, RefreshCw, Clock } from 'lucide-react';
import AdUnit from '../components/AdUnit';

function PostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 animate-pulse flex flex-col">
      <div className="aspect-video w-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="p-5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-2.5">
          <div className="h-3.5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          <div className="h-5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded mt-2" />
        </div>
        <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-3" />
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
    document.title = `${decoded} – SafeLink Portal`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    const descText = `Browse verified stories, news, and updates under ${decoded}.`;
    if (metaDesc) {
      metaDesc.setAttribute('content', descText);
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
    return getPostThumbnail(post);
  };

  const getExcerpt = (content, limit = 110) => {
    if (!content) return '';
    const plainText = content.replace(/<\/?[^>]+(>|$)/g, "");
    return plainText.length > limit ? plainText.substring(0, limit) + '...' : plainText;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{decodeURIComponent(label)}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Posts Grid Column */}
          <main className="flex-1 min-w-0">
            <div className="pb-4 mb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <Folder className="w-3.5 h-3.5" /> Category
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mt-1 leading-tight font-heading">
                {decodeURIComponent(label)}
              </h1>
            </div>

            {loading && posts.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
                <p className="text-red-500 font-semibold text-sm">{error}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">No articles found in this category.</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Return to Home
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {posts.map((post, index) => (
                    <React.Fragment key={post.id}>
                      <Link
                        to={`/post/${post.id}`}
                        className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="aspect-video w-full overflow-hidden relative bg-zinc-100 dark:bg-zinc-800">
                            <img
                              src={getPostImage(post)}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                            />
                            {post.labels && (
                              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-zinc-900/80 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm">
                                {post.labels[0]}
                              </span>
                            )}
                          </div>

                          <div className="p-4 sm:p-5">
                            <div className="flex items-center gap-2 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(post.published).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                              <span>•</span>
                              <span className="truncate max-w-[150px]">{post.sourceName || 'Source'}</span>
                            </div>

                            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 leading-snug font-heading transition-colors">
                              {post.title}
                            </h3>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                              {getExcerpt(post.content, 110)}
                            </p>
                          </div>
                        </div>

                        <div className="px-4 sm:px-5 pb-4 pt-2 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          <span className="text-[11px]">Read Story</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>

                      {index === 2 && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 my-2">
                          <AdUnit variant="fluid" slot="1909584638" minHeight="120px" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {nextPageToken && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading...
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
    </div>
  );
}
