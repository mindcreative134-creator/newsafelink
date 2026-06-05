import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, getPosts } from '../services/bloggerApi';
import { useSafelink } from '../context/SafelinkContext';
import Sidebar from '../components/Sidebar';
import AdUnit from '../components/AdUnit';
import { Calendar, User, ArrowRight } from 'lucide-react';

// ─── Shimmer Skeleton ──────────────────────────────────────────────────────────
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

// ─── Main Component ────────────────────────────────────────────────────────────
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

  // Helper to render content with active React AdUnits instead of non-executing raw script tags
  const renderPostContent = (content) => {
    if (!content) return null;
    const paras = content.split('</p>');
    if (paras.length <= 3) {
      return (
        <div 
          className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base break-words px-5 sm:px-7 pt-4 pb-6"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    return (
      <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base break-words px-5 sm:px-7 pt-4 pb-6">
        {paras.map((para, index) => {
          if (!para.trim()) return null;
          
          // Re-add the closing </p> tag
          const paraHtml = para + '</p>';
          
          return (
            <React.Fragment key={index}>
              <div dangerouslySetInnerHTML={{ __html: paraHtml }} />
              
              {/* In-article ad after paragraph 2 (index 1) */}
              {index === 1 && (
                <div style={{ display: 'block', width: '100%', overflow: 'hidden', margin: '12px 0' }}>
                  <AdUnit 
                    key={`${postId}-article-ad-1`} 
                    slot="1641433819" 
                    format="fluid" 
                    layout="in-article" 
                    minHeight="120px" 
                  />
                </div>
              )}
              
              {/* In-article ad before the last few paragraphs */}
              {paras.length > 5 && index === paras.length - 3 && (
                <div style={{ display: 'block', width: '100%', overflow: 'hidden', margin: '12px 0' }}>
                  <AdUnit 
                    key={`${postId}-article-ad-2`} 
                    slot="1641433819" 
                    format="fluid" 
                    layout="in-article" 
                    minHeight="120px" 
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const getPostImage = (p) => {
    const m = p.content?.match(/<img[^>]+src="([^">]+)"/);
    return m ? m[1] : `https://picsum.photos/seed/${p.id}/1200/600`;
  };

  // ── Safelink Block ─────────────────────────────────────────────────────────
  const renderSafelinkBlock = () => {
    if (!currentStep) return null;

    return (
      <div style={{ width: '100%', display: 'block', margin: '12px 0' }}>

        {/* Ad 1 — Banner display */}
        <div style={{ width: '100%', display: 'block', marginBottom: 8 }}>
          <AdUnit 
            key={`${postId}-${currentStep}-safelink-ad1`} 
            slot="7317709042" 
            format="auto" 
            minHeight="250px" 
          />
        </div>

        {/* Pulsing Green Instruction Pills */}
        <div className="safelink-pills">
          <div className="safelink-pill">▼ CLICK ANY IMAGE 👆 &amp; Wait 15 Seconds to GET LINK ▼ 👇</div>
          <div className="safelink-pill">▼ CLICK ANY IMAGE 👆 &amp; Wait 15 Seconds to GET LINK ▼ 👇</div>
        </div>

        {/* Instruction banner */}
        <div className="safelink-instructions">
          <p className="safelink-inst-en" style={{ textAlign: 'center', color: 'inherit' }}>
            👉 Click Image &amp; Wait &amp; Come back this page to <span style={{ color: '#dc2626', fontWeight: 800 }}>Get Link - Download</span>.
          </p>
          <p className="safelink-inst-hi font-hindi" style={{ textAlign: 'center', color: 'inherit' }}>
            ▼ <span style={{ color: '#dc2626', fontWeight: 700 }}>LINK पाने और DOWNLOAD करने के लिए</span>, 👇 फोटो पर क्लिक करें, <span style={{ color: '#dc2626', fontWeight: 800 }}>15 सेकंड रुकें</span> और फिर इसी पेज पर वापस आएं
          </p>
        </div>

        {/* Ad 2 — In-feed (immediately above button/timer with no gap) */}
        <div style={{ width: '100%', display: 'block', margin: 0 }}>
          <AdUnit 
            key={`${postId}-${currentStep}-safelink-ad2`} 
            slot="1909584638" 
            format="fluid" 
            layoutKey="-6t+ed+2i-1n-4w" 
            minHeight="120px" 
          />
        </div>

        {/* Timer (no vertical margin to keep it flush) */}
        {timerActive && (
          <div className="safelink-timer" style={{ margin: '0 auto', borderRadius: '9999px' }}>
            <span>Please wait {timeLeft} Seconds...</span>
          </div>
        )}

        {/* Verify button / verified label (no vertical margin) */}
        {timerDone && (
          !stepVerified ? (
            <div style={{ textAlign: 'center', margin: 0, padding: '4px 0' }}>
              <button
                onClick={handleVerifyClick}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, fontWeight: 800, fontSize: '0.875rem',
                  padding: '12px 48px', borderRadius: '9999px',
                  background: '#dc2626', color: '#fff',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(220,38,38,0.25)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
              >
                Verify
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', margin: 0, padding: '4px 0' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 16px', borderRadius: '9999px', fontSize: '0.75rem',
                fontWeight: 700, background: '#f0fdf4', color: '#16a34a',
                border: '1px solid #bbf7d0',
              }}>
                ✓ Verification Completed Successfully
              </span>
              <p style={{ fontSize: '0.75rem', color: '#71717a', textAlign: 'center', margin: '4px 0 0', padding: '0 6px' }}>
                Scroll down &amp; click on <span style={{ color: '#4f46e5', fontWeight: 700 }}>Continue</span> button for your destination link
              </p>
            </div>
          )
        )}

        {/* Ad 3 — Display second (immediately below button/timer with no gap) */}
        <div style={{ width: '100%', display: 'block', margin: 0 }}>
          <AdUnit 
            key={`${postId}-${currentStep}-safelink-ad3`} 
            slot="5754054742" 
            format="auto" 
            minHeight="250px" 
          />
        </div>

      </div>
    );
  };

  // ── Bottom Continue Trigger ────────────────────────────────────────────────
  const renderBottomTrigger = () => {
    if (!currentStep) return null;

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
      <div id="safelink-bottom" style={{
        width: '100%', display: 'block',
        borderTop: '1px solid #e4e4e7',
        paddingTop: 16, marginTop: 16,
      }}>
        {!timerDone ? (
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 600, padding: '8px 16px', background: '#f4f4f5', borderRadius: 8, border: '1px solid #e4e4e7', display: 'inline-block', margin: '0 auto' }}>
            ⏳ Please wait for the timer above to complete
          </p>
        ) : !stepVerified ? (
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 600, padding: '8px 16px', background: '#f4f4f5', borderRadius: 8, border: '1px solid #e4e4e7', display: 'inline-block', margin: '0 auto' }}>
            ⏳ Please click "Verify" above first
          </p>
        ) : (
          <>
            {/* Ad above bottom continue button — no gap */}
            <div style={{ width: '100%', display: 'block', margin: 0 }}>
              <AdUnit 
                key={`${postId}-${currentStep}-bottom-ad1`} 
                slot="1909584638" 
                format="fluid" 
                layoutKey="-6t+ed+2i-1n-4w" 
                minHeight="120px" 
              />
            </div>
            
            {/* Continue button — flush with ads */}
            <div style={{ textAlign: 'center', margin: 0, padding: '8px 0' }}>
              {actionBtn}
            </div>
            
            {/* Ad below bottom continue button — no gap */}
            <div style={{ width: '100%', display: 'block', margin: 0 }}>
              <AdUnit 
                key={`${postId}-${currentStep}-bottom-ad2`} 
                slot="8617081290" 
                format="autorelaxed" 
                minHeight="280px" 
              />
            </div>
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

              {/* Safelink Block */}
              <div className="px-5 sm:px-7">
                {renderSafelinkBlock()}
              </div>

              {/* Post Content */}
              {renderPostContent(post.content)}

              {/* Bottom Step Trigger */}
              <div className="px-5 sm:px-7 pb-7">
                {renderBottomTrigger()}
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
