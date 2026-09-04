import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPostById } from '../services/postService';
import { getPosts } from '../services/bloggerApi';
import { getLiveSarkariUpdates } from '../services/rssService';
import { useSafelink } from '../context/SafelinkContext';
import Sidebar from '../components/Sidebar';
import StepHeader from '../components/StepHeader';
import { 
  Calendar, Clock, User, ArrowRight, ShieldCheck, 
  CheckCircle2, Lock, Building2, FileText, ExternalLink,
  ChevronRight, Sparkles, Share2, Check
} from 'lucide-react';
import AdUnit from '../components/AdUnit';

// Post detail skeleton loader
function PostDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 min-w-0">
          <div className="glass-panel rounded-[32px] p-6 sm:p-10 flex flex-col gap-6">
            <div className="flex gap-2">
              <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            </div>
            <div className="h-10 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="flex gap-4">
              <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
            <div className="w-full aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            <div className="space-y-3 mt-4">
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-8">
          <div className="glass-panel rounded-2xl p-6 shadow-sm">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentStep, targetUrl, nextStep, clearSafelink } = useSafelink();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [copied, setCopied] = useState(false);

  // SafeLink countdown timer state
  const TOTAL_SECONDS = 15;
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const timerRef = useRef(null);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [postId]);

  // Fetch article data
  useEffect(() => {
    setLoading(true);
    setError('');
    getPostById(postId)
      .then((data) => {
        setPost(data);
        // 1. High-CTR SEO Title
        document.title = `${data.title} – Apply Online, Notification PDF, Eligibility | SarkariTrend`;

        // 2. SEO Meta Description
        const plainText = data.content ? data.content.replace(/<\/?[^>]+(>|$)/g, '') : '';
        const excerpt = plainText.length > 155 ? plainText.substring(0, 155) + '...' : plainText;
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', excerpt);
        } else {
          metaDesc = document.createElement('meta');
          metaDesc.name = 'description';
          metaDesc.content = excerpt;
          document.head.appendChild(metaDesc);
        }

        // 3. Dynamic Canonical Tag
        const canonicalUrl = `https://iwantgovjob.vercel.app/post/${data.id}`;
        let canonicalEl = document.querySelector('link[rel="canonical"]');
        if (canonicalEl) {
          canonicalEl.setAttribute('href', canonicalUrl);
        }

        // 4. OpenGraph Social & Browser Search Sharing Tags
        const ogImage = data.imageUrl || data.thumbnail || 'https://iwantgovjob.vercel.app/og-image.jpg';
        const updateMeta = (prop, val) => {
          let el = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
          if (el) el.setAttribute('content', val);
        };
        updateMeta('og:title', data.title);
        updateMeta('og:description', excerpt);
        updateMeta('og:url', canonicalUrl);
        updateMeta('og:image', ogImage);
        updateMeta('twitter:title', data.title);
        updateMeta('twitter:description', excerpt);
        updateMeta('twitter:image', ogImage);

        // 5. Dynamic Schema.org JSON-LD Structured Data
        const raw = data.rawJob || {};
        const orgName = raw.organization || (data.labels && data.labels[1]) || 'Government Recruitment Board';
        const isJob = (raw.category || '').toLowerCase().includes('job') || data.title.toLowerCase().includes('recruitment') || data.title.toLowerCase().includes('vacancy');

        const schemaData = isJob ? {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": data.title,
          "description": excerpt,
          "datePosted": data.published ? data.published.split('T')[0] : new Date().toISOString().split('T')[0],
          "validThrough": raw.lastDate && raw.lastDate.includes('202') ? raw.lastDate : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          "employmentType": "FULL_TIME",
          "hiringOrganization": {
            "@type": "Organization",
            "name": orgName,
            "sameAs": raw.applyUrl || "https://biharhelp.in"
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "IN"
            }
          },
          "url": canonicalUrl
        } : {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": data.title,
          "description": excerpt,
          "image": [ogImage],
          "datePublished": data.published || new Date().toISOString(),
          "dateModified": data.published || new Date().toISOString(),
          "author": [{
            "@type": "Person",
            "name": "SarkariTrend Editorial Board",
            "url": "https://iwantgovjob.vercel.app/about"
          }],
          "publisher": {
            "@type": "Organization",
            "name": "SarkariTrend",
            "logo": {
              "@type": "ImageObject",
              "url": "https://iwantgovjob.vercel.app/favicon.svg"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
          }
        };

        let schemaScript = document.getElementById('schema-job-posting');
        if (!schemaScript) {
          schemaScript = document.createElement('script');
          schemaScript.id = 'schema-job-posting';
          schemaScript.type = 'application/ld+json';
          document.head.appendChild(schemaScript);
        }
        schemaScript.textContent = JSON.stringify(schemaData);

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Article not found');
        setLoading(false);
      });

    // Related posts
    getLiveSarkariUpdates()
      .then((items) => {
        setRelatedPosts(items.slice(0, 3));
      })
      .catch(() => {});
  }, [postId]);

  // Handle SafeLink Transit Countdown
  useEffect(() => {
    if (currentStep > 0 && !timerDone) {
      setTimeLeft(TOTAL_SECONDS);
      setTimerActive(true);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            setTimerDone(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [currentStep, timerDone]);

  const handleNextStepTransition = () => {
    nextStep();
    setTimeLeft(TOTAL_SECONDS);
    setTimerActive(false);
    setTimerDone(false);

    getPosts({ maxResults: 15 }).then((data) => {
      if (data.items && data.items.length > 0) {
        const remaining = data.items.filter((p) => p.id !== postId);
        const randomPost = remaining[Math.floor(Math.random() * remaining.length)];
        navigate(`/post/${randomPost.id}`);
      }
    });
  };

  const handleFinalRedirect = () => {
    if (targetUrl) {
      clearSafelink();
      window.location.href = targetUrl;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <PostDetailSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-red-600 mb-3 font-heading">Unable to Load Article</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">{error || 'Article not found.'}</p>
        <button
          onClick={() => navigate('/')}
          className="btn-shimmer px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold uppercase text-xs shadow-lg shadow-indigo-600/20"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const progressCircleOffset = ((TOTAL_SECONDS - timeLeft) / TOTAL_SECONDS) * 282.7;

  // Extract structured data if available
  const rawJob = post.rawJob || {};
  const org = rawJob.organization || 'Official Recruitment Board';
  const category = rawJob.category || (post.labels && post.labels[0]) || 'Government Update';
  const totalPosts = rawJob.totalPosts || 'Refer to Notification';
  const qualification = rawJob.qualification || '10th / 12th / Graduate / Diploma (As per official notification)';
  const ageLimit = rawJob.ageLimit || 'As per central / state government recruitment norms';
  const lastDate = rawJob.lastDate || 'Active Online';
  const pubDate = post.published ? new Date(post.published).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'Recently Updated';
  const applyUrl = rawJob.applyUrl || 'https://biharhelp.in';
  const summary = rawJob.summary || post.title;
  const postImage = post.imageUrl || post.thumbnail;

  return (
    <div className="mesh-bg min-h-screen">
      {/* Step Header for SafeLink Transit */}
      {currentStep > 0 && (
        <StepHeader timerActive={timerActive} timeLeft={timeLeft} totalTime={TOTAL_SECONDS} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-400 dark:text-zinc-400 mb-6 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link to={`/category/${encodeURIComponent(category)}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-zinc-600 dark:text-zinc-200 truncate max-w-xs">{post.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Article Content */}
          <main className="flex-1 min-w-0">
            <article className="glass-panel-elevated rounded-[36px] overflow-hidden shadow-sm p-6 sm:p-10 flex flex-col gap-6 border border-indigo-500/20">
              
              {/* Category Badges & Share */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                    {category}
                  </span>
                  <span className="px-3.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {org}
                  </span>
                </div>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copied ? 'Link Copied!' : 'Share'}
                </button>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white leading-tight font-heading m-0 tracking-tight glow-text-primary">
                {post.title}
              </h1>

              {/* Meta information */}
              <div className="flex flex-wrap items-center text-xs font-semibold text-zinc-400 dark:text-zinc-400 gap-4 pb-4 border-b border-zinc-200/70 dark:border-zinc-800/70">
                <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                  <User className="w-4 h-4 text-indigo-500" /> Editorial Board
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  {pubDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" /> 3 min read
                </span>
              </div>

              {/* Top Banner Image */}
              {postImage && (
                <div className="w-full aspect-video sm:max-h-[400px] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800">
                  <img
                    src={postImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Top Native Ad Unit (BiharHelp Advt #1) */}
              <AdUnit variant="fluid" slot="9320506924" minHeight="120px" className="my-1" />

              {/* ── SafeLink Security Transit Card ── */}
              {currentStep > 0 && (
                <div className="my-4 p-6 sm:p-8 rounded-3xl glass-panel-elevated border-2 border-indigo-400/80 dark:border-indigo-500/50 shadow-xl flex flex-col items-center text-center animate-fadeIn">
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                      Security Phase {currentStep}/3
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white font-heading mb-1">
                    {currentStep === 1 && 'Checking Link Safety & Threat Diagnostics'}
                    {currentStep === 2 && 'Verifying SSL Certificates & Gateway Protocol'}
                    {currentStep === 3 && 'Generating Encrypted Destination Link'}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mb-6 leading-relaxed">
                    {timerActive 
                      ? 'Our automated security transit protocol is running diagnostics. Please wait a moment.'
                      : 'Security verification complete! You may now proceed.'}
                  </p>

                  {/* Circular SVG Countdown Timer */}
                  {timerActive ? (
                    <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="transparent"
                          stroke="#e2e8f0"
                          className="dark:stroke-zinc-800"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="transparent"
                          stroke="#4f46e5"
                          strokeWidth="8"
                          strokeDasharray={282.7}
                          strokeDashoffset={282.7 - progressCircleOffset}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-linear"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-heading">
                          {timeLeft}s
                        </span>
                        <span className="text-[9px] uppercase font-bold text-zinc-400">Verifying</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-4 animate-bounce">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                  )}

                  {!timerActive && (
                    <div className="mt-4 mb-2 w-full flex justify-center">
                      {currentStep < 3 ? (
                        <button
                          onClick={handleNextStepTransition}
                          className="btn-shimmer px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-indigo-600/25 transition-all flex items-center gap-2"
                        >
                          Continue to Step {currentStep + 1} <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleFinalRedirect}
                          className="btn-shimmer px-12 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/25 transition-all flex items-center gap-2"
                        >
                          <Lock className="w-4 h-4" /> Access Secured Link
                        </button>
                      )}
                    </div>
                  )}

                  <span className="text-[10px] font-semibold text-zinc-400 mt-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-radar"></span>
                    <span>End-to-end SafeLink Protocol Protection</span>
                  </span>
                </div>
              )}

              {/* ── Native Structured Post Content ── */}
              {post.isSarkariJob || rawJob.title ? (
                <div className="space-y-6">
                  {/* Quick Overview Highlight Box */}
                  <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-indigo-500/20">
                    <h3 className="text-base font-black text-indigo-900 dark:text-indigo-200 mb-2 font-heading flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500" /> Quick Notification Summary
                    </h3>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                      {summary}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="glass-panel p-3 rounded-xl shadow-sm">
                        <span className="text-zinc-400 block text-[10px] font-bold uppercase">Authority</span>
                        <strong className="text-zinc-900 dark:text-zinc-100 font-extrabold line-clamp-1">{org}</strong>
                      </div>
                      <div className="glass-panel p-3 rounded-xl shadow-sm">
                        <span className="text-zinc-400 block text-[10px] font-bold uppercase">Total Posts</span>
                        <strong className="text-zinc-900 dark:text-zinc-100 font-extrabold">{totalPosts}</strong>
                      </div>
                      <div className="glass-panel p-3 rounded-xl shadow-sm">
                        <span className="text-zinc-400 block text-[10px] font-bold uppercase">Category</span>
                        <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold line-clamp-1">{category}</strong>
                      </div>
                      <div className="glass-panel p-3 rounded-xl shadow-sm">
                        <span className="text-zinc-400 block text-[10px] font-bold uppercase">Status</span>
                        <strong className="text-emerald-500 dark:text-emerald-400 font-extrabold">{lastDate}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Overview Table */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-heading mt-6 mb-3">
                      {post.title} – Detailed Overview
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                      Candidates seeking official details regarding <strong>{post.title}</strong> issued by <strong>{org}</strong> can find all verified information below, including qualifications, step-by-step instructions, and official portal links.
                    </p>

                    <div className="overflow-x-auto rounded-2xl glass-panel shadow-sm">
                      <table className="w-full text-xs sm:text-sm border-collapse">
                        <tbody>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="font-bold bg-zinc-50 dark:bg-zinc-800/70 p-3.5 w-1/3 text-zinc-700 dark:text-zinc-300">Recruitment Authority</td>
                            <td className="p-3.5 text-zinc-900 dark:text-zinc-100 font-semibold">{org}</td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="font-bold bg-zinc-50 dark:bg-zinc-800/70 p-3.5 text-zinc-700 dark:text-zinc-300">Post / Scheme Name</td>
                            <td className="p-3.5 text-zinc-900 dark:text-zinc-100 font-semibold">{post.title}</td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="font-bold bg-zinc-50 dark:bg-zinc-800/70 p-3.5 text-zinc-700 dark:text-zinc-300">Total Vacancies / Scope</td>
                            <td className="p-3.5 text-zinc-900 dark:text-zinc-100 font-semibold">{totalPosts}</td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="font-bold bg-zinc-50 dark:bg-zinc-800/70 p-3.5 text-zinc-700 dark:text-zinc-300">Application Mode</td>
                            <td className="p-3.5 text-zinc-900 dark:text-zinc-100 font-semibold">Online (Official Portal)</td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="font-bold bg-zinc-50 dark:bg-zinc-800/70 p-3.5 text-zinc-700 dark:text-zinc-300">Notification Released</td>
                            <td className="p-3.5 text-zinc-900 dark:text-zinc-100 font-semibold">{pubDate}</td>
                          </tr>
                          <tr>
                            <td className="font-bold bg-zinc-50 dark:bg-zinc-800/70 p-3.5 text-zinc-700 dark:text-zinc-300">Current Status</td>
                            <td className="p-3.5 text-emerald-500 dark:text-emerald-400 font-extrabold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active Online
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mid-Article Ad (BiharHelp Advt #2) */}
                  <AdUnit variant="in-article" slot="4392273015" minHeight="140px" className="my-6" />

                  {/* Eligibility & Criteria */}
                  <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-indigo-500/20">
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white font-heading mb-3 flex items-center gap-2">
                      🎯 Eligibility &amp; Selection Criteria
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <li><strong>Educational Qualification:</strong> {qualification}.</li>
                      <li><strong>Age Limit:</strong> {ageLimit}. Age relaxation is applicable as per government reservation rules.</li>
                      <li><strong>Nationality:</strong> Candidate must be a citizen of India.</li>
                    </ul>
                  </div>

                  {/* Step-by-Step Instructions */}
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white font-heading mb-3 flex items-center gap-2">
                      📝 How to Apply / Check Status Online
                    </h3>
                    <ol className="list-decimal pl-5 space-y-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                      <li>Click on the direct official link provided below to open the authentic portal.</li>
                      <li>Locate the notification advertisement for <strong>{post.title}</strong>.</li>
                      <li>Review the brochure guidelines thoroughly before filling out details.</li>
                      <li>Complete online registration, upload required certificates/photographs, and pay the fee if applicable.</li>
                      <li>Download and retain a printout of the confirmation page for future reference.</li>
                    </ol>
                  </div>

                  {/* Pre-Link Ad Placement (BiharHelp Advt #3) */}
                  <AdUnit variant="pre-link" slot="1362664078" minHeight="120px" className="my-6" />

                  {/* Important Official Direct Links Box */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-950 text-white shadow-2xl border border-indigo-500/30">
                    <h4 className="text-base sm:text-lg font-black uppercase tracking-wider mb-2 text-amber-400 font-heading flex items-center gap-2">
                      ⚡ Official Direct Links &amp; Actions
                    </h4>
                    <p className="text-xs text-zinc-300 mb-6">
                      Click below to access verified direct portals for <strong>{post.title}</strong>:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <a
                        href={applyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-shimmer p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider text-center transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" /> Apply Online / Direct Portal ➔
                      </a>
                      <a
                        href={applyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-shimmer p-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-black text-xs uppercase tracking-wider text-center transition-all border border-white/20 flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" /> Official Notification PDF
                      </a>
                    </div>
                    <p className="text-[11px] text-zinc-400 text-center mt-4">
                      Notice: Always verify details with the official recruitment release before submitting credentials.
                    </p>
                  </div>
                </div>
              ) : (
                /* Fallback for pure HTML Blogger posts */
                <div className="space-y-6">
                  <div
                    className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans text-base sm:text-lg space-y-6 break-words"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                  <AdUnit variant="pre-link" slot="1362664078" minHeight="120px" className="my-6" />
                </div>
              )}

              {/* Bottom SafeLink Action (if scrolled down) */}
              {currentStep > 0 && timerDone && (
                <div className="mt-8 p-6 rounded-3xl glass-panel flex flex-col items-center justify-center text-center gap-3">
                  <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    Finished reviewing? Proceed to your secured link:
                  </div>
                  {currentStep < 3 ? (
                    <button
                      onClick={handleNextStepTransition}
                      className="btn-shimmer px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                    >
                      Proceed to Step {currentStep + 1} <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinalRedirect}
                      className="btn-shimmer px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> Go to Secured Link
                    </button>
                  )}
                </div>
              )}

              {/* Bottom Ad Unit (BiharHelp Bottom Placement) */}
              <AdUnit variant="banner" slot="1909584638" minHeight="100px" className="mt-8" />

            </article>

            {/* ── Related Notifications Grid ── */}
            {relatedPosts.length > 0 && (
              <section className="mt-10 glass-panel-elevated rounded-[32px] p-6 sm:p-8 shadow-sm border border-indigo-500/20">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-200/70 dark:border-zinc-800">
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white font-heading flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> Related Recruitment &amp; Notifications
                  </h3>
                  <Link to="/" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    View All ➔
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedPosts.map((rel) => (
                    <Link
                      key={rel.id}
                      to={`/post/${rel.id}`}
                      className="p-4 rounded-2xl glass-panel hover-lift transition-all flex flex-col justify-between gap-3 group"
                    >
                      <div>
                        <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 block mb-1">
                          {rel.organization || rel.category}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors line-clamp-2 leading-snug">
                          {rel.title}
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read Details ➔
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </main>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
