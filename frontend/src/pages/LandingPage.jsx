import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, ShieldCheck, Award, MapPin, CheckCircle, BarChart3, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F7FAF7] text-[#1F2937] overflow-hidden pb-24">
      {/* Soft Ambient Eco Glows */}
      <div className="eco-glow top-0 right-0 translate-x-1/3 -translate-y-1/3"></div>
      <div className="eco-glow-subtle bottom-0 left-0 -translate-x-1/3 translate-y-1/3"></div>

      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Text & CTAs */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DCFCE7] border border-emerald-200 text-xs font-extrabold text-[#166534] shadow-2xs">
              <Leaf className="w-3.5 h-3.5 text-[#166534]" /> Next-Gen Civic Environmental SaaS
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Building a <br className="hidden sm:inline" />
              <span className="text-[#166534]">Cleaner Tomorrow</span> <br />
              Together
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] font-medium leading-relaxed max-w-xl">
              GreenPulse connects citizens, authorities, and environmental teams to report, monitor, and resolve civic environmental issues.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/login"
                className="px-6 py-3.5 bg-[#166534] hover:bg-[#15803d] text-white font-extrabold text-sm rounded-xl shadow-sm hover:scale-[1.01] transition-all flex items-center gap-2"
              >
                Report an Issue <PlusCircleIcon className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-[#1F2937] font-extrabold text-sm rounded-xl border border-slate-200 shadow-2xs hover:scale-[1.01] transition-all flex items-center gap-2"
              >
                Explore Dashboard <ArrowRight className="w-4 h-4 text-[#166534]" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Premium SVG Illustration & Impact Cards */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-6 relative flex items-center justify-center min-h-[400px]"
          >
            {/* SVG Eco-Tech Illustration */}
            <svg viewBox="0 0 500 400" className="w-full max-w-[480px] drop-shadow-md z-0" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Background hills */}
              <path d="M 0 350 Q 150 280 300 330 T 500 350 L 500 400 L 0 400 Z" fill="#E8F5E9" />
              <path d="M 100 360 Q 250 310 400 350 T 500 370 L 500 400 L 100 400 Z" fill="#C8E6C9" opacity="0.7" />
              
              {/* Solar Panels */}
              <rect x="80" y="280" width="40" height="25" rx="2" fill="#374151" transform="skewX(-15)" />
              <line x1="88" y1="280" x2="88" y2="305" stroke="#9CA3AF" strokeWidth="1" transform="skewX(-15)" />
              <line x1="98" y1="280" x2="98" y2="305" stroke="#9CA3AF" strokeWidth="1" transform="skewX(-15)" />
              <line x1="108" y1="280" x2="108" y2="305" stroke="#9CA3AF" strokeWidth="1" transform="skewX(-15)" />
              
              {/* Wind Turbine */}
              <line x1="380" y1="330" x2="380" y2="200" stroke="#9CA3AF" strokeWidth="3" />
              <circle cx="380" cy="200" r="6" fill="#6B7280" />
              <path d="M 380 200 L 330 180 M 380 200 L 410 160 M 380 200 L 390 250" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
              
              {/* Buildings */}
              <rect x="180" y="160" width="50" height="150" rx="4" fill="#E2E8F0" />
              <rect x="190" y="175" width="8" height="12" rx="1" fill="#FFFFFF" />
              <rect x="212" y="175" width="8" height="12" rx="1" fill="#FFFFFF" />
              <rect x="190" y="200" width="8" height="12" rx="1" fill="#FFFFFF" />
              <rect x="212" y="200" width="8" height="12" rx="1" fill="#FFFFFF" />
              <rect x="190" y="225" width="8" height="12" rx="1" fill="#FFFFFF" />
              <rect x="212" y="225" width="8" height="12" rx="1" fill="#FFFFFF" />
              
              {/* Green Roof Building */}
              <rect x="250" y="200" width="70" height="110" rx="4" fill="#F1F5F9" />
              <path d="M 245 200 L 325 200 L 285 180 Z" fill="#166534" />
              <rect x="265" y="220" width="12" height="16" rx="1" fill="#BAF3E6" />
              <rect x="293" y="220" width="12" height="16" rx="1" fill="#BAF3E6" />
              
              {/* Modern eco trees */}
              <circle cx="150" cy="300" r="25" fill="#22C55E" opacity="0.85" />
              <line x1="150" y1="300" x2="150" y2="340" stroke="#78350F" strokeWidth="3" />
              <circle cx="320" cy="310" r="20" fill="#15803D" opacity="0.9" />
              <line x1="320" y1="310" x2="320" y2="345" stroke="#78350F" strokeWidth="2.5" />
            </svg>

            {/* Overlapping Floating Impact Cards */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-950/5 shadow-md flex items-center gap-3 animate-float-slow">
              <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase">Resolved Issues</div>
                <div className="text-lg font-black text-[#1F2937]">176 Bins Cleaned</div>
              </div>
            </div>

            <div className="absolute bottom-8 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-950/5 shadow-md flex items-center gap-3 animate-float-slow [animation-delay:2s]">
              <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase">Environmental Score</div>
                <div className="text-lg font-black text-[#1F2937]">8.6 / 10</div>
              </div>
            </div>

            <div className="absolute top-1/2 right-0 -translate-y-1/2 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-950/5 shadow-md flex items-center gap-3 animate-float-slow [animation-delay:4s]">
              <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase">Active Volunteers</div>
                <div className="text-lg font-black text-[#1F2937]">248 Citizens</div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-card rounded-2xl p-8 border border-emerald-950/5 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#1F2937]">Geo-Tagged Incident Map</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Capture GPS coordinates, evidence photos, and category details instantly for precise municipal action.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 border border-emerald-950/5 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#1F2937]">Compliance Workflow</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Triage queue for moderators, field worker resolution, and authority officer fine issuance.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 border border-emerald-950/5 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#1F2937]">Eco Contribution Rewards</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Earn Eco-Points for verified environmental contributions and redeem community perks.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

// Simple inline SVG plus icon helper
const PlusCircleIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default LandingPage;
