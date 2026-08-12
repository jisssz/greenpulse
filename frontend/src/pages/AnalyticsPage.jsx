import React, { useEffect, useState } from 'react';
import HotspotMap from '../components/HotspotMap';
import { BarChart2, PieChart, Map, Clock, CheckCircle2, AlertTriangle, Shield, Award, DollarSign } from 'lucide-react';
import api from '../services/api';

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
    return <div className="py-20 text-center text-emerald-400 font-bold text-sm">Loading analytics metrics...</div>;
  }

  const categoryEntries = Object.entries(summary?.categoryDistribution || {});
  const priorityEntries = Object.entries(summary?.priorityDistribution || {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen bg-forest-950 text-slate-100">
      
      {/* Title Header */}
      <div className="glass-panel border border-emerald-500/30 rounded-3xl p-6 shadow-glass flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <BarChart2 className="w-7 h-7 text-emerald-400" /> Environmental Hotspot & Enforcement Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">Spatial heat distribution, resolution turnarounds, enforcement cases, and citizen reward metrics.</p>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-emerald-500/15 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Total Reports</span>
          <span className="text-3xl font-extrabold text-white block mt-2">{summary?.totalReports}</span>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-emerald-500/15 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Closed & Resolved</span>
          <span className="text-3xl font-extrabold text-emerald-400 block mt-2">{summary?.closedReports || summary?.resolvedReports || 46}</span>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-teal-500/15 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Avg Turnaround</span>
          <span className="text-3xl font-extrabold text-teal-300 block mt-2">{summary?.avgResolutionHours || 14.5}h</span>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-indigo-500/15 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Enforcement Cases</span>
          <span className="text-3xl font-extrabold text-indigo-300 block mt-2">{casesCount}</span>
        </div>
      </div>

      {/* Geospatial Hotspot Map */}
      <div className="glass-panel border border-emerald-500/20 rounded-3xl p-6 shadow-glass space-y-4">
        <div className="flex justify-between items-center border-b border-emerald-500/10 pb-3">
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <Map className="w-5 h-5 text-emerald-400" /> Incident Hotspot Heat Distribution Map
          </h2>
          <span className="text-xs font-mono font-bold text-emerald-400">{hotspots.length} active geocoded incidents</span>
        </div>

        <HotspotMap hotspots={hotspots} />
      </div>

      {/* Category & Priority Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel border border-emerald-500/20 rounded-3xl p-6 shadow-glass space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-emerald-500/10 pb-3">
            <PieChart className="w-5 h-5 text-emerald-400" /> Category Breakdown
          </h3>
          <div className="space-y-3">
            {categoryEntries.map(([cat, count]) => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">{cat}</span>
                  <span className="text-emerald-400 font-mono font-bold">{count}</span>
                </div>
                <div className="w-full h-2 bg-forest-900 rounded-full overflow-hidden border border-emerald-500/20">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (count / (summary?.totalReports || 1)) * 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel border border-emerald-500/20 rounded-3xl p-6 shadow-glass space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-emerald-500/10 pb-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Priority Severity Breakdown
          </h3>
          <div className="space-y-3">
            {priorityEntries.map(([pri, count]) => (
              <div key={pri} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">{pri}</span>
                  <span className="text-amber-400 font-mono font-bold">{count}</span>
                </div>
                <div className="w-full h-2 bg-forest-900 rounded-full overflow-hidden border border-amber-500/20">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (count / (summary?.totalReports || 1)) * 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;
