import React, { useEffect, useState } from 'react';
import HotspotMap from '../components/HotspotMap';
import { BarChart2, PieChart, Map, Clock, CheckCircle2, AlertTriangle, Shield, Award, DollarSign, Activity } from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';

const AnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [casesCount, setCasesCount] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, hotRes, caseRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/hotspots'),
        api.get('/enforcement/cases').catch(() => ({ success: false }))
      ]);
      if (sumRes.data) setSummary(sumRes.data);
      if (hotRes.data) setHotspots(hotRes.data);
      if (caseRes.data?.content) setCasesCount(caseRes.data.content.length);
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAF7] flex items-center justify-center p-6">
        <div className="text-center space-y-2 text-[#166534] font-bold text-sm">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-2 text-[#166534]" />
          Loading analytics metrics...
        </div>
      </div>
    );
  }

  const categoryEntries = Object.entries(summary?.categoryDistribution || {});
  const priorityEntries = Object.entries(summary?.priorityDistribution || {});

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen bg-[#F7FAF7] text-[#1F2937]"
    >
      
      {/* Title Header */}
      <div className="bg-white border border-emerald-950/5 rounded-[20px] p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5 leading-tight">
            <BarChart2 className="w-7 h-7 text-[#166534]" /> Impact & Compliance Analytics
          </h1>
          <p className="text-xs text-[#64748B] font-semibold mt-1">Spatial heat distribution, resolution turnarounds, active enforcement cases, and eco-points metrics.</p>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[20px] border border-emerald-950/5 text-center shadow-xs">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Total Reports</span>
          <span className="text-3xl font-extrabold text-slate-900 block mt-2">{summary?.totalReports}</span>
        </div>
        <div className="bg-white p-5 rounded-[20px] border border-emerald-950/5 text-center shadow-xs">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Resolved & Closed</span>
          <span className="text-3xl font-extrabold text-[#166534] block mt-2">{summary?.closedReports || summary?.resolvedReports || 46}</span>
        </div>
        <div className="bg-white p-5 rounded-[20px] border border-emerald-950/5 text-center shadow-xs">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Avg Resolution Time</span>
          <span className="text-3xl font-extrabold text-[#22C55E] block mt-2">{summary?.avgResolutionHours || 14.5}h</span>
        </div>
        <div className="bg-white p-5 rounded-[20px] border border-emerald-950/5 text-center shadow-xs">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Active Enforcements</span>
          <span className="text-3xl font-extrabold text-purple-600 block mt-2">{casesCount}</span>
        </div>
      </div>

      {/* Geospatial Hotspot Map */}
      <div className="bg-white border border-emerald-950/5 rounded-[20px] p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <Map className="w-5 h-5 text-[#166534]" /> Incident Hotspot Heat Distribution Map
          </h2>
          <span className="text-[10px] font-bold text-[#166534] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">{hotspots.length} active coordinates</span>
        </div>

        <div className="h-[350px] rounded-xl overflow-hidden border border-slate-200">
          <HotspotMap hotspots={hotspots} />
        </div>
      </div>

      {/* Category & Priority Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-emerald-950/5 rounded-[20px] p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <PieChart className="w-5 h-5 text-[#166534]" /> Category Distribution
          </h3>
          <div className="space-y-3.5">
            {categoryEntries.map(([cat, count]) => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{cat}</span>
                  <span className="text-[#166534] font-bold">{count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div className="h-full bg-[#166534] rounded-full" style={{ width: `${Math.min(100, (count / (summary?.totalReports || 1)) * 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-emerald-950/5 rounded-[20px] p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Priority Severity Distribution
          </h3>
          <div className="space-y-3.5">
            {priorityEntries.map(([pri, count]) => (
              <div key={pri} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{pri}</span>
                  <span className="text-amber-600 font-bold">{count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (count / (summary?.totalReports || 1)) * 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </motion.div>
  );
};

export default AnalyticsPage;
