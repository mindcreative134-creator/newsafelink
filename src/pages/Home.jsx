import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUnifiedPosts } from '../services/postService';
import { getLiveSarkariUpdates } from '../services/rssService';
import { useSafelink } from '../context/SafelinkContext';
import { getPostThumbnail } from '../utils/postThumbnail';
import Sidebar from '../components/Sidebar';
import { 
  Calendar, Clock, ArrowRight, ShieldCheck, RefreshCw, Sparkles, 
  Lock, CheckCircle2, Flame, ArrowUpRight, BookOpen
} from 'lucide-react';
import AdUnit from '../components/AdUnit';

// Post card shimmer skeleton
function PostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-sm flex flex-col animate-pulse">
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

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [nextPageToken, setNextPageToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Latest Jobs');
  const [sarkariUpdates, setSarkariUpdates] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const { startSafelink } = useSafelink();
  const navigate = useNavigate();

  // Safelink landing page states
  const [safelinkTarget, setSafelinkTarget] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  // Handle Safelink Landing Page Query (?o=... or ?url=...)
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

  const handleSafeTransitStart = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      
      startSafelink(safelinkTarget);
      
      getUnifiedPosts({ maxResults: 15 }).then((data) => {
        if (data.items && data.items.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.items.length);
          const randomPost = data.items[randomIndex];
          window.location.href = `/post/${randomPost.id}`;
        }
      });
    }, 1200);
  };

  // Fetch Unified articles (Blogger posts + Sarkari/Yojana posts)
  useEffect(() => {
    document.title = "SarkariTrend – Latest Govt Jobs, Admit Cards, Results & Schemes 2026";
    
    getUnifiedPosts({ maxResults: 13 })
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

  // Fetch Sarkari / RSS Live Updates for the Quick Matrix
  useEffect(() => {
    setLoadingUpdates(true);
    getLiveSarkariUpdates()
      .then((data) => {
        setSarkariUpdates(data);
        setLoadingUpdates(false);
      })
      .catch(() => {
        setLoadingUpdates(false);
      });
  }, []);

  const loadMore = () => {
    if (!nextPageToken) return;
    setLoading(true);
    getUnifiedPosts({ pageToken: nextPageToken, maxResults: 9 })
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

  const getExcerpt = (content, limit = 140) => {
    if (!content) return '';
    const plainText = content.replace(/<\/?[^>]+(>|$)/g, "");
    return plainText.length > limit ? plainText.substring(0, limit) + '...' : plainText;
  };

  const filteredUpdates = sarkariUpdates.filter((item) => {
    if (activeTab === 'All Updates') return true;
    return item.category?.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      
      {/* ── Compliant SafeLink Verification Transit Card (When ?o= or ?url= present) ── */}
      {showVerification && (
        <div className="w-full max-w-2xl mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-indigo-200/80 dark:border-indigo-900/50 shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
            <Lock className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-black uppercase tracking-wider mb-2">
            Security Transit Gateway
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-heading mb-2">
            SafeLink Transit Verification
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mb-6 leading-relaxed">
            Please verify security credentials to proceed to your requested destination. This ensures a safe, authenticated connection.
          </p>

          <AdUnit slot="7317709042" format="auto" minHeight="120px" className="my-4" />

          <button
            onClick={handleSafeTransitStart}
            disabled={verifying || verified}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 disabled:opacity-75"
          >
            {verifying ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Verifying Credentials...
              </>
            ) : verified ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-300" /> Verified! Redirecting...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-amber-300" /> Start Security Transit
              </>
            )}
          </button>

          <p className="text-[11px] text-zinc-400 mt-4 flex items-center gap-1">
            <span>🛡️ End-to-end protected transit session</span>
          </p>
        </div>
      )}

      {/* ── Featured / Hero Showcase Banner ── */}
      {featuredPost && !showVerification && (
        <div className="relative bg-zinc-950 rounded-[36px] overflow-hidden shadow-2xl mb-12 group border border-zinc-800/80">
          <div className="absolute inset-0">
            <img
              src={getPostImage(featuredPost)}
              alt={featuredPost.title}
              className="w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/20" />
          </div>

          <div className="relative max-w-4xl px-6 py-14 sm:px-12 sm:py-20 lg:px-16 flex flex-col items-start gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5 fill-white" /> TOP NOTIFICATION
              </span>
              {featuredPost.labels && (
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-white/10 text-zinc-200 backdrop-blur-md border border-white/10">
                  {featuredPost.labels[0]}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight font-heading drop-shadow-md">
              {featuredPost.title}
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-3xl font-medium line-clamp-3">
              {getExcerpt(featuredPost.content, 220)}
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2">
              <button
                onClick={() => navigate(`/post/${featuredPost.id}`)}
                className="inline-flex items-center justify-center px-7 py-3.5 border border-transparent text-sm font-black rounded-2xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 active:scale-95 transition-all gap-2.5"
              >
                Read Full Notification <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {new Date(featuredPost.published).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> 4 min read
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BiharHelp-Style Homepage Interstitial Banner ── */}
      {!showVerification && (
        <AdUnit
          variant="leaderboard"
          slot="7291097893"
          minHeight="90px"
          className="mb-10"
        />
      )}

      {/* ── Sarkari Job, Yojana & University Quick Matrix Section ── */}
      {!showVerification && (
        <section className="mb-14 bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[32px] p-6 sm:p-8 shadow-sm">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-200/70 dark:border-zinc-800 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                <Flame className="w-4 h-4 text-red-500" /> Live Sarkari &amp; Yojana Desk 2026
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-heading mt-1">
                Sarkari Jobs, Schemes &amp; Admission Matrix
              </h2>
            </div>

            {/* Interactive Tabs across all categories */}
            <div className="flex flex-wrap gap-2">
              {[
                'Latest Jobs', 
                'Govt Schemes & Yojana', 
                'Admit Cards', 
                'Results', 
                'University & Admissions', 
                'All Updates'
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Sarkari Grid (All cards route ON-SITE to /post/:id) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
            {loadingUpdates ? (
              <div className="col-span-full text-center py-10 text-zinc-400 font-medium">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                Loading latest notifications...
              </div>
            ) : filteredUpdates.length === 0 ? (
              <div className="col-span-full text-center py-8 text-zinc-400">
                No active notifications found under this tab.
              </div>
            ) : (
              filteredUpdates.slice(0, 6).map((job) => (
                <div
                  key={job.id}
                  onClick={() => navigate(`/post/${job.id}`)}
                  className="p-5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/40 border border-zinc-200/70 dark:border-zinc-800/80 hover-lift flex flex-col justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold line-clamp-1">
                        {job.organization}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                          job.badge === 'HOT' || job.badge === 'YOJANA'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            : job.badge === 'NEW' || job.badge === 'JOB' || job.badge === 'CUET'
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                        }`}
                      >
                        {job.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 line-clamp-2 font-heading leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {job.title}
                    </h3>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {job.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-200/50 dark:border-zinc-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-zinc-400">
                      {job.lastDate}
                    </span>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Read Details &amp; Apply ➔
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </section>
      )}

      {/* ── Main Articles & Sidebar Layout ── */}
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Main Feed Column */}
        <main className="flex-1 flex flex-col gap-8">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-heading tracking-tight flex items-center gap-2.5">
              <span className="w-2 h-7 bg-indigo-600 rounded-full"></span> All Latest Articles &amp; Updates
            </h2>
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Updated Live
            </span>
          </div>

          {/* Cards Grid */}
          {loading && posts.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <React.Fragment key={post.id}>
                  <article
                    className="bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[28px] overflow-hidden shadow-sm hover-lift flex flex-col group cursor-pointer"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    {/* Thumbnail Image */}
                    <div
                      className="aspect-video w-full overflow-hidden relative bg-zinc-100 dark:bg-zinc-800"
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

                    {/* Body Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 gap-3 uppercase tracking-wider">
                          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.published).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            3 min read
                          </span>
                        </div>

                        <h3
                          className="text-base sm:text-lg font-black text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 leading-snug font-heading transition-colors"
                        >
                          {post.title}
                        </h3>

                        <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm line-clamp-3 leading-relaxed font-medium">
                          {getExcerpt(post.content, 120)}
                        </p>
                      </div>

                      <span
                        className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-extrabold text-xs gap-1.5 self-start group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors pt-1"
                      >
                        Read Full Article <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </article>

                  {/* BiharHelp-Style Fluid in-feed AdSense unit after 3rd post */}
                  {index === 2 && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 my-2">
                      <AdUnit variant="fluid" slot="1909584638" minHeight="130px" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* BiharHelp-Style Responsive Bottom Banner */}
          <AdUnit variant="banner" slot="7317709042" minHeight="100px" className="my-8" />

          {/* Load More Button */}
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
        </main>

        {/* Sidebar Column */}
        <Sidebar />
      </div>

    </div>
  );
}
