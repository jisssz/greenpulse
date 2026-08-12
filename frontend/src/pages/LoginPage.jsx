import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogIn, Key, Mail, ShieldAlert, User, Wrench, Shield, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

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
      if (u && (u.role === 'AUTHORITY_OFFICER' || u.role === 'ADMIN')) {
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

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    setLoading(true);
    try {
      const u = await login(demoEmail, 'password123');
      if (u && (u.role === 'AUTHORITY_OFFICER' || u.role === 'ADMIN')) {
        navigate('/enforcement');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Demo authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAF7] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Soft Ambient Eco Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-md w-full glass-card rounded-3xl p-8 space-y-6 border border-emerald-950/10 shadow-xl relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#0F7A45] rounded-2xl mx-auto flex items-center justify-center shadow-md shadow-emerald-900/15 p-0.5">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to GreenPulse</h2>
          <p className="text-xs text-slate-500 font-medium">Civic Environmental Reporting & Enforcement Platform</p>
        </div>

        {/* Demo Quick Login Section */}
        <div className="bg-emerald-50/70 rounded-2xl p-4 space-y-3 border border-emerald-200/60 shadow-xs">
          <div className="flex items-center justify-center gap-1.5 text-[#0F7A45]">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider">Try GreenPulse Demo</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button 
              type="button" 
              onClick={() => handleDemoLogin('citizen@greenpulse.demo')} 
              className="flex items-center gap-1.5 p-2.5 rounded-xl bg-white hover:bg-emerald-100/60 border border-emerald-200 text-slate-800 hover:text-[#0F7A45] transition-all shadow-2xs"
            >
              <User className="w-4 h-4 text-[#0F7A45]" /> Citizen Demo
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin('authority@greenpulse.demo')} 
              className="flex items-center gap-1.5 p-2.5 rounded-xl bg-[#0F7A45] hover:bg-[#166534] text-white transition-all shadow-xs"
            >
              <Shield className="w-4 h-4 text-emerald-200" /> Authority Demo
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin('moderator@greenpulse.demo')} 
              className="flex items-center gap-1.5 p-2.5 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-900 transition-all shadow-2xs"
            >
              <ShieldAlert className="w-4 h-4 text-indigo-600" /> Moderator Demo
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin('worker@greenpulse.demo')} 
              className="flex items-center gap-1.5 p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 text-amber-900 transition-all shadow-2xs"
            >
              <Wrench className="w-4 h-4 text-amber-600" /> Field Worker Demo
            </button>
          </div>
          <button 
            type="button" 
            onClick={() => handleDemoLogin('admin@greenpulse.demo')} 
            className="w-full text-center text-xs py-1 text-slate-600 hover:text-[#0F7A45] font-bold transition-colors"
          >
            Sign in as System Admin (admin@greenpulse.demo)
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@greenpulse.demo"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm focus:border-[#0F7A45]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1.5">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm focus:border-[#0F7A45]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0F7A45] hover:bg-[#166534] text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <LogIn className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-200">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#0F7A45] font-extrabold hover:underline">
            Register as Citizen
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
