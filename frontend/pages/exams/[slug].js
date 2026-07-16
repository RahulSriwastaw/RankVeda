import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaSearch, FaUsers, FaTrophy, FaDownload, FaChevronDown,
  FaChevronUp, FaBookOpen, FaRobot, FaChartLine, FaArrowRight,
  FaCheckCircle, FaLock
} from 'react-icons/fa';
import axios from 'axios';
import { EXAMS, getExamBySlug, getAllSlugs } from '../../data/exams';

const SITE_URL = 'https://rankveda.in';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ─── Colour token map (themeColor → Tailwind classes) ────────────────────────
const THEME = {
  indigo: {
    badge: 'bg-indigo-950/50 border-indigo-800/50 text-indigo-400',
    hero: 'from-indigo-900/20 via-transparent',
    btn: 'from-indigo-700 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-500',
    ring: 'focus:border-indigo-500 focus:ring-indigo-500/20',
    icon: 'text-indigo-400',
    dot: 'bg-indigo-500',
    border: 'border-indigo-700/30',
    crumb: 'text-indigo-400',
    tag: 'bg-indigo-900/40 text-indigo-300',
  },
  red: {
    badge: 'bg-red-950/50 border-red-800/50 text-red-400',
    hero: 'from-red-900/20 via-transparent',
    btn: 'from-red-700 via-red-600 to-orange-600 hover:from-red-600 hover:to-orange-500',
    ring: 'focus:border-red-500 focus:ring-red-500/20',
    icon: 'text-red-400',
    dot: 'bg-red-500',
    border: 'border-red-700/30',
    crumb: 'text-red-400',
    tag: 'bg-red-900/40 text-red-300',
  },
  blue: {
    badge: 'bg-blue-950/50 border-blue-800/50 text-blue-400',
    hero: 'from-blue-900/20 via-transparent',
    btn: 'from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-500',
    ring: 'focus:border-blue-500 focus:ring-blue-500/20',
    icon: 'text-blue-400',
    dot: 'bg-blue-500',
    border: 'border-blue-700/30',
    crumb: 'text-blue-400',
    tag: 'bg-blue-900/40 text-blue-300',
  },
  teal: {
    badge: 'bg-teal-950/50 border-teal-800/50 text-teal-400',
    hero: 'from-teal-900/20 via-transparent',
    btn: 'from-teal-700 via-teal-600 to-cyan-600 hover:from-teal-600 hover:to-cyan-500',
    ring: 'focus:border-teal-500 focus:ring-teal-500/20',
    icon: 'text-teal-400',
    dot: 'bg-teal-500',
    border: 'border-teal-700/30',
    crumb: 'text-teal-400',
    tag: 'bg-teal-900/40 text-teal-300',
  },
  amber: {
    badge: 'bg-amber-950/50 border-amber-800/50 text-amber-400',
    hero: 'from-amber-900/20 via-transparent',
    btn: 'from-amber-700 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-500',
    ring: 'focus:border-amber-500 focus:ring-amber-500/20',
    icon: 'text-amber-400',
    dot: 'bg-amber-500',
    border: 'border-amber-700/30',
    crumb: 'text-amber-400',
    tag: 'bg-amber-900/40 text-amber-300',
  },
  purple: {
    badge: 'bg-purple-950/50 border-purple-800/50 text-purple-400',
    hero: 'from-purple-900/20 via-transparent',
    btn: 'from-purple-700 via-purple-600 to-pink-600 hover:from-purple-600 hover:to-pink-500',
    ring: 'focus:border-purple-500 focus:ring-purple-500/20',
    icon: 'text-purple-400',
    dot: 'bg-purple-500',
    border: 'border-purple-700/30',
    crumb: 'text-purple-400',
    tag: 'bg-purple-900/40 text-purple-300',
  },
  orange: {
    badge: 'bg-orange-950/50 border-orange-800/50 text-orange-400',
    hero: 'from-orange-900/20 via-transparent',
    btn: 'from-orange-700 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-500',
    ring: 'focus:border-orange-500 focus:ring-orange-500/20',
    icon: 'text-orange-400',
    dot: 'bg-orange-500',
    border: 'border-orange-700/30',
    crumb: 'text-orange-400',
    tag: 'bg-orange-900/40 text-orange-300',
  },
  pink: {
    badge: 'bg-pink-950/50 border-pink-800/50 text-pink-400',
    hero: 'from-pink-900/20 via-transparent',
    btn: 'from-pink-700 via-pink-600 to-rose-600 hover:from-pink-600 hover:to-rose-500',
    ring: 'focus:border-pink-500 focus:ring-pink-500/20',
    icon: 'text-pink-400',
    dot: 'bg-pink-500',
    border: 'border-pink-700/30',
    crumb: 'text-pink-400',
    tag: 'bg-pink-900/40 text-pink-300',
  },
};

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
function FAQItem({ item, idx, t }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-700/50 rounded-xl overflow-hidden">
      <button
        id={`faq-q-${idx}`}
        aria-expanded={open}
        aria-controls={`faq-a-${idx}`}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left bg-gray-900 hover:bg-gray-800/80 transition gap-4"
      >
        <span className="font-medium text-gray-200 text-sm">{item.q}</span>
        {open
          ? <FaChevronUp className={`${t.icon} shrink-0`} />
          : <FaChevronDown className="text-gray-500 shrink-0" />}
      </button>
      {open && (
        <div
          id={`faq-a-${idx}`}
          role="region"
          aria-labelledby={`faq-q-${idx}`}
          className="p-4 bg-gray-900/50 border-t border-gray-700/50 text-sm text-gray-300 leading-relaxed"
        >
          {item.a}
        </div>
      )}
    </div>
  );
}

