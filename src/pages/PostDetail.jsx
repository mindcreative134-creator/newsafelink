import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, getPosts } from '../services/bloggerApi';
import { useSafelink } from '../context/SafelinkContext';
import Sidebar from '../components/Sidebar';
import StepHeader from '../components/StepHeader';
import { Calendar, User, ArrowRight } from 'lucide-react';

// ─── Ad Slot — No placeholder, zero space until rendered ──────────────────────
let adPushCount = 0;
function AdSlot() {
  const ref = useRef(null);
  useEffect(() => {
    const ins = ref.current;
    if (!ins || ins.getAttribute('data-ad-status')) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {}
  }, []);

  return (
    <div className="adsense-container">
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-9543073887536718"
        data-ad-slot="7317709042"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// ─── Shimmer Skeleton ─────────────────────────────────────────────────────────
function PostDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          </div>
          <div className="h-8 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <div className="flex gap-4">
            <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          <div className="w-full aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <div className="space-y-2.5">
            {[100, 100, 85, 100, 75].map((w, i) => (
              <div key={i} className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
              <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-3" />
              <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-3 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded mt-2" />
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const TIMER_DURATION = 15;

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentStep, targetUrl, nextStep, clearSafelink } = useSafelink();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, [postId]);

  // Fetch post
  useEffect(() => {
    setLoading(true);
    setError('');
    getPostById(postId)
      .then((data) => {
        setPost(data);
        document.title = `${data.title} - SarkariTrend`;
        const plain = data.content ? data.content.replace(/<\/?[^>]+(>|$)/g, '') : '';
        const excerpt = plain.length > 160 ? plain.substring(0, 160) + '...' : plain;

        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', excerpt);
        else {
          metaDesc = document.createElement('meta');
          metaDesc.name = 'description';
          metaDesc.content = excerpt;
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
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load article.');
        setLoading(false);
      });
  }, [postId]);

  // Timer
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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentStep, post, postId]);

  // Step transition
  const handleStepTransition = () => {
    setLoading(true);
    getPosts({ maxResults: 20 })
      .then((data) => {
        if (data.items && data.items.length > 0) {
          const filtered = data.items.filter((i) => i.id !== postId);
          const list = filtered.length > 0 ? filtered : data.items;
          const next = list[Math.floor(Math.random() * list.length)];
          nextStep();
          navigate(`/post/${next.id}`);
        } else { nextStep(); setLoading(false); }
      })
      .catch(() => { nextStep(); setLoading(false); });
  };

  const handleFinalRedirect = () => {
    if (targetUrl) { clearSafelink(); window.location.href = targetUrl; }
  };

  if (loading) return <PostDetailSkeleton />;

  if (error || !post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 font-heading">Article not found</h2>
        <p className="text-zinc-500 mb-6">{error || 'This article could not be located.'}</p>
        <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all">
          Return Home
        </button>
      </div>
    );
  }

  // Inject ads into blogger content
  const injectAds = (html) => {
    if (!html) return '';
    const paras = html.split('</p>');
    if (paras.length <= 3) return html;
    const adUnit = `<div class="adsense-container"><ins class="adsbygoogle" style="display:block;width:100%" data-ad-client="ca-pub-9543073887536718" data-ad-slot="7317709042" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`;
    let out = '';
    for (let i = 0; i < paras.length; i++) {
      out += paras[i];
      if (i < paras.length - 1) out += '</p>';
      if (i === 1) out += adUnit;
      if (paras.length > 5 && i === paras.length - 3) out += adUnit;
    }
    return out;
  };

  const getPostImage = (p) => {
    const m = p.content?.match(/<img[^>]+src="([^">]+)"/);
    return m ? m[1] : `https://picsum.photos/seed/${p.id}/1200/600`;
  };

  // ── The safelink mid-article block ────────────────────────────────────────
  const SafelinkBlock = () => {
    if (!currentStep) return null;

    const btnBase =
      'inline-flex items-center justify-center gap-2 font-bold text-sm py-3 px-8 rounded-full shadow transition-all active:scale-95';

    return (
      <div className="safelink-flow">

        {/* Ad 1 — above instructions */}
        <AdSlot />

        {/* Compact instruction text — same style as image */}
        <div className="safelink-instructions">
          <p className="safelink-inst-en">
            👉 <strong>Click Image &amp; Wait, then Come Back to Get Your Link</strong>
          </p>
          <p className="safelink-inst-hi font-hindi">
            ▼ LINK पाने के लिए — 👇 फोटो पर क्लिक करें, 15 सेकंड रुकें, फिर इसी पेज पर वापस आएं
          </p>
        </div>

        {/* Ad 2 — between instructions and button */}
        <AdSlot />

        {/* Timer (visible only while countdown running) */}
        {timerActive && (
          <div className="safelink-timer">
            <span className="safelink-timer-dot" />
            <span>Please wait <strong>{timeLeft}s</strong> — Verifying...</span>
          </div>
        )}

        {/* Action button — shown only when timer is done */}
        {timerDone && (
          currentStep === 3 ? (
            <button onClick={handleFinalRedirect} className={`${btnBase} bg-green-600 hover:bg-green-700 text-white`}>
              🔓 Get Your Link
            </button>
          ) : currentStep === 2 ? (
            <button onClick={handleStepTransition} className={`${btnBase} bg-indigo-600 hover:bg-indigo-700 text-white`}>
              Continue to Final Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                const el = document.getElementById('safelink-bottom');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`${btnBase} bg-red-600 hover:bg-red-700 text-white`}
            >
              ✓ Verify
            </button>
          )
        )}

        {/* Ad 3 — below button */}
        <AdSlot />

        {/* Scroll hint — only on step 1 after verify */}
        {timerDone && currentStep === 1 && (
          <p className="safelink-scroll-hint">
            Scroll down &amp; click on{' '}
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Continue</span>{' '}
            button for your destination link
          </p>
        )}

        {/* Ad 4 — bottom of block */}
        <AdSlot />
      </div>
    );
  };

  // Bottom continue trigger (only step 1, after verify)
  const BottomTrigger = () => {
    if (!currentStep) return null;
    if (currentStep !== 1) return null; // Steps 2 & 3 handled in SafelinkBlock
    return (
      <div id="safelink-bottom" className="safelink-bottom-trigger">
        {!timerDone ? (
          <span className="safelink-wait-label">
            ⏳ Please complete verification above first
          </span>
        ) : (
          <>
            <AdSlot />
            <button
              onClick={handleStepTransition}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-10 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm"
            >
              Continue to Step 2 <ArrowRight className="w-4 h-4" />
            </button>
            <AdSlot />
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <StepHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Article */}
          <main className="flex-1 min-w-0">
            <article className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">

              {/* Labels */}
              {post.labels && post.labels.length > 0 && (
                <div className="flex flex-wrap gap-2 px-5 sm:px-7 pt-5 sm:pt-7">
                  {post.labels.map((label) => (
                    <span key={label} className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                      {label}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <div className="px-5 sm:px-7 pt-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-white leading-tight font-heading">
                  {post.title}
                </h1>
              </div>

              {/* Meta */}
              <div className="flex items-center text-xs text-zinc-400 dark:text-zinc-500 gap-4 px-5 sm:px-7 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.published).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Staff Writer
                </span>
              </div>

              {/* Featured Image */}
              <div className="w-full aspect-video overflow-hidden">
                <img src={getPostImage(post)} alt={post.title} className="w-full h-full object-cover" />
              </div>

              {/* ── Safelink Block (natural flow, compact) ─── */}
              <div className="px-5 sm:px-7">
                <SafelinkBlock />
              </div>

              {/* Post Content */}
              <div
                className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base break-words px-5 sm:px-7 pt-4 pb-6"
                dangerouslySetInnerHTML={{ __html: injectAds(post.content) }}
              />

              {/* Bottom Step Trigger */}
              <div className="px-5 sm:px-7 pb-7">
                <BottomTrigger />
              </div>

            </article>
          </main>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>
    </>
  );
}
