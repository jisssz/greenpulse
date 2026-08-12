import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, PlusCircle, Award, AlertTriangle, CheckCircle2, Clock, MapPin, ArrowRight, Shield, Activity, TrendingUp, Compass, UserCheck, Camera, BarChart2 } from 'lucide-react';
import HotspotMap from '../components/HotspotMap';
import api from '../services/api';

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

  const totalCount = reports.length || 248;
  const resolvedCount = reports.filter(r => r.status === 'RESOLVED').length || 176;
  const pendingCount = reports.filter(r => r.status === 'REPORTED' || r.status === 'IN_PROGRESS' || r.status === 'TRIAGED').length || 72;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0F7A45] via-[#166534] to-[#22C55E] text-white p-8 sm:p-10 shadow-lg">
        {/* Background Decorative Plant Accents */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-emerald-200 to-transparent"></div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide text-emerald-100">
            <Leaf className="w-3.5 h-3.5 text-emerald-200" /> Civic Eco Portal Active
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            A Cleaner Tomorrow, Together
          </h1>
          <p className="text-sm text-emerald-100 font-medium">
            Report environmental issues, track progress in real-time, and build a greener, safer community.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/reports/new"
              className="px-5 py-2.5 rounded-xl bg-white text-[#0F7A45] font-extrabold text-sm shadow-md hover:bg-emerald-50 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> New Report
            </Link>
            <Link
              to="/rewards"
              className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-emerald-200" /> View My Rewards
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card rounded-2xl p-5 border border-emerald-950/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Reports</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0F7A45] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{totalCount}</span>
            <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-0.5">
              ▲ 12% <span className="text-[10px] font-medium text-slate-400">vs last week</span>
            </span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-emerald-950/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Resolved</span>
            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{resolvedCount}</span>
            <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-0.5">
              ▲ 18% <span className="text-[10px] font-medium text-slate-400">vs last week</span>
            </span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-emerald-950/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{pendingCount}</span>
            <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-0.5">
              ▼ 6% <span className="text-[10px] font-medium text-slate-400">vs last week</span>
            </span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-emerald-950/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Impact Score</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0F7A45] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">8.6<span className="text-sm font-semibold text-slate-400">/10</span></span>
            <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-0.5">
              ▲ 14% <span className="text-[10px] font-medium text-slate-400">vs last week</span>
            </span>
          </div>
        </div>

      </div>

      {/* 3 Column Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Column 1: Recent Reports (4 cols) */}
        <div className="lg:col-span-4 glass-card rounded-3xl p-5 border border-emerald-950/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900">Recent Reports</h3>
            <Link to="/reports" className="text-xs font-bold text-[#0F7A45] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {reports.slice(0, 4).map(report => (
              <Link
                key={report.id}
                to={`/reports/${report.id}`}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 transition-all flex items-start gap-3 group block"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 group-hover:border-emerald-300">
                  <Leaf className="w-5 h-5 text-[#0F7A45]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#0F7A45]">{report.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${report.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{report.locationText || 'Thrissur, Kerala'}</p>
                </div>
              </Link>
            ))}

            {reports.length === 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0F7A45] flex items-center justify-center font-bold">♻️</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Plastic Waste Accumulation</h4>
                    <p className="text-[11px] text-slate-500">Kochi, Kerala • 2h ago</p>
                  </div>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-700">Resolved</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">⚠️</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Illegal Dumping</h4>
                    <p className="text-[11px] text-slate-500">Thrissur, Kerala • 6h ago</p>
                  </div>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">Pending</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Live Environmental Map (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-5 border border-emerald-950/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span> Live Environmental Map
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Resolved</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending</span>
            </div>
          </div>

          <div className="h-[280px] rounded-2xl overflow-hidden border border-slate-200 relative">
            <HotspotMap reports={reports} />
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-sm z-20">
              <MapPin className="w-3.5 h-3.5 text-[#0F7A45]" /> Thrissur, Kerala
            </div>
          </div>
        </div>

        {/* Column 3: Trend & Quick Actions (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Trend Card */}
          <div className="glass-card rounded-3xl p-5 border border-emerald-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#0F7A45]" /> Environmental Trend
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-[#0F7A45]">▲ 22%</span>
            </div>
            
            {/* Simple Bar Visualization */}
            <div className="flex items-end justify-between gap-2 h-24 pt-2">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-emerald-700/80 rounded-t-lg h-[40%]"></div>
                <span className="text-[10px] text-slate-400 font-bold">May</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-emerald-700/80 rounded-t-lg h-[55%]"></div>
                <span className="text-[10px] text-slate-400 font-bold">Jun</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-emerald-700/80 rounded-t-lg h-[65%]"></div>
                <span className="text-[10px] text-slate-400 font-bold">Jul</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#0F7A45] rounded-t-lg h-[90%] shadow-sm"></div>
                <span className="text-[10px] text-[#0F7A45] font-extrabold">Aug</span>
              </div>
            </div>
          </div>

          {/* Impact Banner Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-tr from-emerald-50 to-green-100/80 border border-emerald-200/60 space-y-2">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-[#0F7A45]" />
              <h4 className="text-xs font-black text-slate-900">Make an Impact!</h4>
            </div>
            <p className="text-[11px] text-slate-600">Small actions. Big change. Report issues, help keep Kerala green.</p>
            <Link
              to="/reports/new"
              className="w-full py-2 bg-[#0F7A45] hover:bg-[#166534] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};

export default CitizenDashboard;
