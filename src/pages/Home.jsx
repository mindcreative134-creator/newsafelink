import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUnifiedPosts } from '../services/postService';
import { useSafelink } from '../context/SafelinkContext';
import { getPostThumbnail } from '../utils/postThumbnail';
import Sidebar from '../components/Sidebar';
import { 
  Calendar, Clock, ArrowRight, ShieldCheck, RefreshCw, 
  Search, Lock, CheckCircle2, ChevronRight
} from 'lucide-react';
import AdUnit from '../components/AdUnit';
import RobotVerificationWidget from '../components/RobotVerificationWidget';
import WpSafelinkTopSection from '../components/WpSafelinkTopSection';
import DualAdContinueSection from '../components/DualAdContinueSection';

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

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [nextPageToken, setNextPageToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { currentStep, isSafelinkActive, startSafelink, step1Verified } = useSafelink();
  const navigate = useNavigate();

  // Handle Safelink Landing Page Query (?o=... or ?url=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oParam = params.get('o');
    const urlParam = params.get('url') || params.get('target');

    if (oParam || urlParam) {
      const target = oParam ? `https://piko.site.je/?o=${oParam}` : urlParam;
      startSafelink(target, 1);
    }
  }, [startSafelink]);

  // Fetch posts
  const fetchPosts = (label = '') => {
    setLoading(true);
    const filterLabel = label === 'All' ? '' : label;
    getUnifiedPosts({ maxResults: 13, label: filterLabel })
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setFeaturedPost(data.items[0]);
          setPosts(data.items.slice(1));
          setNextPageToken(data.nextPageToken || '');
        } else {
          setFeaturedPost(null);
          setPosts([]);
          setNextPageToken('');
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    document.title = "SafeLink News & Portal – Verified News, Jobs & Real-Time Updates";
    fetchPosts(activeTab);
  }, [activeTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const loadMore = () => {
    if (!nextPageToken) return;
    setLoading(true);
    const filterLabel = activeTab === 'All' ? '' : activeTab;
    getUnifiedPosts({ pageToken: nextPageToken, maxResults: 9, label: filterLabel })
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

  const getExcerpt = (content, limit = 130) => {
    if (!content) return '';
    const plainText = content.replace(/<\/?[^>]+(>|$)/g, "");
    return plainText.length > limit ? plainText.substring(0, limit) + '...' : plainText;
  };

  const categoriesTabs = [
    { id: 'All', name: 'All Stories' },
    { id: 'News & Updates', name: 'News & Current Affairs' },
    { id: 'Latest Jobs', name: 'Jobs & Recruitment' },
    { id: 'Admit Cards', name: 'Admit Cards' },
    { id: 'Results', name: 'Results' },
    { id: 'University & Admissions', name: 'University & Admissions' },
    { id: 'Govt Schemes & Yojana', name: 'Govt Schemes' },
    { id: 'Technology', name: 'Technology' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      
      {/* ── Breaking News Marquee Ticker ── */}
      {posts.length > 0 && (
        <div className="w-full bg-indigo-600/10 dark:bg-indigo-950/40 border-b border-indigo-200/60 dark:border-indigo-900/40 py-2.5 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-[10px] uppercase tracking-wider shrink-0 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              BREAKING
            </div>
            <div className="flex-1 overflow-hidden whitespace-nowrap">
              <div className="inline-flex gap-8 items-center text-xs font-semibold text-zinc-700 dark:text-zinc-200 animate-marquee hover:pause">
                {posts.slice(0, 6).map((p) => (
                  <Link
                    key={p.id}
                    to={`/post/${p.id}`}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-2"
                  >
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">●</span>
                    <span>{p.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* ── Hero / Portal Introduction & Quick Stats ── */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Verified Recruitment &amp; Public Schemes Portal</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white font-heading tracking-tight leading-tight">
                Authentic Govt Notifications, Results &amp; Schemes
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                Direct official updates from UPSC, SSC, Railways, State PSCs, Central Universities, and PM Welfare Programs.
              </p>
            </div>

            {/* Clean Inline Search & Quick Filter */}
            <form onSubmit={handleSearchSubmit} className="w-full lg:w-88 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search job notices, schemes, exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </form>
          </div>

          {/* Clean Category Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-3.5 no-scrollbar">
            {categoriesTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all shadow-sm ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-500/25 scale-102'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Entry Human Verification (I'm not a robot - clean & unboxed) ── */}
        {isSafelinkActive && !step1Verified && (
          <div className="mb-8">
            <RobotVerificationWidget />
          </div>
        )}

        {/* ── On-Page WP-Safelink Top Section (Step 1 - Ad 1 -> Continue -> Ad 2) ── */}
        {isSafelinkActive && step1Verified && currentStep === 1 && (
          <div className="mb-8">
            <WpSafelinkTopSection />
          </div>
        )}

        {/* ── Main Content Area (Editorial Magazine Layout - Always 100% visible & clickable) ── */}
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Feed */}
            <main className="flex-1 min-w-0">
              
              {/* Featured Lead Story */}
              {featuredPost && (
                <div className="mb-8">
                  <Link
                    to={`/post/${featuredPost.id}`}
                    className="group block bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                      <div className="md:col-span-7 aspect-video md:aspect-auto overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                        <img
                          src={getPostImage(featuredPost)}
                          alt={featuredPost.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-md bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {featuredPost.labels ? featuredPost.labels[0] : 'Featured'}
                        </span>
                      </div>

                      <div className="md:col-span-5 p-5 sm:p-7 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(featuredPost.published).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span>•</span>
                            <span>{featuredPost.sourceName || featuredPost.rawJob?.sourceName || 'Verified Source'}</span>
                          </div>

                          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-3 leading-snug font-heading">
                            {featuredPost.title}
                          </h2>

                          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-2.5 line-clamp-3 leading-relaxed">
                            {getExcerpt(featuredPost.content, 140)}
                          </p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          <span>Read Full Story</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                  {/* Ad banner directly after featured lead story */}
                  <div className="my-5">
                    <AdUnit variant="fluid" slot="9320506924" minHeight="120px" />
                  </div>
                </div>
              )}

              {/* Grid of Articles */}
              {loading && posts.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                </div>
              ) : posts.length === 0 && !featuredPost ? (
                <div className="py-16 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
                  <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                    No articles found in this category right now.
                  </p>
                  <button
                    onClick={() => handleTabClick('All')}
                    className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase"
                  >
                    View All Stories
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {posts.map((post, idx) => (
                    <React.Fragment key={post.id}>
                      <Link
                        to={`/post/${post.id}`}
                        className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                            <img
                              src={getPostImage(post)}
                              alt={post.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                            />
                            {post.labels && (
                              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-zinc-900/85 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm">
                                {post.labels[0]}
                              </span>
                            )}
                          </div>

                          <div className="p-4 sm:p-5">
                            <div className="flex items-center gap-2 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">
                              <span>{new Date(post.published).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                              <span>•</span>
                              <span className="truncate max-w-[150px]">{post.sourceName || post.rawJob?.sourceName || 'Source'}</span>
                            </div>

                            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug font-heading">
                              {post.title}
                            </h3>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                              {getExcerpt(post.content, 100)}
                            </p>
                          </div>
                        </div>

                        <div className="px-4 sm:px-5 pb-4 pt-2 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          <span className="text-[11px]">Read Article</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>

                      {/* In-feed ad unit between posts (every 3 posts across all screen sizes) */}
                      {(idx + 1) % 3 === 0 && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 my-3">
                          <AdUnit variant="fluid" slot="1909584638" minHeight="120px" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Load More Button */}
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
                      'Load More Stories'
                    )}
                  </button>
                </div>
              )}

              {/* Dual Ad Continue Section (Step 1) */}
              {isSafelinkActive && currentStep === 1 && (
                <div className="mt-8">
                  <DualAdContinueSection />
                </div>
              )}

            </main>

            {/* Sidebar Column */}
            <Sidebar />

          </div>

      </div>
    </div>
  );
}
