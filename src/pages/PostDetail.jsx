import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, getPosts } from '../services/bloggerApi';
import { useSafelink } from '../context/SafelinkContext';
import Sidebar from '../components/Sidebar';
import StepHeader from '../components/StepHeader';
import { Calendar, User, ArrowRight, ShieldCheck, AlertCircle, Clock } from 'lucide-react';

// Ad slot component to reuse easily and ensure standard execution (no label)
function AdSlot() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // ignore adsbygoogle push errors
    }
  }, []);

  return (
    <div className="adsense-container w-full overflow-hidden flex items-center justify-center">
      <ins className="adsbygoogle"
           style={{ display: "block" }}
           data-ad-client="ca-pub-9543073887536718"
           data-ad-slot="7317709042"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
}

// Shimmer skeleton screen for Post Detail
function PostDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Article Column Skeleton */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-6 sm:p-8 flex flex-col gap-6">
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
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
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

  // Timer logic for Safelink
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const timerRef = useRef(null);

  // Scroll to top when post changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [postId]);

  // Fetch post details
  useEffect(() => {
    setLoading(true);
    setError('');
    getPostById(postId)
      .then((data) => {
        setPost(data);
        document.title = `${data.title} - SarkariTrend`;
        
        // Update Meta Description
        const plainText = data.content ? data.content.replace(/<\/?[^>]+(>|$)/g, "") : '';
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

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch article details.');
        setLoading(false);
      });
  }, [postId]);

  // Handle safelink timer initialization
  useEffect(() => {
    if (currentStep > 0 && post) {
      setTimeLeft(15);
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

  // Load AdSense ads dynamically once content is rendered
  useEffect(() => {
    if (post) {
      try {
        const ads = document.querySelectorAll('.adsense-container ins.adsbygoogle');
        ads.forEach(() => {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        });
      } catch (e) {
        // ignore adsbygoogle push errors
      }
    }
  }, [post]);

  // Safelink navigation step transition (Steps 1 & 2)
  const handleStepTransition = () => {
    setLoading(true);
    getPosts({ maxResults: 20 })
      .then((data) => {
        if (data.items && data.items.length > 0) {
          // Exclude current post
          const filtered = data.items.filter((item) => item.id !== postId);
          const postsList = filtered.length > 0 ? filtered : data.items;
          const randomIndex = Math.floor(Math.random() * postsList.length);
          const nextPost = postsList[randomIndex];
          
          nextStep();
          navigate(`/post/${nextPost.id}`);
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

  // Final redirection (Step 3)
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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4 font-heading">Error</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">{error || 'Article not found.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Parse and inject Ads into the blogger content (no Advertisement label text)
  const injectAds = (html) => {
    if (!html) return '';
    const paras = html.split('</p>');
    
    if (paras.length <= 3) {
      return html;
    }

    const adUnit = `
      <div class="adsense-container w-full overflow-hidden flex items-center justify-center">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-9543073887536718"
             data-ad-slot="7317709042"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>
    `;

    let finalHtml = '';
    for (let i = 0; i < paras.length; i++) {
      finalHtml += paras[i];
      if (i < paras.length - 1) {
        finalHtml += '</p>';
      }
      
      // Inject after 2nd paragraph
      if (i === 1) {
        finalHtml += adUnit;
      }
      // Inject before the last paragraph
      if (i === paras.length - 3) {
        finalHtml += adUnit;
      }
    }
    return finalHtml;
  };

  // Helper to extract first image
  const getPostImage = (post) => {
    if (!post.content) return 'https://picsum.photos/1200/600';
    const match = post.content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : 'https://picsum.photos/1200/600';
  };

  return (
    <>
      {currentStep > 0 && (
        <StepHeader timerActive={timerActive} timeLeft={timeLeft} />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Article Column */}
          <main className="flex-1 min-w-0">
            <article className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm p-6 sm:p-10 flex flex-col gap-6 backdrop-blur-sm">
              
              {/* Labels / Categories */}
              {post.labels && post.labels.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {post.labels.map((label) => (
                    <span
                      key={label}
                      className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/40"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white leading-tight font-heading m-0 tracking-tight">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 gap-4 pb-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  {new Date(post.published).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-500" />
                  Staff Writer
                </span>
              </div>

              {/* Featured Image */}
              <div className="w-full rounded-[24px] overflow-hidden shadow-sm aspect-video border border-zinc-200/10">
                <img
                  src={getPostImage(post)}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Safelink Timer/Action Widget */}
              {currentStep > 0 && (
                <div className="flex flex-col gap-6 my-4 items-center w-full">
                  
                  {/* Top Ad */}
                  <AdSlot />

                  {/* Verification Instructions Alert (Hinglish/Hindi compliant) */}
                  <div className="w-full p-6 bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-center text-sm font-semibold text-amber-800 dark:text-amber-300 space-y-2.5 backdrop-blur-sm shadow-sm">
                    <p className="flex items-center justify-center gap-2 font-extrabold text-zinc-900 dark:text-zinc-100">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0" /> Click Image & Wait & Come back this page to Get Link - Download.
                    </p>
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-hindi leading-relaxed">
                      👇 LINK पाने और DOWNLOAD करने के लिए, 👇 फोटो पर क्लिक करें, 15 सेकंड रुकें और फिर इसी पेज पर वापस आएं
                    </p>
                  </div>

                  {/* Modern Countdown Timer Widget */}
                  <div className="bg-gradient-to-br from-red-50/40 to-rose-50/20 dark:from-zinc-900/40 dark:to-zinc-900/20 border border-red-100/70 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-6 w-full shadow-sm">
                    <div className="flex flex-col items-center gap-1">
                      <h3 className="text-base font-extrabold text-zinc-900 dark:text-white font-heading tracking-tight">
                        Securing Link parameters
                      </h3>
                      <p className="text-xs font-medium text-zinc-450 dark:text-zinc-500">
                        {currentStep === 3
                          ? 'Finalizing safe transit gateway parameters'
                          : `Step ${currentStep} of 3: Decoupling redirect headers`}
                      </p>
                    </div>

                    {timerActive ? (
                      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 px-4 py-2 rounded-xl">
                          <Clock className="w-4 h-4 text-red-650 dark:text-red-400 animate-spin" />
                          <span className="text-xs font-bold text-red-650 dark:text-red-400 font-mono">
                            Wait {timeLeft} seconds
                          </span>
                        </div>
                        {/* Shimmer linear progress bar */}
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="bg-red-600 h-full rounded-full transition-all duration-1000 ease-linear shadow-md"
                            style={{ width: `${(timeLeft / 15) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 bg-green-50 dark:bg-green-950/40 px-4 py-1.5 rounded-full border border-green-200 dark:border-green-800/60 shadow-sm">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
                          Redirection Verified
                        </span>
                        
                        {/* Verify Scroll Button */}
                        <button
                          onClick={() => {
                            const bottomEl = document.getElementById('safelink-bottom-trigger');
                            if (bottomEl) {
                              bottomEl.scrollIntoView({ behavior: 'smooth' });
                            } else {
                              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                            }
                          }}
                          className="px-8 py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold rounded-full shadow-lg hover:shadow-xl transition-all scale-105 active:scale-95 text-xs uppercase tracking-wider verify-pulse-glow"
                        >
                          Verify / Scroll Down
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bottom Ad */}
                  <AdSlot />
                </div>
              )}

              {/* Dynamic Post Content with Ads Injected */}
              <div
                className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans text-base sm:text-lg space-y-6 break-words"
                dangerouslySetInnerHTML={{ __html: injectAds(post.content) }}
              />

              {/* Bottom Safelink Action Trigger */}
              {currentStep > 0 && (
                <div id="safelink-bottom-trigger" className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-4">
                  {!timerDone ? (
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 bg-zinc-100 dark:bg-zinc-950 px-6 py-4 rounded-xl border border-zinc-200 dark:border-zinc-850/80 cursor-not-allowed select-none">
                      Complete countdown timer above
                    </div>
                  ) : currentStep === 1 ? (
                    <button
                      onClick={handleStepTransition}
                      className="inline-flex items-center gap-2 bg-red-650 hover:bg-red-700 text-white font-extrabold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all scale-105 active:scale-95 uppercase text-xs tracking-wider"
                    >
                      Continue to Step 2 <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : currentStep === 2 ? (
                    <button
                      onClick={handleStepTransition}
                      className="inline-flex items-center gap-2 bg-red-650 hover:bg-red-700 text-white font-extrabold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all scale-105 active:scale-95 uppercase text-xs tracking-wider"
                    >
                      Continue to Step 3 <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinalRedirect}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-extrabold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all scale-105 active:scale-95 uppercase text-xs tracking-wider verify-pulse-glow"
                    >
                      Go to Secured Link <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
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