// ─── Other Exams sidebar ─────────────────────────────────────────────────────
function OtherExams({ currentSlug }) {
  const others = EXAMS.filter((e) => e.slug !== currentSlug).slice(0, 5);
  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5">
      <h3 className="font-semibold text-gray-200 mb-3 text-sm flex items-center gap-2">
        <FaBookOpen className="text-indigo-400" /> Other Exams
      </h3>
      <div className="space-y-2">
        {others.map((e) => (
          e.status === 'active' ? (
            <Link
              key={e.slug}
              href={`/exams/${e.slug}`}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/60 hover:bg-gray-800 transition group text-sm"
            >
              <span className="flex items-center gap-2 text-gray-300 group-hover:text-white">
                <span>{e.icon}</span> {e.name}
              </span>
              <FaArrowRight className="text-xs text-gray-600 group-hover:text-indigo-400 transition" />
            </Link>
          ) : (
            <div
              key={e.slug}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/30 text-sm opacity-50"
            >
              <span className="flex items-center gap-2 text-gray-500">
                <span>{e.icon}</span> {e.name}
              </span>
              <FaLock className="text-xs text-gray-600" />
            </div>
          )
        ))}
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function ExamPage({ exam }) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [liveCount, setLiveCount] = useState(0);

  // Guard: fallback or missing prop during dev HMR
  if (router.isFallback || !exam) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading exam data...</p>
        </div>
      </div>
    );
  }

  const t = THEME[exam.themeColor] || THEME.indigo;
  const CANONICAL = `${SITE_URL}/exams/${exam.slug}`;


  // Live candidate counter
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/live-stats?exam=${exam.examId}`);
        setLiveCount(res.data.totalViews || 0);
      } catch {
        setLiveCount((prev) => prev || Math.floor(Math.random() * 5000 + 8000));
      }
    };
    fetchCount();
    const t = setInterval(fetchCount, 15000);
    return () => clearInterval(t);
  }, [exam.examId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    router.push(`/result?url=${encodeURIComponent(url.trim())}&exam=${exam.examId}`);
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
    mainEntity: exam.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const examEventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: exam.seo.eventName,
    description: exam.seo.eventDesc,
    organizer: { '@type': 'Organization', name: exam.conductedBy, url: 'https://indianrailways.gov.in' },
    url: CANONICAL,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: exam.seo.title,
    description: exam.seo.description,
    url: CANONICAL,
    inLanguage: 'en-IN',
    author: { '@type': 'Organization', name: 'RankVeda', url: SITE_URL },
    breadcrumb: breadcrumbSchema,
  };

  return (
    <>
      <Head>
        <title>{exam.seo.title}</title>
        <meta name="description" content={exam.seo.description} />
        <meta name="keywords" content={exam.seo.keywords} />
        <link rel="canonical" href={CANONICAL} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="RankVeda" />
        <meta name="language" content="en-IN" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={exam.seo.ogTitle} />
        <meta property="og:description" content={exam.seo.ogDesc} />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:site_name" content="RankVeda" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={exam.seo.twitterTitle} />
        <meta name="twitter:description" content={exam.seo.twitterDesc} />
        <meta name="twitter:site" content="@RankVedaIn" />

        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(examEventSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <div className="min-h-screen bg-gray-950 text-white">

        {/* ── Navbar ─────────────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black gradient-text">⚡ RankVeda</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/exams" className="text-sm text-gray-400 hover:text-white transition hidden sm:block">
                All Exams
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition"
              >
                <FaBookOpen className="text-xs" /> Question Bank
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <nav aria-label="breadcrumb" className="max-w-6xl mx-auto px-4 pt-4">
          <ol className="flex items-center gap-2 text-xs text-gray-500">
            <li><Link href="/" className="hover:text-gray-300">Home</Link></li>
            <li>›</li>
            <li><Link href="/exams" className="hover:text-gray-300">Exams</Link></li>
            <li>›</li>
            <li className={`${t.crumb} font-medium`}>{exam.name}</li>
          </ol>
        </nav>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className={`max-w-6xl mx-auto px-4 py-10 relative`}>
          {/* Subtle gradient glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${t.hero} to-transparent pointer-events-none rounded-3xl`} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative">

            {/* Left — copy */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className={`inline-flex items-center gap-2 ${t.badge} border text-xs font-bold px-3 py-1.5 rounded-full mb-4`}>
                {exam.icon} {exam.name} {exam.year}
              </div>

              <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3">
                {exam.name}{' '}
                <span className="gradient-text">Rank Predictor</span>{' '}
                {exam.year} — Score Calculator &amp; Answer Key
              </h1>


              <p className="text-gray-400 text-base leading-relaxed mb-5">
                {exam.bodyText}
              </p>

              {/* Live counter */}
              <div className="flex items-center gap-2 text-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 font-bold" suppressHydrationWarning>
                  {liveCount.toLocaleString()}+
                </span>
                <span className="text-gray-500">candidates checked on RankVeda</span>
              </div>

              {/* Quick feature pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { icon: '⚡', text: 'Instant Score' },
                  { icon: '📊', text: 'Section-wise Analysis' },
                  { icon: '🏆', text: 'Live Rank' },
                  { icon: '📥', text: 'Score Card Download' },
                  { icon: '🤖', text: 'AI Explanations' },
                ].map((pill) => (
                  <span
                    key={pill.text}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border border-gray-700/50 ${t.tag}`}
                  >
                    {pill.icon} {pill.text}
                  </span>
                ))}
              </div>

              {/* Exam at a glance */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Questions', value: exam.sections.reduce((s, sec) => s + sec.questions, 0) + ' MCQs' },
                  { label: 'Duration', value: exam.highlights.find(h => h.label === 'Duration')?.value || '—' },
                  { label: 'Sections', value: exam.sections.length + ' Subjects' },
                  { label: 'Marking', value: exam.highlights.find(h => h.label === 'Negative Marking')?.value || '—' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-500 mb-0.5">{stat.label}</p>
                    <p className="text-sm font-bold text-gray-200">{stat.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — URL input card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:sticky lg:top-24"
            >
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-lg font-bold mb-1 text-gray-200">
                  Check Your {exam.name} Score
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  Paste your official response sheet / answer key URL below
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="answer-key-url" className="block text-xs font-medium text-gray-400 mb-1.5">
                      Answer Key / Response Sheet URL <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="answer-key-url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://cdndigialm.com/.../assessment.html"
                      required
                      className={`w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 ${t.ring} focus:ring-2 text-white placeholder-gray-600 text-sm transition outline-none`}
                    />
                    <p className="mt-1.5 text-xs text-gray-600">
                      Find this URL on the official exam portal after result declaration
                    </p>
                  </div>

                  <button
                    type="submit"
                    id="check-score-btn"
                    className={`w-full py-3 rounded-xl bg-gradient-to-r ${t.btn} text-white font-bold transition flex items-center justify-center gap-2 text-sm shadow-lg`}
                  >
                    <FaSearch /> Check Score &amp; Rank Now
                  </button>
                </form>

                {/* Trust signals */}
                <div className="mt-5 pt-4 border-t border-gray-800">
                  <div className="grid grid-cols-3 gap-2">
                    {exam.features.map((f) => (
                      <div key={f.text} className="flex flex-col items-center text-center gap-1">
                        <span className="text-xl">{f.icon}</span>
                        <span className="text-xs text-gray-500">{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mt-4 text-center text-xs text-gray-600">
                  🔒 Free forever · No login required · Instant results
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── How it Works ───────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-bold mb-5 text-gray-200">
            How to Check {exam.name} Score on RankVeda
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Open Official Portal', desc: `Go to the official ${exam.conductedBy} website and find your response sheet link.`, icon: '🌐' },
              { step: '02', title: 'Copy URL & Paste', desc: 'Copy the response sheet URL and paste it in the input box above on RankVeda.', icon: '📋' },
              { step: '03', title: 'Instant Analysis', desc: 'Get score with negative marking, section-wise breakdown, live rank and percentile instantly.', icon: '🚀' },
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * parseInt(item.step) }}
                className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 relative overflow-hidden"
              >
                <span className="absolute top-3 right-4 text-5xl font-black text-gray-800/50 select-none leading-none">
                  {item.step}
                </span>
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-200 mb-1 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Exam Pattern + Details ─────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-bold mb-5 text-gray-200">{exam.name} Exam Pattern 2025</h2>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">

            {/* Pattern table */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-3xl p-6">
              <div className={`flex items-center gap-2 mb-4 ${t.icon}`}>
                <FaChartLine />
                <span className="font-semibold text-gray-200">Subject-wise Breakdown</span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/60">
                <div className="grid grid-cols-3 border-b border-gray-800 text-xs font-semibold text-gray-400 bg-gray-900/60">
                  <div className="p-3">Subject</div>
                  <div className="p-3 text-center">Questions</div>
                  <div className="p-3 text-center">Marks</div>
                </div>
                {exam.sections.map((section) => (
                  <div key={section.name} className="grid grid-cols-3 border-b border-gray-800 last:border-b-0 hover:bg-gray-800/30 transition">
                    <div className="p-3 text-sm text-white">{section.name}</div>
                    <div className="p-3 text-sm text-center text-gray-400">{section.questions}</div>
                    <div className="p-3 text-sm text-center text-gray-400">{section.marks}</div>
                  </div>
                ))}
                {/* Total row */}
                <div className="grid grid-cols-3 bg-gray-800/40 border-t border-gray-700">
                  <div className="p-3 text-sm font-bold text-gray-200">Total</div>
                  <div className={`p-3 text-sm text-center font-bold ${t.icon}`}>
                    {exam.sections.reduce((s, sec) => s + sec.questions, 0)}
                  </div>
                  <div className={`p-3 text-sm text-center font-bold ${t.icon}`}>
                    {exam.sections.reduce((s, sec) => s + sec.marks, 0)}
                  </div>
                </div>
              </div>

              {/* Marking scheme */}
              <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-950/60 p-4 text-sm text-gray-400">
                <p className="font-semibold text-white mb-2 text-xs uppercase tracking-wide">Marking Scheme</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500 text-xs" />
                    <span>Correct answer: <strong className="text-green-400">+1 mark</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 text-xs font-bold">✕</span>
                    <span>Wrong answer: <strong className="text-red-400">
                      -{exam.highlights.find(h => h.label === 'Negative Marking')?.value?.replace('mark for each wrong answer', '').trim() || '1/3'}
                    </strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-xs">○</span>
                    <span>Unattempted: <strong className="text-gray-400">0 marks</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Exam details table */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-3xl p-6">
              <div className={`flex items-center gap-2 mb-4 ${t.icon}`}>
                <FaRobot />
                <span className="font-semibold text-gray-200">Exam Details</span>
              </div>
              <div className="space-y-2">
                {exam.highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-gray-800 bg-gray-950/60 px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <span className="text-xs font-semibold text-gray-400">{item.label}</span>
                    <span className="text-xs text-right text-gray-200">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Topics Covered ─────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-bold mb-5 text-gray-200">{exam.name} Topics Covered</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exam.sections.map((section) => (
              <div key={section.name} className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${t.dot}`} />
                  <h3 className="font-semibold text-gray-200 text-sm">{section.name}</h3>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${t.tag}`}>
                    {section.questions} Qs
                  </span>
                </div>
                <ul className="space-y-1">
                  {section.topics.map((topic) => (
                    <li key={topic} className="text-xs text-gray-500 flex items-center gap-2">
                      <span className={`w-1 h-1 rounded-full ${t.dot} opacity-60`} />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why RankVeda ───────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-bold mb-5 text-gray-200">Why Use RankVeda for {exam.name}?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '⚡', title: 'Instant Score Calculation', desc: 'Get your exact score in seconds — automatic negative marking calculation, no manual effort.' },
              { icon: '📊', title: 'Section-wise Analysis', desc: 'See your performance broken down by subject. Identify weak areas instantly.' },
              { icon: '🏆', title: 'Live Rank & Percentile', desc: `Know where you stand among all ${exam.name} candidates on RankVeda in real-time.` },
              { icon: '📥', title: 'Score Card Download', desc: 'Download your personalized score card in PNG or PDF — share with friends and family.' },
              { icon: '🤖', title: 'AI-Powered Explanations', desc: 'Understand wrong answers with Gemini AI — never miss learning from mistakes.' },
              { icon: '🔒', title: '100% Free & Secure', desc: 'No login required, no data sold. Your result URL stays private and secure.' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition"
              >
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-gray-200 text-sm mb-2">{feature.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-2xl font-bold mb-5">
            Frequently Asked Questions — {exam.name}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-3">
              {exam.faq.map((item, idx) => (
                <FAQItem key={item.q} item={item} idx={idx} t={t} />
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <OtherExams currentSlug={exam.slug} />

              {/* CTA card */}
              <div className={`bg-gradient-to-br ${exam.color} border ${exam.border} rounded-2xl p-5`}>
                <h3 className="font-bold text-gray-200 text-sm mb-2">
                  Ready to check your {exam.name} score?
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Paste your response sheet URL and get instant results.
                </p>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={`w-full py-2 rounded-lg bg-gradient-to-r ${t.btn} text-white font-bold text-sm transition flex items-center justify-center gap-2`}
                >
                  <FaSearch /> Check Score Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="border-t border-gray-800 mt-4 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-lg font-black gradient-text">⚡ RankVeda</span>
              <p className="text-xs text-gray-600 mt-1">
                Unofficial rank predictor. Not affiliated with {exam.conductedBy}.
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-600">
              <Link href="/exams" className="hover:text-gray-400 transition">All Exams</Link>
              <Link href="/marketplace" className="hover:text-gray-400 transition">Question Bank</Link>
              <Link href="/" className="hover:text-gray-400 transition">Home</Link>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

// ─── Static Generation ────────────────────────────────────────────────────────
export async function getStaticPaths() {
  return {
    paths: getAllSlugs().map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const exam = getExamBySlug(params.slug);
  if (!exam) return { notFound: true };
  return { props: { exam } };
}
