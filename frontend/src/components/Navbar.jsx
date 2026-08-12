import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Bell, LogOut, PlusCircle, ShieldAlert, Wrench, BarChart2, Shield, Award, Menu, X } from 'lucide-react';
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

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'AUTHORITY_OFFICER') return '/enforcement';
    if (user.role === 'MODERATOR') return '/moderator';
    if (user.role === 'FIELD_WORKER') return '/field-worker';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Logo & Subtitle */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#166534] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#1F2937] flex items-center gap-0.5">
                Green<span className="text-[#166534]">Pulse</span>
              </span>
              <span className="text-[8px] font-black text-[#166534] tracking-wider uppercase block -mt-1">
                CIVIC ECO PLATFORM
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          {user ? (
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
              <Link 
                to={getDashboardPath()} 
                className={`px-3 py-1.5 rounded-full transition-all ${
                  location.pathname === '/dashboard' || location.pathname === '/enforcement' || location.pathname === '/moderator' || location.pathname === '/field-worker'
                    ? 'bg-[#DCFCE7] text-[#166534] font-bold' 
                    : 'text-[#64748B] hover:text-[#1F2937] hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>

              {user.role === 'CITIZEN' && (
                <Link 
                  to="/rewards" 
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    location.pathname === '/rewards' 
                      ? 'bg-[#DCFCE7] text-[#166534] font-bold' 
                      : 'text-[#64748B] hover:text-[#1F2937] hover:bg-slate-50'
                  }`}
                >
                  Impact
                </Link>
              )}

              <Link 
                to="/analytics" 
                className={`px-3 py-1.5 rounded-full transition-all ${
                  location.pathname === '/analytics' 
                    ? 'bg-[#DCFCE7] text-[#166534] font-bold' 
                    : 'text-[#64748B] hover:text-[#1F2937] hover:bg-slate-50'
                }`}
              >
                Analytics
              </Link>

              {/* Placeholder tabs for Community & Reports to fulfill demo spec */}
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-3 py-1.5 rounded-full text-[#64748B] hover:text-[#1F2937] hover:bg-slate-50 transition-all"
              >
                Reports
              </button>
              <button 
                onClick={() => alert('Community forum coming soon in GreenPulse v1.1!')}
                className="px-3 py-1.5 rounded-full text-[#64748B] hover:text-[#1F2937] hover:bg-slate-50 transition-all"
              >
                Community
              </button>
            </nav>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 text-xs">
              <span className="text-[#64748B] font-bold mr-1.5 text-[10px] uppercase tracking-wider">Demo Switch:</span>
              <button onClick={() => handleDemoSwitch('citizen@greenpulse.demo')} className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] font-bold hover:opacity-90 transition-all">Citizen</button>
              <button onClick={() => handleDemoSwitch('authority@greenpulse.demo')} className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] font-bold hover:opacity-90 transition-all">Authority</button>
              <button onClick={() => handleDemoSwitch('moderator@greenpulse.demo')} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all">Moderator</button>
              <button onClick={() => handleDemoSwitch('worker@greenpulse.demo')} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all">Worker</button>
            </div>
          )}

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/notifications" className="relative p-2 rounded-full text-[#64748B] hover:text-[#1F2937] hover:bg-slate-100 transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-[#DCFCE7] border border-emerald-200 flex items-center justify-center text-[#166534] font-bold text-xs">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#1F2937] leading-none">{user.name}</span>
                      <span className="w-2 h-2 rounded-full bg-[#22C55E]" title="Online"></span>
                    </div>
                    <span className="text-[9px] font-bold text-[#166534] uppercase tracking-wider block mt-0.5 px-1.5 py-0.5 rounded-md bg-[#DCFCE7]/70">
                      {user.role === 'AUTHORITY_OFFICER' ? 'Officer' : user.role.toLowerCase()}
                    </span>
                  </div>

                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-xs font-extrabold text-[#64748B] hover:text-[#1F2937] transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 text-xs font-extrabold text-white bg-[#166534] hover:bg-[#15803d] rounded-xl shadow-xs transition-all">
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
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 shadow-inner">
          {user ? (
            <div className="flex flex-col gap-2 text-sm font-semibold">
              <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50">Dashboard</Link>
              {user.role === 'CITIZEN' && (
                <Link to="/rewards" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50">Impact</Link>
              )}
              <Link to="/analytics" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50">Analytics</Link>
              {user.role === 'CITIZEN' && (
                <Link to="/reports/new" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-white font-bold bg-[#166534] text-center">New Report</Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Demo Accounts</span>
              <button onClick={() => { handleDemoSwitch('citizen@greenpulse.demo'); setMobileMenuOpen(false); }} className="text-left px-3 py-1.5 rounded bg-emerald-50 text-[#166534] text-xs font-bold">Citizen Demo</button>
              <button onClick={() => { handleDemoSwitch('authority@greenpulse.demo'); setMobileMenuOpen(false); }} className="text-left px-3 py-1.5 rounded bg-emerald-50 text-[#166534] text-xs font-bold">Authority Demo</button>
              <button onClick={() => { handleDemoSwitch('moderator@greenpulse.demo'); setMobileMenuOpen(false); }} className="text-left px-3 py-1.5 rounded bg-slate-100 text-slate-700 text-xs font-bold">Moderator Demo</button>
              <button onClick={() => { handleDemoSwitch('worker@greenpulse.demo'); setMobileMenuOpen(false); }} className="text-left px-3 py-1.5 rounded bg-slate-100 text-slate-700 text-xs font-bold">Field Worker Demo</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
