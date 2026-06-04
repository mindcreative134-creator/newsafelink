import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../services/bloggerApi';
import { useSafelink } from '../context/SafelinkContext';
import Sidebar from '../components/Sidebar';
import { Calendar, User, ArrowRight } from 'lucide-react';

// Card skeleton component
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

// Hero featured card skeleton component
function FeaturedPostSkeleton() {
  return (
    <div className="bg-zinc-205 dark:bg-zinc-900 h-96 rounded-3xl animate-pulse flex flex-col justify-end p-6 sm:p-12 gap-4 mb-12">
      <div className="h-6 w-24 bg-zinc-300 dark:bg-zinc-850 rounded" />
      <div className="h-10 w-3/4 bg-zinc-300 dark:bg-zinc-850 rounded" />
      <div className="space-y-2 max-w-2xl">
        <div className="h-4 w-full bg-zinc-300 dark:bg-zinc-850 rounded" />
        <div className="h-4 w-5/6 bg-zinc-300 dark:bg-zinc-850 rounded" />
      </div>
      <div className="h-12 w-40 bg-zinc-300 dark:bg-zinc-850 rounded-xl mt-2" />
    </div>
  );
}

// Sidebar widget skeleton component
function SidebarSkeleton() {
  return (
    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-8 animate-pulse">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
        <div className="flex flex-wrap gap-2">
          <div className="h-7 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          <div className="h-7 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          <div className="h-7 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        </div>
      </div>
    </aside>
  );
}

// Complete Home skeleton
function HomeSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FeaturedPostSkeleton />
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 flex flex-col gap-10">
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded mb-2 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        </div>
        <SidebarSkeleton />
      </div>
    </div>
  );
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [nextPageToken, setNextPageToken] = useState('');
  const [loading, setLoading] = useState(true);
  const { startSafelink } = useSafelink();
  const navigate = useNavigate();

  // Safelink landing page states
  const [safelinkTarget, setSafelinkTarget] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  // Handle Safelink Landing Page Redirection Query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oParam = params.get('o');
    const urlParam = params.get('url');

    if (oParam || urlParam) {
      const target = oParam ? `https://piko.site.je/?o=${oParam}` : urlParam;
      
      // Store target, but don't redirect yet! Show "I am not robot" check block
      setSafelinkTarget(target);
      setShowVerification(true);
    }
  }, []);

  const handleRobotCheck = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      
      // Perform safelink initiation and navigate to random post
      startSafelink(safelinkTarget);
      
      getPosts({ maxResults: 15 }).then((data) => {
        if (data.items && data.items.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.items.length);
          const randomPost = data.items[randomIndex];
          navigate(`/post/${randomPost.id}`);
        }
      });
    }, 1500);
  };

  // Fetch posts for standard display
  useEffect(() => {
    document.title = "SarkariTrend News - Career Guidance and Education";
    
    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    const descText = "SarkariTrend News is a premium online hub featuring career guidance, education updates, trending news, secure gateway integrations, and job notification updates.";
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

    getPosts({ maxResults: 10 })
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setFeaturedPost(data.items[0]);
          setPosts(data.items.slice(1));
          setNextPageToken(data.nextPageToken || '');
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const loadMore = () => {
    if (!nextPageToken) return;
    setLoading(true);
    getPosts({ pageToken: nextPageToken, maxResults: 9 })
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

  if (loading && posts.length === 0) {
    return <HomeSkeleton />;
  }

  const getPostImage = (post) => {
    if (!post.content) return 'https://picsum.photos/600/400';
    const match = post.content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : 'https://picsum.photos/600/400';
  };

  const getExcerpt = (content, limit = 150) => {
    if (!content) return '';
    const plainText = content.replace(/<\/?[^>]+(>|$)/g, "");
    return plainText.length > limit ? plainText.substring(0, limit) + '...' : plainText;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      
      {/* Safelink Verification Widget */}
      {showVerification && (
        <div className="bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-zinc-900/50 dark:to-zinc-900/30 border border-indigo-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-6 mb-12 shadow-md backdrop-blur-md">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white font-heading">
              Gateway Access Verification
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              Please check the box below to complete security verification.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-zinc-950 px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-sm min-w-[280px] justify-between">
            <div className="flex items-center gap-3">
              {verifying ? (
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              ) : verified ? (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
              ) : (
                <input
                  type="checkbox"
                  id="not-robot"
                  className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  onChange={handleRobotCheck}
                />
              )}
              <label htmlFor="not-robot" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                {verifying ? 'Checking browser...' : verified ? 'Verification Complete' : "I'm not a robot"}
              </label>
            </div>

            <div className="flex flex-col items-center gap-0.5">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
              </svg>
              <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Shield</span>
            </div>
          </div>
        </div>
      )}

      {/* Featured/Hero Post */}
      {featuredPost && !showVerification && (
        <div className="relative bg-zinc-900 rounded-3xl overflow-hidden shadow-xl mb-12 group">
          <div className="absolute inset-0">
            <img
              src={getPostImage(featuredPost)}
              alt={featuredPost.title}
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
          </div>

          <div className="relative max-w-3xl px-6 py-24 sm:px-12 sm:py-32 lg:px-16 flex flex-col items-start gap-4">
            {featuredPost.labels && (
              <span className="px-3 py-1.5 text-xs font-bold uppercase rounded-full bg-indigo-600 text-white">
                {featuredPost.labels[0]}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight font-heading">
              {featuredPost.title}
            </h1>
            <p className="text-zinc-300 text-base leading-relaxed">
              {getExcerpt(featuredPost.content, 200)}
            </p>
            <button
              onClick={() => navigate(`/post/${featuredPost.id}`)}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all gap-2"
            >
              Read Full Article <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid + Sidebar Layout */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Posts Grid Column */}
        <main className="flex-1 flex flex-col gap-10">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-200 dark:border-zinc-800 font-heading">
            Latest Articles
          </h2>

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
                    src={getPostImage(post)}
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
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-3">
                      {getExcerpt(post.content, 120)}
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
        </main>

        {/* Sidebar Column */}
        <Sidebar />
      </div>
    </div>
  );
}
