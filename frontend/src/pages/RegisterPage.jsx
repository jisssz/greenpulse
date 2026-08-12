import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, User, Mail, Key, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (name.length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, phone, role: 'CITIZEN' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-tr from-[#F0FDF4] via-[#F7FAF7] to-[#DCFCE7] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Soft Ambient Eco Glow */}
      <div className="eco-glow top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white border border-emerald-950/5 rounded-3xl p-8 space-y-6 shadow-md relative z-10"
      >
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#166534] rounded-2xl mx-auto flex items-center justify-center shadow-xs p-0.5">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Citizen Account</h2>
          <p className="text-xs text-[#64748B] font-semibold">Join the community in building a cleaner environment</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm focus:border-[#166534]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm focus:border-[#166534]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0192"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm focus:border-[#166534]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Password</label>
            <div className="relative">
              <Key className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={8}
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
            {loading ? 'Creating Account...' : 'Register'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#64748B] pt-2 border-t border-slate-200">
          Already have an account?{' '}
          <Link to="/login" className="text-[#166534] font-extrabold hover:underline">
            Sign in
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default RegisterPage;
