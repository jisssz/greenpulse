import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Bell, LogOut, PlusCircle, ShieldAlert, Wrench, BarChart2, Shield, Award, Settings, Menu, X, CheckCircle2, User } from 'lucide-react';
import api from '../services/api';

const Navbar = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then(res => {
          if (res.data) {
            setUnreadCount(res.data.filter(n => !n.isRead).length);
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleDemoSwitch = async (email) => {
    try {
      await login(email, 'password123');
      if (email.includes('officer') || email.includes('authority')) {
        navigate('/enforcement');
      } else {
        navigate('/dashboard');
      }
    } catch (e) {
      alert('Demo login failed: ' + e.message);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-950/10 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#0F7A45] text-white flex items-center justify-center shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-all duration-300">
              <Leaf className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900 flex items-center gap-1">
                Green<span className="text-[#0F7A45]">Pulse</span>
              </span>
              <span className="text-[9px] font-extrabold text-[#0F7A45] tracking-widest uppercase block -mt-1">
                Civic Eco Platform
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          {user ? (
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <Link to="/dashboard" className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${location.pathname === '/dashboard' ? 'bg-emerald-50 text-[#0F7A45] font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                <Leaf className="w-4 h-4 text-[#0F7A45]" /> Overview
              </Link>

              {user.role === 'CITIZEN' && (
                <>
                  <Link to="/rewards" className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${location.pathname === '/rewards' ? 'bg-emerald-50 text-[#0F7A45] font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                    <Award className="w-4 h-4 text-emerald-600" /> Rewards
                  </Link>
                  <Link to="/reports/new" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F7A45] hover:bg-[#166534] text-white font-bold transition-all shadow-md shadow-emerald-900/10 ml-1">
                    <PlusCircle className="w-4 h-4" /> New Report
                  </Link>
                </>
              )}

              {(user.role === 'AUTHORITY_OFFICER' || user.role === 'ADMIN') && (
                <Link to="/enforcement" className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${location.pathname.startsWith('/enforcement') ? 'bg-emerald-50 text-[#0F7A45] font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  <Shield className="w-4 h-4 text-[#0F7A45]" /> Enforcement
                </Link>
              )}

              {(user.role === 'MODERATOR' || user.role === 'ADMIN') && (
                <Link to="/moderator" className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${location.pathname.startsWith('/moderator') ? 'bg-emerald-50 text-[#0F7A45] font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  <ShieldAlert className="w-4 h-4 text-indigo-600" /> Triage Queue
                </Link>
              )}

              {(user.role === 'FIELD_WORKER' || user.role === 'ADMIN') && (
                <Link to="/field-worker" className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${location.pathname.startsWith('/field-worker') ? 'bg-emerald-50 text-[#0F7A45] font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  <Wrench className="w-4 h-4 text-amber-600" /> Field Tasks
                </Link>
              )}

              <Link to="/analytics" className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${location.pathname === '/analytics' ? 'bg-emerald-50 text-[#0F7A45] font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                <BarChart2 className="w-4 h-4 text-emerald-600" /> Analytics
              </Link>
            </nav>
          ) : (
            <div className="hidden lg:flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-medium mr-1.5 text-[11px] uppercase tracking-wider">Demo:</span>
              <button onClick={() => handleDemoSwitch('citizen@greenpulse.demo')} className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[#0F7A45] font-bold hover:bg-emerald-100 transition-all">Citizen</button>
              <button onClick={() => handleDemoSwitch('authority@greenpulse.demo')} className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[#0F7A45] font-bold hover:bg-emerald-100 transition-all">Authority</button>
              <button onClick={() => handleDemoSwitch('moderator@greenpulse.demo')} className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100 transition-all">Moderator</button>
              <button onClick={() => handleDemoSwitch('worker@greenpulse.demo')} className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-bold hover:bg-amber-100 transition-all">Field Worker</button>
              <button onClick={() => handleDemoSwitch('admin@greenpulse.demo')} className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 font-bold hover:bg-purple-100 transition-all">Admin</button>
            </div>
          )}

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/notifications" className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#0F7A45] font-bold text-xs">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-slate-900 leading-none">{user.name}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online"></span>
                    </div>
                    <span className="text-[10px] font-bold text-[#0F7A45] uppercase tracking-wider block mt-0.5">{user.role}</span>
                  </div>

                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 text-xs font-bold text-white bg-[#0F7A45] hover:bg-[#166534] rounded-xl shadow-sm transition-all">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3">
          {user ? (
            <div className="flex flex-col gap-2">
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold">Overview</Link>
              <Link to="/rewards" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold">Rewards</Link>
              <Link to="/reports/new" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-white font-bold bg-[#0F7A45]">New Report</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Demo Accounts</span>
              <button onClick={() => { handleDemoSwitch('citizen@greenpulse.demo'); setMobileMenuOpen(false); }} className="text-left px-3 py-1.5 rounded bg-emerald-50 text-[#0F7A45] text-xs font-bold">Citizen Demo</button>
              <button onClick={() => { handleDemoSwitch('authority@greenpulse.demo'); setMobileMenuOpen(false); }} className="text-left px-3 py-1.5 rounded bg-emerald-50 text-[#0F7A45] text-xs font-bold">Authority Demo</button>
              <button onClick={() => { handleDemoSwitch('moderator@greenpulse.demo'); setMobileMenuOpen(false); }} className="text-left px-3 py-1.5 rounded bg-indigo-50 text-indigo-700 text-xs font-bold">Moderator Demo</button>
              <button onClick={() => { handleDemoSwitch('worker@greenpulse.demo'); setMobileMenuOpen(false); }} className="text-left px-3 py-1.5 rounded bg-amber-50 text-amber-700 text-xs font-bold">Field Worker Demo</button>
              <button onClick={() => { handleDemoSwitch('admin@greenpulse.demo'); setMobileMenuOpen(false); }} className="text-left px-3 py-1.5 rounded bg-purple-50 text-purple-700 text-xs font-bold">Admin Demo</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
