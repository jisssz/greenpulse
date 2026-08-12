import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, PlusCircle, Award, CheckCircle2, Clock, MapPin, ArrowRight, Activity, BarChart2, TrendingUp, HelpCircle } from 'lucide-react';
import HotspotMap from '../components/HotspotMap';
import api from '../services/api';
import { motion } from 'framer-motion';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports')
      .then(res => {
        if (res.data) {
          setReports(res.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Seeding Indian coordinates if database results are empty or SF-centered
  const displayReports = reports.length > 0 ? reports : [
    { id: 201, title: 'Severe Solid Waste Heap near Railway Gate', status: 'IN_PROGRESS', latitude: 10.5276, longitude: 76.2144, reportNumber: 'GP-IN-201', priority: 'HIGH', categoryName: 'Plastic Waste', address: 'Thrissur, Kerala, India', reporterEmail: user?.email },
    { id: 202, title: 'Illegal Waste Burning in Residential Zone', status: 'RESOLVED', latitude: 9.9312, longitude: 76.2673, reportNumber: 'GP-IN-202', priority: 'CRITICAL', categoryName: 'Air Pollution', address: 'Kochi, Kerala, India', reporterEmail: user?.email },
    { id: 203, title: 'Electronic Scrap Yard Blocking Lane', status: 'TRIAGED', latitude: 12.9716, longitude: 77.5946, reportNumber: 'GP-IN-203', priority: 'MEDIUM', categoryName: 'E-Waste', address: 'Bangalore, Karnataka, India', reporterEmail: user?.email },
    { id: 204, title: 'Toxic Chemical Sludge in Municipal Canal', status: 'RESOLVED', latitude: 19.0760, longitude: 72.8777, reportNumber: 'GP-IN-204', priority: 'HIGH', categoryName: 'Water Pollution', address: 'Mumbai, Maharashtra, India', reporterEmail: user?.email },
    { id: 205, title: 'Heavy Construction Debris on Wetlands', status: 'REPORTED', latitude: 10.5123, longitude: 76.2012, reportNumber: 'GP-IN-205', priority: 'LOW', categoryName: 'Construction Debris', address: 'Thrissur, Kerala, India', reporterEmail: user?.email }
  ];

  const totalCount = displayReports.length;
  const resolvedCount = displayReports.filter(r => r.status === 'RESOLVED').length;
  const pendingCount = displayReports.filter(r => r.status === 'REPORTED' || r.status === 'IN_PROGRESS' || r.status === 'TRIAGED').length;

  // Derive custom user-specific impact stats
  const citizenReportsCount = displayReports.filter(r => r.reporterEmail === user?.email || r.reporterEmail === 'citizen@greenpulse.demo').length;
  const citizenResolvedCount = displayReports.filter(r => (r.reporterEmail === user?.email || r.reporterEmail === 'citizen@greenpulse.demo') && r.status === 'RESOLVED').length;
  const wastePreventedKg = citizenReportsCount * 25 + 20;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      
      {/* Top Banner Hero Card */}
      <div className="relative rounded-[20px] overflow-hidden bg-gradient-to-r from-[#166534] via-[#15803d] to-[#22C55E] text-white p-8 sm:p-10 shadow-xs">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-[#DCFCE7] to-transparent"></div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide text-emerald-100">
            <Leaf className="w-3.5 h-3.5 text-emerald-200" /> Civic Eco Portal Active
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Good morning, {user?.name || 'Citizen'}
          </h1>
          <p className="text-sm text-emerald-100 font-medium">
            Monitor environmental compliance and community impact in your local neighborhood.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/reports/new"
              className="px-5 py-2.5 rounded-xl bg-white text-[#166534] font-extrabold text-sm shadow-sm hover:bg-[#DCFCE7]/90 hover:scale-[1.01] transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Report an Issue
            </Link>
            <Link
              to="/rewards"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-sm border border-white/20 hover:scale-[1.01] transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-emerald-200" /> View My Rewards
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B]">Total Reports</span>
            <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{totalCount}</span>
            <span className="text-xs font-extrabold text-[#22C55E] flex items-center gap-0.5">
              ▲ 12% <span className="text-[10px] font-medium text-slate-400">vs last week</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B]">Resolved</span>
            <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#22C55E] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{resolvedCount}</span>
            <span className="text-xs font-extrabold text-[#22C55E] flex items-center gap-0.5">
              ▲ 18% <span className="text-[10px] font-medium text-slate-400">vs last week</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B]">Pending</span>
            <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{pendingCount}</span>
            <span className="text-xs font-extrabold text-[#22C55E] flex items-center gap-0.5">
              ▼ 6% <span className="text-[10px] font-medium text-slate-400">vs last week</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B]">Impact Score</span>
            <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">8.6<span className="text-sm font-semibold text-slate-400">/10</span></span>
            <span className="text-xs font-extrabold text-[#22C55E] flex items-center gap-0.5">
              ▲ 14% <span className="text-[10px] font-medium text-slate-400">vs last week</span>
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Column 1: Recent Reports (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900">Recent Reports</h3>
            <span className="text-[10px] font-bold text-[#166534] uppercase bg-[#DCFCE7] px-2 py-0.5 rounded-full">Community Logs</span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {displayReports.slice(0, 5).map(report => (
              <Link
                key={report.id}
                to={`/reports/${report.id}`}
                className="p-3 rounded-xl bg-slate-50 hover:bg-[#DCFCE7]/20 border border-slate-100 hover:border-emerald-200 transition-all flex items-start gap-3 group block"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 group-hover:border-emerald-300">
                  <Leaf className="w-4 h-4 text-[#166534]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-extrabold text-slate-900 truncate group-hover:text-[#166534]">{report.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${report.status === 'RESOLVED' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-amber-100 text-amber-800'}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#64748B] truncate mt-0.5">{report.address || 'Thrissur, Kerala, India'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 2: Live Environmental Map (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping"></span> Live Environmental Map
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#64748B]">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> Resolved</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending</span>
            </div>
          </div>

          <div className="h-[300px] rounded-xl overflow-hidden border border-slate-200 relative">
            <HotspotMap reports={displayReports} />
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-800 flex items-center gap-1.5 shadow-sm z-20">
              <MapPin className="w-3.5 h-3.5 text-[#166534]" /> Active View: India
            </div>
          </div>
        </div>

        {/* Column 3: Your Impact & Trend (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Your Impact Card */}
          <div className="bg-gradient-to-tr from-emerald-50 to-[#DCFCE7]/70 rounded-[20px] p-5 border border-emerald-200/50 space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-[#166534]" />
              <h3 className="text-sm font-extrabold text-slate-900">Your Impact</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white/80 rounded-xl p-3 border border-emerald-100 flex items-center justify-between">
                <span className="text-xs text-[#64748B] font-bold">Reports Submitted</span>
                <span className="text-base font-extrabold text-[#166534]">{citizenReportsCount}</span>
              </div>
              <div className="bg-white/80 rounded-xl p-3 border border-emerald-100 flex items-center justify-between">
                <span className="text-xs text-[#64748B] font-bold">Issues Resolved</span>
                <span className="text-base font-extrabold text-[#22C55E]">{citizenResolvedCount}</span>
              </div>
              <div className="bg-white/80 rounded-xl p-3 border border-emerald-100 flex items-center justify-between">
                <span className="text-xs text-[#64748B] font-bold">Waste Prevented</span>
                <span className="text-base font-extrabold text-[#166534]">{wastePreventedKg} kg</span>
              </div>
            </div>
          </div>

          {/* Trend Card */}
          <div className="bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#166534]" /> Environmental Trend
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#DCFCE7] text-[#166534]">▲ 22%</span>
            </div>
            
            {/* Simple Bar Visualization */}
            <div className="flex items-end justify-between gap-2 h-20 pt-2">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-emerald-700/80 rounded-t-lg h-[40%]"></div>
                <span className="text-[9px] text-[#64748B] font-bold">May</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-emerald-700/80 rounded-t-lg h-[55%]"></div>
                <span className="text-[9px] text-[#64748B] font-bold">Jun</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-emerald-700/80 rounded-t-lg h-[65%]"></div>
                <span className="text-[9px] text-[#64748B] font-bold">Jul</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#166534] rounded-t-lg h-[90%] shadow-2xs"></div>
                <span className="text-[9px] text-[#166534] font-extrabold">Aug</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
};

export default CitizenDashboard;
