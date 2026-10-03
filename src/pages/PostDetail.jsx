import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPostById } from '../services/postService';
import { getUnifiedPosts } from '../services/postService';
import { useSafelink } from '../context/SafelinkContext';
import Sidebar from '../components/Sidebar';
import { TechmintTopSection, TechmintBottomSection } from '../components/TechmintSafelinkWidget';
import ForcedAdPopupModal from '../components/ForcedAdPopupModal';
import { 
  Calendar, Clock, User, ArrowRight, ShieldCheck, 
  CheckCircle2, Lock, ExternalLink, ChevronRight, Share2, FileText
} from 'lucide-react';
import AdUnit from '../components/AdUnit';
import { AD_CONFIG } from '../config/adConfig';
import { updatePostSeo, cleanupPostSeo } from '../utils/seoHelper';
import { getPostThumbnail } from '../utils/postThumbnail';

function PostDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-5">
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-8 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="w-full aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-xl mt-2" />
            <div className="space-y-3 mt-4">
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-4/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        </div>
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 h-64" />
        </aside>
      </div>
    </div>
  );
}

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentStep, totalSteps, isSafelinkActive, goToNextStep, completeAndRedirect } = useSafelink();
  const [isStepVerified, setIsStepVerified] = useState(false);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [copied, setCopied] = useState(false);
  const articleRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsStepVerified(false);
  }, [postId, currentStep]);

  useEffect(() => {
    if (!post || !articleRef.current) return;
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        const uninitialized = articleRef.current.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status])');
        uninitialized.forEach(() => {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch {}
        });
      }
    } catch {}
  }, [post]);

  useEffect(() => {
    setLoading(true);
    setError('');
    getPostById(postId)
      .then((data) => {
        setPost(data);
        updatePostSeo(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Article not found');
        setLoading(false);
      });

    // Related posts
    getUnifiedPosts({ maxResults: 4 })
      .then((res) => {
        if (res.items) {
          setRelatedPosts(res.items.filter((p) => p.id !== postId).slice(0, 3));
        }
      })
      .catch(() => {});

    // Clean up SEO tags when navigating away
    return () => cleanupPostSeo();
  }, [postId]);

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
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2 font-heading">Article Not Available</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">{error || 'Unable to display article.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const rawJob = post.rawJob || {};
  const org = rawJob.organization || (post.labels && post.labels[1]) || post.sourceName || 'Verified Source';
  const category = rawJob.category || (post.labels && post.labels[0]) || 'News & Updates';
  const applyUrl = rawJob.applyUrl || rawJob.sourceUrl || post.sourceUrl || '';
  const postImage = post.imageUrl || post.thumbnail || getPostThumbnail(post);
  const pubDate = post.published ? new Date(post.published).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'Recently Published';

  const isRecruitment = post.isSarkariJob && (
    (rawJob.totalPosts && !rawJob.totalPosts.toLowerCase().includes('notice')) ||
    (rawJob.qualification && !rawJob.qualification.toLowerCase().includes('notice'))
  );

  const activeStep = currentStep > 0 ? currentStep : 1;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      

      {/* ── Fixed Sticky Step Bar (From TechmintTopSection) ── */}
      <TechmintTopSection
        currentStep={activeStep}
        totalSteps={totalSteps || 3}
        isVerified={isStepVerified}
        onVerify={() => setIsStepVerified(true)}
        timerSeconds={15}
        adSlotTop={AD_CONFIG.SLOTS.TOP_BANNER}
        adSlotBottom={AD_CONFIG.SLOTS.BELOW_VERIFY}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Breadcrumb Navigation - Clean TechMint Style */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-4 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#e60023] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link to={`/category/${encodeURIComponent(category)}`} className="hover:text-[#e60023] transition-colors">
            {category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-zinc-800 dark:text-zinc-200 truncate max-w-sm font-medium">{post.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Article Container - Clean GeneratePress Style */}
          <main className="flex-1 min-w-0">
            <article ref={articleRef} className="bg-white dark:bg-zinc-900 rounded-lg p-5 sm:px-8 sm:pt-8 sm:pb-3 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col gap-4">
              
              {/* Category & Share */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded bg-zinc-100 dark:bg-zinc-800 text-[#e60023]">
                  {category}
                </span>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copied ? 'Link Copied' : 'Share'}
                </button>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] dark:text-white leading-tight font-sans m-0 tracking-tight">
                {post.title}
              </h1>

              {/* Publication Metadata */}
              <div className="flex flex-wrap items-center text-xs font-medium text-zinc-500 dark:text-zinc-400 gap-3 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
                <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                  <User className="w-3.5 h-3.5 text-[#e60023]" /> By Editorial Desk
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  {pubDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" /> 4 min read
                </span>
              </div>

              {/* Featured Image */}
              {postImage && (
                <div className="w-full aspect-video max-h-[460px] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800">
                  <img
                    src={postImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}


              {/* Native Fluid In-Article Ad Unit */}
              <AdUnit variant="fluid" slot={AD_CONFIG.SLOTS.IN_ARTICLE_1} minHeight="120px" className="my-2" />

              {/* Recruitment Overview Box (If it's an authentic job with specifics) */}
              {isRecruitment && (
                <div className="bg-zinc-50 dark:bg-zinc-850/60 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                    📢 Notification Summary
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200/70 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Authority</span>
                      <strong className="text-zinc-900 dark:text-zinc-100 line-clamp-1">{org}</strong>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200/70 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Total Vacancies</span>
                      <strong className="text-zinc-900 dark:text-zinc-100">{rawJob.totalPosts || 'Refer Notice'}</strong>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200/70 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Qualification</span>
                      <strong className="text-zinc-900 dark:text-zinc-100 line-clamp-1">{rawJob.qualification || 'As per norms'}</strong>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200/70 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Status</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">{rawJob.lastDate || 'Active'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ACTUAL ARTICLE BODY CONTENT ── */}
              <div
                className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans text-base sm:text-lg space-y-4 break-words"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* ── Safelink Bottom Section: First Ad -> Continue Button -> Second Ad ("Sata hua") ── */}
              <TechmintBottomSection
                currentStep={activeStep}
                totalSteps={totalSteps || 3}
                isUnlocked={isStepVerified}
                adSlot1={AD_CONFIG.SLOTS.ABOVE_CONTINUE}
                adSlot2={AD_CONFIG.SLOTS.BELOW_CONTINUE}
                onContinue={() => {
                  navigate('/readmore');
                }}
              />

            </article>

            {/* Related Articles Feed */}
            {relatedPosts.length > 0 && (
              <div className="mt-4">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white font-heading mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  Related Stories &amp; Updates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedPosts.map((rel) => (
                    <Link
                      key={rel.id}
                      to={`/post/${rel.id}`}
                      className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase block mb-1">
                          {rel.labels ? rel.labels[0] : 'Update'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 leading-snug">
                          {rel.title}
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold text-zinc-400 mt-3 flex items-center gap-1">
                        Read Story ➔
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </main>

          {/* Clean Sidebar */}
          <Sidebar />

        </div>

      </div>
    </div>
  );
}
