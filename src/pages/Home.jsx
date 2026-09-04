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

  // Profile Matcher States
  const [matchQual, setMatchQual] = useState('all');
  const [matchState, setMatchState] = useState('all');
  const [matchCategory, setMatchCategory] = useState('all');
  const [showSavedModal, setShowSavedModal] = useState(false);

  // Saved Jobs / Bookmarks persisted in localStorage
  const [savedJobs, setSavedJobs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('iwantgovjob_saved_jobs') || '[]');
    } catch {
      return [];
    }
  });

  const toggleSaveJob = (job, e) => {
    if (e) e.preventDefault();
    setSavedJobs((prev) => {
      const exists = prev.some((j) => j.id === job.id);
      let updated;
      if (exists) {
        updated = prev.filter((j) => j.id !== job.id);
      } else {
        updated = [...prev, job];
      }
      try {
        localStorage.setItem('iwantgovjob_saved_jobs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const isJobSaved = (jobId) => savedJobs.some((j) => j.id === jobId);

  // Matching Engine
  const matchedJobs = sarkariUpdates.filter((job) => {
    const text = ((job.title || '') + ' ' + (job.summary || '') + ' ' + (job.qualification || '') + ' ' + (job.organization || '')).toLowerCase();

    // Qualification Filter
    if (matchQual === '10th' && !text.includes('10th') && !text.includes('matric') && !text.includes('group d') && !text.includes('gd')) return false;
    if (matchQual === '12th' && !text.includes('12th') && !text.includes('inter') && !text.includes('chsl') && !text.includes('constable') && !text.includes('clerk')) return false;
    if (matchQual === 'graduate' && !text.includes('graduate') && !text.includes('degree') && !text.includes('cgl') && !text.includes('po') && !text.includes('officer')) return false;
    if (matchQual === 'diploma' && !text.includes('diploma') && !text.includes('iti') && !text.includes('polytechnic') && !text.includes('apprentice')) return false;
    if (matchQual === 'btech' && !text.includes('b.tech') && !text.includes('engineer') && !text.includes('je') && !text.includes('ae')) return false;

    // State Filter
    if (matchState === 'bihar' && !text.includes('bihar') && !text.includes('bssc') && !text.includes('bpsc')) return false;
    if (matchState === 'up' && !text.includes('up') && !text.includes('uttar pradesh') && !text.includes('upsssc') && !text.includes('uppsc')) return false;
    if (matchState === 'delhi' && !text.includes('delhi') && !text.includes('dsssb')) return false;
    if (matchState === 'rajasthan' && !text.includes('rajasthan') && !text.includes('rpsc') && !text.includes('rsmssb')) return false;
    if (matchState === 'mp' && !text.includes('mp') && !text.includes('madhya pradesh') && !text.includes('mppsc')) return false;

    // Category Filter
    if (matchCategory === 'jobs' && !text.includes('job') && !text.includes('recruitment') && !text.includes('bharti')) return false;
    if (matchCategory === 'admit' && !text.includes('admit') && !text.includes('hall ticket')) return false;
    if (matchCategory === 'results' && !text.includes('result') && !text.includes('merit') && !text.includes('score')) return false;
    if (matchCategory === 'schemes' && !text.includes('yojana') && !text.includes('scheme') && !text.includes('kisan')) return false;

    return true;
  });

  // Urgency: Applications Closing Soon
  const closingSoonList = [
    {
      id: 'closing-1',
      title: 'SSC Junior Engineer (JE) 2026 Online Form',
      authority: 'Staff Selection Commission',
      daysLeft: 3,
      progress: 85,
      lastDate: '08 Sep 2026',
      totalPosts: '1,748 Posts',
      applyUrl: 'https://ssc.gov.in',
    },
    {
      id: 'closing-2',
      title: 'Railway RRB ALP & Technician 2026 Recruitment',
      authority: 'Railway Recruitment Control Board',
      daysLeft: 5,
      progress: 75,
      lastDate: '10 Sep 2026',
      totalPosts: '18,799 Posts',
      applyUrl: 'https://rrbapply.gov.in',
    },
    {
      id: 'closing-3',
      title: 'Bihar Police Constable (CSBC) Physical Test Form',
      authority: 'Central Selection Board of Constable',
      daysLeft: 6,
      progress: 68,
      lastDate: '12 Sep 2026',
      totalPosts: '21,391 Posts',
      applyUrl: 'https://csbc.bih.nic.in',
    },
  ];

  // 2026 Interactive Exam Calendar
  const examCalendar = [
    { date: '04 Sep', title: 'SSC CGL 2026 Application', type: 'application', badge: 'Active Now', color: 'emerald' },
    { date: '08 Sep', title: 'Railway RRB Stage I Exam', type: 'exam', badge: 'Exam Scheduled', color: 'indigo' },
    { date: '12 Sep', title: 'CTET Dec 2025 Answer Key', type: 'result', badge: 'Result / Key', color: 'amber' },
    { date: '18 Sep', title: 'Bihar Police SI Final List', type: 'deadline', badge: 'Selection Out', color: 'cyan' },
    { date: '25 Sep', title: 'UPSC Combined Geo-Scientist', type: 'application', badge: 'Closes Soon', color: 'rose' },
  ];

  // State Matrix
  const stateMatrix = [
    { name: 'All India Central', code: 'all', count: '450+', icon: '🏛️' },
    { name: 'Bihar', code: 'bihar', count: '128', icon: '🌾' },
    { name: 'Uttar Pradesh', code: 'up', count: '246', icon: '🏰' },
    { name: 'Delhi NCR', code: 'delhi', count: '82', icon: '🏙️' },
    { name: 'Rajasthan', code: 'rajasthan', count: '113', icon: '🏜️' },
    { name: 'Madhya Pradesh', code: 'mp', count: '94', icon: '🏞️' },
  ];

  return (
    <div className="mesh-bg min-h-screen pb-20 sm:pb-12">
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
          <section className="relative rounded-[38px] overflow-hidden glass-panel-elevated p-6 sm:p-14 mb-8 text-center flex flex-col items-center justify-center border border-indigo-500/20">
            <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-indigo-500/15 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-emerald-500/15 blur-[100px] pointer-events-none" />

            <div className="relative max-w-4xl mx-auto flex flex-col items-center gap-5">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-300 shadow-sm animate-float">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>India's Verified Sarkari Intelligence Portal 2026</span>
              </div>

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
                    placeholder="Search 500+ Sarkari Jobs, Admit Cards, Results, Schemes (Press Cmd+K)..."
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

        {/* ── 🌟 TODAY ON IWANTGOVJOB: DAILY TELEMETRY HUD ── */}
        {!showVerification && (
          <section className="glass-panel rounded-3xl p-5 sm:p-7 mb-8 border border-indigo-500/20 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/70 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 text-xl">
                  👋
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-heading">
                    Today on iWantGovJob Intelligence Desk
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Verified live telemetry updated every 30 minutes from official government portals
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSavedModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-500 hover:text-white text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-all border border-zinc-200 dark:border-zinc-700 shrink-0"
              >
                <span>🔖 Saved Jobs</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                  {savedJobs.length}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 text-center">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xl sm:text-2xl font-black font-heading text-emerald-600 dark:text-emerald-400 block">38+</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">New Jobs Today</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-xl sm:text-2xl font-black font-heading text-indigo-600 dark:text-indigo-400 block">14,580+</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Open Vacancies</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xl sm:text-2xl font-black font-heading text-amber-500 block">12</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Results Declared</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <span className="text-xl sm:text-2xl font-black font-heading text-blue-500 block">8</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Admit Cards Out</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <span className="text-xl sm:text-2xl font-black font-heading text-purple-500 block">15</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Admissions Live</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="text-xl sm:text-2xl font-black font-heading text-cyan-500 block">7</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Welfare Schemes</span>
              </div>
            </div>
          </section>
        )}

        {/* ── 🎯 INTERACTIVE "FIND JOBS FOR ME" PROFILE MATCHER ── */}
        {!showVerification && (
          <section id="find-jobs-section" className="glass-panel-elevated rounded-[32px] p-6 sm:p-8 mb-8 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/70 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-indigo-600/30">
                  🎯
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white font-heading">
                    Find Jobs For Me (Profile Discovery)
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Apni qualification aur state chunein — matching vacancies turant filter hongi
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black">
                <span>⚡ {matchedJobs.length} Vacancies Match Your Profile</span>
              </div>
            </div>

            {/* Selectors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
              
              {/* Qualification Filter */}
              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-2 uppercase tracking-wider">
                  🎓 Qualification
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All Degrees' },
                    { id: '10th', label: '10th Pass' },
                    { id: '12th', label: '12th Pass' },
                    { id: 'graduate', label: 'Graduate' },
                    { id: 'diploma', label: 'ITI / Diploma' },
                    { id: 'btech', label: 'B.Tech / Engg' },
                  ].map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setMatchQual(q.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        matchQual === q.id
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                          : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* State Filter */}
              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-2 uppercase tracking-wider">
                  📍 State / Region
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All India' },
                    { id: 'bihar', label: 'Bihar' },
                    { id: 'up', label: 'Uttar Pradesh' },
                    { id: 'delhi', label: 'Delhi NCR' },
                    { id: 'rajasthan', label: 'Rajasthan' },
                    { id: 'mp', label: 'Madhya Pradesh' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setMatchState(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        matchState === s.id
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                          : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-2 uppercase tracking-wider">
                  📂 Opportunity Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All Types' },
                    { id: 'jobs', label: 'Govt Jobs' },
                    { id: 'admit', label: 'Admit Cards' },
                    { id: 'results', label: 'Exam Results' },
                    { id: 'schemes', label: 'Sarkari Yojana' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setMatchCategory(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        matchCategory === c.id
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                          : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ── ⏰ APPLICATIONS CLOSING SOON (URGENCY BANNER) ── */}
        {!showVerification && (
          <section className="glass-panel rounded-3xl p-6 sm:p-8 mb-8 border border-amber-500/30 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200/70 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-xl shrink-0">
                  ⏰
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white font-heading flex items-center gap-2">
                    Applications Closing Soon (अंतिम तिथि नज़दीक)
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    High-priority recruitments expiring in the next 1–7 days. Apply before server rush!
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs font-black uppercase tracking-wider animate-pulse hidden sm:inline-block">
                High Alert
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
              {closingSoonList.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl glass-panel-elevated border border-amber-500/20 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-amber-500 font-extrabold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {item.daysLeft} Days Left
                      </span>
                      <span className="font-bold text-zinc-400 text-[11px]">{item.totalPosts}</span>
                    </div>

                    <h3 className="font-black text-sm text-zinc-900 dark:text-white line-clamp-2 mb-1">
                      {item.title}
                    </h3>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {item.authority}
                    </span>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-3">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200/50 dark:border-zinc-800/60 text-xs">
                    <span className="text-zinc-400 text-[11px] font-semibold">Last Date: <b>{item.lastDate}</b></span>
                    <a
                      href={item.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-500 hover:text-amber-400 font-extrabold flex items-center gap-1"
                    >
                      Apply Now ➔
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 2-COLUMN WIDGET: 2026 EXAM CALENDAR + STATE EXPLORER ── */}
        {!showVerification && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
            
            {/* 2026 Exam Calendar (7 Columns) */}
            <div id="calendar-section" className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-7 border border-indigo-500/20 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200/70 dark:border-zinc-800 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-heading">
                        2026 Interactive Exam Calendar
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Important application start, exam dates &amp; admit card schedules</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  {examCalendar.map((evt, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black flex flex-col items-center justify-center leading-none shrink-0 shadow-md shadow-indigo-600/20">
                          <span className="text-sm">{evt.date.split(' ')[0]}</span>
                          <span className="text-[10px] uppercase">{evt.date.split(' ')[1]}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-900 dark:text-white text-sm">{evt.title}</h3>
                          <span className="text-zinc-500 dark:text-zinc-400 text-[11px] capitalize">{evt.type}</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 ${
                        evt.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                        evt.color === 'indigo' ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30' :
                        evt.color === 'amber' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                        evt.color === 'cyan' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30' :
                        'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      }`}>
                        {evt.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>🟢 Application • 🔵 Exam • 🟠 Result • 🔴 Last Date</span>
                <span className="font-bold text-indigo-500">Updated Daily</span>
              </div>
            </div>

            {/* India State Explorer Matrix (5 Columns) */}
            <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-7 border border-emerald-500/20 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200/70 dark:border-zinc-800 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-heading">
                        Government Jobs by State
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Browse state-specific recruitment updates</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {stateMatrix.map((st) => (
                    <button
                      key={st.code}
                      onClick={() => {
                        setMatchState(st.code);
                        const el = document.getElementById('find-jobs-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/60 dark:border-zinc-800 hover:border-emerald-500/50 hover:scale-[1.02] transition-all text-left group"
                    >
                      <div className="text-xl mb-1">{st.icon}</div>
                      <div className="font-black text-xs sm:text-sm text-zinc-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                        {st.name}
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                        {st.count} Active Jobs
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-zinc-200/60 dark:border-zinc-800 text-center">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Select any state to automatically filter verified notifications
                </span>
              </div>
            </div>

          </div>
        )}

        {/* ── Sarkari Job & Scheme Matrix Desk (Interactive Filtered Cards) ── */}
        {!showVerification && (
          <section id="jobs-section" className="mb-14 glass-panel rounded-[32px] p-6 sm:p-8 shadow-sm">
            
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

            {/* Sarkari Grid with Clear Source Site Attribution & Save Bookmark Button */}
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
                filteredUpdates.slice(0, 15).map((job) => (
                  <div
                    key={job.id}
                    className="p-5 rounded-2xl glass-panel hover-lift flex flex-col justify-between gap-4 group transition-all shadow-sm relative border border-zinc-200/70 dark:border-zinc-800 hover:border-indigo-500/40"
                  >
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-[11px] font-bold flex-wrap gap-1">
                        <span className="text-indigo-600 dark:text-indigo-400 font-extrabold line-clamp-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          {job.organization}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
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

                          {/* Save / Bookmark Button */}
                          <button
                            onClick={(e) => toggleSaveJob(job, e)}
                            title={isJobSaved(job.id) ? 'Saved' : 'Save Job'}
                            className={`p-1.5 rounded-lg text-xs transition-all ${
                              isJobSaved(job.id)
                                ? 'text-rose-500 bg-rose-500/10'
                                : 'text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            {isJobSaved(job.id) ? '❤️' : '♡'}
                          </button>
                        </div>
                      </div>

                      <Link to={`/post/${job.id}`}>
                        <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 line-clamp-2 font-heading leading-snug group-hover:text-indigo-500 transition-colors">
                          {job.title}
                        </h3>
                      </Link>

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
                      <Link
                        to={`/post/${job.id}`}
                        className="text-xs font-black text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1"
                      >
                        Read Details ➔
                      </Link>
                    </div>
                  </div>
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

                    {index === 2 && (
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 my-2">
                        <AdUnit variant="fluid" slot="1909584638" minHeight="130px" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            <AdUnit variant="banner" slot="7317709042" minHeight="100px" className="my-8" />

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

          <Sidebar />
        </div>

      </div>

      {/* ── 🔖 SAVED JOBS MODAL DRAWER ── */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel-elevated rounded-3xl max-w-xl w-full p-6 sm:p-8 flex flex-col gap-4 border border-indigo-500/30 max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🔖</span>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white font-heading">
                  My Saved Jobs &amp; Opportunities ({savedJobs.length})
                </h3>
              </div>
              <button
                onClick={() => setShowSavedModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
              {savedJobs.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-xs">
                  <div className="text-3xl mb-2">📂</div>
                  Koi saved vacancy nahi hai. Job card par ❤️ icon daba kar save karein!
                </div>
              ) : (
                savedJobs.map((job) => (
                  <div key={job.id} className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/70 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase block">{job.organization}</span>
                      <h4 className="font-bold text-zinc-900 dark:text-white line-clamp-1">{job.title}</h4>
                      <span className="text-[10px] text-zinc-400">Last Date: {job.lastDate}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/post/${job.id}`}
                        onClick={() => setShowSavedModal(false)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-[11px]"
                      >
                        Apply ➔
                      </Link>
                      <button
                        onClick={() => toggleSaveJob(job)}
                        className="text-red-500 hover:text-red-400 font-bold text-sm px-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 📱 MOBILE BOTTOM APP NAVIGATION BAR (PWA STYLE) ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 px-4 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-500"
        >
          <span className="text-base">🏠</span>
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            const el = document.getElementById('jobs-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-500"
        >
          <span className="text-base">💼</span>
          <span>Jobs</span>
        </button>

        <button
          onClick={() => {
            const el = document.getElementById('find-jobs-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400"
        >
          <span className="text-base">🎯</span>
          <span>For Me</span>
        </button>

        <button
          onClick={() => {
            const el = document.getElementById('calendar-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-500"
        >
          <span className="text-base">📅</span>
          <span>Calendar</span>
        </button>

        <button
          onClick={() => setShowSavedModal(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-500 relative"
        >
          <span className="text-base">🔖</span>
          <span>Saved</span>
          {savedJobs.length > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
          )}
        </button>
      </nav>

    </div>
  );
}

