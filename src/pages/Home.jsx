import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../services/bloggerApi';
import { useSafelink } from '../context/SafelinkContext';
import Sidebar from '../components/Sidebar';
import { Calendar, User, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

// Card skeleton component
function PostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm flex flex-col animate-pulse">
      <div className="aspect-video w-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
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
        <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2" />
      </div>
    </div>
  );
}

// Hero featured card skeleton component
function FeaturedPostSkeleton() {
  return (
    <div className="bg-zinc-200 dark:bg-zinc-900 h-96 rounded-[32px] animate-pulse flex flex-col justify-end p-6 sm:p-12 gap-4 mb-12">
      <div className="h-6 w-24 bg-zinc-300 dark:bg-zinc-800 rounded-full" />
      <div className="h-10 w-3/4 bg-zinc-300 dark:bg-zinc-800 rounded-lg" />
      <div className="space-y-2 max-w-2xl">
        <div className="h-4 w-full bg-zinc-300 dark:bg-zinc-800 rounded" />
        <div className="h-4 w-5/6 bg-zinc-300 dark:bg-zinc-800 rounded" />
      </div>
      <div className="h-12 w-40 bg-zinc-300 dark:bg-zinc-800 rounded-xl mt-2" />
    </div>
  );
}

// Sidebar widget skeleton component
function SidebarSkeleton() {
  return (
    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-8 animate-pulse">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
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
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-2 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-zinc-900/40 dark:to-zinc-900/20 border border-indigo-100/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center text-center gap-6 mb-12 shadow-md backdrop-blur-md">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-heading tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6.5 h-6.5 text-indigo-650 dark:text-indigo-400" /> Gateway Security Verification
            </h2>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-sm">
              Verify your session parameters to proceed to the secure portal destination.
            </p>
          </div>

          <div className="flex items-center gap-5 bg-white dark:bg-zinc-950 px-6 py-4.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-850/80 shadow-sm min-w-[280px] sm:min-w-[340px] justify-between transition-all duration-300">
            <div className="flex items-center gap-3.5">
              {verifying ? (
                <div className="w-5.5 h-5.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              ) : verified ? (
                <div className="w-5.5 h-5.5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">✓</div>
              ) : (
                <input
                  type="checkbox"
                  id="not-robot"
                  className="w-5.5 h-5.5 rounded-lg border-zinc-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all duration-150"
                  onChange={handleRobotCheck}
                />
              )}
              <label htmlFor="not-robot" className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                {verifying ? 'Checking browser parameters...' : verified ? 'Verification Complete' : "I'm not a robot"}
              </label>
            </div>

            <div className="flex flex-col items-center gap-0.5 opacity-60">
              <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest">v3-Shield</span>
            </div>
          </div>
        </div>
      )}

      {/* Featured/Hero Post */}
      {featuredPost && !showVerification && (
        <div className="relative bg-zinc-900 rounded-[32px] overflow-hidden shadow-xl mb-12 group border border-zinc-200/10">
          <div className="absolute inset-0">
            <img
              src={getPostImage(featuredPost)}
              alt={featuredPost.title}
              className="w-full h-full object-cover opacity-60 group-hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          </div>

          <div className="relative max-w-3xl px-6 py-24 sm:px-12 sm:py-32 lg:px-16 flex flex-col items-start gap-4">
            {featuredPost.labels && (
              <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-indigo-600 text-white shadow-sm">
                Featured • {featuredPost.labels[0]}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight font-heading">
              {featuredPost.title}
            </h1>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
              {getExcerpt(featuredPost.content, 220)}
            </p>
            <button
              onClick={() => navigate(`/post/${featuredPost.id}`)}
              className="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all gap-2"
            >
              Read Full Article <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid + Sidebar Layout */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Posts Grid Column */}
        <main className="flex-1 flex flex-col gap-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white pb-3 border-b border-zinc-200 dark:border-zinc-800/80 font-heading tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span> Latest Announcements
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[24px] overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col group"
              >
                {/* Image */}
                <div
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="aspect-video w-full overflow-hidden cursor-pointer relative"
                >
                  <img
                    src={getPostImage(post)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {post.labels && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-indigo-600 text-white shadow-sm">
                      {post.labels[0]}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center text-[10px] font-bold text-zinc-400 dark:text-zinc-500 gap-3 uppercase tracking-wider">
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
                      className="text-base font-extrabold text-zinc-900 dark:text-white hover:text-indigo-650 dark:hover:text-indigo-400 line-clamp-2 leading-snug cursor-pointer font-heading transition-colors"
                    >
                      {post.title}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm line-clamp-3 leading-relaxed font-medium">
                      {getExcerpt(post.content, 120)}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="inline-flex items-center text-indigo-650 dark:text-indigo-400 font-bold text-xs gap-1.5 self-start group-hover:translate-x-1.5 transition-transform"
                  >
                    Read Excerpt <ArrowRight className="w-3.5 h-3.5" />
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
                className="px-6 py-3.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Loading Articles...
                  </>
                ) : (
                  'Load More Articles'
                )}
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
