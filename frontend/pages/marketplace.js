import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLock, FaUnlock, FaSearch, FaCoins, FaBookOpen,
  FaCalendar, FaFilter, FaCheck, FaTimes, FaShoppingCart, FaUser
} from 'react-icons/fa';

const API = 'http://localhost:5000';

function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('rv_token');
      const u = localStorage.getItem('rv_user');
      if (t) setToken(t);
      if (u) try { setUser(JSON.parse(u)); } catch {}
    }
  }, []);
  return { user, token };
}

export default function Marketplace() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qLoading, setQLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [buyModal, setBuyModal] = useState(null);
  const [buying, setBuying] = useState(false);
  const [buyMsg, setBuyMsg] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchExams(); }, [user]);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/marketplace/exams`, { headers: authHeaders });
      const data = await res.json();
      setExams(Array.isArray(data.exams) ? data.exams : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openExam = async (exam) => {
    setSelectedExam(exam);
    setPage(1);
    setSearch('');
    loadQuestions(exam.id, 1, '');
  };

  const loadQuestions = async (examId, pg, sq) => {
    setQLoading(true);
    try {
      let url = `${API}/api/marketplace/exams/${examId}/questions?page=${pg}&per_page=20`;
      if (sq) url += `&search=${encodeURIComponent(sq)}`;
      const res = await fetch(url, { headers: authHeaders });
      const data = await res.json();
      setQuestions(Array.isArray(data.questions) ? data.questions : []);
      setTotalPages(data.pages || 1);
      setSelectedExam(prev => ({ ...prev, is_purchased: data.is_purchased }));
    } catch (e) { console.error(e); }
    finally { setQLoading(false); }
  };

  const buyExam = async (exam) => {
    if (!user) {
      router.push(`/login?redirect=/marketplace`);
      return;
    }
    setBuyModal(exam);
    setBuyMsg('');
  };

  const confirmBuy = async () => {
    setBuying(true);
    setBuyMsg('');
    try {
      const res = await fetch(`${API}/api/marketplace/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ exam_id: buyModal.id }),
      });
      const data = await res.json();
      if (data.success) {
        setBuyMsg('✅ ' + data.message);
        // Update local user balance
        const u = JSON.parse(localStorage.getItem('rv_user') || '{}');
        u.balance = data.new_balance;
        localStorage.setItem('rv_user', JSON.stringify(u));
        fetchExams();
        setTimeout(() => {
          setBuyModal(null);
          openExam({ ...buyModal, is_purchased: true });
        }, 1500);
      } else {
        setBuyMsg('❌ ' + (data.error || 'Purchase failed'));
      }
    } catch (e) { setBuyMsg('❌ Network error'); }
    finally { setBuying(false); }
  };

  const OPTION_LABELS = ['A', 'B', 'C', 'D'];
  const OPTION_COLORS = { A: '#60a5fa', B: '#c084fc', C: '#fbbf24', D: '#f87171' };

  // ── Question Detail View ─────────────────────────────────────────────────
  if (selectedExam) {
    return (
      <>
        <Head>
          <title>{selectedExam.name} — Question Bank | RankVeda</title>
        </Head>
        <div className="min-h-screen bg-gray-950 text-white">
          <NavBar user={user} />
          <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setSelectedExam(null)}
                className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
                ← वापस
              </button>
              <div>
                <h1 className="text-2xl font-bold">{selectedExam.name}</h1>
                <p className="text-gray-400 text-sm mt-0.5">{selectedExam.total_questions} प्रश्न · {selectedExam.shifts} Shifts</p>
              </div>
              {!selectedExam.is_purchased && (
                <button onClick={() => buyExam(selectedExam)}
                  className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold text-sm">
                  <FaShoppingCart /> Unlock करें — {selectedExam.price} Points
                </button>
              )}
              {selectedExam.is_purchased && (
                <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-green-900/40 border border-green-700 text-green-400 text-sm font-medium">
                  <FaUnlock /> Purchased ✅
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <FaSearch className="absolute left-4 top-3.5 text-gray-500" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); loadQuestions(selectedExam.id, 1, e.target.value); }}
                placeholder="प्रश्न में खोजें..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Questions List */}
            {qLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, i) => (
                  <motion.div key={q.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-indigo-800 transition">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="bg-indigo-900/50 text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 mt-0.5">
                        Q{i + 1 + (page - 1) * 20}
                      </span>
                      <p className="text-gray-200 leading-relaxed text-sm flex-1">{q.question_text}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {['a', 'b', 'c', 'd'].map((opt, idx) => {
                        const label = OPTION_LABELS[idx];
                        const text = q[`option_${opt}_text`];
                        const isCorrect = !q.is_locked && q.correct_answer === label;
                        const isLocked = q.is_locked;

                        return (
                          <div key={opt} className={`relative px-4 py-2.5 rounded-xl border text-sm flex items-center gap-2 overflow-hidden
                            ${isCorrect ? 'border-green-500 bg-green-900/20 text-green-300' :
                              isLocked ? 'border-gray-700 bg-gray-800/50' : 'border-gray-700 bg-gray-800/40 text-gray-300'}`}>
                            <span style={{ color: OPTION_COLORS[label] }} className="font-bold text-xs shrink-0">{label}.</span>
                            {isLocked ? (
                              <span className="flex items-center gap-1.5 text-gray-600 blur-sm select-none">
                                ••••••••••••••
                              </span>
                            ) : (
                              <span>{text}</span>
                            )}
                            {isCorrect && <FaCheck className="ml-auto text-green-400 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {q.is_locked && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <FaLock /> उत्तर देखने के लिए Unlock करें
                      </div>
                    )}

                    <div className="mt-3 flex gap-2 flex-wrap">
                      {q.shifts?.slice(0, 3).map((s, si) => (
                        <span key={si} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                          {s.test_date} · {s.subject}
                        </span>
                      ))}
                      {q.shift_count > 1 && (
                        <span className="text-xs bg-purple-900/40 text-purple-400 px-2 py-0.5 rounded-full">
                          +{q.shift_count - 1} shifts
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2 flex-wrap">
                <button onClick={() => { setPage(p => Math.max(1, p - 1)); loadQuestions(selectedExam.id, Math.max(1, page - 1), search); }}
                  disabled={page === 1} className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-sm">‹</button>
                {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => { setPage(p); loadQuestions(selectedExam.id, p, search); }}
                    className={`px-3 py-1.5 rounded-lg text-sm ${page === p ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'}`}>{p}</button>
                ))}
                <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); loadQuestions(selectedExam.id, Math.min(totalPages, page + 1), search); }}
                  disabled={page === totalPages} className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-sm">›</button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── Exam List View ────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Question Bank Marketplace — RankVeda</title>
        <meta name="description" content="सभी competitive exams का Question Bank। RRB NTPC, SSC, Banking — सभी shifts के questions एक जगह।" />
      </Head>

      <div className="min-h-screen bg-gray-950 text-white">
        <NavBar user={user} />

        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-transparent" />
          <div className="max-w-5xl mx-auto px-4 py-16 text-center relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-2 bg-indigo-900/40 border border-indigo-700/50 text-indigo-400 text-sm px-4 py-1.5 rounded-full mb-4">
                <FaBookOpen className="text-xs" /> Premium Question Bank
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Exam Question Bank{' '}
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Marketplace
                </span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                सभी shifts के questions, correct answers और AI solutions — एक जगह।
                Points खर्च करें, unlimited access पाएं।
              </p>
            </motion.div>
          </div>
        </div>

        {/* Exam Cards */}
        <div className="max-w-5xl mx-auto px-4 pb-16">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <FaBookOpen className="text-5xl mx-auto mb-4 opacity-30" />
              <p>अभी कोई exam available नहीं है। जल्द आ रहा है!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exams.map((exam, i) => (
                <motion.div key={exam.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-700 transition group">
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold group-hover:text-indigo-300 transition">{exam.name}</h2>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                          <span className="flex items-center gap-1"><FaCalendar className="text-xs" /> {exam.date}</span>
                          <span>·</span>
                          <span>{exam.shifts || 1} Shifts</span>
                        </div>
                      </div>
                      {exam.purchased ? (
                        <span className="flex items-center gap-1 bg-green-900/40 border border-green-700/50 text-green-400 text-xs px-3 py-1.5 rounded-full shrink-0 font-medium">
                          <FaUnlock className="text-xs" /> Purchased
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-amber-900/30 border border-amber-700/40 text-amber-400 text-xs px-3 py-1.5 rounded-full shrink-0 font-semibold">
                          <FaCoins className="text-xs" /> {exam.price} pts
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[
                        { label: 'Questions', value: exam.total_questions || '—' },
                        { label: 'Subjects', value: exam.subjects?.length || '—' },
                        { label: 'Shifts', value: exam.shifts || 1 },
                      ].map(s => (
                        <div key={s.label} className="bg-gray-800/60 rounded-xl px-3 py-2 text-center">
                          <div className="text-lg font-bold text-white">{s.value}</div>
                          <div className="text-xs text-gray-500">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Subjects */}
                    {exam.subjects && exam.subjects.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {exam.subjects.slice(0, 4).map(s => (
                          <span key={s} className="text-xs bg-indigo-900/30 text-indigo-400 border border-indigo-800/50 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-5 flex gap-3">
                    <button onClick={() => openExam(exam)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-700 hover:border-indigo-600 text-sm font-medium text-gray-300 hover:text-indigo-300 transition">
                      Questions देखें
                    </button>
                    {!exam.purchased ? (
                      <button onClick={() => buyExam(exam)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition">
                        <FaShoppingCart className="text-xs" /> Unlock करें
                      </button>
                    ) : (
                      <button onClick={() => openExam(exam)}
                        className="flex-1 py-2.5 rounded-xl bg-green-800/40 border border-green-700 text-green-400 font-semibold text-sm flex items-center justify-center gap-2">
                        <FaUnlock className="text-xs" /> Full Access
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Buy Modal */}
      <AnimatePresence>
        {buyModal && (
          <motion.div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-xl font-bold mb-2">🛒 Confirm Purchase</h3>
              <p className="text-gray-400 text-sm mb-4">{buyModal.name} का Question Bank unlock करें।</p>
              <div className="bg-gray-800 rounded-xl p-4 mb-5 flex justify-between items-center">
                <span className="text-gray-300">कीमत</span>
                <span className="text-amber-400 font-bold text-lg flex items-center gap-1">
                  <FaCoins /> {buyModal.price} Points
                </span>
              </div>
              {buyMsg && (
                <div className={`mb-4 text-sm px-4 py-3 rounded-xl ${buyMsg.startsWith('✅') ? 'bg-green-900/40 text-green-300 border border-green-700' : 'bg-red-900/40 text-red-300 border border-red-700'}`}>
                  {buyMsg}
                </div>
              )}
              {!buyMsg.startsWith('✅') && (
                <div className="flex gap-3">
                  <button onClick={() => setBuyModal(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:border-gray-600 text-sm">
                    Cancel
                  </button>
                  <button onClick={confirmBuy} disabled={buying}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {buying ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : '✅ Confirm'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavBar({ user }) {
  const router = useRouter();
  const logout = () => {
    localStorage.removeItem('rv_token');
    localStorage.removeItem('rv_user');
    router.push('/');
  };
  return (
    <nav className="border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          RankVeda
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/marketplace" className="text-sm text-indigo-400 font-medium">🏪 Marketplace</Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs bg-amber-900/40 border border-amber-700/50 text-amber-400 px-3 py-1.5 rounded-full flex items-center gap-1">
                <FaCoins className="text-xs" /> {user.balance || 0}
              </span>
              <button onClick={logout} className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-600">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-lg font-medium transition">
              <FaUser className="text-xs" /> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
