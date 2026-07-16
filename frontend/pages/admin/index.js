import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaTachometerAlt, FaUsers, FaBook, FaClipboardList, FaQuestionCircle, FaMoneyBillWave, FaSignOutAlt, FaBars, FaTimes, FaBox, FaDatabase } from 'react-icons/fa';

const ADMIN_PASS = "admin123";

export default function AdminLayout() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASS) {
      sessionStorage.setItem('admin_auth', 'true');
      setAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative bg-gray-900/80 backdrop-blur-xl p-7 rounded-2xl w-full max-w-sm border border-gray-800/80 shadow-2xl shadow-indigo-500/5"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/20">
              <FaShieldAlt className="text-xl text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Admin Panel</h1>
            <p className="text-gray-500 text-xs mt-0.5">RankVeda Administration</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-400">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-gray-800/60 border border-gray-700/60 text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-gray-800 transition-all outline-none"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
            </div>

            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={error ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {error && (
                <div className="flex items-center gap-2 bg-red-900/30 border border-red-800/40 rounded-lg px-3 py-2">
                  <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  <p className="text-red-300 text-xs">{error}</p>
                </div>
              )}
            </motion.div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                Sign In
              </span>
            </button>
          </form>

          <p className="text-center text-gray-600 text-[10px] mt-5">Protected area &bull; Authorized access only</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-gray-900 border border-gray-800"
      >
        {sidebarOpen ? <FaTimes size={14} /> : <FaBars size={14} />}
      </button>

      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-40 w-56 h-full bg-gray-900 border-r border-gray-800 transition-transform duration-300`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-lg text-indigo-500" />
            <div>
              <h2 className="font-bold text-sm">RankVeda</h2>
              <p className="text-[10px] text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="p-2 space-y-1">
          {[
            { id: 'dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
            { id: 'users', icon: FaUsers, label: 'Users' },
            { id: 'exams', icon: FaBook, label: 'Exams' },
            { id: 'packs', icon: FaBox, label: 'Packs' },
            { id: 'results', icon: FaClipboardList, label: 'Results' },
            { id: 'questions', icon: FaQuestionCircle, label: 'Questions' },
            { id: 'parsed', icon: FaDatabase, label: 'Parsed Data' },
            { id: 'transactions', icon: FaMoneyBillWave, label: 'Transactions' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition ${activeTab === item.id
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                }`}
            >
              <item.icon size={14} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-2 border-t border-gray-800">
          <button
            onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthenticated(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-gray-800 transition"
          >
            <FaSignOutAlt size={14} /> Logout
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-5">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'users' && <Users />}
          {activeTab === 'exams' && <Exams />}
          {activeTab === 'packs' && <Packs />}
          {activeTab === 'results' && <Results />}
          {activeTab === 'questions' && <Questions />}
          {activeTab === 'parsed' && <ParsedData />}
          {activeTab === 'transactions' && <Transactions />}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/dashboard');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', value: stats?.total_users || 0, color: 'from-blue-600 to-blue-700' },
    { label: 'Total Exams', value: stats?.total_exams || 0, color: 'from-purple-600 to-purple-700' },
    { label: 'Total Results', value: stats?.total_results || 0, color: 'from-emerald-600 to-emerald-700' },
    { label: 'Total Questions', value: stats?.total_questions || 0, color: 'from-pink-600 to-pink-700' },
    { label: 'AI Solutions', value: stats?.total_solutions || 0, color: 'from-amber-600 to-amber-700' },
    { label: "Today's Results", value: stats?.today_results || 0, color: 'from-cyan-600 to-cyan-700' },
    { label: "Today's Users", value: stats?.today_users || 0, color: 'from-teal-600 to-teal-700' },
  ];

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-gradient-to-br ${card.color} rounded-lg p-4 shadow-lg`}
          >
            <p className="text-xs opacity-80">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 bg-gray-900 rounded-lg p-4">
        <h2 className="text-sm font-semibold mb-3">Points Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Total Earned</p>
            <p className="text-xl font-bold text-green-400">{stats?.total_points_earned || 0}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Total Spent</p>
            <p className="text-xl font-bold text-red-400">{stats?.total_points_spent || 0}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Net Balance</p>
            <p className="text-xl font-bold text-indigo-400">{(stats?.total_points_earned || 0) - (stats?.total_points_spent || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Packs() {
  const [packs, setPacks] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '0', exam_ids: [] });
  const [editingPackId, setEditingPackId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [packsRes, examsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/packs'),
        fetch('http://localhost:5000/api/admin/exams'),
      ]);
      const packsData = await packsRes.json();
      const examsData = await examsRes.json();
      setPacks(Array.isArray(packsData.packs) ? packsData.packs : []);
      setExams(Array.isArray(examsData.exams) ? examsData.exams : []);
    } catch (e) {
      console.error(e);
      setError('Failed to load packs');
    } finally {
      setLoading(false);
    }
  };

  const toggleExam = (examId) => {
    setForm(prev => {
      const exists = prev.exam_ids.some(item => 
        typeof item === 'object' ? item.exam_id === examId : item === examId
      );
      if (exists) {
        return {
          ...prev,
          exam_ids: prev.exam_ids.filter(item => 
            typeof item === 'object' ? item.exam_id !== examId : item !== examId
          )
        };
      } else {
        return {
          ...prev,
          exam_ids: [...prev.exam_ids, { exam_id: examId, include_questions: true, include_results: true }]
        };
      }
    });
  };

  const updateExamConfig = (examId, key, value) => {
    setForm(prev => ({
      ...prev,
      exam_ids: prev.exam_ids.map(item => {
        const isTarget = typeof item === 'object' ? item.exam_id === examId : item === examId;
        if (isTarget) {
          const itemObj = typeof item === 'object' ? item : { exam_id: examId, include_questions: true, include_results: true };
          return { ...itemObj, [key]: value };
        }
        return item;
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      const url = editingPackId 
        ? `http://localhost:5000/api/admin/packs/${editingPackId}` 
        : 'http://localhost:5000/api/admin/packs';
      const method = editingPackId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price || 0),
          exam_ids: form.exam_ids,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(editingPackId ? 'Pack updated successfully' : 'Pack created successfully');
        setForm({ name: '', description: '', price: '0', exam_ids: [] });
        setEditingPackId(null);
        fetchData();
      } else {
        setError(data.error || 'Failed to save pack');
      }
    } catch (e) {
      setError('Network error while saving pack');
    } finally {
      setSubmitting(false);
    }
  };

  const editPack = (pack) => {
    setEditingPackId(pack.id);
    setForm({
      name: pack.name || '',
      description: pack.description || '',
      price: (pack.price || 0).toString(),
      exam_ids: pack.exam_ids || []
    });
  };

  const cancelEdit = () => {
    setEditingPackId(null);
    setForm({ name: '', description: '', price: '0', exam_ids: [] });
    setMessage('');
    setError('');
  };

  const handleDelete = async (packId) => {
    if (!confirm('Are you sure you want to delete this pack?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/packs/${packId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        setError(data.error || 'Failed to delete pack');
      }
    } catch (e) {
      setError('Failed to delete pack');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold">Question Packs</h1>
          <p className="text-gray-500 text-xs mt-0.5">Bundle multiple exams into marketplace offers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <form onSubmit={handleSubmit} className="xl:col-span-2 bg-gray-900 rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold">{editingPackId ? 'Edit Pack' : 'Create New Pack'}</h2>
          {message && <div className="rounded-lg bg-emerald-900/40 border border-emerald-700 px-3 py-1.5 text-xs text-emerald-300">{message}</div>}
          {error && <div className="rounded-lg bg-red-900/40 border border-red-700 px-3 py-1.5 text-xs text-red-300">{error}</div>}

          <div>
            <label className="block text-xs text-gray-400 mb-1">Pack Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
              placeholder="e.g. RRB NTPC Mega Pack"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
              rows="2"
              placeholder="Bundle details"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Pack Price (INR)</label>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Select Exams & Configure Access</label>
            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-auto p-2 rounded-lg bg-gray-950/60">
              {exams.map((exam) => {
                const selectedConfig = form.exam_ids.find(item => 
                  typeof item === 'object' ? item.exam_id === exam.id : item === exam.id
                );
                const isChecked = !!selectedConfig;
                
                return (
                  <div key={exam.id} className="border border-gray-800 rounded-lg p-2.5 bg-gray-900/40 flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleExam(exam.id)}
                        className="w-3.5 h-3.5 text-indigo-600 bg-gray-800 border-gray-700 rounded focus:ring-indigo-500"
                      />
                      <span>{exam.name}</span>
                    </label>
                    
                    {isChecked && (
                      <div className="flex gap-4 pl-5 text-[10px] text-gray-400">
                        <label className="flex items-center gap-1.5 cursor-pointer hover:text-gray-300">
                          <input
                            type="checkbox"
                            checked={typeof selectedConfig === 'object' ? selectedConfig.include_questions !== false : true}
                            onChange={(e) => updateExamConfig(exam.id, 'include_questions', e.target.checked)}
                            className="w-3 h-3 text-indigo-600 bg-gray-850 border-gray-750 rounded"
                          />
                          <span>Include Questions</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer hover:text-gray-300">
                          <input
                            type="checkbox"
                            checked={typeof selectedConfig === 'object' ? selectedConfig.include_results !== false : true}
                            onChange={(e) => updateExamConfig(exam.id, 'include_results', e.target.checked)}
                            className="w-3 h-3 text-indigo-600 bg-gray-850 border-gray-750 rounded"
                          />
                          <span>Include Results/Analysis</span>
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs disabled:opacity-60"
            >
              {submitting ? 'Saving...' : editingPackId ? 'Update Pack' : 'Create Pack'}
            </button>
            {editingPackId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold text-xs"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="bg-gray-900 rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-3">Existing Packs</h2>
          {loading ? (
            <div className="text-xs text-gray-500">Loading...</div>
          ) : packs.length === 0 ? (
            <div className="text-xs text-gray-500">No packs created yet.</div>
          ) : (
            <div className="space-y-2">
              {packs.map((pack) => (
                <div key={pack.id} className="rounded-lg border border-gray-800 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white text-xs truncate">{pack.name}</h3>
                      <p className="text-[10px] text-gray-500 mt-0.5 truncate">{pack.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => editPack(pack)} className="text-[10px] text-indigo-400 hover:text-indigo-300">Edit</button>
                      <button onClick={() => handleDelete(pack.id)} className="text-[10px] text-red-400 hover:text-red-300">Delete</button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
                    <span>{(pack.exam_ids || []).length} exams</span>
                    <span className="text-green-400 font-medium">₹{pack.price || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [adjustModal, setAdjustModal] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [perPage, setPerPage] = useState(20);
  const [bulkSelected, setBulkSelected] = useState([]);

  // Add/Edit states
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', points: 0 });
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchUsers();
  }, [page, perPage, search, sortBy, dateFrom, dateTo]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/admin/users?page=${page}&per_page=${perPage}&search=${search}&sort_by=${sortBy}`;
      if (dateFrom) url += `&date_from=${dateFrom}`;
      if (dateTo) url += `&date_to=${dateTo}`;
      const res = await fetch(url);
      const data = await res.json();
      setUsers(data.users);
      setTotalPages(data.pages);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAdd(false);
        setNewUser({ name: '', email: '', password: '', points: 0 });
        fetchUsers();
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const startEditUser = (u) => {
    setEditingUserId(u.id);
    setEditForm({
      name: u.name || '',
      email: u.email || '',
      password: ''
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditingUserId(null);
        fetchUsers();
        if (selectedUser && selectedUser.user?.id === editingUserId) {
          fetchUserDetail(editingUserId);
        }
      } else {
        alert(data.error || 'Failed to update user');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? All their results and points balance will be deleted.')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchUsers();
        if (selectedUser && selectedUser.user?.id === userId) {
          setSelectedUser(null);
        }
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const runBulkDeleteUsers = async () => {
    if (bulkSelected.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${bulkSelected.length} users and all their data (Points, Results, Transactions)?`)) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: bulkSelected }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`${data.deleted} Users deleted`);
        setBulkSelected([]);
        if (page === 1) {
          fetchUsers();
        } else {
          setPage(1);
        }
      } else {
        alert('Error: ' + (data.error || ''));
      }
    } catch (e) { alert('Delete failed'); }
  };

  const fetchUserDetail = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`);
      const data = await res.json();
      setSelectedUser(data);
    } catch (e) {
      console.error(e);
    }
  };

  const adjustPoints = async (userId, amount, description) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description, type: amount > 0 ? 'earn' : 'spend' })
      });
      const data = await res.json();
      if (data.success) {
        fetchUserDetail(userId);
        setAdjustModal(null);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-lg font-bold">Users</h1>
          <p className="text-xs text-gray-500 mt-0.5">{total} total users registered</p>
        </div>
        <div className="flex items-center gap-2">
          {bulkSelected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-400">{bulkSelected.length} selected</span>
              <button onClick={runBulkDeleteUsers} className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs transition">
                Bulk Delete
              </button>
              <button onClick={() => setBulkSelected([])} className="bg-gray-700 hover:bg-gray-600 text-white px-2.5 py-1 rounded text-xs transition">
                Clear
              </button>
            </div>
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
          >
            + New User
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-1 md:grid-cols-4 gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by email or name..."
          className="col-span-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
          className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none">
          <option value="created_at">Latest</option>
          <option value="balance">Points Balance</option>
        </select>
        <div className="flex gap-1.5">
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            className="flex-1 px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none" />
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
            className="flex-1 px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none" />
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleCreateUser} className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-800 space-y-3">
          <h3 className="font-semibold text-sm text-indigo-400">Create New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(ev) => setNewUser({ ...newUser, name: ev.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-gray-850 border border-gray-700 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(ev) => setNewUser({ ...newUser, email: ev.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-gray-850 border border-gray-700 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(ev) => setNewUser({ ...newUser, password: ev.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-gray-850 border border-gray-700 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Initial Points</label>
              <input
                type="number"
                value={newUser.points}
                onChange={(ev) => setNewUser({ ...newUser, points: parseInt(ev.target.value) || 0 })}
                className="w-full px-3 py-1.5 rounded-lg bg-gray-850 border border-gray-700 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition">
              Create User
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {editingUserId && (
        <form onSubmit={handleUpdateUser} className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-800 space-y-3">
          <h3 className="font-semibold text-sm text-indigo-400">Edit User Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(ev) => setEditForm({ ...editForm, name: ev.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-gray-850 border border-gray-700 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(ev) => setEditForm({ ...editForm, email: ev.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-gray-850 border border-gray-700 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">New Password (leave blank to keep current)</label>
              <input
                type="password"
                value={editForm.password}
                onChange={(ev) => setEditForm({ ...editForm, password: ev.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-gray-850 border border-gray-700 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition">
              Save Changes
            </button>
            <button type="button" onClick={() => setEditingUserId(null)} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {selectedUser ? (
        <UserDetail user={selectedUser} onBack={() => setSelectedUser(null)} onAdjustPoints={(u) => setAdjustModal(u)} />
      ) : (
        <>
          <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="p-2.5 text-left w-8">
                    <input type="checkbox" onChange={e => {
                      if (e.target.checked) {
                        setBulkSelected(prev => [...new Set([...prev, ...users.map(u => u.id)])]);
                      } else {
                        const userIds = users.map(u => u.id);
                        setBulkSelected(prev => prev.filter(id => !userIds.includes(id)));
                      }
                    }}
                    checked={users.length > 0 && users.every(u => bulkSelected.includes(u.id))} className="w-3 h-3" />
                  </th>
                  <th className="p-2.5 text-left font-medium text-gray-500">ID</th>
                  <th className="p-2.5 text-left font-medium text-gray-500">Name</th>
                  <th className="p-2.5 text-left font-medium text-gray-500">Email</th>
                  <th className="p-2.5 text-left font-medium text-gray-500">Points</th>
                  <th className="p-2.5 text-left font-medium text-gray-500">Results</th>
                  <th className="p-2.5 text-left font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-gray-500">No users found.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                      <td className="p-2.5">
                        <input type="checkbox" checked={bulkSelected.includes(u.id)}
                          onChange={e => setBulkSelected(prev => e.target.checked ? [...prev, u.id] : prev.filter(x => x !== u.id))}
                          className="w-3 h-3" />
                      </td>
                      <td className="p-2.5 text-gray-400">{u.id}</td>
                      <td className="p-2.5 font-medium text-white">{u.name || '—'}</td>
                      <td className="p-2.5 text-gray-500">{u.email || '—'}</td>
                      <td className="p-2.5 text-yellow-400 font-bold">{u.points_balance}</td>
                      <td className="p-2.5 text-gray-400">{u.results_count}</td>
                      <td className="p-2.5 flex items-center gap-3">
                        <button
                          onClick={() => fetchUserDetail(u.id)}
                          className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold"
                        >
                          View
                        </button>
                        <button
                          onClick={() => startEditUser(u)}
                          className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex justify-between items-center bg-gray-900 p-2.5 rounded-lg border border-gray-800">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Rows:</span>
              <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} className="bg-gray-800 text-white rounded px-2 py-0.5 text-xs">
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-2.5 py-0.5 rounded text-xs ${page === p ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {adjustModal && (
        <PointsAdjustModal
          user={adjustModal}
          onClose={() => setAdjustModal(null)}
          onSave={adjustPoints}
        />
      )}
    </div>
  );
}

function UserDetail({ user, onBack, onAdjustPoints }) {
  return (
    <div>
      <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 mb-3 flex items-center gap-1.5 text-xs">
        ← Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h2 className="text-sm font-bold mb-3">User Info</h2>
          <div className="space-y-1.5 text-xs">
            <p><span className="text-gray-500">ID:</span> {user.user?.id}</p>
            <p><span className="text-gray-500">Name:</span> {user.user?.name || '—'}</p>
            <p><span className="text-gray-500">Email:</span> {user.user?.email}</p>
            <p><span className="text-gray-500">Joined:</span> {user.user?.created_at ? new Date(user.user.created_at).toLocaleDateString() : '—'}</p>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-800">
            <p className="text-2xl font-bold text-yellow-400">{user.points?.balance || 0}</p>
            <p className="text-xs text-gray-500">Points Balance</p>
            <div className="flex gap-3 mt-1.5 text-xs">
              <span className="text-green-400">Earned: {user.points?.total_earned || 0}</span>
              <span className="text-red-400">Spent: {user.points?.total_spent || 0}</span>
            </div>
            <button
              onClick={() => onAdjustPoints(user)}
              className="mt-3 w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
            >
              Adjust Points
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h2 className="text-sm font-bold mb-3">Recent Transactions</h2>
          {user.transactions?.length === 0 ? (
            <p className="text-gray-500 text-xs">No transactions</p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {user.transactions?.map((t) => (
                <div key={t.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2.5 text-xs">
                  <div>
                    <span className={`font-medium ${t.type === 'earn' || t.type === 'recharge' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.type === 'earn' || t.type === 'recharge' ? '+' : '-'}{t.amount}
                    </span>
                    <p className="text-gray-500 text-[10px]">{t.description}</p>
                  </div>
                  <span className="text-gray-600 text-[10px]">{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h2 className="text-sm font-bold mb-3">User Results</h2>
          {user.results?.length === 0 ? (
            <p className="text-gray-500 text-xs">No results</p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {user.results?.map((r) => (
                <div key={r.id} className="bg-gray-800/50 rounded-lg p-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium">Score: {r.score}</span>
                    <span className="text-indigo-400">Rank #{r.rank}</span>
                  </div>
                  <p className="text-gray-500 text-[10px]">Roll: {r.roll_number} | {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PointsAdjustModal({ user, onClose, onSave }) {
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 p-5 rounded-xl w-full max-w-sm border border-gray-800" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-bold mb-3">Adjust Points</h3>
        <p className="text-xs text-gray-400 mb-3">
          User: {user.user?.name || user.user?.email} (ID: {user.user?.id})
          <br />Current Balance: {user.points?.balance || 0}
        </p>
        <div className="space-y-2.5">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Amount (Points)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
              placeholder="Positive = add, negative = subtract"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Reason</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
              placeholder="e.g. Bonus, refund, penalty..."
            />
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs">
              Cancel
            </button>
            <button
              onClick={() => onSave(user.user.id, amount, description)}
              className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Exams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkSelected, setBulkSelected] = useState([]);
  const [editingExamId, setEditingExamId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', date: '', total_questions: 100, price: 0, description: '', disclaimer: '' });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/exams');
      const data = await res.json();
      setExams(data.exams);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runBulkDeleteExams = async () => {
    if (bulkSelected.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${bulkSelected.length} exams? All related results will also be deleted.`)) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/exams/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: bulkSelected }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`${data.deleted} Exams deleted`);
        setBulkSelected([]);
        fetchExams();
      } else {
        alert('Error: ' + (data.error || ''));
      }
    } catch (e) { alert('Delete failed'); }
  };

  const editExam = (e) => {
    setEditingExamId(e.id);
    setEditForm({
      name: e.name || '',
      date: e.date ? e.date.substring(0, 10) : '',
      total_questions: e.total_questions || 100,
      price: e.price || 0,
      description: e.description || '',
      disclaimer: e.disclaimer || ''
    });
  };

  const saveExamEdit = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/admin/exams/${editingExamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          date: editForm.date || null,
          total_questions: Number(editForm.total_questions || 100),
          price: Number(editForm.price || 0),
          description: editForm.description,
          disclaimer: editForm.disclaimer
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingExamId(null);
        fetchExams();
      } else {
        alert('Error updating exam: ' + (data.error || ''));
      }
    } catch (e) {
      alert('Update failed');
    }
  };

  const cancelExamEdit = () => {
    setEditingExamId(null);
    setEditForm({ name: '', date: '', total_questions: 100, price: 0, description: '', disclaimer: '' });
  };

  const deleteExam = async (id) => {
    if (!confirm('Are you sure you want to delete this exam? All related results will also be deleted.')) return;
    try {
      await fetch(`http://localhost:5000/api/admin/exams/${id}`, { method: 'DELETE' });
      fetchExams();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-lg font-bold">Exams</h1>
          <p className="text-xs text-gray-500 mt-0.5">Edit price, disclaimer, or details of preloaded exams</p>
        </div>
        <div className="flex items-center gap-2">
          {bulkSelected.length > 0 && (
            <>
              <span className="text-xs text-indigo-400">{bulkSelected.length} selected</span>
              <button onClick={runBulkDeleteExams} className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs transition">
                Bulk Delete
              </button>
              <button onClick={() => setBulkSelected([])} className="bg-gray-700 hover:bg-gray-600 text-white px-2.5 py-1 rounded text-xs transition">
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {editingExamId && (
        <form onSubmit={saveExamEdit} className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-800 space-y-3">
          <h3 className="font-semibold text-sm text-indigo-400">Edit Exam Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Exam Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(ev) => setEditForm({ ...editForm, name: ev.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date</label>
              <input
                type="date"
                value={editForm.date}
                onChange={(ev) => setEditForm({ ...editForm, date: ev.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Total Questions</label>
              <input
                type="number"
                value={editForm.total_questions}
                onChange={(ev) => setEditForm({ ...editForm, total_questions: parseInt(ev.target.value) || 100 })}
                className="w-full px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Price (INR)</label>
              <input
                type="number"
                value={editForm.price}
                onChange={(ev) => setEditForm({ ...editForm, price: parseInt(ev.target.value) || 0 })}
                className="w-full px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Marketplace Description</label>
            <textarea
              value={editForm.description}
              onChange={(ev) => setEditForm({ ...editForm, description: ev.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              rows="2"
              placeholder="Enter exam description for the marketplace card..."
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Legal Disclaimer override</label>
            <textarea
              value={editForm.disclaimer}
              onChange={(ev) => setEditForm({ ...editForm, disclaimer: ev.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              rows="2"
              placeholder="Enter per-exam disclaimer notice..."
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition">
              Save Changes
            </button>
            <button type="button" onClick={cancelExamEdit} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-800/50">
              <th className="p-2.5 text-left w-10">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) setBulkSelected(exams.map(ex => ex.id));
                    else setBulkSelected([]);
                  }}
                  checked={exams.length > 0 && bulkSelected.length === exams.length}
                  className="w-3 h-3"
                />
              </th>
              <th className="p-2.5 text-left font-medium text-gray-500">ID</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Name</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Date</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Questions</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Price (INR)</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Results</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="py-10 text-center text-gray-500">Loading exams...</td>
              </tr>
            ) : exams.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-10 text-center text-gray-500">No exams preloaded yet.</td>
              </tr>
            ) : (
              exams.map((e) => (
                <tr key={e.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="p-2.5">
                    <input
                      type="checkbox"
                      checked={bulkSelected.includes(e.id)}
                      onChange={() => {
                        setBulkSelected(prev => prev.includes(e.id) ? prev.filter(x => x !== e.id) : [...prev, e.id]);
                      }}
                      className="w-3 h-3"
                    />
                  </td>
                  <td className="p-2.5 text-gray-400">{e.id}</td>
                  <td className="p-2.5 font-medium text-white">{e.name}</td>
                  <td className="p-2.5 text-gray-500">{e.date ? new Date(e.date).toLocaleDateString() : '—'}</td>
                  <td className="p-2.5">{e.total_questions}</td>
                  <td className="p-2.5 font-semibold text-green-400">₹{e.price || 0}</td>
                  <td className="p-2.5 text-gray-400">{e.results_count}</td>
                  <td className="p-2.5">
                    <button onClick={() => editExam(e)} className="text-indigo-400 hover:text-indigo-300 text-xs mr-3 font-medium">
                      Edit
                    </button>
                    <button onClick={() => deleteExam(e.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedResult, setSelectedResult] = useState(null);
  const [bulkSelected, setBulkSelected] = useState([]);
  const [exams, setExams] = useState([]);

  // Advanced Filters State
  const [filters, setFilters] = useState({
    exam_id: '',
    category: '',
    shift_date: '',
    shift_time: '',
    subject: '',
    min_score: '',
    max_score: ''
  });

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [page, search, filters]);

  const fetchExams = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/exams');
      const data = await res.json();
      setExams(data.exams || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchResults = async (pageNumber = page, isDownload = false) => {
    if (!isDownload) setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageNumber,
        per_page: isDownload ? 10000 : 20,
        search,
        ...filters
      });
      if (isDownload) {
        queryParams.set('download', 'all');
      }

      const res = await fetch(`http://localhost:5000/api/admin/results?${queryParams.toString()}`);
      const data = await res.json();
      if (isDownload) {
        return data.results;
      } else {
        setResults(data.results || []);
        setTotalPages(data.pages || 1);
        setTotalItems(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!isDownload) setLoading(false);
    }
  };

  const runBulkDeleteResults = async () => {
    if (bulkSelected.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${bulkSelected.length} results?`)) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/results/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: bulkSelected }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`${data.deleted} Results deleted`);
        setBulkSelected([]);
        setPage(1);
        fetchResults(1);
      } else {
        alert('Error: ' + (data.error || ''));
      }
    } catch (e) { alert('Delete failed'); }
  };

  const fetchResultDetail = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/results/${id}`);
      const data = await res.json();
      setSelectedResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteResult = async (id) => {
    if (!confirm('Are you sure you want to delete this result?')) return;
    try {
      await fetch(`http://localhost:5000/api/admin/results/${id}`, { method: 'DELETE' });
      fetchResults();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = async () => {
    const allResults = await fetchResults(1, true);
    if (!allResults || allResults.length === 0) {
      alert('No data to export');
      return;
    }
    const csvHeaders = ['ID', 'Exam', 'Roll Number', 'Registration Number', 'Candidate Name', 'Category', 'Subject', 'Date', 'Time', 'Correct', 'Wrong', 'Unattempted', 'Score', 'Rank', 'Percentile'];
    const csvRows = [csvHeaders.join(',')];
    allResults.forEach(r => {
      csvRows.push([
        r.id,
        `"${r.exam_name || ''}"`,
        `"${r.roll_number || ''}"`,
        `"${r.registration_number || ''}"`,
        `"${r.candidate_name || ''}"`,
        r.category || '',
        `"${r.subject || ''}"`,
        `"${r.test_date || ''}"`,
        `"${r.test_time || ''}"`,
        r.total_correct,
        r.total_wrong,
        r.total_unattempted,
        r.score,
        r.rank,
        r.percentile || ''
      ].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'raw_results_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (selectedResult) {
    const r = selectedResult.result;
    const qs = selectedResult.questions || [];

    const buildSections = (result, questions) => {
      const sw = result?.section_wise;
      if (Array.isArray(sw) && sw.length > 0) return sw;
      if (sw && typeof sw === 'object' && !Array.isArray(sw) && Object.keys(sw).length > 0) {
        return Object.entries(sw).map(([name, marks]) => ({ name, marks, total: null, na: null, right: null, wrong: null }));
      }
      if (!questions?.length) return [];
      const groups = {};
      questions.forEach(q => {
        const sn = q.parsed_payload?.section_name || 'Overall';
        if (!groups[sn]) groups[sn] = { name: sn, total: 0, na: 0, right: 0, wrong: 0, marks: 0 };
        groups[sn].total++;
        if (q.student_answer && q.student_answer === q.correct_answer) { groups[sn].right++; groups[sn].marks = +(groups[sn].marks + 1).toFixed(2); }
        else if (q.student_answer && q.student_answer !== q.correct_answer) { groups[sn].wrong++; groups[sn].marks = +(groups[sn].marks - 1/3).toFixed(2); }
        else groups[sn].na++;
      });
      return Object.values(groups);
    };

    const sections = buildSections(r, qs);

    return (
      <div>
        <button onClick={() => setSelectedResult(null)} className="text-indigo-400 hover:text-indigo-300 mb-3 flex items-center gap-1.5 text-xs">
          ← Back
        </button>

        <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-800">
          <div className="flex items-start gap-4">
            {r.photo_url && (
              <img src={r.photo_url} alt="Photo" className="w-20 h-24 rounded-lg object-cover border border-gray-700" />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
              <div>
                <p className="text-[10px] text-gray-500">Registration Number</p>
                <p className="font-mono text-xs">{r.registration_number || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Roll Number</p>
                <p className="font-mono text-xs">{r.roll_number || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Candidate Name</p>
                <p className="font-medium text-xs">{r.candidate_name || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Community</p>
                <p className="text-xs">{r.community || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Test Centre</p>
                <p className="text-xs">{r.test_centre_name || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Test Date</p>
                <p className="text-xs">{r.test_date || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Test Time</p>
                <p className="text-xs">{r.test_time || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Subject</p>
                <p className="text-xs">{r.subject || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-800">
            <p className="text-[10px] text-gray-500">Score</p>
            <p className="text-xl font-bold text-indigo-400">{r.score}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-800">
            <p className="text-[10px] text-gray-500">Rank</p>
            <p className="text-xl font-bold text-purple-400">#{r.rank}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-800">
            <p className="text-[10px] text-gray-500">Percentile</p>
            <p className="text-xl font-bold text-pink-400">{r.percentile}%</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-800">
            <p className="text-[10px] text-gray-500">Category</p>
            <p className="text-xl font-bold text-amber-400">{r.category}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-emerald-600/10 rounded-lg p-3 text-center border border-emerald-800/30">
            <p className="text-[10px] text-gray-500">Correct</p>
            <p className="text-xl font-bold text-emerald-400">{selectedResult.stats?.correct || r.total_correct}</p>
          </div>
          <div className="bg-red-600/10 rounded-lg p-3 text-center border border-red-800/30">
            <p className="text-[10px] text-gray-500">Wrong</p>
            <p className="text-xl font-bold text-red-400">{selectedResult.stats?.wrong || r.total_wrong}</p>
          </div>
          <div className="bg-gray-600/10 rounded-lg p-3 text-center border border-gray-700/30">
            <p className="text-[10px] text-gray-500">Unattempted</p>
            <p className="text-xl font-bold text-gray-400">{selectedResult.stats?.unattempted || r.total_unattempted}</p>
          </div>
        </div>

        {sections.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-800">
            <h3 className="font-bold text-xs mb-3">Section-wise Score Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="p-2">Section Name</th>
                    <th className="p-2 text-center">Total</th>
                    <th className="p-2 text-center">Unattempted</th>
                    <th className="p-2 text-center">Right</th>
                    <th className="p-2 text-center">Wrong</th>
                    <th className="p-2 text-center">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((sec, i) => (
                    <tr key={i} className="border-t border-gray-800/50">
                      <td className="p-2 text-gray-300">{sec.name}</td>
                      <td className="p-2 text-center text-gray-500">{sec.total ?? '—'}</td>
                      <td className="p-2 text-center text-gray-600">{sec.na ?? '—'}</td>
                      <td className="p-2 text-center text-emerald-400 font-bold">{sec.right ?? '—'}</td>
                      <td className="p-2 text-center text-red-400 font-bold">{sec.wrong ?? '—'}</td>
                      <td className="p-2 text-center text-indigo-400 font-bold">{sec.marks != null ? Number(sec.marks).toFixed(2) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h3 className="font-bold text-xs mb-3">Questions ({qs.length})</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {Array.from(new Set(qs.map(q => q.parsed_payload?.section_name || 'Overall'))).map((sectionName) => {
              const sectionQs = qs.filter(q => (q.parsed_payload?.section_name || 'Overall') === sectionName);
              if (sectionQs.length === 0) return null;
              return (
                <div key={sectionName} className="space-y-1.5">
                  <h4 className="text-indigo-300 font-semibold text-[11px] bg-gray-800/30 p-1.5 rounded-lg">{sectionName}</h4>
                  <div className="space-y-1.5">
                    {sectionQs.map((q) => {
                      const status = q.student_answer === q.correct_answer ? 'correct' : q.student_answer ? 'wrong' : 'unattempted';
                      const statusColor = status === 'correct' ? 'bg-emerald-600/10 border-emerald-600' : status === 'wrong' ? 'bg-red-600/10 border-red-600' : 'bg-gray-600/10 border-gray-600';
                      return (
                        <div key={q.id} className={`${statusColor} border rounded-lg p-2.5 text-xs`}>
                          <div className="flex justify-between">
                            <span className="font-medium">Q{q.question_no}</span>
                            <span className={`font-medium ${status === 'correct' ? 'text-emerald-400' : status === 'wrong' ? 'text-red-400' : 'text-gray-400'}`}>
                              {status === 'correct' ? 'Correct' : status === 'wrong' ? 'Wrong' : 'Unattempted'} | {q.marks_awarded} marks
                            </span>
                          </div>
                          <p className="text-gray-300 mt-1.5 font-medium text-xs" dangerouslySetInnerHTML={{ __html: q.question_text || `Question ${q.question_no}` }}></p>
                          
                          <div className="space-y-1 mt-1.5">
                            {['a', 'b', 'c', 'd'].map(opt => {
                              const optText = q.parsed_payload?.[`option_${opt}_text`];
                              if (!optText) return null;
                              const isOptCorrect = q.parsed_payload?.correct_option_text === optText;
                              const isOptSelected = q.student_option_text === optText;
                              let optStyle = 'text-gray-500';
                              if (isOptCorrect) optStyle = 'text-emerald-400 font-bold';
                              else if (isOptSelected) optStyle = 'text-red-400';
                              
                              return (
                                <div key={opt} className={`flex gap-1.5 text-[11px] ${optStyle}`}>
                                  <span className="uppercase">{opt}.</span>
                                  <span dangerouslySetInnerHTML={{ __html: optText }}></span>
                                  {isOptSelected && <span className="text-[10px] opacity-70 ml-1">(Chosen)</span>}
                                  {isOptCorrect && <span className="text-[10px] opacity-70 ml-1">(Correct)</span>}
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="mt-2 pt-1.5 border-t border-gray-700/50 flex flex-wrap gap-2 text-[10px] text-gray-600">
                            {q.question_id_html && <span>Q ID: {q.question_id_html}</span>}
                            {q.option_id && <span>Chosen Opt ID: {q.option_id}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-lg font-bold">Results</h1>
          <p className="text-[10px] text-gray-500 mt-0.5">{totalItems} results found</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            Export Filtered CSV
          </button>
          {bulkSelected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-400">{bulkSelected.length} selected</span>
              <button onClick={runBulkDeleteResults} className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs transition">
                Bulk Delete
              </button>
              <button onClick={() => setBulkSelected([])} className="bg-gray-700 hover:bg-gray-600 text-white px-2.5 py-1 rounded text-xs transition">
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-3.5 mb-3 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-[10px] text-gray-500 mb-1">Filter by Exam</label>
          <select
            value={filters.exam_id}
            onChange={e => { setFilters({ ...filters, exam_id: e.target.value }); setPage(1); }}
            className="w-full px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-white"
          >
            <option value="">All Exams</option>
            {exams.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-gray-500 mb-1">Category</label>
          <select
            value={filters.category}
            onChange={e => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}
            className="w-full px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-white"
          >
            <option value="">All Categories</option>
            <option value="UR">UR</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="EWS">EWS</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-gray-500 mb-1">Marks Range</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              placeholder="Min"
              value={filters.min_score}
              onChange={e => { setFilters({ ...filters, min_score: e.target.value }); setPage(1); }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-white"
            />
            <span className="text-gray-500 text-xs">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.max_score}
              onChange={e => { setFilters({ ...filters, max_score: e.target.value }); setPage(1); }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-gray-500 mb-1">Subject Keyword</label>
          <input
            type="text"
            placeholder="e.g. English, Math..."
            value={filters.subject}
            onChange={e => { setFilters({ ...filters, subject: e.target.value }); setPage(1); }}
            className="w-full px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-white"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-[10px] text-gray-500 mb-1">Search Candidate</label>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by roll number, name, registration number, test center..."
            className="w-full px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSearch('');
              setFilters({
                exam_id: '',
                category: '',
                shift_date: '',
                shift_time: '',
                subject: '',
                min_score: '',
                max_score: ''
              });
              setPage(1);
            }}
            className="w-full py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-800/50">
              <th className="p-2.5 text-left w-10">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) setBulkSelected(results.map(r => r.id));
                    else setBulkSelected([]);
                  }}
                  checked={results.length > 0 && bulkSelected.length === results.length}
                  className="w-3 h-3"
                />
              </th>
              <th className="p-2.5 text-left font-medium text-gray-500">ID</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Candidate Name</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Roll No.</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Exam</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Score</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Rank</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Percentile</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Category</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Subject</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" className="py-10 text-center text-gray-500">Loading results...</td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td colSpan="11" className="py-10 text-center text-gray-500">No results found matching filters.</td>
              </tr>
            ) : (
              results.map((r) => (
                <tr key={r.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="p-2.5">
                    <input
                      type="checkbox"
                      checked={bulkSelected.includes(r.id)}
                      onChange={() => {
                        setBulkSelected(prev => prev.includes(r.id) ? prev.filter(x => x !== r.id) : [...prev, r.id]);
                      }}
                      className="w-3 h-3"
                    />
                  </td>
                  <td className="p-2.5 text-gray-400">{r.id}</td>
                  <td className="p-2.5 font-medium text-white">{r.candidate_name || '—'}</td>
                  <td className="p-2.5 font-mono text-[11px]">{r.roll_number}</td>
                  <td className="p-2.5 text-gray-400">{r.exam_name || '—'}</td>
                  <td className="p-2.5 font-bold text-indigo-400">{r.score}</td>
                  <td className="p-2.5 text-purple-400">#{r.rank}</td>
                  <td className="p-2.5">{r.percentile}%</td>
                  <td className="p-2.5 uppercase font-bold text-[10px] text-gray-500">{r.category}</td>
                  <td className="p-2.5 text-gray-500 max-w-[120px] truncate">{r.subject || '—'}</td>
                  <td className="p-2.5">
                    <button onClick={() => fetchResultDetail(r.id)} className="text-indigo-400 hover:text-indigo-300 mr-1.5">
                      View
                    </button>
                    <button onClick={() => deleteResult(r.id)} className="text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex justify-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-0.5 rounded text-xs bg-gray-800 disabled:opacity-40"
          >
            ‹
          </button>
          {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-2.5 py-0.5 rounded text-xs ${page === p ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2 py-0.5 rounded text-xs bg-gray-800 disabled:opacity-40"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

function Questions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedQ, setSelectedQ] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [bulkSelected, setBulkSelected] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);
  const [toast, setToast] = useState(null);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [hasSolution, setHasSolution] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [subject, setSubject] = useState('');
  const [shiftDate, setShiftDate] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchQuestions(); }, [page, perPage, search, sortBy, hasSolution, correctAnswer, subject, shiftDate]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/admin/master-questions?page=${page}&per_page=${perPage}&sort_by=${sortBy}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (hasSolution) url += `&has_solution=${hasSolution}`;
      if (correctAnswer) url += `&correct_answer=${correctAnswer}`;
      if (subject) url += `&subject=${encodeURIComponent(subject)}`;
      if (shiftDate) url += `&shift_date=${shiftDate}`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(Array.isArray(data.questions) ? data.questions : []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); setItems([]); }
    finally { setLoading(false); }
  };

  const openDetail = async (id) => {
    setDetailLoading(true);
    setSelectedQ(null);
    setEditMode(false);
    setAiSuggestion(null);
    setBulkResults(null);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/master-questions/${id}`);
      const data = await res.json();
      setSelectedQ(data);
      setEditData({
        question_text: data.question_text || '',
        correct_answer: data.correct_answer || '',
        correct_option_text: data.correct_option_text || '',
        question_id_html: data.question_id_html || '',
        option_a_text: data.option_a_text || '',
        option_b_text: data.option_b_text || '',
        option_c_text: data.option_c_text || '',
        option_d_text: data.option_d_text || '',
      });
    } catch (e) { console.error(e); }
    finally { setDetailLoading(false); }
  };

  const saveEdit = async () => {
    if (!selectedQ) return;
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/master-questions/${selectedQ.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        showToast('Question updated successfully');
        setEditMode(false);
        openDetail(selectedQ.id);
        fetchQuestions();
      } else {
        showToast('Error saving question', 'error');
      }
    } catch (e) { showToast('Network error', 'error'); }
    finally { setSaving(false); }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    setEditData({
      question_text: aiSuggestion.question_text || editData.question_text,
      correct_answer: aiSuggestion.correct_answer || editData.correct_answer,
      option_a_text: aiSuggestion.option_a || editData.option_a_text,
      option_b_text: aiSuggestion.option_b || editData.option_b_text,
      option_c_text: aiSuggestion.option_c || editData.option_c_text,
      option_d_text: aiSuggestion.option_d || editData.option_d_text,
      correct_option_text: editData.correct_option_text,
      question_id_html: editData.question_id_html,
    });
    setEditMode(true);
    setAiSuggestion(null);
    showToast('AI suggestion applied. Review and save.', 'info');
  };

  const runAiEdit = async () => {
    if (!selectedQ) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/master-questions/${selectedQ.id}/ai-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto_apply: false }),
      });
      const data = await res.json();
      if (data.suggestion) {
        setAiSuggestion(data.suggestion);
        showToast('AI suggestion received!', 'info');
      } else {
        showToast('AI: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch (e) { showToast('AI edit failed', 'error'); }
    finally { setAiLoading(false); }
  };

  const toggleBulkSelect = (id) => {
    setBulkSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const runBulkAiEdit = async (autoApply = false) => {
    if (bulkSelected.length === 0) return;
    setBulkLoading(true);
    setBulkResults(null);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/master-questions/bulk-ai-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: bulkSelected, auto_apply: autoApply }),
      });
      const data = await res.json();
      setBulkResults(data);
      if (autoApply) fetchQuestions();
      showToast(`${data.processed} questions processed via bulk AI edit!`, 'info');
    } catch (e) { showToast('Bulk AI edit failed', 'error'); }
    finally { setBulkLoading(false); }
  };

  const runBulkDeleteQuestions = async () => {
    if (bulkSelected.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${bulkSelected.length} Questions and all related Responses/Solutions?`)) return;
    
    setBulkLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/master-questions/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: bulkSelected }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${data.deleted} Questions deleted`);
        setBulkSelected([]);
        if (page === 1) {
          fetchQuestions();
        } else {
          setPage(1);
        }
      } else {
        showToast('Error: ' + (data.error || ''), 'error');
      }
    } catch (e) { showToast('Delete failed', 'error'); } finally { setBulkLoading(false); }
  };

  const deleteQuestion = async (id, fromDetail = false) => {
    if (!confirm(`Are you sure you want to permanently delete MQ #${id}? All related student responses will also be deleted!`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/master-questions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`MQ #${id} deleted.`);
        if (fromDetail) setSelectedQ(null);
        fetchQuestions();
        setBulkSelected(prev => prev.filter(x => x !== id));
      } else {
        showToast('Delete error: ' + (data.error || ''), 'error');
      }
    } catch (e) { showToast('Delete failed', 'error'); }
  };

  const answerColor = { A: 'text-blue-400', B: 'text-purple-400', C: 'text-amber-400', D: 'text-rose-400' };

  if (detailLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (selectedQ) {
    return (
      <div>
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-xl text-xs font-medium transition-all
            ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'info' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
            {toast.msg}
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setSelectedQ(null)} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 text-xs">
            ← Back
          </button>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500 text-xs">MQ #{selectedQ.id}</span>
          {selectedQ.question_id_html && (
            <span className="font-mono text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-indigo-300">{selectedQ.question_id_html}</span>
          )}
          <div className="ml-auto flex gap-1.5">
            <button onClick={runAiEdit} disabled={aiLoading}
              className="px-2.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-[10px] font-medium disabled:opacity-50 flex items-center gap-1">
              {aiLoading ? '...' : 'AI'} Edit
            </button>
            <button onClick={() => setEditMode(!editMode)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium ${editMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
              {editMode ? 'Cancel' : 'Edit'}
            </button>
            {editMode && (
              <button onClick={saveEdit} disabled={saving}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[10px] font-medium disabled:opacity-50">
                {saving ? '...' : 'Save'}
              </button>
            )}
            <button onClick={() => deleteQuestion(selectedQ.id, true)}
              className="px-2.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-[10px] font-medium">
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-800">
            <p className="text-[10px] text-gray-500 mb-0.5">Reference Count</p>
            <p className="text-xl font-bold text-indigo-400">{selectedQ.reference_count}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-800">
            <p className="text-[10px] text-gray-500 mb-0.5">Shift Count</p>
            <p className="text-xl font-bold text-purple-400">{selectedQ.shift_count}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-800">
            <p className="text-[10px] text-gray-500 mb-0.5">Correct Answer</p>
            <p className={`text-xl font-bold ${answerColor[selectedQ.correct_answer] || 'text-emerald-400'}`}>{selectedQ.correct_answer}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-800">
            <p className="text-[10px] text-gray-500 mb-0.5">AI Solution</p>
            <p className="text-xl">{selectedQ.has_solution ? '✅' : '❌'}</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 mb-3 border border-gray-800">
          <h3 className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Question</h3>
          {editMode ? (
            <textarea value={editData.question_text} onChange={e => setEditData(p => ({ ...p, question_text: e.target.value }))}
              className="w-full bg-gray-950 border border-indigo-500 rounded-lg p-2.5 text-xs text-white resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          ) : (
            <p className="text-white leading-relaxed text-xs">{selectedQ.question_text}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
            {['a', 'b', 'c', 'd'].map((opt) => {
              const key = `option_${opt}_text`;
              const idKey = `option_${opt}_id`;
              const label = opt.toUpperCase();
              const isCorrect = selectedQ.correct_answer === label;
              return (
                <div key={opt} className={`p-2.5 rounded-lg border relative ${isCorrect ? 'border-emerald-500 bg-emerald-900/20' : 'border-gray-800 bg-gray-950'}`}>
                  {selectedQ[idKey] && (
                    <div className="absolute top-1 right-1.5 text-[9px] text-gray-600 font-mono">
                      ID: {selectedQ[idKey]}
                    </div>
                  )}
                  <div className="mt-1">
                    <span className={`font-bold text-[11px] mr-1.5 ${answerColor[label]}`}>{label}.</span>
                    {editMode ? (
                      <input value={editData[key]} onChange={e => setEditData(p => ({ ...p, [key]: e.target.value }))}
                        className="bg-transparent border-b border-gray-700 text-xs text-white w-[85%] focus:outline-none focus:border-indigo-400" />
                    ) : (
                      <span className={`text-xs ${isCorrect ? 'text-emerald-300' : 'text-gray-300'}`}>{selectedQ[key] || '—'}</span>
                    )}
                    {isCorrect && <span className="ml-1.5 text-[10px] text-emerald-400">✓ Correct</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {editMode && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-gray-500 mb-0.5 block">Correct Answer (A/B/C/D)</label>
                <select value={editData.correct_answer} onChange={e => setEditData(p => ({ ...p, correct_answer: e.target.value }))}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white">
                  {['A', 'B', 'C', 'D'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-0.5 block">Correct Option Text</label>
                <input value={editData.correct_option_text} onChange={e => setEditData(p => ({ ...p, correct_option_text: e.target.value }))}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-0.5 block">HTML Element ID</label>
                <input value={editData.question_id_html} onChange={e => setEditData(p => ({ ...p, question_id_html: e.target.value }))}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-indigo-300" />
              </div>
            </div>
          )}
        </div>

        {aiSuggestion && (
          <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-purple-300">AI Suggestion</h3>
              <div className="flex gap-1.5">
                <button onClick={applyAiSuggestion} className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-[10px]">Apply & Review</button>
                <button onClick={() => setAiSuggestion(null)} className="px-2.5 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-[10px]">Close</button>
              </div>
            </div>
            {aiSuggestion.notes && <p className="text-[10px] text-purple-200 mb-2 italic">{aiSuggestion.notes}</p>}
            <p className="text-xs text-white mb-1.5"><span className="text-gray-500">Q:</span> {aiSuggestion.question_text}</p>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {['a', 'b', 'c', 'd'].map(o => (
                <div key={o} className="bg-gray-900 rounded p-1.5">
                  <span className="text-purple-400 font-bold">{o.toUpperCase()}.</span> {aiSuggestion[`option_${o}`] || '—'}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-emerald-400 mt-1.5">✓ Suggested Answer: <strong>{aiSuggestion.correct_answer}</strong></p>
          </div>
        )}

        {selectedQ.shifts && selectedQ.shifts.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-4 mb-3 border border-gray-800">
            <h3 className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Shifts ({selectedQ.shifts.length})</h3>
            <div className="flex flex-wrap gap-1.5">
              {selectedQ.shifts.map((s, i) => (
                <div key={i} className="bg-gray-800 rounded-lg px-2.5 py-1.5 text-[10px]">
                  <p className="text-indigo-300 font-medium">{s.test_date} · {s.test_time}</p>
                  <p className="text-gray-500">{s.subject}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedQ.solution && (
          <div className="bg-gray-900 rounded-lg p-4 mb-3 border border-gray-800">
            <h3 className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">AI Solution</h3>
            <p className="text-xs text-gray-300 mb-1.5">{selectedQ.solution.explanation}</p>
            {selectedQ.solution.why_wrong && <p className="text-xs text-red-300"><span className="font-medium">Why Wrong:</span> {selectedQ.solution.why_wrong}</p>}
            {selectedQ.solution.key_takeaways && (
              <ul className="mt-1.5 space-y-0.5">
                {selectedQ.solution.key_takeaways.map((t, i) => <li key={i} className="text-[10px] text-emerald-300">• {t}</li>)}
              </ul>
            )}
          </div>
        )}

        {selectedQ.responses && selectedQ.responses.length > 0 && (
          <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            <div className="p-3 border-b border-gray-800">
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Student Responses ({selectedQ.responses.length})</h3>
            </div>
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="p-2 text-left font-medium text-gray-500">Roll No.</th>
                  <th className="p-2 text-left font-medium text-gray-500">Candidate</th>
                  <th className="p-2 text-left font-medium text-gray-500">Q No.</th>
                  <th className="p-2 text-left font-medium text-gray-500">Student Answer</th>
                  <th className="p-2 text-left font-medium text-gray-500">Status</th>
                  <th className="p-2 text-left font-medium text-gray-500">Marks</th>
                </tr>
              </thead>
              <tbody>
                {selectedQ.responses.map((r) => (
                  <tr key={r.response_id} className="border-t border-gray-800">
                    <td className="p-2 font-mono">{r.roll_number || '—'}</td>
                    <td className="p-2">{r.candidate_name || '—'}</td>
                    <td className="p-2">{r.question_no}</td>
                    <td className="p-2">
                      <span className={r.student_answer === selectedQ.correct_answer ? 'text-emerald-400' : r.student_answer ? 'text-red-400' : 'text-gray-600'}>
                        {r.student_answer || 'Unattempted'}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${r.status === 'correct' ? 'bg-emerald-800 text-emerald-300' : r.status === 'wrong' ? 'bg-red-800 text-red-300' : 'bg-gray-800 text-gray-400'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-2">{r.marks_awarded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-xl text-xs font-medium
          ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'info' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-bold">Master Questions <span className="text-xs font-normal text-gray-500 ml-1">({total})</span></h1>
        {bulkSelected.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-indigo-400">{bulkSelected.length} selected</span>
            <button onClick={() => runBulkAiEdit(false)} disabled={bulkLoading}
              className="px-2 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-[10px] font-medium disabled:opacity-50">
              {bulkLoading ? '...' : 'AI Preview'}
            </button>
            <button onClick={() => runBulkAiEdit(true)} disabled={bulkLoading}
              className="px-2 py-1.5 rounded-lg bg-purple-900 hover:bg-purple-800 text-[10px] font-medium disabled:opacity-50">
              {bulkLoading ? '...' : 'AI Apply All'}
            </button>
            <button onClick={runBulkDeleteQuestions} disabled={bulkLoading}
              className="px-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-[10px] font-medium disabled:opacity-50">
              Bulk Delete
            </button>
            <button onClick={() => { setBulkSelected([]); setBulkResults(null); }}
              className="px-2 py-1.5 rounded-lg bg-gray-700 text-[10px]">Clear</button>
          </div>
        )}
      </div>

      <div className="bg-gray-900 rounded-lg p-3 mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-2 border border-gray-800">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search questions..." className="col-span-2 px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
          className="px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none">
          <option value="created_at">Latest</option>
          <option value="reference_count">Reference Count</option>
          <option value="shift_count">Shift Count</option>
        </select>
        <select value={hasSolution} onChange={e => { setHasSolution(e.target.value); setPage(1); }}
          className="px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none">
          <option value="">All Solutions</option>
          <option value="true">Has Solution</option>
          <option value="false">No Solution</option>
        </select>
        <select value={correctAnswer} onChange={e => { setCorrectAnswer(e.target.value); setPage(1); }}
          className="px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none">
          <option value="">All Answers</option>
          {['A', 'B', 'C', 'D'].map(v => <option key={v} value={v}>Answer: {v}</option>)}
        </select>
        <input value={subject} onChange={e => { setSubject(e.target.value); setPage(1); }}
          placeholder="Exam name..." className="px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none" />
        <input type="text" value={shiftDate} onChange={e => { setShiftDate(e.target.value); setPage(1); }}
          placeholder="Date (DD/MM/YYYY)" className="px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none" />
      </div>

      {bulkResults && (
        <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-3 mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <h4 className="text-xs font-semibold text-purple-300">Bulk AI Results — {bulkResults.processed} processed</h4>
            <button onClick={() => setBulkResults(null)} className="text-gray-500 text-[10px]">✕</button>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-0.5">
            {bulkResults.results?.map((r, i) => (
              <div key={i} className={`text-[10px] px-2 py-0.5 rounded ${r.success ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'}`}>
                MQ #{r.id}: {r.success ? r.data?.notes || 'Edited' : r.error}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-800/50">
              <th className="p-2.5 w-8">
                <input type="checkbox" onChange={e => {
                  if (e.target.checked) {
                    setBulkSelected(prev => [...new Set([...prev, ...items.map(i => i.id)])]);
                  } else {
                    const itemIds = items.map(i => i.id);
                    setBulkSelected(prev => prev.filter(id => !itemIds.includes(id)));
                  }
                }}
                checked={items.length > 0 && items.every(i => bulkSelected.includes(i.id))}
                className="w-3 h-3" />
              </th>
              <th className="p-2.5 text-left font-medium text-gray-500">ID</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Question</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Ans</th>
              <th className="p-2.5 text-center font-medium text-gray-500">Refs</th>
              <th className="p-2.5 text-center font-medium text-gray-500">Shifts</th>
              <th className="p-2.5 text-center font-medium text-gray-500">AI</th>
              <th className="p-2.5 text-center font-medium text-gray-500">Del</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500"></div>
              </td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="p-4 text-center text-gray-500 text-xs">No questions found</td></tr>
            ) : items.map((q) => (
              <tr key={q.id} className="border-t border-gray-800 hover:bg-gray-800/30 cursor-pointer"
                onClick={(e) => { if (e.target.type !== 'checkbox') openDetail(q.id); }}>
                <td className="p-2.5" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={bulkSelected.includes(q.id)}
                    onChange={() => toggleBulkSelect(q.id)} className="w-3 h-3" />
                </td>
                <td className="p-2.5">
                  <p className="text-gray-300 text-xs">#{q.id}</p>
                  {q.question_id_html && <p className="font-mono text-[10px] text-indigo-400 truncate max-w-[80px]">{q.question_id_html}</p>}
                </td>
                <td className="p-2.5 max-w-xs">
                  <p className="text-gray-200 truncate text-xs">{q.question_text || '—'}</p>
                </td>
                <td className="p-2.5">
                  <span className={`font-bold text-xs ${answerColor[q.correct_answer] || 'text-white'}`}>{q.correct_answer}</span>
                </td>
                <td className="p-2.5 text-center">
                  <span className="bg-indigo-900/40 text-indigo-300 px-1.5 py-0.5 rounded-full text-[10px]">{q.reference_count}</span>
                </td>
                <td className="p-2.5 text-center">
                  <span className="bg-purple-900/40 text-purple-300 px-1.5 py-0.5 rounded-full text-[10px]">{q.shift_count}</span>
                </td>
                <td className="p-2.5 text-center">
                  {q.has_solution ? <span className="text-emerald-400">✓</span> : <span className="text-gray-700">—</span>}
                </td>
                <td className="p-2.5 text-center" onClick={e => e.stopPropagation()}>
                  <button onClick={() => deleteQuestion(q.id)}
                    className="text-red-500 hover:text-red-400 hover:bg-red-900/30 px-1.5 py-0.5 rounded text-xs transition">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div className="mt-3 flex justify-between items-center bg-gray-900 p-2.5 rounded-lg border border-gray-800 flex-wrap">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Rows:</span>
            <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} className="bg-gray-800 text-white rounded px-2 py-0.5 text-xs">
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex justify-center gap-1 flex-wrap">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-xs">‹</button>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`px-2 py-0.5 rounded text-xs ${page === p ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-xs">›</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ParsedData() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchParsed();
  }, [search]);

  const fetchParsed = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/results?page=1&per_page=50&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/results/${id}`);
      const data = await res.json();
      setSelected(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-bold">Parsed Data</h1>
        <p className="text-xs text-gray-500">Candidate + Question payloads from HTML parser</p>
      </div>

      <div className="mb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by roll/registration/name/subject..."
          className="w-full px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {selected ? (
        <div className="space-y-3">
          <button onClick={() => setSelected(null)} className="text-indigo-400 hover:text-indigo-300 text-xs">← Back</button>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <h2 className="text-sm font-semibold mb-3">Candidate Metadata</h2>
            <pre className="text-[11px] whitespace-pre-wrap break-all text-gray-300">{JSON.stringify(selected.result, null, 2)}</pre>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <h2 className="text-sm font-semibold mb-3">Question Payloads</h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {selected.questions?.map((q, index) => (
                <div key={q.id} className="border border-gray-800 rounded-lg p-2.5">
                  <p className="text-xs font-medium text-indigo-300">Q{q.question_no}</p>
                  <p className="text-xs text-white mt-1">{q.question_text}</p>
                  <pre className="text-[10px] mt-1.5 whitespace-pre-wrap break-all text-gray-500">{JSON.stringify(q.parsed_payload || {}, null, 2)}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="p-2.5 text-left font-medium text-gray-500">Roll</th>
                <th className="p-2.5 text-left font-medium text-gray-500">Candidate</th>
                <th className="p-2.5 text-left font-medium text-gray-500">Subject</th>
                <th className="p-2.5 text-left font-medium text-gray-500">Photo</th>
                <th className="p-2.5 text-left font-medium text-gray-500">Parser</th>
                <th className="p-2.5 text-left font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500 text-xs">Loading...</td></tr>
              ) : results.map((r) => (
                <tr key={r.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="p-2.5 font-mono text-[11px]">{r.roll_number}</td>
                  <td className="p-2.5">{r.candidate_name || '—'}</td>
                  <td className="p-2.5">{r.subject || '—'}</td>
                  <td className="p-2.5 text-gray-500">{r.application_photograph ? '✓' : '—'}</td>
                  <td className="p-2.5 text-gray-500">{r.parser_version || '—'}</td>
                  <td className="p-2.5">
                    <button onClick={() => openDetail(r.id)} className="text-indigo-400 hover:text-indigo-300 text-xs">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [page, userId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/admin/transactions?page=${page}&per_page=20`;
      if (userId) url += `&user_id=${userId}`;
      const res = await fetch(url);
      const data = await res.json();
      setTransactions(data.transactions);
      setTotalPages(data.pages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-lg font-bold mb-3">Transaction History</h1>

      <div className="mb-3">
        <input
          type="text"
          value={userId}
          onChange={(e) => { setUserId(e.target.value); setPage(1); }}
          placeholder="Filter by User ID..."
          className="w-full px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-800/50">
              <th className="p-2.5 text-left font-medium text-gray-500">ID</th>
              <th className="p-2.5 text-left font-medium text-gray-500">User ID</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Type</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Amount</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Description</th>
              <th className="p-2.5 text-left font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                <td className="p-2.5 text-gray-400">{t.id}</td>
                <td className="p-2.5">{t.user_id}</td>
                <td className="p-2.5">
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${t.type === 'earn' || t.type === 'recharge'
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'bg-red-600/20 text-red-400'
                    }`}>
                    {t.type}
                  </span>
                </td>
                <td className="p-2.5 font-medium">{t.type === 'earn' || t.type === 'recharge' ? '+' : '-'}{t.amount}</td>
                <td className="p-2.5 text-gray-500">{t.description || '—'}</td>
                <td className="p-2.5 text-gray-500 text-[11px]">{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex justify-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-2.5 py-0.5 rounded text-xs ${page === p ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
