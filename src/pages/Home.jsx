import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../services/bloggerApi';
import { useSafelink } from '../context/SafelinkContext';
import Sidebar from '../components/Sidebar';
import { Calendar, User, ArrowRight, TrendingUp } from 'lucide-react';

// ── Skeleton Components ───────────────────────────────────────────────────────
function PostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col animate-pulse">
      <div className="aspect-video w-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="h-5 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-5 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="space-y-1.5 mt-1">
          <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded mt-auto" />
      </div>
    </div>
  );
}

function FeaturedPostSkeleton() {
  return (
    <div className="w-full h-80 sm:h-96 lg:h-[26rem] bg-zinc-200 dark:bg-zinc-800 rounded-3xl animate-pulse mb-10" />
  );
}

function HomeSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FeaturedPostSkeleton />
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 flex flex-col gap-8">
          <div className="h-8 w-44 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
        </div>
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col gap-6 animate-pulse">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-3 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Ad Slot Component ────────────────────────────────────────────────────────
function AdSlot({ format = 'auto', slot = '7317709042' }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const ins = ref.current;
    if (!ins || ins.getAttribute('data-ad-status')) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {}
  }, []);

  const isFeed = slot === '1909584638';
  const adFormat = isFeed ? 'fluid' : format;

  return (
    <div className="adsense-container w-full overflow-hidden">
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-9543073887536718"
        data-ad-slot={slot}
        data-ad-format={adFormat}
        data-full-width-responsive={adFormat === 'auto' ? "true" : "false"}
        {...(isFeed ? { 'data-ad-layout-key': '-6t+ed+2i-1n-4w' } : {})}
      />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [nextPageToken, setNextPageToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { startSafelink } = useSafelink();
  const navigate = useNavigate();

  // Safelink verification widget state
  const [safelinkTarget, setSafelinkTarget] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  // Handle safelink query parameters (?url= or ?o=)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oParam = params.get('o');
    const urlParam = params.get('url');

    if (oParam || urlParam) {
      const target = oParam ? `https://piko.site.je/?o=${oParam}` : urlParam;
      setSafelinkTarget(target);
      setShowVerification(true);
    }
  }, []);

  const handleRobotCheck = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      startSafelink(safelinkTarget);
      getPosts({ maxResults: 15 }).then((data) => {
        if (data.items && data.items.length > 0) {
          const randomPost = data.items[Math.floor(Math.random() * data.items.length)];
          navigate(`/post/${randomPost.id}`);
        }
      });
    }, 1500);
  };

  // Fetch posts
  useEffect(() => {
    document.title = 'SarkariTrend — Career Guidance, Job Notifications & Education';

    let metaDesc = document.querySelector('meta[name="description"]');
    const desc = 'SarkariTrend is your premium portal for sarkari job notifications, exam schedules, career guidance, educational resources, and secure gateway services.';
    if (metaDesc) metaDesc.setAttribute('content', desc);
    else {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      metaDesc.content = desc;
      document.head.appendChild(metaDesc);
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', window.location.href);
    else {
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
      .catch(() => setLoading(false));
  }, []);

  const loadMore = () => {
    if (!nextPageToken) return;
    setLoadingMore(true);
    getPosts({ pageToken: nextPageToken, maxResults: 9 })
      .then((data) => {
        if (data.items) {
          setPosts((prev) => [...prev, ...data.items]);
          setNextPageToken(data.nextPageToken || '');
        }
        setLoadingMore(false);
      })
      .catch(() => setLoadingMore(false));
  };

  if (loading) return <HomeSkeleton />;

  const getPostImage = (post) => {
    const match = post.content?.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : `https://picsum.photos/seed/${post.id}/600/400`;
  };

  const getExcerpt = (content, limit = 150) => {
    if (!content) return '';
    const text = content.replace(/<\/?[^>]+(>|$)/g, '');
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">

      {/* ── Safelink Verification Widget ─────────────────── */}
      {showVerification && (
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50/50 to-white dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-zinc-900 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl p-8 sm:p-12 flex flex-col items-center gap-6 mb-12 shadow-sm">
          {/* Ad above verification content */}
          <AdSlot slot="7317709042" />

          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center mb-2">
              <span className="text-2xl">🛡️</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white font-heading">
              Gateway Access Verification
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              Please confirm you are not a robot to continue to your secure destination.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-zinc-950 px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm min-w-[280px] sm:min-w-[320px] justify-between">
            <div className="flex items-center gap-3">
              {verifying ? (
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              ) : verified ? (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
              ) : (
                <input
                  type="checkbox"
                  id="not-robot"
                  className="w-5 h-5 rounded cursor-pointer accent-indigo-600"
                  onChange={handleRobotCheck}
                />
              )}
              <label htmlFor="not-robot" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                {verifying ? 'Verifying...' : verified ? 'Verification Complete!' : "I'm not a robot"}
              </label>
            </div>
            <div className="flex flex-col items-center gap-0.5 text-indigo-600 dark:text-indigo-400">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
              </svg>
              <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">Shield</span>
            </div>
          </div>

          {/* Ad below verification (In-feed Ad unit) */}
          <AdSlot slot="1909584638" />
        </div>
      )}

      {/* ── Featured / Hero Post ──────────────────────────── */}
      {featuredPost && !showVerification && (
        <div className="relative bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl mb-10 group cursor-pointer" onClick={() => navigate(`/post/${featuredPost.id}`)}>
          {/* Background image with parallax-style zoom */}
          <div className="absolute inset-0">
            <img
              src={getPostImage(featuredPost)}
              alt={featuredPost.title}
              className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-900/20" />
          </div>

          <div className="relative px-6 py-16 sm:px-12 sm:py-24 lg:px-16 lg:py-28 flex flex-col items-start gap-4 max-w-3xl">
            {featuredPost.labels && (
              <span className="px-3 py-1.5 text-xs font-bold uppercase rounded-full bg-indigo-600 text-white tracking-widest">
                {featuredPost.labels[0]}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight font-heading">
              {featuredPost.title}
            </h1>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-xl hidden sm:block">
              {getExcerpt(featuredPost.content, 180)}
            </p>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(featuredPost.published).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Staff Writer
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/post/${featuredPost.id}`); }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-indigo-50 text-zinc-900 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
            >
              Read Full Article <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Main Grid + Sidebar ───────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-12">
        <main className="flex-1 flex flex-col gap-8">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white font-heading">
              Latest Articles
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <React.Fragment key={post.id}>
                <article
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col group cursor-pointer"
                >
                  {/* Image */}
                  <div className="aspect-video w-full overflow-hidden relative">
                    <img
                      src={getPostImage(post)}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {post.labels && post.labels[0] && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-indigo-600 text-white">
                        {post.labels[0]}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div className="flex items-center text-xs text-zinc-400 dark:text-zinc-500 gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.published).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Staff
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 leading-snug font-heading transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm line-clamp-2 flex-1">
                      {getExcerpt(post.content, 100)}
                    </p>
                    <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold text-xs gap-1 group-hover:gap-2 transition-all mt-auto">
                      Read More <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </article>

                {/* Render In-feed Ad card after the 3rd post */}
                {index === 2 && (
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                    <AdSlot slot="1909584638" format="auto" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Load More */}
          {nextPageToken && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : 'Load More Articles'}
              </button>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
}
