import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { FaBookOpen, FaUserCircle, FaCoins, FaSignOutAlt, FaBars, FaTimes, FaSun, FaMoon, FaDesktop, FaChevronDown } from 'react-icons/fa';
import Logo from './Logo';

export default function Navbar({ user: propUser, setUser: propSetUser }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [internalUser, setInternalUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeUser = propUser !== undefined ? propUser : internalUser;

  useEffect(() => {
    setMounted(true);
    let u = propUser;
    if (u === undefined) {
      try {
        const stored = localStorage.getItem('rv_user');
        if (stored) {
          u = JSON.parse(stored);
          setInternalUser(u);
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (u && u.id) {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      fetch(`${API}/api/user/${u.id}/points`)
        .then(res => res.json())
        .then(data => {
          if (data.balance !== undefined) {
            setInternalUser(prev => prev ? { ...prev, balance: data.balance } : { ...u, balance: data.balance });
          }
        })
        .catch(() => {});
    }
  }, [propUser]);

  // Close menus on route change or click outside
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [router.asPath]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('rv_token');
    localStorage.removeItem('rv_user');
    if (propSetUser) {
      propSetUser(null);
    }
    setInternalUser(null);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    router.push('/');
  };

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
  };

  const formatPoints = (num) => {
    if (num == null) return '50';
    if (num >= 100000) return `${(num / 1000).toFixed(0)}k`;
    if (num >= 10000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString();
  };

  const initials = activeUser?.name
    ? activeUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-[#080b24]/95 backdrop-blur-md border-b border-slate-200 dark:border-indigo-900/40 px-3 sm:px-4 py-2.5 sm:py-3 shadow-xs dark:shadow-xl dark:shadow-black/40 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo */}
        <Logo size="md" />

        {/* Middle navigation (Desktop) */}
        <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <Link href="/exams" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Exams</Link>
          <Link href="/pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</Link>
          <Link href="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Question Bank Link (Desktop) */}
          <Link
            href="/marketplace"
            className="hidden lg:flex items-center gap-1.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 px-3 py-1.5 rounded-xl shadow-xs transition"
          >
            <FaBookOpen className="text-xs text-indigo-600 dark:text-indigo-400" /> Question Bank
          </Link>

          {/* Points Display Badge (Compact Header) */}
          {activeUser && (
            <Link
              href="/pricing"
              title="Your Points Balance (Click to get more points)"
              className="flex items-center gap-1 text-[11px] sm:text-xs font-black bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/30 px-2.5 py-1.5 rounded-xl shadow-xs hover:bg-amber-100 dark:hover:bg-amber-500/25 transition select-none shrink-0"
            >
              <FaCoins className="text-amber-500 dark:text-amber-400 text-xs shrink-0" />
              <span>{formatPoints(activeUser.balance)}</span>
              <span className="hidden xs:inline text-[10px] opacity-75">Pts</span>
            </Link>
          )}

          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={toggleTheme}
              title={`Theme: ${theme || 'system'} (Click to change)`}
              aria-label="Toggle Theme Mode"
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-indigo-950/60 border border-slate-200 dark:border-indigo-800/60 text-slate-700 dark:text-amber-300 hover:bg-slate-200 dark:hover:bg-indigo-900/80 transition flex items-center justify-center text-xs shrink-0"
            >
              {theme === 'dark' ? (
                <FaMoon className="text-amber-400 text-xs" />
              ) : theme === 'light' ? (
                <FaSun className="text-amber-500 text-xs" />
              ) : (
                <FaDesktop className="text-indigo-500 dark:text-indigo-300 text-xs" />
              )}
            </button>
          )}

          {/* User Account / Login */}
          {activeUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-indigo-950/60 hover:bg-slate-200 dark:hover:bg-indigo-900/60 border border-slate-200 dark:border-indigo-800/60 pl-2 pr-1.5 py-1 rounded-xl text-slate-800 dark:text-white transition cursor-pointer"
              >
                <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-black uppercase shadow-xs shrink-0">
                  {initials}
                </span>
                <span className="text-slate-700 dark:text-slate-200 font-bold text-xs hidden md:inline truncate max-w-[80px]">
                  {activeUser.name ? activeUser.name.split(' ')[0] : 'User'}
                </span>
                <FaChevronDown className={`text-[10px] text-slate-400 transition-transform duration-200 hidden sm:inline ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Desktop User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#0c1033] border border-slate-200 dark:border-indigo-900/80 rounded-2xl shadow-xl py-2 z-50 text-xs font-semibold text-slate-700 dark:text-slate-200 backdrop-blur-md">
                  <div className="px-3.5 py-2 border-b border-slate-100 dark:border-indigo-900/40">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{activeUser.name || 'User'}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{activeUser.email}</p>
                  </div>
                  <Link href="/pricing" className="flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-indigo-900/30 transition text-amber-600 dark:text-amber-400 font-bold">
                    <span className="flex items-center gap-2"><FaCoins className="text-amber-500" /> Wallet Balance</span>
                    <span className="font-black">{formatPoints(activeUser.balance)} Pts</span>
                  </Link>
                  <div className="border-t border-slate-100 dark:border-indigo-900/40 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold flex items-center gap-2 transition"
                    >
                      <FaSignOutAlt className="text-xs" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
            >
              <FaUserCircle className="text-xs sm:text-sm" />
              <span>Login</span>
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-slate-100 dark:bg-indigo-950/60 border border-slate-200 dark:border-indigo-800/60 p-1.5 sm:p-2 rounded-xl text-sm transition shrink-0"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-3 pb-2 border-t border-slate-200 dark:border-indigo-900/40 mt-2.5 space-y-2 text-xs font-bold text-slate-700 dark:text-slate-200 animate-fadeIn">
          {activeUser ? (
            <div className="px-3.5 py-3 bg-slate-50 dark:bg-indigo-950/40 border border-slate-200 dark:border-indigo-800/50 rounded-2xl mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-black uppercase shadow-xs shrink-0">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate">{activeUser.name || 'User'}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{activeUser.email}</p>
                </div>
              </div>
              <Link href="/pricing" className="shrink-0 bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1">
                <FaCoins className="text-amber-500 text-xs" /> {formatPoints(activeUser.balance)} Pts
              </Link>
            </div>
          ) : null}

          <Link
            href="/exams"
            className="block px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-indigo-900/40 transition"
          >
            📝 Exams Calculator
          </Link>
          <Link
            href="/marketplace"
            className="block px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-indigo-900/40 transition flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold"
          >
            <FaBookOpen className="text-xs" /> Question Bank Marketplace
          </Link>
          <Link
            href="/pricing"
            className="block px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-indigo-900/40 transition"
          >
            💎 Pricing &amp; Points Recharge
          </Link>
          <Link
            href="/blog"
            className="block px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-indigo-900/40 transition"
          >
            📰 Blog &amp; Articles
          </Link>

          {activeUser && (
            <div className="pt-2 border-t border-slate-200 dark:border-indigo-900/40 mt-2">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 font-extrabold text-xs flex items-center justify-center gap-2 transition"
              >
                <FaSignOutAlt className="text-xs" /> Logout Account
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
