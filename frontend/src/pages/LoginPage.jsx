import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogIn, Key, Mail, ShieldAlert, User, Wrench, Shield, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-brand-700 to-brand-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in to GreenPulse</h2>
          <p className="text-xs text-slate-500">Civic Environmental Reporting, Evidence & Enforcement Platform</p>
        </div>

        {/* Demo Quick Fill Cards */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">1-Click Demo Login</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button type="button" onClick={() => fillDemoAccount('citizen@greenpulse.demo')} className="flex items-center gap-1.5 p-2 rounded-lg bg-white hover:bg-brand-50 border border-slate-200 text-slate-700 hover:text-brand-700 font-semibold transition-colors">
              <User className="w-3.5 h-3.5 text-brand-600" /> Citizen
            </button>
            <button type="button" onClick={() => fillDemoAccount('officer@greenpulse.demo')} className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold transition-colors">
              <Shield className="w-3.5 h-3.5 text-emerald-700" /> Authority
            </button>
            <button type="button" onClick={() => fillDemoAccount('moderator@greenpulse.demo')} className="flex items-center gap-1.5 p-2 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-700 font-semibold transition-colors">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" /> Moderator
            </button>
            <button type="button" onClick={() => fillDemoAccount('worker@greenpulse.demo')} className="flex items-center gap-1.5 p-2 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 text-slate-700 hover:text-amber-700 font-semibold transition-colors">
              <Wrench className="w-3.5 h-3.5 text-amber-600" /> Field Worker
            </button>
          </div>
          <button type="button" onClick={() => fillDemoAccount('admin@greenpulse.demo')} className="w-full text-center text-xs py-1 text-slate-500 hover:text-slate-900 font-medium">
            Login as System Admin (admin@greenpulse.demo)
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@greenpulse.demo"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <LogIn className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-700 font-bold hover:underline">
            Register as Citizen
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
