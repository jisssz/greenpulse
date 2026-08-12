import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Bell, LogOut, PlusCircle, ShieldAlert, Wrench, BarChart2, Shield, Award, Settings, Menu, X } from 'lucide-react';
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
      if (email.includes('officer')) {
        navigate('/enforcement');
      } else {
        navigate('/dashboard');
      }
    } catch (e) {
      alert('Demo login failed: ' + e.message);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-forest-950/85 backdrop-blur-xl border-b border-emerald-500/15 shadow-glass transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-glow-emerald group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-forest-950 rounded-[10px] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                Green<span className="text-emerald-400 font-black">Pulse</span>
              </span>
              <span className="text-[9px] font-bold text-emerald-400/70 tracking-widest uppercase block -mt-1">
                Civic Eco Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          {user ? (
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium">
              {user.role === 'CITIZEN' && (
                <>
                  <Link to="/dashboard" className={`px-3 py-2 rounded-lg transition-all ${location.pathname === '/dashboard' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                    Dashboard
                  </Link>
                  <Link to="/rewards" className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${location.pathname === '/rewards' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                    <Award className="w-3.5 h-3.5 text-emerald-400" /> My Rewards
                  </Link>
                  <Link to="/reports/new" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold transition-all shadow-glow-emerald">
                    <PlusCircle className="w-3.5 h-3.5" /> Report Issue
                  </Link>
                </>
              )}

              {(user.role === 'AUTHORITY_OFFICER' || user.role === 'ADMIN') && (
                <Link to="/enforcement" className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${location.pathname.startsWith('/enforcement') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> Enforcement Portal
                </Link>
              )}

              {(user.role === 'MODERATOR' || user.role === 'ADMIN') && (
                <Link to="/moderator" className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${location.pathname.startsWith('/moderator') ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" /> Triage Queue
                </Link>
              )}

              {(user.role === 'FIELD_WORKER' || user.role === 'ADMIN') && (
                <Link to="/field-worker" className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${location.pathname.startsWith('/field-worker') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                  <Wrench className="w-3.5 h-3.5 text-amber-400" /> Task Queue
                </Link>
              )}

              {user.role === 'ADMIN' && (
                <Link to="/admin/reward-policy" className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${location.pathname === '/admin/reward-policy' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                  <Settings className="w-3.5 h-3.5 text-purple-400" /> Reward Policy
                </Link>
              )}

              {(user.role === 'ADMIN' || user.role === 'MODERATOR' || user.role === 'AUTHORITY_OFFICER') && (
                <Link to="/analytics" className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${location.pathname === '/analytics' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                  <BarChart2 className="w-3.5 h-3.5 text-teal-400" /> Analytics
                </Link>
              )}
            </nav>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium mr-1">Demo Switch:</span>
              <button onClick={() => handleDemoSwitch('citizen@greenpulse.demo')} className="px-2.5 py-1 rounded-md bg-forest-900 border border-emerald-500/20 text-slate-300 hover:text-white hover:border-emerald-500/50 transition-all">Citizen</button>
              <button onClick={() => handleDemoSwitch('officer@greenpulse.demo')} className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all font-semibold">Authority</button>
              <button onClick={() => handleDemoSwitch('moderator@greenpulse.demo')} className="px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 transition-all">Moderator</button>
              <button onClick={() => handleDemoSwitch('worker@greenpulse.demo')} className="px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all">Field Worker</button>
              <button onClick={() => handleDemoSwitch('admin@greenpulse.demo')} className="px-2.5 py-1 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all">Admin</button>
            </div>
          )}

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/notifications" className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <div className="flex items-center gap-2 pl-3 border-l border-emerald-500/15">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-slate-100 block leading-none">{user.name}</span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mt-1">{user.role}</span>
                  </div>

                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 text-xs font-bold text-forest-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-glow-emerald transition-all">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-300 hover:text-white rounded-lg hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-emerald-500/15 px-4 py-4 space-y-3">
          {user ? (
            <div className="flex flex-col gap-2">
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-200 hover:bg-white/5">Dashboard</Link>
              <Link to="/rewards" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-200 hover:bg-white/5">My Rewards</Link>
              <Link to="/reports/new" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20">Report Issue</Link>
              {(user.role === 'AUTHORITY_OFFICER' || user.role === 'ADMIN') && (
                <Link to="/enforcement" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-emerald-300 hover:bg-white/5">Enforcement Portal</Link>
              )}
              {(user.role === 'MODERATOR' || user.role === 'ADMIN') && (
                <Link to="/moderator" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-indigo-300 hover:bg-white/5">Triage Queue</Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Quick Demo Switch</span>
              <button onClick={() => { handleDemoSwitch('citizen@greenpulse.demo'); setMobileMenuOpen(false); }} className="text-left px-3 py-1.5 rounded bg-forest-900 text-slate-300 text-xs">Citizen</button>
              <button onClick={() => { handleDemoSwitch('officer@greenpulse.demo'); setMobileMenuOpen(false); }} className="text-left px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-semibold">Authority Officer</button>
              <button onClick={() => { handleDemoSwitch('moderator@greenpulse.demo'); setMobileMenuOpen(false); }} className="text-left px-3 py-1.5 rounded bg-indigo-500/20 text-indigo-300 text-xs">Moderator</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
