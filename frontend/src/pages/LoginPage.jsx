import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogIn, Key, Mail, ShieldAlert, User, Wrench, Shield, AlertCircle, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email, password);
      if (u && u.role === 'AUTHORITY_OFFICER') {
        navigate('/enforcement');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-forest-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full glass-panel rounded-3xl p-8 space-y-6 border border-emerald-500/20 shadow-glass relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-2xl mx-auto flex items-center justify-center shadow-glow-emerald p-0.5">
            <div className="w-full h-full bg-forest-950 rounded-[14px] flex items-center justify-center">
              <Leaf className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign in to GreenPulse</h2>
          <p className="text-xs text-slate-400">Civic Environmental Reporting, Evidence & Enforcement Platform</p>
        </div>

        {/* Demo Quick Fill Cards */}
        <div className="glass-card rounded-2xl p-3.5 space-y-2 border border-emerald-500/15">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block text-center">1-Click Quick Demo Login</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button type="button" onClick={() => fillDemoAccount('citizen@greenpulse.demo')} className="flex items-center gap-1.5 p-2 rounded-xl bg-forest-900/80 hover:bg-emerald-500/15 border border-emerald-500/20 text-slate-200 hover:text-emerald-300 font-semibold transition-all">
              <User className="w-3.5 h-3.5 text-emerald-400" /> Citizen
            </button>
            <button type="button" onClick={() => fillDemoAccount('officer@greenpulse.demo')} className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold transition-all shadow-glow-emerald">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Authority
            </button>
            <button type="button" onClick={() => fillDemoAccount('moderator@greenpulse.demo')} className="flex items-center gap-1.5 p-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 font-semibold transition-all">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" /> Moderator
            </button>
            <button type="button" onClick={() => fillDemoAccount('worker@greenpulse.demo')} className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold transition-all">
              <Wrench className="w-3.5 h-3.5 text-amber-400" /> Field Worker
            </button>
          </div>
          <button type="button" onClick={() => fillDemoAccount('admin@greenpulse.demo')} className="w-full text-center text-[11px] py-1 text-slate-400 hover:text-emerald-300 font-medium transition-colors">
            Login as System Admin (admin@greenpulse.demo)
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@greenpulse.demo"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm focus:border-emerald-500/60"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm focus:border-emerald-500/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold text-sm rounded-xl shadow-glow-emerald transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <LogIn className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-emerald-500/10">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 font-bold hover:underline">
            Register as Citizen
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
