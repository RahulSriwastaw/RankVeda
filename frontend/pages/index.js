import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers, FaRobot, FaChartLine, FaBookOpen,
  FaChevronRight, FaTrophy, FaDownload, FaCheckCircle,
  FaClock, FaArrowRight, FaShieldAlt, FaBolt, FaLink,
  FaFileAlt, FaTelegram, FaYoutube, FaTwitter, FaInstagram,
  FaSearch, FaCheck, FaQuestionCircle, FaStar, FaAward,
  FaLock, FaTimes, FaExternalLinkAlt, FaGraduationCap
} from 'react-icons/fa';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';

const SITE_URL = 'https://rankresult.in';

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'RankResult — Government Exam Score Calculator Hub',
  alternateName: 'RankResult Exam Marks & Rank Predictor',
  description: 'RankResult is India\'s free platform to check RRB NTPC, SSC, Bank exam answer keys, calculate marks with negative marking, predict rank and download professional score card.',
  url: SITE_URL,
  inLanguage: 'en-IN',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/exams?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'RankResult',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
  },
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'RankResult',
  url: SITE_URL,
  description: 'Free government exam answer key calculator and rank predictor portal for RRB NTPC, SSC CGL, CHSL, Bank PO and competitive exams.',
  sameAs: [
    'https://twitter.com/RankResultIn',
    'https://linkedin.com/company/rankresult',
    'https://github.com/rankresult',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-XXXXXXXXXX',
    contactType: 'customer support',
    availableLanguage: ['English', 'Hindi'],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
  ],
};

const FAQ_ITEMS = [
  {
    q: "Why does each exam have a dedicated page on RankResult?",
    a: "Each exam (such as RRB NTPC, SSC CGL, Bank PO) has specific negative marking rules, section weightage, and normalization formulas. Dedicated pages provide customized calculators and official updates for each exam."
  },
  {
    q: "How to check my answer key and calculate marks?",
    a: "Select your specific exam from the list below to go to its dedicated page. Paste your Digialm response sheet URL or upload your PDF response sheet to get instant marks with negative marking."
  },
  {
    q: "Is RankResult 100% Free to check marks and live rank?",
    a: "Yes! Calculating your exact score, viewing section-wise breakdown, percentile score, and All India Rank (AIR) estimation is 100% free with no login required."
  },
  {
    q: "Can I download my Score Card on mobile?",
    a: "Yes! After checking your score on your exam page, you can download an official-style HD score card directly to your smartphone in PNG or PDF format."
  }
];

