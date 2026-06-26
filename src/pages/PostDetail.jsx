import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, getPosts } from '../services/bloggerApi';
import { useSafelink } from '../context/SafelinkContext';
import Sidebar from '../components/Sidebar';
import { Calendar, User, ArrowRight, ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import AdUnit from '../components/AdUnit';

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

  // States for verification flow
  const [isTopVerified, setIsTopVerified] = useState(false);
  const [showAdPopup, setShowAdPopup] = useState(false);
  const [popupShownThisStep, setPopupShownThisStep] = useState(false); // show only once
  const [showSkipBtn, setShowSkipBtn] = useState(false); // skip after 5s

  // Helper: verify and close popup, scroll to bottom
  const completeVerification = () => {
    setIsTopVerified(true);
    setShowAdPopup(false);
    setTimeout(() => {
      const el = document.getElementById('safelink-bottom-trigger');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  };

  // Reset verification states on step or post change
  useEffect(() => {
    setIsTopVerified(false);
    setShowAdPopup(false);
    setPopupShownThisStep(false);
    setShowSkipBtn(false);
  }, [currentStep, postId]);

  // Scroll to top when post changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [postId]);

  // Auto-close popup when user returns from clicking the ad (visibilitychange)
  useEffect(() => {
    if (!showAdPopup) return;

    // Wait 1 second before listening - avoids firing immediately on popup open
    let ready = false;
    const readyTimer = setTimeout(() => { ready = true; }, 1000);

    const handleVisibility = () => {
      if (ready && document.visibilityState === 'visible') {
        completeVerification();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearTimeout(readyTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAdPopup]);

  // Show skip button 5 seconds after popup opens
  useEffect(() => {
    if (!showAdPopup) { setShowSkipBtn(false); return; }
    const t = setTimeout(() => setShowSkipBtn(true), 5000);
    return () => clearTimeout(t);
  }, [showAdPopup]);

  // Push AdSense ad when popup opens (slot 7317709042 - NOT in DOM at popup open time)
  useEffect(() => {
    if (!showAdPopup) return;
    const t = setTimeout(() => {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    }, 200);
    return () => clearTimeout(t);
  }, [showAdPopup]);

  // Global Image Click Handler for Adsterra SmartLink
  // Guard: only fires during the safelink flow (currentStep > 0)
  useEffect(() => {
    if (currentStep === 0) return;
    const handleImageClick = (e) => {
      const img = e.target.closest('img');
      // Skip logo/UI images marked with data-ui-image
      if (img && !img.getAttribute('data-ui-image')) {
        if (!img.getAttribute('data-smartlink-clicked')) {
          img.setAttribute('data-smartlink-clicked', 'true');
          window.open('https://www.effectivecpmnetwork.com/wm9u7q6i7?key=2322f579e7bdafc50bc0259df918895f', '_blank');
        }
      }
    };
    document.addEventListener('click', handleImageClick);
    return () => {
      document.removeEventListener('click', handleImageClick);
    };
  }, [currentStep]);

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

        // ── Open Graph per-post ──
        const postImage = (data.content?.match(/<img[^>]+src="([^">]+)"/) || [])[1]
          || `https://picsum.photos/seed/${data.id}/1200/630`;
        const ogTags = {
          'og:type': 'article',
          'og:title': `${data.title} - SarkariTrend`,
          'og:description': excerpt,
          'og:url': window.location.href,
          'og:image': postImage,
          'article:published_time': data.published,
          'article:modified_time': data.updated || data.published,
          'article:section': (data.labels && data.labels[0]) || 'General',
        };
        Object.entries(ogTags).forEach(([prop, content]) => {
          let tag = document.querySelector(`meta[property="${prop}"]`);
          if (tag) tag.setAttribute('content', content);
          else {
            tag = document.createElement('meta');
            tag.setAttribute('property', prop);
            tag.setAttribute('content', content);
            document.head.appendChild(tag);
          }
        });
        if (data.labels) {
          data.labels.forEach((label) => {
            const tag = document.createElement('meta');
            tag.setAttribute('property', 'article:tag');
            tag.setAttribute('content', label);
            tag.setAttribute('data-dynamic-og-tag', 'true');
            document.head.appendChild(tag);
          });
        }

        // ── JSON-LD Article Schema (AI SEO) ──
        const existingSchemas = document.querySelectorAll('script[data-post-schema]');
        existingSchemas.forEach((s) => s.remove());

        const articleSchema = {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Article',
              '@id': `${window.location.href}#article`,
              'headline': data.title,
              'description': excerpt,
              'image': {
                '@type': 'ImageObject',
                'url': postImage,
                'width': 1200,
                'height': 630,
              },
              'datePublished': data.published,
              'dateModified': data.updated || data.published,
              'author': {
                '@type': 'Person',
                'name': 'SarkariTrend Editorial Team',
                'url': 'https://iwantgovjob.vercel.app/about',
              },
              'publisher': {
                '@id': 'https://iwantgovjob.vercel.app/#organization',
              },
              'isPartOf': { '@id': 'https://iwantgovjob.vercel.app/#website' },
              'url': window.location.href,
              'mainEntityOfPage': window.location.href,
              'keywords': data.labels ? data.labels.join(', ') : 'sarkari job, government job, India',
              'articleSection': (data.labels && data.labels[0]) || 'Career',
              'inLanguage': 'en-IN',
              'about': [
                { '@type': 'Thing', 'name': 'Government Jobs India' },
                { '@type': 'Thing', 'name': 'Sarkari Naukri' },
              ],
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${window.location.href}#breadcrumb`,
              'itemListElement': [
                {
                  '@type': 'ListItem',
                  'position': 1,
                  'name': 'Home',
                  'item': 'https://iwantgovjob.vercel.app/',
                },
                ...(data.labels && data.labels[0] ? [{
                  '@type': 'ListItem',
                  'position': 2,
                  'name': data.labels[0],
                  'item': `https://iwantgovjob.vercel.app/category/${encodeURIComponent(data.labels[0])}`,
                }] : []),
                {
                  '@type': 'ListItem',
                  'position': data.labels && data.labels[0] ? 3 : 2,
                  'name': data.title,
                  'item': window.location.href,
                },
              ],
            },
          ],
        };

        const schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        schemaScript.setAttribute('data-post-schema', 'true');
        schemaScript.textContent = JSON.stringify(articleSchema);
        document.head.appendChild(schemaScript);

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch article details.');
        setLoading(false);
      });

    // Cleanup schemas and tags on unmount
    return () => {
      document.querySelectorAll('script[data-post-schema]').forEach((s) => s.remove());
      document.querySelectorAll('meta[data-dynamic-og-tag]').forEach((t) => t.remove());
    };
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
    } else {
      setTimerActive(false);
      setTimerDone(true);
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
      <div class="adsense-container w-full overflow-hidden flex items-center justify-center py-2">
        <ins class="adsbygoogle"
             style="display:block; text-align:center;"
             data-ad-layout="in-article"
             data-ad-format="fluid"
             data-ad-client="ca-pub-9543073887536718"
             data-ad-slot="1641433819"></ins>
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
        <div className="sticky top-[64px] z-30 w-full border-b border-blue-200 dark:border-blue-900/50 bg-blue-50/90 dark:bg-blue-950/90 text-blue-900 dark:text-blue-100 text-center font-bold text-xs sm:text-sm py-2.5 px-4 shadow-sm font-sans backdrop-blur-md">
          You are Currently On Step ({currentStep}/3) From Destination.
        </div>
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

              {currentStep > 0 && (
                <>
                  {/* Warning Bars (studyaf.com style) */}
                  <div className="w-full flex flex-col gap-1.5 my-2">
                    <div className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-400 border border-green-600 text-zinc-900 dark:text-zinc-950 text-center text-xs font-black uppercase tracking-wider rounded-md shadow-sm">
                      ▼ CLICK ANY <span className="text-red-650 font-extrabold">IMAGE</span> 👆 & Wait 15 Seconds to <span className="text-blue-700 font-extrabold">GET LINK</span> ▼ 👆
                    </div>
                    <div className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-400 border border-green-600 text-zinc-900 dark:text-zinc-950 text-center text-xs font-black uppercase tracking-wider rounded-md shadow-sm">
                      ▼ CLICK ANY <span className="text-red-650 font-extrabold">IMAGE</span> 👆 & Wait 15 Seconds to <span className="text-blue-700 font-extrabold">GET LINK</span> ▼ 👆
                    </div>
                  </div>

                  {/* Verification Instructions Alert (Hinglish/Hindi compliant) */}
                  <div className="w-full text-center space-y-1 my-3 px-4">
                    <p className="text-xs sm:text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
                      👉 Click Image & Wait & Come back this page to <span className="text-red-650 font-extrabold">Get Link - Download.</span>
                    </p>
                    <p className="text-xs sm:text-xs font-bold text-zinc-750 dark:text-zinc-350 font-hindi">
                      <span className="text-red-650 font-extrabold">▼ LINK पाने और DOWNLOAD करने के लिए,</span> 👉 फोटो पर क्लिक करें, <span className="text-blue-750 font-extrabold">15 सेकंड रुकें</span> और फिर इसी पेज पर वापस आएं
                    </p>
                  </div>

                  {/* Interactive Force-Click Banner */}
                  <div className="w-full flex justify-center px-4 my-3">
                    <div className="relative group overflow-hidden rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-md cursor-pointer max-w-lg w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                      <img 
                        src="/force-click-banner.png" 
                        alt="Force Click to Verify" 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>

                  {timerActive && (
                    /* Circular Loader (shown while timerActive is true) - thick circle like image */
                    <div className="flex flex-col items-center justify-center my-6">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                          <circle
                            cx="60"
                            cy="60"
                            r="45"
                            fill="transparent"
                            stroke="#e2e8f0"
                            className="dark:stroke-zinc-800"
                            strokeWidth="14"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r="45"
                            fill="transparent"
                            stroke="#3b82f6"
                            strokeWidth="14"
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={2 * Math.PI * 45 - (Math.round(((15 - timeLeft) / 15) * 100) / 100) * (2 * Math.PI * 45)}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-linear"
                          />
                        </svg>
                        <div className="absolute text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                          {Math.round(((15 - timeLeft) / 15) * 100)}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wrap Middle Verification Ad & Action group in zero-gap flexbox */}
                  <div className="w-full flex flex-col items-center" style={{ gap: 0, margin: 0, padding: 0 }}>
                    {/* Above Verify Ad (Ad 1) */}
                    <AdUnit
                      key={`post-above-verify-${currentStep}`}
                      slot="1909584638"
                      format="fluid"
                      layoutKey="-6t+ed+2i-1n-4w"
                      style={{ margin: 0, padding: 0 }}
                    />

                    {timerActive ? (
                      /* Click Ads Instruction Box (Text Box) */
                      <div className="click-ads-box w-full" style={{ margin: 0, borderRadius: '12px' }}>
                        <p className="text-sm font-extrabold text-white mb-1">🙏 Thank You For Visiting Our Site</p>
                        <div className="inner-white-box" style={{ margin: '8px 0 0 0' }}>
                          Please Click on any <strong>Ads</strong> 👆 Above Or Below 👇 and then <strong>Back</strong> to Continue
                        </div>
                      </div>
                    ) : (
                      /* Verify Now Button - opens popup ONCE per step */
                      <div className="w-full flex justify-center" style={{ margin: 0, padding: 0 }}>
                        <button
                          onClick={() => {
                            if (!popupShownThisStep) {
                              // First time: show popup
                              setShowAdPopup(true);
                              setPopupShownThisStep(true);
                            } else {
                              // Already seen popup: directly unlock
                              completeVerification();
                            }
                          }}
                          className="btn-neon-purple px-12 py-3.5 text-base font-extrabold"
                          style={{ margin: 0 }}
                        >
                          ✅ Verify Now
                        </button>
                      </div>
                    )}

                    {/* Below Instruction Ad #1 (Ad 2) */}
                    <AdUnit
                      key={`post-verify-mid1-${currentStep}`}
                      slot="5754054742"
                      format="auto"
                      style={{ margin: 0, padding: 0 }}
                    />
                  </div>

                  {!timerActive && !isTopVerified && (
                    <div className="w-full text-center space-y-1 my-3 px-4 animate-bounce">
                      <p className="text-sm font-extrabold text-red-650 dark:text-red-400">
                        👆 Click on "VERIFY NOW" to unlock download link 👆
                      </p>
                    </div>
                  )}

                  {!timerActive && isTopVerified && (
                    <div className="w-full text-center space-y-1 my-3 px-4 animate-bounce">
                      <p className="text-sm font-extrabold text-green-600 dark:text-green-400">
                        👇 Scroll down to bottom and click on {currentStep === 3 ? '"GENERATE LINK"' : '"CONTINUE NEXT STEP"'} 👇
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Dynamic Post Content with Ads Injected */}
              <div
                className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans text-base sm:text-lg space-y-6 break-words"
                dangerouslySetInnerHTML={{ __html: injectAds(post.content) }}
              />

              {/* Bottom Safelink Action Trigger - Hidden until isTopVerified is true */}
              {currentStep > 0 && isTopVerified && (
                <div id="safelink-bottom-trigger" className="mt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center animate-fade-in" style={{ gap: 0, paddingTop: 0 }}>

                  {/* Wrap Bottom Verification Ad & Action group in zero-gap flexbox and use unique slots to prevent collisions */}
                  <div className="w-full flex flex-col items-center" style={{ gap: 0, margin: 0, padding: 0 }}>
                    {/* Top Bottom Ad (Ad 1) */}
                    <AdUnit
                      key={`post-bottom-top-ad-${currentStep}`}
                      slot="7317709042"
                      format="auto"
                      style={{ margin: 0, padding: 0 }}
                    />

                    {!timerDone ? (
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-8 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 cursor-not-allowed select-none text-center">
                        ⏳ Complete the countdown timer above to unlock the button
                      </div>
                    ) : (
                      /* Generate Link or Continue Button */
                      <div className="w-full flex justify-center" style={{ margin: 0, padding: 0 }}>
                        {currentStep === 3 ? (
                          <button
                            onClick={handleFinalRedirect}
                            className="btn-neon-blue px-14 py-4 text-base font-extrabold uppercase tracking-widest"
                            style={{ margin: 0 }}
                          >
                            Generate Link
                          </button>
                        ) : (
                          <button
                            onClick={handleStepTransition}
                            className="btn-neon-orange px-14 py-4 text-base font-extrabold uppercase tracking-widest"
                            style={{ margin: 0 }}
                          >
                            Continue Next Step
                          </button>
                        )}
                      </div>
                    )}

                    {/* Bottom Ad (Ad 2) */}
                    <AdUnit
                      key={`post-bottom-mid-${currentStep}`}
                      slot="1641433819"
                      format="auto"
                      style={{ margin: 0, padding: 0 }}
                    />
                  </div>

                  {/* Bottom relaxed Ad - always visible */}
                  <AdUnit key={`post-bottom-relax-${currentStep}`} slot="8617081290" format="autorelaxed" />
                </div>
              )}

            </article>
          </main>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>

      {/* Verification Popup — shows ONCE per step, auto-closes when user returns */}
      {showAdPopup && currentStep > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[28px] max-w-md w-full shadow-2xl relative overflow-hidden">

            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-white">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-black text-sm">Anti-Bot Verification</span>
              </div>
              <button
                onClick={() => setShowAdPopup(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Instruction */}
            <div className="px-5 pt-4 pb-2 text-center flex flex-col gap-1">
              <p className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                👆 <span className="text-indigo-600 dark:text-indigo-400">Click the ad below</span>, wait a moment, then come back — your link will unlock automatically.
              </p>
              <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 font-hindi">
                <span className="text-red-600 font-black">नीचे दिए गए विज्ञापन पर क्लिक करें</span>, फिर वापस आएं — लिंक अपने आप अनलॉक हो जाएगा।
              </p>
            </div>

            {/* AdSense ad — slot 7317709042 is NOT loaded on page until after verification */}
            <div className="px-4 pb-2">
              <div
                className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 min-h-[260px] flex items-center justify-center overflow-hidden"
              >
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block', width: '300px', height: '250px' }}
                  data-ad-client="ca-pub-9543073887536718"
                  data-ad-slot="7317709042"
                  data-ad-format="auto"
                  data-full-width-responsive="false"
                ></ins>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-2 flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                Waiting... page will unlock when you come back
              </div>
              {showSkipBtn && (
                <button
                  onClick={completeVerification}
                  className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:underline uppercase tracking-widest transition-colors"
                >
                  Skip — Ad didn't load?
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
