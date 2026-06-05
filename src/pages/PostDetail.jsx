import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, getPosts } from '../services/bloggerApi';
import { useSafelink } from '../context/SafelinkContext';
import Sidebar from '../components/Sidebar';
import { Calendar, User, ArrowRight } from 'lucide-react';

// ─── Ad Slot — Multi-format, zero placeholder ─────────────────────────────────
// format: 'auto' | 'fluid' (in-article) | 'autorelaxed' (multiplex/native) | 'in-feed' | 'display-second'
function AdSlot({ format = 'auto', layout = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const ins = ref.current;
    if (!ins || ins.getAttribute('data-ad-status')) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {}
  }, []);

  // Map format/type to the user's specific AdSense Ad Unit IDs
  let adSlotId = "7317709042"; // Default: "Banner" (Display format)
  let adFormat = format;
  let adLayout = layout;

  if (format === 'fluid') {
    // "Article" In-article unit
    adSlotId = "1641433819";
  } else if (format === 'autorelaxed') {
    // "multi" Multiplex unit
    adSlotId = "8617081290";
  } else if (format === 'in-feed') {
    // "Ad's" In-feed unit
    adSlotId = "1909584638";
    adFormat = "fluid";
  } else if (format === 'display-second') {
    // "Display ads" unit
    adSlotId = "5754054742";
    adFormat = "auto";
  }

  const isInArticle = adFormat === 'fluid' && format === 'fluid';
  const isInFeed = adFormat === 'fluid' && format === 'in-feed';

  return (
    <div className="adsense-container">
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-9543073887536718"
        data-ad-slot={adSlotId}
        data-ad-format={adFormat}
        data-full-width-responsive={adFormat === 'auto' ? "true" : "false"}
        {...(isInArticle ? { 'data-ad-layout': 'in-article' } : {})}
        {...(isInFeed ? { 'data-ad-layout-key': '-6t+ed+2i-1n-4w' } : {})}
        {...(adLayout ? { 'data-ad-layout': adLayout } : {})}
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
  const [stepVerified, setStepVerified] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setStepVerified(false);
  }, [currentStep, postId]);

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

  const handleVerifyClick = () => {
    setStepVerified(true);
    setTimeout(() => {
      const el = document.getElementById('safelink-bottom');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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

  // Inject ads into blogger content using the In-article ad unit
  const injectAds = (html) => {
    if (!html) return '';
    const paras = html.split('</p>');
    if (paras.length <= 3) return html;
    // In-article ad unit slot is 1641433819
    const adUnit = `<div class="adsense-container"><ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article" data-ad-format="fluid" data-ad-client="ca-pub-9543073887536718" data-ad-slot="1641433819"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`;
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

        {/* Ad 1 — above instructions (Uses Banner unit) */}
        <AdSlot format="auto" />

        {/* Pulsing Green Instruction Bars (studyaf style) */}
        <div className="safelink-pills">
          <div className="safelink-pill">
            ▼ CLICK ANY IMAGE 👆 &amp; Wait 15 Seconds to GET LINK ▼ 👇
          </div>
          <div className="safelink-pill">
            ▼ CLICK ANY IMAGE 👆 &amp; Wait 15 Seconds to GET LINK ▼ 👇
          </div>
        </div>

        {/* Compact instruction text — studyaf style */}
        <div className="safelink-instructions">
          <p className="safelink-inst-en text-center text-zinc-900 dark:text-zinc-100">
            👉 Click Image &amp; Wait &amp; Come back this page to <span className="text-red-650 dark:text-red-400 font-extrabold">Get Link - Download</span>.
          </p>
          <p className="safelink-inst-hi font-hindi text-center text-zinc-800 dark:text-zinc-200">
            ▼ <span className="text-red-650 dark:text-red-400 font-bold">LINK पाने और DOWNLOAD करने के लिए</span>, 👇 फोटो पर क्लिक करें, <span className="text-red-650 dark:text-red-400 font-extrabold">15 सेकंड रुकें</span> और फिर इसी पेज पर वापस आएं
          </p>
        </div>

        {/* Ad 2 — between instructions and button (Uses In-feed unit 1909584638) */}
        <AdSlot format="in-feed" />

        {/* Timer (visible only while countdown running) */}
        {timerActive && (
          <div className="safelink-timer">
            <span>Please wait {timeLeft} Seconds...</span>
          </div>
        )}

        {/* Action button — shown only when timer is done */}
        {timerDone && (
          !stepVerified ? (
            <button
              onClick={handleVerifyClick}
              className={`${btnBase} bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase px-12`}
            >
              Verify
            </button>
          ) : (
            <div className="text-center py-2">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                ✓ Verification Completed Successfully
              </span>
              <p className="safelink-scroll-hint mt-3 text-center font-semibold text-zinc-600 dark:text-zinc-400">
                Scroll down &amp; click on <span className="text-indigo-600 dark:text-indigo-400 font-bold">Continue</span> button for your destination link
              </p>
            </div>
          )
        )}

        {/* Ad 3 — below button (Uses Display ads unit) */}
        <AdSlot format="display-second" />

        {/* Ad 4 — bottom of block (Uses Multiplex grid recommendations) */}
        <AdSlot format="autorelaxed" />
      </div>
    );
  };

  // Bottom continue trigger (for steps 1, 2, 3 after verify)
  const BottomTrigger = () => {
    if (!currentStep) return null;

    // Determine the button label and action based on step
    let actionBtn = null;
    if (currentStep === 1) {
      actionBtn = (
        <button
          onClick={handleStepTransition}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-10 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm"
        >
          Continue to Step 2 <ArrowRight className="w-4 h-4" />
        </button>
      );
    } else if (currentStep === 2) {
      actionBtn = (
        <button
          onClick={handleStepTransition}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-10 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm"
        >
          Continue to Final Step <ArrowRight className="w-4 h-4" />
        </button>
      );
    } else if (currentStep === 3) {
      actionBtn = (
        <button
          onClick={handleFinalRedirect}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-10 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm"
        >
          🔓 Get Your Link
        </button>
      );
    }

    return (
      <div id="safelink-bottom" className="safelink-bottom-trigger">
        {!timerDone ? (
          <span className="safelink-wait-label">
            ⏳ Please wait for the timer above to complete
          </span>
        ) : !stepVerified ? (
          <span className="safelink-wait-label">
            ⏳ Please click "Verify" above first
          </span>
        ) : (
          <>
            {/* Uses In-feed ad unit (1909584638) */}
            <AdSlot format="in-feed" />
            {actionBtn}
            {/* Uses Multiplex grid unit (8617081290) */}
            <AdSlot format="autorelaxed" />
          </>
        )}
      </div>
    );
  };

  return (
    <>
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
