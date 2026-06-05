import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../services/bloggerApi';
import { useSafelink } from '../context/SafelinkContext';
import Sidebar from '../components/Sidebar';
import AdUnit from '../components/AdUnit';
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

function HomeSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full h-80 sm:h-96 bg-zinc-200 dark:bg-zinc-800 rounded-3xl animate-pulse mb-10" />
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

      {/* ── Safelink Verification Widget ─────────────────────────────────── */}
      {showVerification && (
        <div style={{
          width: '100%',
          background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #ffffff 100%)',
          border: '1px solid #c7d2fe',
          borderRadius: '1.5rem',
          padding: '1rem',
          marginBottom: '2.5rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {/* Heading */}
          <p style={{
            textAlign: 'center',
            fontWeight: 800,
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#1e293b',
            marginBottom: '8px',
          }}>
            Please confirm you are not a robot to continue
          </p>

          {/* Ad above checkbox — pure block, no flex parent */}
          <div style={{ width: '100%', display: 'block' }}>
            <AdUnit key={`home-robot-ad1-${safelinkTarget}`} slot="7317709042" format="auto" minHeight="250px" />
          </div>

          {/* Checkbox */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '1rem',
            padding: '0.75rem 1.25rem',
            margin: '8px auto',
            maxWidth: '340px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {verifying ? (
                <div style={{
                  width: 24, height: 24,
                  border: '2px solid #4f46e5',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              ) : verified ? (
                <div style={{
                  width: 24, height: 24,
                  background: '#22c55e',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                }}>✓</div>
              ) : (
                <input
                  type="checkbox"
                  id="not-robot"
                  style={{ width: 20, height: 20, cursor: 'pointer', accentColor: '#4f46e5' }}
                  onChange={handleRobotCheck}
                />
              )}
              <label htmlFor="not-robot" style={{
                fontSize: '0.875rem', fontWeight: 600,
                color: '#334155', cursor: 'pointer', userSelect: 'none',
              }}>
                {verifying ? 'Verifying...' : verified ? 'Verification Complete!' : "I'm not a robot"}
              </label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#4f46e5' }}>
              <svg style={{ width: 28, height: 28 }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
              </svg>
              <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.05em', color: '#94a3b8', textTransform: 'uppercase' }}>Shield</span>
            </div>
          </div>

          {/* Ad below checkbox */}
          <div style={{ width: '100%', display: 'block' }}>
            <AdUnit key={`home-robot-ad2-${safelinkTarget}`} slot="1909584638" format="fluid" layoutKey="-6t+ed+2i-1n-4w" minHeight="120px" />
          </div>
        </div>
      )}

      {/* ── Featured / Hero Post ──────────────────────────── */}
      {featuredPost && !showVerification && (
        <div
          className="relative bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl mb-10 group cursor-pointer"
          onClick={() => navigate(`/post/${featuredPost.id}`)}
        >
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

                {/* In-feed Ad after the 3rd post */}
                {index === 2 && (
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                    <AdUnit key={`home-list-ad-${index}`} slot="1909584638" format="fluid" layoutKey="-6t+ed+2i-1n-4w" minHeight="120px" />
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
