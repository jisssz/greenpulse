import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Bell, LogOut, PlusCircle, ShieldAlert, Wrench, BarChart2, Shield, Award, Settings } from 'lucide-react';
import api from '../services/api';

const Navbar = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1">
                Green<span className="text-brand-600">Pulse</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase block -mt-1">
                Civic Eco Engine
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          {user ? (
            <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
              {user.role === 'CITIZEN' && (
                <>
                  <Link to="/dashboard" className={`px-3 py-2 rounded-lg transition-colors ${location.pathname === '/dashboard' ? 'bg-brand-50 text-brand-700 font-bold' : 'hover:bg-slate-100 hover:text-slate-900'}`}>
                    Dashboard
                  </Link>
                  <Link to="/rewards" className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${location.pathname === '/rewards' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-100'}`}>
                    <Award className="w-4 h-4 text-emerald-600" /> My Rewards
                  </Link>
                  <Link to="/reports/new" className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all shadow-sm`}>
                    <PlusCircle className="w-4 h-4" /> Report Issue
                  </Link>
                </>
              )}

              {(user.role === 'AUTHORITY_OFFICER' || user.role === 'ADMIN') && (
                <Link to="/enforcement" className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${location.pathname.startsWith('/enforcement') ? 'bg-emerald-100 text-emerald-800 font-bold' : 'hover:bg-slate-100'}`}>
                  <Shield className="w-4 h-4 text-emerald-700" /> Enforcement Portal
                </Link>
              )}

              {(user.role === 'MODERATOR' || user.role === 'ADMIN') && (
                <Link to="/moderator" className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${location.pathname.startsWith('/moderator') ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-100'}`}>
                  <ShieldAlert className="w-4 h-4 text-indigo-600" /> Triage Queue
                </Link>
              )}

              {(user.role === 'FIELD_WORKER' || user.role === 'ADMIN') && (
                <Link to="/field-worker" className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${location.pathname.startsWith('/field-worker') ? 'bg-amber-50 text-amber-700 font-bold' : 'hover:bg-slate-100'}`}>
                  <Wrench className="w-4 h-4 text-amber-600" /> Task Queue
                </Link>
              )}

              {user.role === 'ADMIN' && (
                <Link to="/admin/reward-policy" className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${location.pathname === '/admin/reward-policy' ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-slate-100'}`}>
                  <Settings className="w-4 h-4 text-purple-600" /> Reward Policy
                </Link>
              )}

              {(user.role === 'ADMIN' || user.role === 'MODERATOR' || user.role === 'AUTHORITY_OFFICER') && (
                <Link to="/analytics" className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${location.pathname === '/analytics' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-100'}`}>
                  <BarChart2 className="w-4 h-4 text-emerald-600" /> Hotspot Analytics
                </Link>
              )}
            </nav>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-400">Quick Demo Switch:</span>
              <button onClick={() => handleDemoSwitch('citizen@greenpulse.demo')} className="bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-700">Citizen</button>
              <button onClick={() => handleDemoSwitch('officer@greenpulse.demo')} className="bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded text-emerald-800 font-bold">Authority</button>
              <button onClick={() => handleDemoSwitch('moderator@greenpulse.demo')} className="bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded text-indigo-700">Moderator</button>
              <button onClick={() => handleDemoSwitch('worker@greenpulse.demo')} className="bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded text-amber-700">Field Worker</button>
              <button onClick={() => handleDemoSwitch('admin@greenpulse.demo')} className="bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded text-slate-800">Admin</button>
            </div>
          )}

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/notifications" className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-slate-900 block leading-none">{user.name}</span>
                    <span className="text-[10px] font-semibold text-brand-700 uppercase tracking-wider block mt-0.5">{user.role}</span>
                  </div>

                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all">
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
