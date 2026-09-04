import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUnifiedPosts } from '../services/postService';
import { getLiveSarkariUpdates } from '../services/rssService';
import { useSafelink } from '../context/SafelinkContext';
import { getPostThumbnail } from '../utils/postThumbnail';
import Sidebar from '../components/Sidebar';
import { 
  Calendar, Clock, ArrowRight, ShieldCheck, RefreshCw, Sparkles, 
  Lock, CheckCircle2, Flame, Search, Send, Briefcase, FileCheck, 
  Award, TrendingUp, Bell, Check, Landmark, GraduationCap, Zap
} from 'lucide-react';
import AdUnit from '../components/AdUnit';

// Post card shimmer skeleton
function PostCardSkeleton() {
  return (
    <div className="glass-panel rounded-3xl overflow-hidden shadow-sm flex flex-col animate-pulse">
      <div className="aspect-video w-full bg-zinc-200 dark:bg-zinc-800/80" />
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
  const [activeTab, setActiveTab] = useState('All Live Updates');
  const [sarkariUpdates, setSarkariUpdates] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [heroSearch, setHeroSearch] = useState('');
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
          navigate(`/post/${randomPost.id}`);
        }
      });
    }, 1200);
  };

  // Fetch Unified articles (Blogger posts + Sarkari/Yojana posts)
  useEffect(() => {
    document.title = "SarkariTrend – Next-Gen Govt Jobs, Admit Cards, Results & Schemes 2026";
    
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

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/category/${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const filteredUpdates = sarkariUpdates.filter((item) => {
    if (heroSearch.trim()) {
      const q = heroSearch.toLowerCase().trim();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.organization?.toLowerCase().includes(q) ||
        item.sourceName?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      );
    }
    if (activeTab === 'All Live Updates' || activeTab === 'All Updates') return true;
    return item.category?.toLowerCase() === activeTab.toLowerCase();
  });

  const trendingTags = ['SSC CGL', 'Railway ALP', 'BPSC', 'Admit Card', 'Results', 'PM Kisan', 'UP Police', 'CUET UG'];

  return (
    <div className="mesh-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-200">
        
        {/* ── Compliant SafeLink Verification Transit Card (When ?o= or ?url= present) ── */}
        {showVerification && (
          <div className="w-full max-w-2xl mx-auto my-8 p-6 sm:p-10 rounded-3xl glass-panel-elevated shadow-2xl flex flex-col items-center text-center animate-fadeIn border border-indigo-500/30">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 animate-glow-ring">
                <Lock className="w-8 h-8" />
              </div>
            </div>

            <span className="px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[11px] font-black uppercase tracking-wider mb-2">
              Security Transit Gateway
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-heading mb-2">
              SafeLink Transit Verification
            </h2>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mb-6 leading-relaxed">
              Verifying security certificates and establishing encrypted transit protocol. Please proceed safely to your requested destination.
            </p>

            <AdUnit slot="7317709042" format="auto" minHeight="120px" className="my-4" />

            <button
              onClick={handleSafeTransitStart}
              disabled={verifying || verified}
              className="btn-shimmer w-full sm:w-auto px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 disabled:opacity-75"
            >
              {verifying ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Verifying Security Credentials...
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

            <p className="text-[11px] text-zinc-400 mt-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-radar"></span>
              <span>End-to-end authenticated SSL transit tunnel</span>
            </p>
          </div>
        )}

        {/* ── 🌟 Futuristic Glassmorphic Hero Section ── */}
        {!showVerification && (
          <section className="relative rounded-[38px] overflow-hidden glass-panel-elevated p-6 sm:p-14 mb-12 text-center flex flex-col items-center justify-center border border-indigo-500/20">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-indigo-500/15 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-emerald-500/15 blur-[100px] pointer-events-none" />

            <div className="relative max-w-4xl mx-auto flex flex-col items-center gap-5">
              
              {/* Glowing Top Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-300 shadow-sm animate-float">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>India's Verified Sarkari Intelligence Portal 2026</span>
              </div>

              {/* Mega Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-tight glow-text-primary text-zinc-900 dark:text-white">
                Next-Gen Sarkari Naukri, Admit Card &amp;{' '}
                <span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Scheme Portal
                </span>
              </h1>

              <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base max-w-2xl leading-relaxed font-medium">
                Direct application links, authentic exam dates, official answer keys, and central/state welfare schemes with 100% verified sources and zero fake news.
              </p>

              {/* Glowing Glass Search Bar */}
              <form onSubmit={handleHeroSearchSubmit} className="w-full max-w-2xl mt-2 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  <input
                    type="text"
                    placeholder="Search 500+ Sarkari Jobs, Admit Cards, Results, Schemes..."
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/80 dark:border-indigo-900/40 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-shimmer px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  Explore <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Trending Quick Filter Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Trending:
                </span>
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setHeroSearch(tag)}
                    className="px-3 py-1 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/80 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-zinc-700 dark:text-zinc-300 text-xs font-semibold backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-700/60 transition-all hover:scale-105"
                  >
                    #{tag}
                  </button>
                ))}
              </div>

            </div>
          </section>
        )}

        {/* ── 3. Stitch Animated Metrics Grid ── */}
        {!showVerification && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="glass-panel rounded-2xl p-6 text-center flex flex-col items-center justify-center group border border-emerald-500/20">
              <span className="text-3xl sm:text-4xl font-black text-emerald-500 dark:text-emerald-400 font-heading mb-1 glow-text-emerald">
                120+
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Active Recruitments
              </span>
            </div>

            <div className="glass-panel rounded-2xl p-6 text-center flex flex-col items-center justify-center group border border-indigo-500/20">
              <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 font-heading mb-1 glow-text-primary">
                100%
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Direct Official Links
              </span>
            </div>

            <div className="glass-panel rounded-2xl p-6 text-center flex flex-col items-center justify-center group border border-amber-500/20">
              <span className="text-3xl sm:text-4xl font-black text-amber-500 dark:text-amber-400 font-heading mb-1">
                30m
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Real-Time Auto Sync
              </span>
            </div>

            <div className="glass-panel rounded-2xl p-6 text-center flex flex-col items-center justify-center group border border-cyan-500/20">
              <span className="text-3xl sm:text-4xl font-black text-cyan-500 dark:text-cyan-400 font-heading mb-1">
                Zero
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Fake Notifications
              </span>
            </div>
          </section>
        )}

        {/* ── 4. Stitch Bento Category Hub ── */}
        {!showVerification && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
            
            {/* Featured Large Bento Card (Latest Jobs) */}
            <div className="md:col-span-8 glass-panel rounded-3xl p-8 relative overflow-hidden group border border-emerald-500/20 flex flex-col justify-between">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-all duration-500"></div>
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white font-heading">
                      Latest Govt Jobs
                    </h3>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
                    14 New Today
                  </span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-lg mb-6 leading-relaxed">
                  Real-time recruitment notices from SSC, UPSC, Railway (RRB), Banking (IBPS/SBI), Defense, and State PSC boards with official eligibility criteria.
                </p>
              </div>

              <Link 
                to="/category/Latest%20Jobs"
                className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm group-hover:translate-x-1.5 transition-transform"
              >
                Explore All Jobs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Small Bento Card 1 (Admit Cards) */}
            <div className="md:col-span-4 glass-panel rounded-3xl p-6 flex flex-col justify-between group border border-indigo-500/20">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 border border-indigo-500/20">
                  <FileCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-full uppercase">
                  Exam Hall Tickets
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white font-heading mb-1.5">
                  Admit Cards
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                  Download hall tickets and exam city intimation slips instantly.
                </p>
                <Link 
                  to="/category/Admit%20Cards" 
                  className="text-indigo-600 dark:text-indigo-400 text-xs font-black group-hover:underline flex items-center gap-1"
                >
                  View All Cards <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Small Bento Card 2 (Results) */}
            <div className="md:col-span-4 glass-panel rounded-3xl p-6 flex flex-col justify-between group border border-amber-500/20">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full uppercase">
                  Merit Lists
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white font-heading mb-1.5">
                  Exam Results
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                  Check cut-off marks, scorecards, and final selection merit lists.
                </p>
                <Link 
                  to="/category/Results" 
                  className="text-amber-500 text-xs font-black group-hover:underline flex items-center gap-1"
                >
                  Check Results <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Wide Bento Card (Govt Schemes & Yojana) */}
            <div className="md:col-span-8 glass-panel rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group border border-cyan-500/20">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-cyan-500/10 rounded-2xl text-cyan-500 border border-cyan-500/20 shrink-0">
                  <Landmark className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white font-heading">
                    Govt Schemes &amp; Yojana (सरकारी योजना)
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-0.5">
                    Central &amp; state financial assistance, scholarships, farmer subsidies &amp; welfare programs.
                  </p>
                </div>
              </div>
              <Link 
                to="/category/Govt%20Schemes%20%26%20Yojana"
                className="btn-shimmer px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shrink-0"
              >
                Browse Schemes
              </Link>
            </div>

          </section>
        )}

        {/* ── Featured Mega Notification Banner ── */}
        {featuredPost && !showVerification && (
          <div className="relative rounded-[36px] overflow-hidden shadow-2xl mb-12 group border border-indigo-900/40 bg-zinc-950">
            <div className="absolute inset-0">
              <img
                src={getPostImage(featuredPost)}
                alt={featuredPost.title}
                className="w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/20" />
            </div>

            <div className="relative max-w-4xl px-6 py-12 sm:px-12 sm:py-16 lg:px-16 flex flex-col items-start gap-5">
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

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight font-heading drop-shadow-md">
                {featuredPost.title}
              </h2>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-3xl font-medium line-clamp-3">
                {getExcerpt(featuredPost.content, 220)}
              </p>

              <div className="flex flex-wrap items-center gap-5 pt-2">
                <Link
                  to={`/post/${featuredPost.id}`}
                  className="btn-shimmer inline-flex items-center justify-center px-8 py-4 border border-transparent text-sm font-black rounded-2xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 active:scale-95 transition-all gap-2.5"
                >
                  Read Notification &amp; Apply <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {new Date(featuredPost.published).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> 3 min read
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BiharHelp-Style Interstitial Leaderboard Banner ── */}
        {!showVerification && (
          <AdUnit
            variant="leaderboard"
            slot="7291097893"
            minHeight="90px"
            className="mb-12"
          />
        )}

        {/* ── Sarkari Job & Scheme Matrix Desk ── */}
        {!showVerification && (
          <section className="mb-14 glass-panel rounded-[32px] p-6 sm:p-8 shadow-sm">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-200/70 dark:border-zinc-800 gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  <Flame className="w-4 h-4 text-red-500 animate-pulse" /> Live Recruitment &amp; Yojana Matrix 2026
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-heading mt-1">
                  Active Notifications Desk
                </h2>
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  'All Live Updates',
                  'Latest Jobs', 
                  'University & Admissions',
                  'Admit Cards', 
                  'Results', 
                  'Govt Schemes & Yojana'
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setHeroSearch('');
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                      activeTab === tab && !heroSearch
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                        : 'bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-750'
                    }`}
                  >
                    {tab === 'All Live Updates' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-radar"></span>}
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Sarkari Grid with Clear Source Site Attribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
              {loadingUpdates ? (
                <div className="col-span-full text-center py-12 text-zinc-400 font-medium">
                  <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-indigo-500" />
                  Loading verified notifications feed...
                </div>
              ) : filteredUpdates.length === 0 ? (
                <div className="col-span-full text-center py-10 text-zinc-400">
                  No active notifications found for this category. Try browsing all live updates.
                </div>
              ) : (
                filteredUpdates.slice(0, 12).map((job) => (
                  <Link
                    key={job.id}
                    to={`/post/${job.id}`}
                    className="p-5 rounded-2xl glass-panel hover-lift flex flex-col justify-between gap-4 group block transition-all shadow-sm"
                  >
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-[11px] font-bold flex-wrap gap-1">
                        <span className="text-indigo-600 dark:text-indigo-400 font-extrabold line-clamp-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          {job.organization}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                            job.badge === 'HOT' || job.badge === 'YOJANA'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                              : job.badge === 'NEW' || job.badge === 'JOB' || job.badge === 'CUET' || job.badge === 'UNIV'
                              ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {job.badge || 'ACTIVE'}
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 line-clamp-2 font-heading leading-snug group-hover:text-indigo-500 transition-colors">
                        {job.title}
                      </h3>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {job.summary}
                      </p>

                      {/* Source Site Tag */}
                      <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100/90 dark:bg-zinc-850 px-2.5 py-1 rounded-lg w-fit">
                        <span>🌐 Source:</span>
                        <span className="text-zinc-700 dark:text-indigo-300 font-extrabold truncate max-w-[170px]">
                          {job.sourceName || job.organization}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-200/50 dark:border-zinc-800/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" /> {job.lastDate}
                      </span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Read Details ➔
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>

          </section>
        )}

        {/* ── VIP Alert Banner (Telegram & WhatsApp) ── */}
        {!showVerification && (
          <section className="mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-800/40 relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                <Bell className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black font-heading text-white">
                  Never Miss a Sarkari Naukri or Yojana Deadline!
                </h3>
                <p className="text-xs sm:text-sm text-indigo-200 mt-1">
                  Join 250,000+ aspirants getting instant updates on Telegram &amp; WhatsApp.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="btn-shimmer px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
              >
                <Send className="w-4 h-4 text-amber-300" /> Join Telegram Channel
              </a>
            </div>
          </section>
        )}

        {/* ── Main Articles & Sidebar Layout ── */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Feed Column */}
          <main className="flex-1 flex flex-col gap-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-heading tracking-tight flex items-center gap-2.5">
                <span className="w-2.5 h-7 bg-indigo-600 rounded-full"></span> All Latest Articles &amp; Updates
              </h2>
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-radar"></span>
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
                    <Link
                      to={`/post/${post.id}`}
                      className="glass-panel rounded-[28px] overflow-hidden shadow-sm hover-lift flex flex-col group block transition-all"
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
                        {(post.sourceName || post.rawJob?.sourceName) && (
                          <span className="absolute top-3.5 right-3.5 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-xl bg-slate-950/80 text-emerald-300 backdrop-blur-md border border-emerald-500/30">
                            🌐 {post.sourceName || post.rawJob?.sourceName}
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
                    </Link>

                    {/* In-feed AdSense unit after 3rd post */}
                    {index === 2 && (
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 my-2">
                        <AdUnit variant="fluid" slot="1909584638" minHeight="130px" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Responsive Bottom Banner */}
            <AdUnit variant="banner" slot="7317709042" minHeight="100px" className="my-8" />

            {/* Load More Button */}
            {nextPageToken && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="btn-shimmer px-8 py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-600/20"
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
    </div>
  );
}
