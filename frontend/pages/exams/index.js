import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight, FaLock, FaBookOpen } from 'react-icons/fa';
import { EXAMS } from '../../data/exams';

const SITE_URL = 'https://rankveda.in';

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Exams', item: `${SITE_URL}/exams` },
  ],
};

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'All Government Exam Answer Key Calculators — RankVeda',
  itemListElement: EXAMS.map((e, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: `${e.name} ${e.year} Answer Key — ${e.fullName}`,
    url: `${SITE_URL}/exams/${e.slug}`,
  })),
};

export default function ExamsIndexPage() {
  const activeExams = EXAMS.filter((e) => e.status === 'active');
  const upcomingExams = EXAMS.filter((e) => e.status !== 'active');

  return (
    <>
      <Head>
        <title>All Exam Answer Key Calculators 2025 | RRB NTPC, SSC CGL, CHSL, Bank PO | RankVeda</title>
        <meta
          name="description"
          content="Check answer keys, calculate exact scores and predict rank for RRB NTPC UG, NTPC CBT-II, SSC CGL, SSC CHSL, RRB ALP, IBPS PO and SSC MTS 2025. Free tool with section-wise analysis and score card download."
        />
        <meta
          name="keywords"
          content="exam answer key calculator 2025, RRB NTPC answer key, NTPC CBT-II answer key, SSC CGL answer key, SSC CHSL answer key, RRB ALP answer key, IBPS PO answer key, SSC MTS answer key, government exam rank predictor"
        />
        <link rel="canonical" href={`${SITE_URL}/exams`} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <meta name="author" content="RankVeda" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="All Exam Answer Key Calculators 2025 | RankVeda" />
        <meta
          property="og:description"
          content="Free answer key calculators for RRB NTPC, SSC CGL, SSC CHSL, RRB ALP, IBPS PO and SSC MTS. Check score, rank and download score card."
        />
        <meta property="og:url" content={`${SITE_URL}/exams`} />
        <meta property="og:site_name" content="RankVeda" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="All Exam Answer Key Calculators 2025 | RankVeda" />
        <meta name="twitter:site" content="@RankVedaIn" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      </Head>

      <div className="min-h-screen bg-gray-950 text-white">

        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl font-black gradient-text">⚡ RankVeda</Link>
            <Link
              href="/marketplace"
              className="flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition"
            >
              <FaBookOpen className="text-xs" /> Question Bank
            </Link>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-10">

          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-xs text-gray-500">
              <li><Link href="/" className="hover:text-gray-300">Home</Link></li>
              <li>›</li>
              <li className="text-indigo-400">Exams</li>
            </ol>
          </nav>

          {/* Page header */}
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            Government Exam <span className="gradient-text">Answer Key</span> Calculators
          </h1>
          <p className="text-gray-400 mb-10 max-w-2xl text-sm leading-relaxed">
            RRB NTPC UG, NTPC CBT-II, SSC CGL, SSC CHSL, RRB ALP, IBPS PO, SSC MTS — free answer key calculator
            for all exams. Exact score with negative marking, live rank, percentile &amp; score card download.
          </p>

          {/* Active exams */}
          {activeExams.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <h2 className="text-sm font-bold text-green-400 uppercase tracking-wider">Live Now</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                {activeExams.map((exam, i) => (
                  <motion.div
                    key={exam.slug}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link href={`/exams/${exam.slug}`} className="block group">
                      <div className={`bg-gradient-to-br ${exam.color} border ${exam.border} rounded-2xl p-5 hover:border-indigo-600/50 transition-all hover:shadow-lg hover:shadow-indigo-900/20 cursor-pointer`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-2xl">{exam.icon}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${exam.badgeColor}`}>
                                {exam.badge}
                              </span>
                            </div>
                            <h2 className="font-black text-lg text-gray-200 mb-0.5 group-hover:text-indigo-400 transition">
                              {exam.name}{' '}
                              <span className="text-xs font-normal text-gray-500">{exam.year}</span>
                            </h2>
                            <p className="text-xs text-gray-500 mb-2">{exam.fullName}</p>
                            <p className="text-sm text-gray-400 leading-relaxed">{exam.descCard}</p>
                            <div className="mt-3 flex items-center gap-1 text-xs text-indigo-400 font-medium">
                              Check Answer Key &amp; Rank <FaArrowRight className="text-xs group-hover:translate-x-1 transition" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Coming Soon exams */}
          {upcomingExams.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-gray-600" />
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Coming Soon</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {upcomingExams.map((exam, i) => (
                  <motion.div
                    key={exam.slug}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 + 0.2 }}
                  >
                    <div className={`bg-gradient-to-br ${exam.color} border ${exam.border} rounded-2xl p-5 opacity-60`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{exam.icon}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${exam.badgeColor}`}>
                              {exam.badge}
                            </span>
                          </div>
                          <h2 className="font-black text-lg text-gray-400 mb-0.5">
                            {exam.name}{' '}
                            <span className="text-xs font-normal text-gray-600">{exam.year}</span>
                          </h2>
                          <p className="text-xs text-gray-600 mb-2">{exam.fullName}</p>
                          <p className="text-sm text-gray-500 leading-relaxed">{exam.descCard}</p>
                          <div className="mt-3 flex items-center gap-1 text-xs text-gray-600 font-medium">
                            <FaLock className="text-xs" /> Available soon
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-10 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-lg font-black gradient-text">⚡ RankVeda</span>
            <div className="flex items-center gap-6 text-xs text-gray-600">
              <Link href="/" className="hover:text-gray-400 transition">Home</Link>
              <Link href="/marketplace" className="hover:text-gray-400 transition">Question Bank</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}