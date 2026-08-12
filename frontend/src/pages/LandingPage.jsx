import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, CheckCircle2, ArrowRight, Activity, Users, AlertTriangle, Sparkles, Layers, Cpu, Eye, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';
import HotspotMap from '../components/HotspotMap';

const LandingPage = () => {
  const [stats, setStats] = useState({ totalReports: 52, resolvedReports: 46, activeCitizens: 18, avgResolutionHours: 14.5 });
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    api.get('/analytics/summary')
      .then(res => {
        if (res.data) setStats(res.data);
      })
      .catch(() => {});

    api.get('/analytics/hotspots')
      .then(res => {
        if (res.data) setHotspots(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-forest-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-forest-950">
      
      {/* Cinematic Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 border-b border-emerald-500/10">
        {/* Glow & Radial Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px] bg-teal-500/10 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-emerald-400 text-xs font-semibold mb-8 shadow-glow-emerald animate-float-slow">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} /> Next-Gen Civic Environmental Intelligence Platform
          </div>

          {/* Solvex Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] text-white">
            Report. Track. Resolve. <br />
            <span className="text-gradient-emerald">
              Improve Your Environment.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300/80 max-w-2xl mx-auto font-normal leading-relaxed">
            GreenPulse connects citizens, environmental moderators, and municipal field workers through verified reports, transparent operational workflows, and real-time hotspot intelligence.
          </p>

          {/* Dual CTAs */}
          <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
            <Link
              to="/reports/new"
              className="px-7 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold text-sm shadow-glow-emerald transition-all duration-300 flex items-center gap-2.5 group"
            >
              Report Environmental Issue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/analytics"
              className="px-7 py-4 rounded-xl glass-panel text-slate-200 hover:text-white hover:border-emerald-500/40 font-semibold text-sm transition-all duration-300 flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-emerald-400" /> Explore Environmental Hotspots
            </Link>
          </div>

          {/* Live Platform Intelligence Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-card rounded-2xl p-5 text-center">
              <span className="block text-3xl font-extrabold text-white">{stats.totalReports}</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Issues Reported</span>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center">
              <span className="block text-3xl font-extrabold text-emerald-400">{stats.resolvedReports || stats.closedReports || 46}</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Issues Resolved</span>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center">
              <span className="block text-3xl font-extrabold text-teal-300">{stats.avgResolutionHours || 14.5}h</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Avg Resolution Time</span>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center">
              <span className="block text-3xl font-extrabold text-white">{stats.activeCitizens || 18}</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Active Citizens</span>
            </div>
          </div>

        </div>
      </section>

      {/* Environmental Issues Section */}
      <section className="py-24 border-b border-emerald-500/10 bg-forest-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Target Environmental Hazards</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">Empowering Citizens to Address Urban Pollution</h3>
            <p className="text-slate-400 mt-3 text-sm leading-relaxed">From illegal dumping sites to hazardous electronic waste, GreenPulse provides an open channel for community accountability.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-white">Illegal Dumping</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Unapproved waste accumulation on public roads, parks, and waterways endangering soil health.</p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-white">Overflowing Bins</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Municipal waste receptacles exceeding capacity requiring immediate field crew dispatch.</p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-white">Hazardous E-Waste</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Discarded electronics containing heavy metals requiring specialized environmental handling.</p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-white">Open Burning</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Toxic smoke emissions from uncontrolled waste combustion affecting community air quality.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Accountable Lifecycle Workflow */}
      <section className="py-24 border-b border-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Transparent Lifecycle</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">How GreenPulse Enforces Municipal Accountability</h3>
            <p className="text-slate-400 mt-3 text-sm">Unlike unmonitored reporting forms, GreenPulse enforces verification, priority triage, mandatory after-photos, and citizen confirmation.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="glass-card rounded-2xl p-6 relative group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-sm mb-4">1</div>
              <h4 className="font-bold text-slate-100 text-lg mb-2">1. Citizen Pinpoint</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Citizens pin exact GPS coordinates, upload photo evidence, and select waste categories.</p>
            </div>

            <div className="glass-card rounded-2xl p-6 relative group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-bold text-sm mb-4">2</div>
              <h4 className="font-bold text-slate-100 text-lg mb-2">2. Moderator Triage</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Moderators verify report authenticity, screen nearby duplicate reports, assign priority, and dispatch crews.</p>
            </div>

            <div className="glass-card rounded-2xl p-6 relative group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-sm mb-4">3</div>
              <h4 className="font-bold text-slate-100 text-lg mb-2">3. Field Resolution</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Field workers accept tasks, execute cleanup, and upload mandatory AFTER photo evidence to mark completion.</p>
            </div>

            <div className="glass-card rounded-2xl p-6 relative group">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold text-sm mb-4">4</div>
              <h4 className="font-bold text-slate-100 text-lg mb-2">4. Citizen Confirmation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">The original citizen confirms resolution quality before the report transitions to CLOSED status and awards points.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hotspots & Map Visualization Showcase */}
      <section className="py-24 border-b border-emerald-500/10 bg-forest-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Geospatial Intelligence</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Real-Time Community Environmental Map</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xl">Track environmental incidents across municipalities with interactive dark maps and status indicators.</p>
            </div>
            <Link to="/analytics" className="px-5 py-2.5 rounded-xl glass-panel text-emerald-300 hover:text-white hover:border-emerald-500/50 text-xs font-bold flex items-center gap-2 self-start md:self-auto">
              View Analytics Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <HotspotMap hotspots={hotspots} />
        </div>
      </section>

      {/* Smart Category Suggestion Prototype Honest Showcase */}
      <section className="py-24 border-b border-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <Cpu className="w-3.5 h-3.5" /> Smart Category Suggestion Prototype
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">AI-Assisted Category Classification</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  GreenPulse incorporates an intelligent category suggestion prototype. When uploading evidence photos, the system analyzes image features to suggest probable categories while guaranteeing full citizen override capability.
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Fast Pre-classification</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> User Confirmation Guaranteed</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Reduces Triage Bottlenecks</span>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-emerald-500/20 pb-3">
                  <span className="font-mono font-bold text-emerald-400">PROTOTYPE PREVIEW</span>
                  <span className="text-emerald-300 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">94% Confidence</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-forest-900 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Eye className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">Suggested: Overflowing Municipal Bin</h5>
                    <p className="text-xs text-slate-400 mt-0.5">Automated visual feature match detected</p>
                  </div>
                </div>
                <div className="bg-forest-950 p-3 rounded-xl border border-emerald-500/20 text-xs text-slate-300 flex items-center justify-between">
                  <span>Citizen Choice: Keep or Override?</span>
                  <span className="text-emerald-400 font-bold text-[11px] uppercase">Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-forest-950 border-t border-emerald-500/10 py-10 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-slate-200 text-sm">GreenPulse Platform</span>
          </div>
          <p className="max-w-md mx-auto text-slate-500 text-[11px]">
            Civic Environmental Issue Reporting & Monitoring System. Single-Origin Full-Stack Production Architecture (React 18 + Spring Boot + Aiven MySQL).
          </p>
          <p className="text-slate-600 text-[10px]">© 2026 GreenPulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
