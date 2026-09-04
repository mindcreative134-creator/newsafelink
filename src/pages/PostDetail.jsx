import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById } from '../services/postService';
import { getPosts } from '../services/bloggerApi';
import { useSafelink } from '../context/SafelinkContext';
import Sidebar from '../components/Sidebar';
import StepHeader from '../components/StepHeader';
import { 
  Calendar, Clock, User, ArrowRight, ShieldCheck, 
  CheckCircle2, Lock 
} from 'lucide-react';
import AdUnit from '../components/AdUnit';

// Post detail skeleton loader
function PostDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-6 sm:p-10 flex flex-col gap-6">
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
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
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
        document.title = `${data.title} – SarkariTrend`;

        // Update Meta Description for SEO
        const plainText = data.content ? data.content.replace(/<\/?[^>]+(>|$)/g, '') : '';
        const excerpt = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', excerpt);
        } else {
          metaDesc = document.createElement('meta');
          metaDesc.name = 'description';
          metaDesc.content = excerpt;
          document.head.appendChild(metaDesc);
        }

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load article.');
        setLoading(false);
      });
  }, [postId]);

  // SafeLink countdown timer execution
  useEffect(() => {
    if (currentStep > 0 && post) {
      setTimeLeft(TOTAL_SECONDS);
      setTimerActive(true);
      setTimerDone(false);

      if (timerRef.current) clearInterval(timerRef.current);

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
    } else {
      setTimerActive(false);
      setTimerDone(true);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStep, post, postId]);

  // Step transition (Steps 1 & 2)
  const handleNextStepTransition = () => {
    setLoading(true);
    getPosts({ maxResults: 20 })
      .then((data) => {
        if (data.items && data.items.length > 0) {
          const filtered = data.items.filter((item) => item.id !== postId);
          const pool = filtered.length > 0 ? filtered : data.items;
          const randomNext = pool[Math.floor(Math.random() * pool.length)];

          nextStep();
          window.location.href = `/post/${randomNext.id}`;
        } else {
          nextStep();
          setLoading(false);
        }
      })
      .catch(() => {
        nextStep();
        setLoading(false);
      });
  };

  // Final destination redirect (Step 3)
  const handleFinalRedirect = () => {
    if (targetUrl) {
      clearSafelink();
      window.location.href = targetUrl;
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
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold uppercase text-xs shadow-lg shadow-indigo-600/20"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Safe In-Article AdSense injection respecting policy
  const injectArticleAds = (html) => {
    if (!html) return '';
    const paras = html.split('</p>');
    if (paras.length <= 4) return html;

    const inArticleAd = `
      <div class="my-8 w-full flex flex-col items-center justify-center">
        <div class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Advertisement</div>
        <div class="w-full max-w-2xl overflow-hidden rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-2">
          <ins class="adsbygoogle"
               style="display:block; text-align:center;"
               data-ad-layout="in-article"
               data-ad-format="fluid"
               data-ad-client="ca-pub-9543073887536718"
               data-ad-slot="1641433819"></ins>
        </div>
      </div>
    `;

    let result = '';
    for (let i = 0; i < paras.length; i++) {
      result += paras[i];
      if (i < paras.length - 1) result += '</p>';
      // Inject after 3rd paragraph
      if (i === 2) {
        result += inArticleAd;
      }
    }
    return result;
  };

  const progressCircleOffset = ((TOTAL_SECONDS - timeLeft) / TOTAL_SECONDS) * 282.7;

  return (
    <>
      {/* Step Header for SafeLink Transit */}
      {currentStep > 0 && (
        <StepHeader timerActive={timerActive} timeLeft={timeLeft} totalTime={TOTAL_SECONDS} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Article Content */}
          <main className="flex-1 min-w-0">
            <article className="bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[32px] overflow-hidden shadow-sm p-6 sm:p-10 flex flex-col gap-6 backdrop-blur-sm">
              
              {/* Category Badges */}
              {post.labels && post.labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.labels.map((label) => (
                    <span
                      key={label}
                      className="px-3.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white leading-tight font-heading m-0 tracking-tight">
                {post.title}
              </h1>

              {/* Meta information */}
              <div className="flex flex-wrap items-center text-xs font-semibold text-zinc-400 dark:text-zinc-500 gap-4 pb-6 border-b border-zinc-200/70 dark:border-zinc-800/70">
                <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                  <User className="w-4 h-4 text-indigo-500" /> Editorial Desk
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  {new Date(post.published).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" /> 4 min read
                </span>
              </div>

              {/* Top Ad Unit (Compliant Placement) */}
              <AdUnit slot="7317709042" format="auto" minHeight="100px" className="my-2" />

              {/* ── SafeLink Security Transit Card ── */}
              {currentStep > 0 && (
                <div className="my-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-slate-50/80 dark:from-indigo-950/30 dark:via-zinc-900 dark:to-zinc-950/30 border border-indigo-200/80 dark:border-indigo-900/50 shadow-md flex flex-col items-center text-center">
                  
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
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
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
                    /* Verified Icon */
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 animate-bounce">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                  )}

                  {/* Action Button: Displayed with 32px safe spacing from any ad */}
                  {!timerActive && (
                    <div className="mt-4 mb-2 w-full flex justify-center">
                      {currentStep < 3 ? (
                        <button
                          onClick={handleNextStepTransition}
                          className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-indigo-600/25 transition-all flex items-center gap-2"
                        >
                          Continue to Step {currentStep + 1} <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleFinalRedirect}
                          className="px-12 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/25 transition-all flex items-center gap-2"
                        >
                          <Lock className="w-4 h-4" /> Access Secured Link
                        </button>
                      )}
                    </div>
                  )}

                  <span className="text-[10px] font-semibold text-zinc-400 mt-3 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> End-to-end SafeLink Protection
                  </span>
                </div>
              )}

              {/* Dynamic Post Body HTML */}
              <div
                className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans text-base sm:text-lg space-y-6 break-words"
                dangerouslySetInnerHTML={{ __html: injectArticleAds(post.content) }}
              />

              {/* Bottom Safe Transit Action (For smooth user experience if scrolled to bottom) */}
              {currentStep > 0 && timerDone && (
                <div className="mt-10 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center gap-3">
                  <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    Finished reviewing? Proceed with your verified destination:
                  </div>
                  {currentStep < 3 ? (
                    <button
                      onClick={handleNextStepTransition}
                      className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                    >
                      Proceed to Step {currentStep + 1} <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinalRedirect}
                      className="px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> Go to Secured Link
                    </button>
                  )}
                </div>
              )}

              {/* Bottom Ad Unit */}
              <AdUnit slot="1909584638" format="auto" minHeight="120px" className="mt-8" />

            </article>
          </main>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>
    </>
  );
}
