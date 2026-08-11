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
    return <div className="py-20 text-center text-slate-400 font-bold text-sm">Loading analytics metrics...</div>;
  }

  const categoryEntries = Object.entries(summary?.categoryDistribution || {});
  const priorityEntries = Object.entries(summary?.priorityDistribution || {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-emerald-600" /> Environmental Hotspot & Enforcement Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">Spatial heat distribution, resolution turnarounds, enforcement cases, and citizen reward metrics.</p>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Reports</span>
          <span className="text-3xl font-extrabold text-slate-900 block mt-2">{summary?.totalReports}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Resolution Rate</span>
          <span className="text-3xl font-extrabold text-emerald-600 block mt-2">{summary?.resolutionRate}%</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Enforcement Cases</span>
          <span className="text-3xl font-extrabold text-indigo-600 block mt-2">{casesCount} Active</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Citizen Rewards Paid</span>
          <span className="text-3xl font-extrabold text-amber-600 block mt-2">₹500</span>
        </div>
      </div>

      {/* Hotspot Spatial Map */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Map className="w-5 h-5 text-brand-600" /> Interactive Environmental Hotspot Map
          </h2>
          <span className="text-xs font-bold text-slate-500">{hotspots.length} geocoded incidents</span>
        </div>
        <HotspotMap hotspots={hotspots} />
      </div>

      {/* Category Breakdown & Priority Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-600" /> Reports by Category
          </h3>
          <div className="space-y-3">
            {categoryEntries.map(([cat, count]) => {
              const pct = summary?.totalReports > 0 ? Math.round((count / summary.totalReports) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{cat}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Priority Distribution
          </h3>
          <div className="space-y-3">
            {priorityEntries.map(([prio, count]) => {
              const pct = summary?.totalReports > 0 ? Math.round((count / summary.totalReports) * 100) : 0;
              return (
                <div key={prio} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{prio}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${prio === 'CRITICAL' ? 'bg-rose-600' : prio === 'HIGH' ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AnalyticsPage;
