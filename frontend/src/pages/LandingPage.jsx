import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, CheckCircle2, ArrowRight, Activity, Users, AlertTriangle, Sparkles } from 'lucide-react';
import api from '../services/api';

const LandingPage = () => {
  const [stats, setStats] = useState({ totalReports: 52, resolvedReports: 46, activeCitizens: 18, avgResolutionHours: 14.5 });

  useEffect(() => {
    api.get('/analytics/summary')
      .then(res => {
        if (res.data) setStats(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-slate-900 to-slate-900 text-white pt-20 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4" /> Next-Gen Civic Environmental Issue Management
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Report. Verify. Resolve. <br />
            <span className="bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Improve Your Environment.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal">
            GreenPulse connects citizens, environmental moderators, and municipal field workers through verified reports, transparent operational workflows, and real-time hotspot analytics.
          </p>

          <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
            <Link
              to="/reports/new"
              className="px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 group"
            >
              Report Environmental Issue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/analytics"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-brand-400" /> Explore Environmental Hotspots
            </Link>
          </div>

          {/* Platform Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-center">
              <span className="block text-2xl font-extrabold text-white">{stats.totalReports}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Issues Reported</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-center">
              <span className="block text-2xl font-extrabold text-brand-400">{stats.resolvedReports || stats.closedReports || 46}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Issues Resolved</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-center">
              <span className="block text-2xl font-extrabold text-emerald-300">{stats.avgResolutionHours || 14.5}h</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Resolution Time</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-center">
              <span className="block text-2xl font-extrabold text-white">{stats.activeCitizens || 18}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Community Members</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Workflow */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">Accountable Lifecycle</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">How GreenPulse Solves Civic Environmental Bottlenecks</h3>
            <p className="text-slate-600 mt-3 text-sm">Unlike simple submission forms, GreenPulse enforces verification, priority triage, field evidence, and citizen resolution confirmation.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-extrabold mb-4">1</div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">1. Citizen Reports</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Citizens pin precise GPS locations, upload initial photo evidence, select waste categories, and submit reports.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold mb-4">2</div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">2. Moderator Triage</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Moderators verify authenticity, screen duplicate reports nearby, assign priority levels, and dispatch field crews.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold mb-4">3</div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">3. Field Resolution</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Sanitation crews accept tasks, execute cleanup, and upload mandatory AFTER photo evidence to mark work completed.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold mb-4">4</div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">4. Citizen Verification</h4>
              <p className="text-xs text-slate-600 leading-relaxed">The original citizen confirms whether the issue was actually solved before the report transitions to CLOSED status.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 GreenPulse — Civic Environmental Issue Reporting & Monitoring System. Full-Stack Portfolio Engineering Project.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
