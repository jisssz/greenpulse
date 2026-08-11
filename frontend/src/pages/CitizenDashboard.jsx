import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, FileText, CheckCircle2, Clock, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import api from '../services/api';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/my?page=0&size=20');
      if (res.success && res.data) {
        setReports(res.data.content || []);
      }
    } catch (e) {
      console.error('Failed to load reports', e);
    } finally {
      setLoading(false);
    }
  };

  const total = reports.length;
  const active = reports.filter(r => r.status !== 'CLOSED' && r.status !== 'REJECTED').length;
  const resolved = reports.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED').length;
  const pendingVerification = reports.filter(r => r.status === 'RESOLVED' || r.status === 'RESOLUTION_VERIFICATION').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome back, {user?.name}</h1>
          <p className="text-xs text-slate-500 mt-1">Track your submitted environmental issues and verify completed resolutions.</p>
        </div>
        <Link
          to="/reports/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Report Environmental Issue
        </Link>
      </div>

      {/* Verification Warning Alert */}
      {pendingVerification > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-amber-900">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Resolution Verification Required</h4>
              <p className="text-xs text-amber-700">You have {pendingVerification} issue(s) marked resolved by field workers awaiting your final confirmation.</p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reports</span>
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-3xl font-extrabold text-slate-900 block mt-2">{total}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Pipeline</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-3xl font-extrabold text-amber-600 block mt-2">{active}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved & Closed</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-3xl font-extrabold text-emerald-600 block mt-2">{resolved}</span>
        </div>
      </div>

      {/* Recent Reports List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="font-bold text-slate-900 text-lg">My Submitted Reports</h2>
          <span className="text-xs text-slate-500 font-medium">{reports.length} total</span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-700 text-sm">No environmental reports yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Found illegal dumping or an overflowing bin? Submit your first report to help clean up our community.</p>
            <Link to="/reports/new" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl font-bold text-xs">
              + Create First Report
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((report) => (
              <div key={report.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 p-3 rounded-xl transition-colors">
                <div className="flex items-start gap-3">
                  {report.thumbnailUrl ? (
                    <img src={report.thumbnailUrl} alt="Report" className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500">{report.reportNumber}</span>
                      <PriorityBadge priority={report.priority} />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{report.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{report.address}</p>
                    <span className="text-[11px] font-semibold text-brand-700 block">{report.categoryName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <StatusBadge status={report.status} />
                  <Link
                    to={`/reports/${report.id}`}
                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default CitizenDashboard;
