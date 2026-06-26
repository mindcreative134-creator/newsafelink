import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../services/bloggerApi';
import { useSafelink } from '../context/SafelinkContext';
import Sidebar from '../components/Sidebar';
import { Calendar, User, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import AdUnit from '../components/AdUnit';

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

          // ── JSON-LD ItemList Schema for AI SEO ──
          const existingHomeSchema = document.querySelector('script[data-home-schema]');
          if (existingHomeSchema) existingHomeSchema.remove();

          const itemListSchema = {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            'name': 'Latest Sarkari Job & Education Articles',
            'description': 'Most recent government job notifications, exam updates, and career guidance articles from SarkariTrend.',
            'url': 'https://iwantgovjob.vercel.app/',
            'numberOfItems': data.items.length,
            'itemListElement': data.items.map((item, index) => {
              const plain = item.content ? item.content.replace(/<\/?[^>]+(>|$)/g, '') : '';
              const desc = plain.length > 120 ? plain.substring(0, 120) + '...' : plain;
              return {
                '@type': 'ListItem',
                'position': index + 1,
                'url': `https://iwantgovjob.vercel.app/post/${item.id}`,
                'name': item.title,
                'item': {
                  '@type': 'Article',
                  'headline': item.title,
                  'description': desc,
                  'datePublished': item.published,
                  'url': `https://iwantgovjob.vercel.app/post/${item.id}`,
                  'keywords': item.labels ? item.labels.join(', ') : 'sarkari job',
                  'publisher': { '@id': 'https://iwantgovjob.vercel.app/#organization' },
                },
              };
            }),
          };

          const schemaScript = document.createElement('script');
          schemaScript.type = 'application/ld+json';
          schemaScript.setAttribute('data-home-schema', 'true');
          schemaScript.textContent = JSON.stringify(itemListSchema);
          document.head.appendChild(schemaScript);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return () => {
      const s = document.querySelector('script[data-home-schema]');
      if (s) s.remove();
    };
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
        <div className="w-full flex flex-col items-center justify-center my-6" style={{ gap: 0, margin: 0, padding: 0 }}>
          {/* Ad ABOVE checkbox */}
          <div className="w-full flex items-center justify-center home-robot-ad-container" style={{ margin: 0, padding: 0 }}>
            <AdUnit key={`home-robot-ad1-${safelinkTarget}`} slot="7317709042" format="auto" />
          </div>

          {/* Exact Replica of Google reCAPTCHA Box */}
          <div className="recaptcha-box flex items-center justify-between" style={{ margin: 0 }}>
            <div className="flex items-center gap-3">
              {verifying ? (
                <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : verified ? (
                <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <input
                  type="checkbox"
                  id="not-robot"
                  className="w-7 h-7 border-2 border-zinc-350 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-blue-600 rounded-sm focus:ring-0 cursor-pointer"
                  style={{ width: '28px', height: '28px' }}
                  onChange={handleRobotCheck}
                />
              )}
              <label htmlFor="not-robot" className="text-[15px] font-normal text-zinc-900 dark:text-zinc-100 cursor-pointer select-none font-sans pl-1">
                {verifying ? 'Verifying...' : verified ? 'Verified' : "I'm not a robot"}
              </label>
            </div>

            {/* Google Logo & Privacy/Terms */}
            <div className="flex flex-col items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <div className="text-[8px] text-zinc-400 font-medium font-sans flex flex-col items-center leading-none mt-1">
                <span className="font-semibold text-zinc-500 dark:text-zinc-350 text-[10px]">reCAPTCHA</span>
                <span className="mt-0.5"><a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="hover:underline text-zinc-400">Privacy</a> - <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="hover:underline text-zinc-400">Terms</a></span>
              </div>
            </div>
          </div>

          {/* Ad BELOW checkbox */}
          <div className="w-full flex flex-col gap-0 mt-1" style={{ margin: 0, padding: 0 }}>
            <AdUnit key={`home-robot-ad2-${safelinkTarget}`} slot="1909584638" format="fluid" layoutKey="-6t+ed+2i-1n-4w" />
            <AdUnit key={`home-robot-ad3-${safelinkTarget}`} slot="5754054742" format="auto" />
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
            {posts.map((post, index) => (
              <React.Fragment key={post.id}>
                <article
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
                      <span className="absolute top-3.5 left-3.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/20">
                        {post.labels[0]}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center text-[9px] font-black text-zinc-400 dark:text-zinc-500 gap-3.5 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-550" />
                          {new Date(post.published).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-550" />
                          Staff Writer
                        </span>
                      </div>
                      <h3
                        onClick={() => navigate(`/post/${post.id}`)}
                        className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 leading-snug cursor-pointer font-heading transition-colors"
                      >
                        {post.title}
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm line-clamp-3 leading-relaxed font-medium">
                        {getExcerpt(post.content, 120)}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-extrabold text-xs gap-1.5 self-start group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors"
                    >
                      Read Full Article <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </article>

                {/* In-feed Ad after the 3rd post */}
                {index === 2 && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[24px] p-4 flex items-center justify-center min-h-[120px]">
                    <AdUnit key={`home-list-ad-${index}`} slot="1909584638" format="fluid" layoutKey="-6t+ed+2i-1n-4w" minHeight="120px" />
                  </div>
                )}
              </React.Fragment>
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
