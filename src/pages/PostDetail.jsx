import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, getPosts } from '../services/bloggerApi';
import { useSafelink } from '../context/SafelinkContext';
import Sidebar from '../components/Sidebar';
import StepHeader from '../components/StepHeader';
import { Calendar, User, ArrowRight, Shield, CheckCircle2, Clock } from 'lucide-react';

// ─── Ad Slot Component ────────────────────────────────────────────────────────
// Each <AdSlot> manages its own push; no duplicate push needed elsewhere.
function AdSlot({ slot = '7317709042', format = 'auto' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Only push once after mount, guarded by a flag on the element
    const el = containerRef.current?.querySelector('ins');
    if (!el) return;
    if (el.getAttribute('data-pushed') === 'true') return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      el.setAttribute('data-pushed', 'true');
    } catch (e) {
      // ignore adsbygoogle errors in dev
    }
  }, []);

  return (
    <div ref={containerRef} className="adsense-container w-full overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-9543073887536718"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// ─── Shimmer Skeleton ─────────────────────────────────────────────────────────
function PostDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Article skeleton */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            </div>
            <div className="h-10 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="flex gap-4">
              <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
            <div className="w-full aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            <div className="space-y-3 mt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded" style={{ width: `${85 + Math.random() * 15}%` }} />
              ))}
            </div>
          </div>
        </div>
        {/* Sidebar skeleton */}
        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
            <div className="flex flex-wrap gap-2">
              <div className="h-7 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              <div className="h-7 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              <div className="h-7 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentStep, targetUrl, nextStep, clearSafelink } = useSafelink();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Timer state
  const TIMER_DURATION = 15;
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const timerRef = useRef(null);

  // Scroll to top on post change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [postId]);

  // Fetch post
  useEffect(() => {
    setLoading(true);
    setError('');
    getPostById(postId)
      .then((data) => {
        setPost(data);

        // Update document title
        document.title = `${data.title} - SarkariTrend`;

        // Update meta description
        const plainText = data.content ? data.content.replace(/<\/?[^>]+(>|$)/g, '') : '';
        const excerpt = plainText.length > 160 ? plainText.substring(0, 160) + '...' : plainText;
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', excerpt);
        } else {
          metaDesc = document.createElement('meta');
          metaDesc.name = 'description';
          metaDesc.content = excerpt;
          document.head.appendChild(metaDesc);
        }

        // Update canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
          canonical.setAttribute('href', window.location.href);
        } else {
          canonical = document.createElement('link');
          canonical.rel = 'canonical';
          canonical.href = window.location.href;
          document.head.appendChild(canonical);
        }

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch article details.');
        setLoading(false);
      });
  }, [postId]);

  // Safelink timer — runs each time step changes (and post is ready)
  useEffect(() => {
    if (currentStep > 0 && post) {
      setTimeLeft(TIMER_DURATION);
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
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStep, post, postId]);

  // Step transition (Steps 1 → 2 → 3)
  const handleStepTransition = () => {
    setLoading(true);
    getPosts({ maxResults: 20 })
      .then((data) => {
        if (data.items && data.items.length > 0) {
          const filtered = data.items.filter((item) => item.id !== postId);
          const list = filtered.length > 0 ? filtered : data.items;
          const next = list[Math.floor(Math.random() * list.length)];
          nextStep();
          navigate(`/post/${next.id}`);
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

  // Final redirect (Step 3 complete)
  const handleFinalRedirect = () => {
    if (targetUrl) {
      clearSafelink();
      window.location.href = targetUrl;
    }
  };

  if (loading) return <PostDetailSkeleton />;

  if (error || !post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 mb-6">
          <span className="text-red-500 text-2xl">⚠</span>
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 font-heading">
          {error ? 'Something went wrong' : 'Article not found'}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">{error || 'This article could not be located.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Inject ad units into Blogger HTML content
  const injectAds = (html) => {
    if (!html) return '';
    const paras = html.split('</p>');
    if (paras.length <= 3) return html;

    const adUnit = `
      <div class="adsense-container w-full overflow-hidden">
        <ins class="adsbygoogle"
             style="display:block;width:100%"
             data-ad-client="ca-pub-9543073887536718"
             data-ad-slot="7317709042"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>
    `;

    let finalHtml = '';
    for (let i = 0; i < paras.length; i++) {
      finalHtml += paras[i];
      if (i < paras.length - 1) finalHtml += '</p>';
      if (i === 1) finalHtml += adUnit;
      if (i === paras.length - 3) finalHtml += adUnit;
    }
    return finalHtml;
  };

  // Extract first image from blogger content
  const getPostImage = (p) => {
    if (!p.content) return 'https://picsum.photos/1200/600';
    const match = p.content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : 'https://picsum.photos/1200/600';
  };

  const isStepComplete = timerDone;

  return (
    <>
      {/* Sticky step progress banner */}
      {currentStep > 0 && (
        <StepHeader timerActive={timerActive} timeLeft={timeLeft} totalTime={TIMER_DURATION} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* ── Article Column ─────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            <article className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">

              {/* Labels */}
              {post.labels && post.labels.length > 0 && (
                <div className="flex gap-2 px-6 sm:px-8 pt-6 sm:pt-8">
                  {post.labels.map((label) => (
                    <span
                      key={label}
                      className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <div className="px-6 sm:px-8 pt-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-white leading-tight font-heading">
                  {post.title}
                </h1>
              </div>

              {/* Meta */}
              <div className="flex items-center text-sm text-zinc-400 dark:text-zinc-500 gap-4 px-6 sm:px-8 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.published).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  Staff Writer
                </span>
              </div>

              {/* Featured Image */}
              <div className="w-full aspect-video overflow-hidden">
                <img
                  src={getPostImage(post)}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* ── Safelink Verification Widget ──────────────── */}
              {currentStep > 0 && (
                <div className="flex flex-col gap-4 px-6 sm:px-8 py-6">

                  {/* Top AdSense */}
                  <AdSlot />

                  {/* Instruction Banner */}
                  <div className="w-full p-4 sm:p-5 bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-center space-y-2">
                    <p className="flex items-center justify-center gap-2 font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                      👇 Click Image &amp; Wait, then Come Back to Get Your Link
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-hindi leading-relaxed">
                      👇 LINK पाने के लिए — नीचे फोटो पर क्लिक करें, 15 सेकंड रुकें, फिर इसी पेज पर वापस आएं
                    </p>
                  </div>

                  {/* Timer / Action Widget */}
                  <div className="bg-gradient-to-br from-slate-50 to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center gap-6 shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mb-1">
                        <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white font-heading">
                        Link Security Check
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {currentStep === 3
                          ? 'Finalizing secure transit credentials...'
                          : `Step ${currentStep} of 3 — Processing verification parameters`}
                      </p>
                    </div>

                    {/* Step Indicators */}
                    <div className="flex items-center gap-2 w-full max-w-xs">
                      {[1, 2, 3].map((step) => (
                        <React.Fragment key={step}>
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-all ${
                            step < currentStep
                              ? 'bg-green-500 border-green-500 text-white'
                              : step === currentStep
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400'
                          }`}>
                            {step < currentStep ? '✓' : step}
                          </div>
                          {step < 3 && (
                            <div className={`flex-1 h-0.5 rounded transition-all ${step < currentStep ? 'bg-green-400' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Timer or Done */}
                    {timerActive ? (
                      <div className="flex flex-col items-center gap-3 w-full max-w-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-red-500 animate-pulse" />
                          <span className="text-lg font-extrabold text-red-600 dark:text-red-400 font-mono tabular-nums">
                            {timeLeft}s remaining
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-full transition-all duration-1000 ease-linear"
                            style={{ width: `${(timeLeft / TIMER_DURATION) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-zinc-400">Please stay on this page while we verify...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 w-full">
                        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full border border-green-200 dark:border-green-800/50 text-sm font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          Parameters Authenticated
                        </div>
                        <button
                          onClick={() => {
                            const el = document.getElementById('safelink-bottom-trigger');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                            else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                          }}
                          className="px-8 py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all text-sm uppercase tracking-wide"
                        >
                          ↓ Scroll Down to Continue
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bottom AdSense */}
                  <AdSlot />
                </div>
              )}

              {/* Post Content */}
              <div
                className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed text-base sm:text-lg break-words px-6 sm:px-8 pb-6 sm:pb-8"
                dangerouslySetInnerHTML={{ __html: injectAds(post.content) }}
              />

              {/* Bottom Safelink Action Trigger */}
              {currentStep > 0 && (
                <div
                  id="safelink-bottom-trigger"
                  className="px-6 sm:px-8 pb-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col items-center gap-4"
                >
                  {!isStepComplete ? (
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-950 px-6 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <Clock className="w-4 h-4" />
                      Complete verification above first
                    </div>
                  ) : currentStep === 1 ? (
                    <button
                      onClick={handleStepTransition}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm uppercase tracking-wide"
                    >
                      Continue to Step 2 <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : currentStep === 2 ? (
                    <button
                      onClick={handleStepTransition}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm uppercase tracking-wide"
                    >
                      Continue to Step 3 <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinalRedirect}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold px-12 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm uppercase tracking-wide"
                    >
                      🔓 Go to Secured Link <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {currentStep < 3 ? `Step ${currentStep} of 3` : 'Final Step — Your link is ready!'}
                  </p>
                </div>
              )}

            </article>
          </main>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>
    </>
  );
}