export default function Home({ exams = [] }) {
  const router = useRouter();
  const [liveCount, setLiveCount] = useState(0);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Selector state for Hero
  const [selectedSlug, setSelectedSlug] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('rv_user');
      if (u) {
        try { setUser(JSON.parse(u)); } catch { }
      }
    }
  }, []);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/live-stats?exam=1`);
        setLiveCount(res.data.totalViews || 0);
      } catch {
        setLiveCount(prev => prev || 24580);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 12000);
    return () => clearInterval(interval);
  }, []);

  // Set default selected exam slug once exams load
  useEffect(() => {
    if (exams && exams.length > 0) {
      const activeExam = exams.find(e => e.status === 'active') || exams[0];
      setSelectedSlug(activeExam.slug || 'rrb-ntpc-ug');
    }
  }, [exams]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  const handleGoToExamPage = (e) => {
    e.preventDefault();
    if (selectedSlug) {
      router.push(`/exams/${selectedSlug}`);
    }
  };

  // Filter exams based on category & search query
  const categories = ['All', 'Active Keys', 'Railway', 'SSC', 'Banking', 'State Exams'];

  const filteredExams = exams.filter(exam => {
    const nameLower = (exam.name || '').toLowerCase();
    const fullNameLower = (exam.full_name || '').toLowerCase();
    const qLower = searchQuery.toLowerCase();

    const matchesSearch = !qLower || nameLower.includes(qLower) || fullNameLower.includes(qLower);

    let matchesCat = true;
    if (activeCategory === 'Active Keys') {
      matchesCat = exam.status === 'active';
    } else if (activeCategory === 'Railway') {
      matchesCat = nameLower.includes('rrb') || nameLower.includes('railway') || fullNameLower.includes('railway');
    } else if (activeCategory === 'SSC') {
      matchesCat = nameLower.includes('ssc') || fullNameLower.includes('staff selection');
    } else if (activeCategory === 'Banking') {
      matchesCat = nameLower.includes('bank') || nameLower.includes('ibps') || nameLower.includes('sbi');
    } else if (activeCategory === 'State Exams') {
      matchesCat = !nameLower.includes('rrb') && !nameLower.includes('ssc') && !nameLower.includes('bank');
    }

    return matchesSearch && matchesCat;
  });

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Government Exam Answer Key Calculators',
    description: 'List of all supported government exam answer key calculators on RankResult',
    itemListElement: exams.map((exam, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${exam.name} ${exam.year || '2025'} Answer Key Calculator`,
      url: `${SITE_URL}/exams/${exam.slug}`,
      description: `${exam.full_name} - ${exam.desc_card || exam.description}. Check answer key, calculate score with negative marking, predict rank and download score card.`,
    })),
  };

  return (
    <>
      <Head>
        <title>RankResult — Government Exam Answer Key Calculator Portal 2025 | RRB NTPC, SSC, Bank Score & Rank</title>
        <meta name="description" content="Select your exam on RankResult — India's #1 free exam score calculator. Dedicated pages for RRB NTPC UG, SSC CGL, CHSL, Bank PO, RRB ALP answer keys 2025. Calculate exact marks with negative marking, predict live rank & percentile." />
        <meta name="keywords" content="RRB NTPC UG answer key 2025, SSC CGL answer key 2025, SSC CHSL answer key 2025, RRB ALP answer key 2025, Bank PO answer key 2025, exam score calculator, marks calculator with negative marking, rank predictor" />
        <link rel="canonical" href={SITE_URL} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="RankResult" />
        <meta name="language" content="en-IN" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors">
        
        {/* ── Sticky Top Navbar ────────────────────────────────────────── */}
        <Navbar user={user} setUser={setUser} />

        {/* ── Hero Section (Light & Dark Compatible) ──────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-slate-50 to-white dark:from-[#0b0f29] dark:via-[#0f172a] dark:to-slate-950 pt-6 pb-12 sm:pt-12 sm:pb-20 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
          
          {/* Subtle Ambient Background Orbs */}
          <div className="absolute -top-20 right-0 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 sm:w-[400px] sm:h-[400px] bg-sky-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 relative">
            
            {/* Top Live Stats Badge */}
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[11px] sm:text-xs font-bold px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-sm dark:shadow-lg backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-amber-500 dark:text-amber-400 font-black">★</span>
                <span>India's #1 Exam Score &amp; Rank Calculator Portal</span>
                <span className="hidden xs:inline text-slate-400">•</span>
                <span className="hidden xs:inline text-emerald-600 dark:text-emerald-400 font-extrabold" suppressHydrationWarning>
                  {(liveCount || 24580).toLocaleString()}+ Candidates Served
                </span>
              </div>
            </div>

            {/* Main Headline & Subtitle */}
            <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                Select Your Exam Page for <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 dark:from-amber-400 dark:via-orange-400 dark:to-rose-400 text-transparent bg-clip-text">Instant Score</span> &amp; <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 dark:from-indigo-400 dark:via-purple-300 dark:to-sky-400 text-transparent bg-clip-text">Rank Prediction</span>
              </h1>
              
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto px-2">
                Every exam has its dedicated calculation page with specific negative marking rules, subject weightage, normalization formulas &amp; SEO analysis. Select your exam below.
              </p>
            </div>

            {/* ── Quick Exam Navigation Hub Widget ────────────────────── */}
            <div className="mt-6 sm:mt-8 max-w-xl mx-auto">
              <form onSubmit={handleGoToExamPage} className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-indigo-500/30 rounded-2xl p-3 sm:p-4 shadow-xl dark:shadow-2xl backdrop-blur-xl space-y-3">
                
                <label className="block text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 text-center sm:text-left">
                  🚀 Quick Select Your Exam Page:
                </label>

                <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                  {/* Select Exam Dropdown */}
                  <div className="relative flex-grow">
                    <select
                      value={selectedSlug}
                      onChange={(e) => setSelectedSlug(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs sm:text-sm rounded-xl px-3.5 py-3 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer pr-9"
                    >
                      {exams.length > 0 ? (
                        exams.map(exam => (
                          <option key={exam.slug || exam.id} value={exam.slug}>
                            {exam.name} {exam.year || '2025'} {exam.status !== 'active' ? '(Coming Soon)' : ''}
                          </option>
                        ))
                      ) : (
                        <option value="rrb-ntpc-ug">RRB NTPC UG 2025 Answer Key Calculator</option>
                      )}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">
                      ▼
                    </div>
                  </div>

                  {/* Go to Dedicated Page Button */}
                  <button
                    type="submit"
                    className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <span>Open Exam Page</span>
                    <FaArrowRight className="text-xs" />
                  </button>
                </div>

                {/* Popular Exam Links Chips */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap items-center justify-center gap-1.5 text-[10.5px] font-bold text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">Popular:</span>
                  {exams.slice(0, 4).map(exam => (
                    <Link
                      key={exam.slug}
                      href={`/exams/${exam.slug}`}
                      className="bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/80 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                    >
                      <span>{exam.icon || '📋'}</span>
                      <span>{exam.name}</span>
                    </Link>
                  ))}
                </div>

              </form>
            </div>

            {/* Feature Highlights Quick Bar */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm shrink-0">
                  <FaChartLine />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-800 dark:text-white">Dedicated Exam SEO</div>
                  <div className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400">Exact Board Rules</div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm shrink-0">
                  <FaTrophy />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-800 dark:text-white">Live Rank &amp; AIR</div>
                  <div className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400">Real Candidate Rank</div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm shrink-0">
                  <FaDownload />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-800 dark:text-white">Scorecard PDF</div>
                  <div className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400">Download PNG/PDF</div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm shrink-0">
                  <FaRobot />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-800 dark:text-white">AI Explanations</div>
                  <div className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400">Step-by-Step AI</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── Choose Your Exam Section (Light & Dark Responsive Grid) ──── */}
        <section className="py-10 sm:py-16 max-w-7xl mx-auto px-3.5 sm:px-6" id="exams">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-1">
                <FaGraduationCap className="text-sm" />
                <span>Dedicated Exam Pages</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                All Government Exam Calculators
              </h2>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exam (RRB NTPC, SSC, Bank...)"
                className="w-full bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-semibold text-xs rounded-xl pl-9 pr-8 py-2.5 border border-slate-200 dark:border-slate-700/70 focus:border-indigo-500 focus:outline-none shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Exam Cards Grid */}
          {filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
              {filteredExams.map((exam, i) => {
                const isActive = exam.status === 'active';
                const examSlug = exam.slug || 'rrb-ntpc-ug';

                const badgeText = exam.badge || (isActive ? 'Active Calculator' : 'Coming Soon');
                const examIcon = exam.icon || '📋';
                const totalQuestions = exam.total_questions || 100;

                return (
                  <motion.div
                    key={exam.slug || exam.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link href={`/exams/${examSlug}`} className="block group h-full">
                      <div className={`bg-white dark:bg-slate-800/60 border ${isActive ? 'border-slate-200 dark:border-slate-700/80 hover:border-indigo-500' : 'border-slate-200 dark:border-slate-800'} rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between h-full relative shadow-sm hover:shadow-md dark:shadow-md dark:hover:shadow-indigo-500/10`}>
                        
                        <div>
                          {/* Top row: Icon + Title + Status badge */}
                          <div className="flex items-start gap-3 mb-2.5">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0">
                              {examIcon}
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h3 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition truncate">
                                  {exam.name}
                                </h3>
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                                  isActive
                                    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                                    : 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                                }`}>
                                  {badgeText}
                                </span>
                              </div>
                              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {exam.full_name || 'Govt Competitive Exam'}
                              </p>
                            </div>
                          </div>

                          {/* SEO Article snippet / Card desc */}
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
                            {exam.desc_card || exam.description || `Official ${exam.name} answer key calculator, negative marking deduction & live rank predictor.`}
                          </p>

                          {/* Exam Details Chips */}
                          <div className="flex flex-wrap items-center gap-1.5 my-2 text-[9.5px] font-bold">
                            <span className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/50 flex items-center gap-1">
                              <FaFileAlt className="text-[9px] text-indigo-500 dark:text-indigo-400" /> {totalQuestions} Qs
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/50 flex items-center gap-1">
                              <FaAward className="text-[9px] text-emerald-500 dark:text-emerald-400" /> Negative Marking
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/50 flex items-center gap-1">
                              <FaShieldAlt className="text-[9px] text-sky-500 dark:text-sky-400" /> Dedicated SEO Page
                            </span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-2">
                          <div className="w-full py-2.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 dark:group-hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition shadow-sm">
                            <span>Open {exam.name} Page</span>
                            <FaArrowRight className="text-[10px] group-hover:translate-x-0.5 transition" />
                          </div>
                        </div>

                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto shadow-sm">
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Exam Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Try searching with a different exam name or category.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Reset Search
              </button>
            </div>
          )}

        </section>

        {/* ── SEO Article Overview Section ─────────────────────────────── */}
        <section className="py-10 sm:py-16 bg-white dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800/80 transition-colors">
          <div className="max-w-4xl mx-auto px-3.5 sm:px-6">
            
            <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 space-y-4 shadow-sm">
              <div className="inline-flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 text-xs font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-500/10 px-3 py-1 rounded-md">
                <span>📚</span> Government Exam Answer Key &amp; Score Calculator Guide 2025
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                How RankResult Calculates Exam Scores, Negative Marking &amp; Rank
              </h2>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                When competitive exams like <strong className="text-slate-900 dark:text-white">RRB NTPC, SSC CGL, SSC CHSL, RRB ALP, and Bank PO</strong> declare candidate response sheets via Digialm portals, students need an accurate and fast tool to check their exact marks without manual error.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-white dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
                  <h3 className="text-xs font-black text-indigo-700 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
                    <FaAward className="text-emerald-600 dark:text-emerald-400" /> Precise Negative Marking
                  </h3>
                  <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Our exam engines automatically deduct official negative marks (such as 1/3 negative marking for RRB NTPC or 0.5/0.25 negative marking for SSC exams) based on the specific exam pattern.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
                  <h3 className="text-xs font-black text-indigo-700 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
                    <FaTrophy className="text-amber-600 dark:text-amber-400" /> All India Rank (AIR) &amp; Percentile
                  </h3>
                  <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    By compiling verified candidate responses across shifts, RankResult estimates your real-time All India Rank (AIR) and Category Percentile score.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
                Select your respective exam link above (e.g., <Link href="/exams/rrb-ntpc-ug" className="text-indigo-600 dark:text-indigo-400 font-bold underline">RRB NTPC UG 2025 Answer Key Calculator</Link>) to access the dedicated SEO page with full subject-wise syllabus breakdown, cutoff trends, and answer key submission widget.
              </p>
            </div>

          </div>
        </section>

        {/* ── FAQ Accordion Section ───────────────────────────────────── */}
        <section className="py-10 sm:py-16 max-w-3xl mx-auto px-3.5 sm:px-6">
          <div className="text-center mb-8">
            <div className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-1">
              Frequently Asked Questions
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Got Questions? We Have Answers
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300 transition"
                  >
                    <span>{item.q}</span>
                    <span className={`text-indigo-600 dark:text-indigo-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
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
            })}
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 pt-12 pb-8 px-3.5 sm:px-6 border-t border-slate-800">
          <div className="max-w-7xl mx-auto">

            {/* Newsletter Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8 border-b border-slate-800 items-center">
              <div className="lg:col-span-6 text-center lg:text-left space-y-1">
                <div className="text-base font-black text-white flex items-center gap-2 justify-center lg:justify-start">
                  <span>⚡</span> Get Exam Answer Key Updates
                </div>
                <p className="text-xs text-slate-400">Receive answer key releases &amp; mock test alerts in your inbox.</p>
              </div>
              <div className="lg:col-span-6">
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto lg:mr-0">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-grow bg-slate-800 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shrink-0 shadow-md">
                    {subscribed ? 'Subscribed!' : 'Subscribe'}
                  </button>
                </form>
              </div>
            </div>

            {/* Links Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
              <div className="col-span-2 md:col-span-1">
                <div className="mb-3"><Logo size="sm" /></div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  India's leading platform for government exam answer key calculations, negative marking evaluation and live rank prediction.
                </p>
                <div className="flex items-center gap-2.5 mt-4">
                  <a href="#" aria-label="Telegram" className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs hover:bg-indigo-600 hover:text-white transition"><FaTelegram /></a>
                  <a href="#" aria-label="YouTube" className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs hover:bg-indigo-600 hover:text-white transition"><FaYoutube /></a>
                  <a href="#" aria-label="Twitter" className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs hover:bg-indigo-600 hover:text-white transition"><FaTwitter /></a>
                  <a href="#" aria-label="Instagram" className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs hover:bg-indigo-600 hover:text-white transition"><FaInstagram /></a>
                </div>
              </div>

              <div>
                <div className="font-extrabold text-white text-xs uppercase tracking-wider mb-3">Exams Pages</div>
                <ul className="space-y-2 text-xs">
                  {exams.slice(0, 5).map(e => (
                    <li key={e.slug}>
                      <Link href={`/exams/${e.slug}`} className="hover:text-white transition">{e.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-extrabold text-white text-xs uppercase tracking-wider mb-3">Platform</div>
                <ul className="space-y-2 text-xs">
                  <li><Link href="/exams" className="hover:text-white transition">All Exams</Link></li>
                  <li><Link href="/marketplace" className="hover:text-white transition">Question Bank</Link></li>
                  <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                  <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
                  <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
                </ul>
              </div>

              <div>
                <div className="font-extrabold text-white text-xs uppercase tracking-wider mb-3">Legal</div>
                <ul className="space-y-2 text-xs">
                  <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                  <li><Link href="/disclaimer" className="hover:text-white transition">Disclaimer</Link></li>
                  <li><Link href="/refund-policy" className="hover:text-white transition">Refund Policy</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="border-t border-slate-800/80 pt-5 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] font-semibold text-slate-500">
              <div>© 2025 RankResult — All Rights Reserved</div>
              <div className="text-center md:text-right text-slate-500 max-w-md">
                Disclaimer: Scores are unofficial estimates. Final results are published only by respective official examination boards.
              </div>
            </div>

          </div>
        </footer>

      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/public/exams`);
    const data = await res.json();
    return {
      props: {
        exams: data.exams || [],
      },
    };
  } catch (e) {
    console.error("Error fetching exams:", e);
    return {
      props: {
        exams: [],
      },
    };
  }
}