import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, getPosts } from '../services/bloggerApi';
import { useSafelink } from '../context/SafelinkContext';
import Sidebar from '../components/Sidebar';
import StepHeader from '../components/StepHeader';
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
  const [gatewayStarted, setGatewayStarted] = useState(false);
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
                'url': 'https://sarkaritrend.news/about',
              },
              'publisher': {
                '@id': 'https://sarkaritrend.news/#organization',
              },
              'isPartOf': { '@id': 'https://sarkaritrend.news/#website' },
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
                  'item': 'https://sarkaritrend.news/',
                },
                ...(data.labels && data.labels[0] ? [{
                  '@type': 'ListItem',
                  'position': 2,
                  'name': data.labels[0],
                  'item': `https://sarkaritrend.news/category/${encodeURIComponent(data.labels[0])}`,
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

  // Reset gateway status when post ID changes
  useEffect(() => {
    setGatewayStarted(false);
  }, [postId]);

  // Handle safelink timer initialization
  useEffect(() => {
    if (currentStep > 0 && post && gatewayStarted) {
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
      setTimerDone(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStep, post, postId, gatewayStarted]);

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
                  <AdUnit key={`post-top-banner-${currentStep}`} slot="7317709042" format="auto" minHeight="90px" />

                  {/* Verification Instructions Alert (Hinglish/Hindi compliant) */}
                  <div className="w-full p-6 bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-center text-sm font-semibold text-amber-800 dark:text-amber-300 space-y-2.5 backdrop-blur-sm shadow-sm">
                    <p className="flex items-center justify-center gap-2 font-extrabold text-zinc-900 dark:text-zinc-100">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0" /> Click Image & Wait & Come back this page to Get Link - Download.
                    </p>
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-hindi leading-relaxed">
                      👇 LINK पाने और DOWNLOAD करने के लिए, 👇 फोटो पर क्लिक करें, 15 सेकंड रुकें और फिर इसी पेज पर वापस आएं
                    </p>
                  </div>

                  {/* Above Verify Ad */}
                          {/* Link Parameter Verification Gateway Widget */}
                  <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[24px] shadow-sm overflow-hidden text-zinc-900 dark:text-zinc-100 max-w-2xl mx-auto my-4 transition-all">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-zinc-950 to-indigo-950 px-6 py-6 text-center gold-gradient-border flex flex-col items-center gap-2 rounded-t-[24px]">
                      <span className="bg-gold-badge px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest">
                        Secure Transit Node
                      </span>
                      <h3 className="m-0 text-white text-base sm:text-lg font-black font-heading tracking-tight">
                        Link Parameter Verification Gateway
                      </h3>
                    </div>

                    {/* State 1: Input dropdown and start button */}
                    {!gatewayStarted && (
                      <div className="p-6 sm:p-8 flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-left">
                            Select Secure Transit Pipeline:
                          </label>
                          <select className="w-full p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-zinc-50 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200 focus:outline-none cursor-pointer">
                            <option>Direct Institutional Transit Gateway (Ultra Fast Node)</option>
                            <option>Sovereign Academic Encryption Pipeline (SSL-v3 Secured)</option>
                            <option>Encrypted Cross-Border Payload Router</option>
                          </select>
                        </div>
                        
                        <p className="text-xs text-zinc-450 dark:text-zinc-500 leading-relaxed font-medium text-left">
                          Initialize the secure transit gateway to decouple, decrypt, and authorize the requested redirection parameters safely.
                        </p>

                        <button
                          onClick={() => setGatewayStarted(true)}
                          className="w-full py-4 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all scale-100 active:scale-[0.98]"
                        >
                          Verify Safe Transit Gateway
                        </button>
                      </div>
                    )}

                    {/* State 2: Progress Scanner */}
                    {gatewayStarted && timerActive && (
                      <div className="p-8 text-center flex flex-col items-center justify-center gap-6">
                        <div className="w-10 h-10 border-4 border-zinc-200 dark:border-zinc-800 border-t-amber-500 rounded-full animate-spin-gold" />
                        
                        <div className="flex flex-col gap-1.5">
                          <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight">
                            {timeLeft > 11 ? "Initializing Secure Transit Nodes..." :
                             timeLeft > 7 ? "Decoupling Encrypted Payload Parameters..." :
                             timeLeft > 3 ? "Authorizing Transit Port Headers..." :
                             "Establishing Secure Redirection Bridge..."}
                          </h4>
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-500 font-mono">
                            Wait {timeLeft} seconds
                          </span>
                        </div>

                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-indigo-600 to-amber-500 h-full rounded-full transition-all duration-1000 ease-linear shadow-md"
                            style={{ width: `${((15 - timeLeft) / 15) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* State 3: Result screen */}
                    {gatewayStarted && timerDone && (
                      <div className="p-8 text-center flex flex-col items-center justify-center gap-6">
                        <div className="w-10 h-10 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-bold shadow-sm">
                          ✓
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <h3 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight">
                            Safe Transit Bridge Established
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
                            Your session credentials clear strict secure transit underwriting parameters. Click the button below to verify.
                          </p>
                        </div>

                        <div className="w-full p-4 border border-zinc-200 dark:border-zinc-800/80 border-l-4 border-l-indigo-600 dark:border-l-indigo-500 bg-zinc-50 dark:bg-zinc-950/30 rounded-xl text-left">
                          <h2 className="m-0 text-xs font-extrabold text-zinc-900 dark:text-white uppercase tracking-tight">
                            Redirection Gateway Parameters Decoupled Successfully
                          </h2>
                        </div>

                        <button
                          onClick={() => {
                            const bottomEl = document.getElementById('safelink-bottom-trigger');
                            if (bottomEl) {
                              bottomEl.scrollIntoView({ behavior: 'smooth' });
                            } else {
                              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                            }
                          }}
                          className="px-8 py-3.5 bg-red-650 hover:bg-red-700 active:bg-red-800 text-white font-extrabold rounded-full shadow-lg hover:shadow-xl transition-all scale-105 active:scale-95 text-xs uppercase tracking-wider verify-pulse-glow"
                        >
                          Verify / Scroll Down
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Below Verify Ad */}
                  <AdUnit key={`post-below-verify-${currentStep}`} slot="5754054742" format="auto" minHeight="250px" />
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
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-555 bg-zinc-100 dark:bg-zinc-950 px-6 py-4 rounded-xl border border-zinc-200 dark:border-zinc-850/80 cursor-not-allowed select-none">
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

                  {/* Bottom Ad Slots */}
                  <div className="w-full flex flex-col gap-6 mt-6">
                    <AdUnit key={`post-bottom-ad1-${currentStep}`} slot="1909584638" format="auto" minHeight="250px" />
                    <AdUnit key={`post-bottom-ad2-${currentStep}`} slot="8617081290" format="autorelaxed" minHeight="280px" />
                  </div>
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
