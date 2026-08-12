import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Shield, Award, MapPin, ArrowRight, CheckCircle, Activity, Users, Globe } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAF7] text-slate-800 space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Soft Background Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-[#0F7A45] shadow-2xs">
            <Leaf className="w-4 h-4 text-[#0F7A45]" /> Next-Gen Civic Environmental Tech
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            A Cleaner Tomorrow, <span className="text-[#0F7A45]">Together</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Report environmental issues, track progress in real-time, and build a greener community with official municipal enforcement.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/login"
              className="px-8 py-4 bg-[#0F7A45] hover:bg-[#166534] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-900/10 hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <Leaf className="w-4 h-4" /> Try GreenPulse Demo
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center gap-2"
            >
              Register as Citizen <ArrowRight className="w-4 h-4 text-[#0F7A45]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-card rounded-3xl p-8 border border-emerald-950/10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0F7A45] flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Geo-Tagged Reporting</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Capture GPS coordinates, evidence photos, and category details instantly for precise municipal action.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-emerald-950/10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0F7A45] flex items-center justify-center font-bold">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Enforcement Workflow</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Triage queue for moderators, field worker resolution, and authority officer fine issuance.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-emerald-950/10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0F7A45] flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Citizen Rewards</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Earn Eco-Points for verified environmental contributions and redeem community perks.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;
