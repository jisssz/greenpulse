import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogIn, Key, Mail, ShieldAlert, User, Wrench, Shield, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-tr from-[#F0FDF4] via-[#F7FAF7] to-[#DCFCE7] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Soft Ambient Eco Glow */}
      <div className="eco-glow top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full bg-white border border-emerald-950/5 rounded-3xl p-8 space-y-6 shadow-md relative z-10"
      >
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <motion.div 
            animate={{ rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="w-12 h-12 bg-[#166534] rounded-2xl mx-auto flex items-center justify-center shadow-xs p-0.5"
          >
            <Leaf className="w-6 h-6 text-white" />
          </motion.div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back to GreenPulse</h2>
          <p className="text-xs text-[#64748B] font-semibold">Civic Environmental Reporting & Enforcement Platform</p>
        </div>

        {/* Quick Demo Login Grid */}
        <div className="bg-[#F7FAF7] rounded-2xl p-5 space-y-3.5 border border-emerald-900/10">
          <div className="flex items-center justify-center gap-1.5 text-[#166534]">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Quick Demo Access</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button 
              type="button" 
              onClick={() => handleDemoLogin('citizen@greenpulse.demo')} 
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-[#DCFCE7]/40 border border-slate-100 hover:border-emerald-300 text-slate-800 hover:text-[#166534] transition-all shadow-2xs group"
            >
              <User className="w-5 h-5 text-[#166534] group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-bold">Citizen</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin('authority@greenpulse.demo')} 
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-[#DCFCE7]/40 border border-slate-100 hover:border-emerald-300 text-slate-800 hover:text-[#166534] transition-all shadow-2xs group"
            >
              <Shield className="w-5 h-5 text-[#166534] group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-bold">Authority</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin('moderator@greenpulse.demo')} 
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-[#DCFCE7]/40 border border-slate-100 hover:border-emerald-300 text-slate-800 hover:text-[#166534] transition-all shadow-2xs group"
            >
              <ShieldAlert className="w-5 h-5 text-indigo-600 group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-bold">Moderator</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin('worker@greenpulse.demo')} 
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-[#DCFCE7]/40 border border-slate-100 hover:border-emerald-300 text-slate-800 hover:text-[#166534] transition-all shadow-2xs group"
            >
              <Wrench className="w-5 h-5 text-amber-600 group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-bold">Worker</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin('admin@greenpulse.demo')} 
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-[#DCFCE7]/40 border border-slate-100 hover:border-emerald-300 text-slate-800 hover:text-[#166534] transition-all shadow-2xs group col-span-2 sm:col-span-1"
            >
              <ShieldCheck className="w-5 h-5 text-purple-600 group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-bold">Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#1F2937] block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@greenpulse.demo"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm focus:border-[#166534]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1F2937] block mb-1.5">Password</label>
            <div className="relative">
              <Key className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm focus:border-[#166534]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#166534] hover:bg-[#15803d] text-white font-extrabold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <LogIn className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#64748B] pt-2 border-t border-slate-200">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#166534] font-extrabold hover:underline">
            Register as Citizen
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default LoginPage;
