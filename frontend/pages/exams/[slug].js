import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaUsers, FaTrophy, FaDownload, FaChevronDown,
  FaChevronUp, FaBookOpen, FaRobot, FaChartLine, FaArrowRight,
  FaCheckCircle, FaLock, FaFilePdf, FaShieldAlt, FaAward,
  FaClock, FaFileAlt, FaLink, FaExclamationCircle, FaQuestionCircle,
  FaStar, FaExternalLinkAlt, FaGraduationCap
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Logo from '../../components/Logo';

const SITE_URL = 'https://rankresult.in';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ─── FAQ Accordion Component ──────────────────────────────────────────────────
function FAQItem({ item, idx }) {
  const [open, setOpen] = useState(idx === 0);
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition">
      <button
        id={`faq-q-${idx}`}
        aria-expanded={open}
        aria-controls={`faq-a-${idx}`}
        onClick={() => setOpen(!open)}
        className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300 transition"
      >
        <span>{item.q}</span>
        <span className={`text-indigo-600 dark:text-indigo-400 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={`faq-a-${idx}`}
            role="region"
            aria-labelledby={`faq-q-${idx}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Other Exams Sidebar Component ────────────────────────────────────────────
function OtherExams({ currentSlug, allExams = [] }) {
  const others = allExams.filter((e) => e.slug !== currentSlug).slice(0, 5);
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <h3 className="font-extrabold text-slate-900 dark:text-white mb-4 text-xs sm:text-sm flex items-center gap-2 uppercase tracking-wider">
        <FaBookOpen className="text-indigo-600 dark:text-indigo-400" /> Other Exam Calculators
      </h3>
      <div className="space-y-2.5">
        {others.map((e) => (
          e.status === 'active' ? (
            <Link
              key={e.slug}
              href={`/exams/${e.slug}`}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-500/50 transition group text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              <span className="flex items-center gap-2 truncate">
                <span className="text-base">{e.icon || '📋'}</span>
                <span className="truncate">{e.name}</span>
              </span>
              <FaArrowRight className="text-[10px] text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:translate-x-0.5 transition shrink-0" />
            </Link>
          ) : (
            <div
              key={e.slug}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 opacity-60"
            >
              <span className="flex items-center gap-2 truncate">
                <span className="text-base">{e.icon || '📋'}</span>
                <span className="truncate">{e.name}</span>
              </span>
              <FaLock className="text-[10px] shrink-0" />
            </div>
          )
        ))}
      </div>
    </div>
  );
}

// ─── Main Exam SEO Page Component ─────────────────────────────────────────────
export default function ExamPage({ exam, allExams = [] }) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [liveCount, setLiveCount] = useState(0);
  const [activeTab, setActiveTab] = useState('url');
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Guard: fallback or missing prop during dev HMR
  if (router.isFallback || !exam) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">Loading exam data...</p>
        </div>
      </div>
    );
  }

  const CANONICAL = `${SITE_URL}/exams/${exam.slug}`;

  // Live candidate counter
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/live-stats?exam=${exam.id}`);
        setLiveCount(res.data.totalViews || 0);
      } catch {
        setLiveCount((prev) => prev || Math.floor(Math.random() * 5000 + 8000));
      }
    };
    fetchCount();
    const timer = setInterval(fetchCount, 15000);
    return () => clearInterval(timer);
  }, [exam.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setUrlError('');
    if (!url.trim()) {
      setUrlError('Please paste your response sheet URL');
      return;
    }
    if (!url.includes('digialm.com') && !url.includes('http')) {
      setUrlError('Please enter a valid response sheet URL (e.g. digialm.com)');
      return;
    }
    router.push(`/result?url=${encodeURIComponent(url.trim())}&exam=${exam.id}`);
  };

  const handlePdfSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('exam_id', exam.id);

    try {
      toast.loading('Uploading and parsing response sheet PDF...', { id: 'pdf-upload' });
      const res = await axios.post(`${API_BASE}/api/results/upload-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Response sheet parsed successfully!', { id: 'pdf-upload' });
      router.push(`/result?id=${res.data.result.id}&exam=${exam.id}`);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to parse PDF. Please try again.';
      toast.error(errMsg, { id: 'pdf-upload' });
    } finally {
      setUploading(false);
    }
  };

  // ── Schema.org structured data ──────────────────────────────────────────
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Exams', item: `${SITE_URL}/exams` },
      { '@type': 'ListItem', position: 3, name: exam.name, item: CANONICAL },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (exam.faq || []).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const examEventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: exam.seo?.eventName || `${exam.name} Answer Key Release 2025`,
    description: exam.seo?.eventDesc || `Official answer key calculation and rank predictor for ${exam.name}`,
    organizer: { '@type': 'Organization', name: exam.conducted_by || 'Recruitment Board', url: 'https://indianrailways.gov.in' },
    url: CANONICAL,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: exam.seo?.title || `${exam.name} Answer Key 2025 — Score & Rank Calculator`,
    description: exam.seo?.description || `Check ${exam.name} answer key 2025. Calculate exact marks with negative marking, view percentile & download score card.`,
    url: CANONICAL,
    inLanguage: 'en-IN',
    author: { '@type': 'Organization', name: 'RankResult', url: SITE_URL },
    breadcrumb: breadcrumbSchema,
  };

  const totalQuestions = exam.sections ? exam.sections.reduce((sum, sec) => sum + sec.questions, 0) : 100;
  const negativeMarkingText = exam.highlights?.find(h => h.label === 'Negative Marking')?.value || '1/3 Negative';

  return (
    <>
      <Head>
        <title>{exam.seo?.title || `${exam.name} Rank Predictor & Score Calculator 2026 | RankResult.in`}</title>
        <meta name="description" content={exam.seo?.description || `Predict your ${exam.name} rank instantly. Upload answer key PDF or paste URL to calculate marks, percentile & AIR category rank. Free Rank Predictor 2026.`} />
        <meta name="keywords" content={exam.seo?.keywords || `${exam.name} Rank Predictor, ${exam.name} Score Calculator, Score Calculator, Rank Predictor 2026, Answer Key Calculator, Marks Calculator, Analyze Answer Key, ${exam.name} Answer Key PDF`} />
        <link rel="canonical" href={CANONICAL} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="RankResult" />
        <meta name="language" content="en-IN" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={exam.seo?.ogTitle || `${exam.name} Answer Key Calculator & Rank Predictor 2025`} />
        <meta property="og:description" content={exam.seo?.ogDesc || `Free marks calculator for ${exam.name}. Calculate exact score with negative marking & live rank estimate.`} />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:site_name" content="RankResult" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={exam.seo?.twitterTitle || `${exam.name} Score & Rank Calculator 2025`} />
        <meta name="twitter:description" content={exam.seo?.twitterDesc || `Check ${exam.name} answer key response URL for instant marks & rank.`} />
        <meta name="twitter:site" content="@RankResultIn" />

        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(examEventSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors">

        {/* ── Navbar ─────────────────────────────────────────────────────── */}
        <Navbar />

        {/* ── Breadcrumb Bar ─────────────────────────────────────────────── */}
        <nav aria-label="breadcrumb" className="max-w-7xl mx-auto px-3.5 sm:px-6 pt-4">
          <ol className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <li><Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Home</Link></li>
            <li className="text-slate-400 dark:text-slate-600">›</li>
            <li><Link href="/exams" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Exams</Link></li>
            <li className="text-slate-400 dark:text-slate-600">›</li>
            <li className="text-indigo-600 dark:text-indigo-300 font-bold truncate max-w-[180px]">{exam.name}</li>
          </ol>
        </nav>

        {/* ── Hero & Dedicated Exam Calculator Section ──────────────────── */}
        <section className="max-w-7xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column — H1 Title, Meta Tags & Exam Overview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-7 space-y-4"
            >
              {/* Badge Pill */}
              <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/90 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                <span className="text-amber-500 dark:text-amber-400">{exam.icon || '📋'}</span>
                <span>{exam.name} {exam.year || '2025'} Official Calculator</span>
              </div>

              {/* H1 SEO Heading */}
              <h1 className="text-2xl xs:text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                {exam.name} <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 dark:from-amber-400 dark:via-orange-400 dark:to-rose-400 text-transparent bg-clip-text">Answer Key 2025</span> &amp; <span className="bg-gradient-to-r from-indigo-600 to-sky-600 dark:from-indigo-400 dark:to-sky-400 text-transparent bg-clip-text">Rank Predictor</span>
              </h1>

              {/* Subheading / Body paragraph */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {exam.body_text || `Official ${exam.name} answer key calculator on RankResult. Submit your Digialm response sheet URL or upload response PDF to get instant subject-wise marks, negative marking deduction, and All India Rank (AIR) estimate.`}
              </p>

              {/* Live Count Badge */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                <span className="text-emerald-600 dark:text-emerald-400 font-black" suppressHydrationWarning>
                  {(liveCount || 12450).toLocaleString()}+
                </span>
                <span>candidates checked for {exam.name}</span>
              </div>

              {/* Exam Quick Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-sm">
                  <div className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">Total Questions</div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5">{totalQuestions} MCQs</div>
                </div>

                <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-sm">
                  <div className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">Negative Marking</div>
                  <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{negativeMarkingText}</div>
                </div>

                <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-sm">
                  <div className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">Conducted By</div>
                  <div className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-300 mt-0.5 truncate">{exam.conducted_by || 'Board'}</div>
                </div>

                <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-sm">
                  <div className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">Rank Engine</div>
                  <div className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5">AIR Live</div>
                </div>
              </div>

            </motion.div>

            {/* Right Column — Dedicated Calculator Box */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-5 lg:sticky lg:top-20"
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-xl dark:shadow-2xl space-y-3.5 backdrop-blur-xl">
                
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Check {exam.name} Score
                  </h2>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeTab === 'url' ? 'Paste your Digialm response sheet URL below' : 'Upload your official response sheet PDF below'}
                  </p>
                </div>

                {/* Submission Mode Selector Tabs */}
                <div className="flex border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-slate-100 dark:bg-slate-950">
                  <button
                    type="button"
                    onClick={() => setActiveTab('url')}
                    className={`flex-1 py-2 text-xs font-black rounded-lg transition ${
                      activeTab === 'url'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🌐 Submit URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pdf')}
                    className={`flex-1 py-2 text-xs font-black rounded-lg transition ${
                      activeTab === 'pdf'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    📄 Upload PDF
                  </button>
                </div>

                {/* Form A: Submit URL */}
                {activeTab === 'url' ? (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label htmlFor="answer-key-url" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                        Digialm Response Sheet URL <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <FaLink className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400 text-xs" />
                        <input
                          id="answer-key-url"
                          type="url"
                          value={url}
                          onChange={(e) => { setUrl(e.target.value); setUrlError(''); }}
                          placeholder="https://cdndigialm.com/.../assessment.html"
                          required
                          className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono text-xs rounded-xl pl-9 pr-3 py-3 border border-slate-200 dark:border-slate-700/80 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                        Found on the official recruitment portal after answer key release.
                      </p>
                    </div>

                    {urlError && (
                      <div className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400 text-[11px] font-semibold">
                        <FaExclamationCircle className="shrink-0" />
                        <span>{urlError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      id="check-score-btn"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 active:scale-[0.98]"
                    >
                      <FaSearch className="text-xs" /> Check Score &amp; Live Rank
                    </button>
                  </form>
                ) : (
                  /* Form B: Upload PDF */
                  <form onSubmit={handlePdfSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                        Response Sheet PDF <span className="text-rose-500">*</span>
                      </label>
                      
                      <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-5 bg-slate-50 dark:bg-slate-950 text-center cursor-pointer transition">
                        <input
                          type="file"
                          accept=".pdf"
                          required
                          onChange={(e) => setPdfFile(e.target.files[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <FaFilePdf className="text-2xl text-rose-500 dark:text-rose-400" />
                          {pdfFile ? (
                            <div>
                              <p className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[220px]">
                                {pdfFile.name}
                              </p>
                              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                                Click or drag response sheet PDF
                              </p>
                              <p className="text-[10px] font-semibold text-slate-500">
                                Text-searchable printed PDFs supported
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!pdfFile || uploading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50"
                    >
                      {uploading ? 'Processing PDF...' : 'Upload & Calculate Score'}
                    </button>
                  </form>
                )}

                {/* Trust Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                  <FaCheckCircle className="text-[9px]" /> 100% Free · No Login Required · Instant AIR
                </div>

              </div>
            </motion.div>

          </div>
        </section>

        {/* ── SEO Article Content Section ────────────────────────────── */}
        <section className="py-10 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Article Main Body */}
              <article className="lg:col-span-8 space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 space-y-4 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    How To Check {exam.name} Answer Key 2025 &amp; Calculate Marks
                  </h2>

                  <p>
                    Following the completion of the <strong className="text-slate-900 dark:text-white">{exam.full_name || exam.name}</strong> examination, candidates can check their recorded responses using the official candidate login portal (Digialm). RankResult automates the calculation process by evaluating your attempted questions against official key answers.
                  </p>

                  <h3 className="text-sm font-black text-indigo-700 dark:text-indigo-300 pt-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
                    Step-by-Step Instructions to Extract Response Sheet URL:
                  </h3>

                  <ol className="list-decimal list-inside space-y-2 pl-2 text-slate-600 dark:text-slate-400 font-medium text-xs sm:text-xs">
                    <li>Log into your official recruitment board candidate portal ({exam.conducted_by || 'Digialm'}).</li>
                    <li>Navigate to the <strong className="text-slate-900 dark:text-slate-200">Candidate Response / Objection Tracker</strong> tab.</li>
                    <li>Click on the link that opens your response sheet in a new browser tab.</li>
                    <li>Copy the full browser URL (starts with <code className="text-indigo-700 dark:text-indigo-300 bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">https://cdndigialm.com/...</code>).</li>
                    <li>Paste the URL into the RankResult {exam.name} calculator input above and tap <strong className="text-indigo-600 dark:text-indigo-400">Check Score</strong>.</li>
                  </ol>
                </div>

                {/* Exam Pattern & Subject Breakdown Table */}
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 space-y-4 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {exam.name} Exam Pattern &amp; Marking Scheme {exam.year || '2025'}
                  </h2>

                  <p>
                    The official exam pattern for {exam.name} determines the section-wise distribution of questions and marks:
                  </p>

                  {/* Section Table */}
                  {exam.sections && exam.sections.length > 0 && (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Section / Subject</th>
                            <th className="p-3 text-center">Questions</th>
                            <th className="p-3 text-center">Total Marks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                          {exam.sections.map((sec) => (
                            <tr key={sec.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-3 font-bold text-slate-900 dark:text-white">{sec.name}</td>
                              <td className="p-3 text-center text-slate-700 dark:text-slate-300">{sec.questions}</td>
                              <td className="p-3 text-center text-slate-700 dark:text-slate-300">{sec.marks}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="bg-white dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs shadow-sm">
                    <div className="font-extrabold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider">Formula for Score Calculation:</div>
                    <div className="font-mono text-indigo-700 dark:text-indigo-300 bg-slate-100 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
                      Raw Score = (Correct Answers × Positive Marks) - (Incorrect Answers × Negative Deduction)
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Negative Marking Rule: <strong className="text-rose-500 dark:text-rose-400">{negativeMarkingText}</strong> deducted for every incorrect attempt. Unattempted questions receive 0 marks.
                    </p>
                  </div>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-3 pt-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Frequently Asked Questions ({exam.name})
                  </h2>
                  {(exam.faq || []).map((f, idx) => (
                    <FAQItem key={idx} item={f} idx={idx} />
                  ))}
                </div>

              </article>

              {/* Sidebar Column */}
              <aside className="lg:col-span-4 space-y-6">
                <OtherExams currentSlug={exam.slug} allExams={allExams} />

                {/* RankResult Platform CTA */}
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/30 rounded-2xl p-5 space-y-3 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Need AI Explanations for Wrong Answers?
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Check your {exam.name} score to unlock step-by-step AI solutions for incorrect questions.
                  </p>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition shadow-md"
                  >
                    Check Score Now
                  </button>
                </div>
              </aside>

            </div>

          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 pt-12 pb-8 px-3.5 sm:px-6 border-t border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
              <div>
                <div className="mb-2"><Logo size="sm" /></div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Unofficial score calculator. Not affiliated with {exam.conducted_by || 'recruitment board'}.
                </p>
              </div>
              <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
                <Link href="/" className="hover:text-white transition">Home</Link>
                <Link href="/exams" className="hover:text-white transition">Exams</Link>
                <Link href="/marketplace" className="hover:text-white transition">Question Bank</Link>
              </div>
            </div>
            
            <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              <div>© 2025 RankResult — All Rights Reserved</div>
              <div className="text-center md:text-right normal-case tracking-normal">
                Disclaimer: Scores are unofficial estimates. Final result by respective recruitment boards only.
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

// ─── Dynamic Server Side Rendering ───────────────────────────────────────────
export async function getServerSideProps({ params }) {
  try {
    const [examRes, allExamsRes] = await Promise.all([
      fetch(`${API_BASE}/api/public/exams/${params.slug}`),
      fetch(`${API_BASE}/api/public/exams`)
    ]);
    
    if (examRes.status === 404) {
      return { notFound: true };
    }
    
    const examData = await examRes.json();
    const allExamsData = await allExamsRes.json();
    const exam = examData.exam;
    const allExams = allExamsData.exams || [];
    
    if (!exam || exam.status === 'draft') {
      return { notFound: true };
    }
    
    return {
      props: {
        exam,
        allExams,
      },
    };
  } catch (e) {
    console.error("Error fetching exam details:", e);
    return { notFound: true };
  }
}
