import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { ShieldAlert, Search, Filter, CheckCircle2, XCircle, UserPlus, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const ModeratorDashboard = () => {
  const [reports, setReports] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals state
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalType, setModalType] = useState(null); // 'verify', 'reject', 'assign'
  const [priorityInput, setPriorityInput] = useState('HIGH');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchModeratorReports();
    fetchFieldWorkers();
  }, [statusFilter, priorityFilter, search]);

  const fetchModeratorReports = async () => {
    setLoading(true);
    try {
      let query = `/moderator/reports?page=0&size=50`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (priorityFilter) query += `&priority=${priorityFilter}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(query);
      if (res.success && res.data) {
        setReports(res.data.content || []);
      }
    } catch (e) {
      console.error('Failed to fetch moderator triage reports', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFieldWorkers = async () => {
    try {
      const res = await api.get('/moderator/field-workers');
      if (res.data) setWorkers(res.data);
    } catch (e) {}
  };

  const handleVerifySubmit = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/moderator/reports/${selectedReport.id}/verify?priority=${priorityInput}&comment=${encodeURIComponent(commentInput || 'Verified by moderator')}`);
      setModalType(null);
      fetchModeratorReports();
    } catch (e) {
      alert('Error verifying report: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/moderator/reports/${selectedReport.id}/reject?reason=${encodeURIComponent(commentInput || 'Invalid or non-actionable report')}`);
      setModalType(null);
      fetchModeratorReports();
    } catch (e) {
      alert('Error rejecting report: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedWorkerId) {
      alert('Please select a field worker.');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/moderator/reports/${selectedReport.id}/assign?fieldWorkerId=${selectedWorkerId}&instructions=${encodeURIComponent(commentInput || 'Assigned for cleanup')}`);
      setModalType(null);
      fetchModeratorReports();
    } catch (e) {
      alert('Error assigning report: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen bg-[#F8FAF7] text-slate-800">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card border border-indigo-200/60 rounded-3xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" /> Moderator Operational Queue
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Triage & Verification Portal</h1>
          <p className="text-xs text-slate-500 font-medium">Review citizen submissions, screen duplicates, set priority severity, and dispatch field workers.</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report #, title, address..."
            className="w-full pl-10 pr-4 py-2 glass-input rounded-xl text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 glass-input rounded-xl text-xs font-semibold"
          >
            <option value="">All Lifecycle Statuses</option>
            <option value="SUBMITTED">SUBMITTED (Needs Verification)</option>
            <option value="VERIFIED">VERIFIED (Needs Worker)</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 glass-input rounded-xl text-xs font-semibold"
          >
            <option value="">All Priorities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="glass-card border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center text-[#0F7A45]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-semibold">No reports match current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Report #</th>
                  <th className="py-3.5 px-4">Title & Address</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Crew</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#0F7A45]">{r.reportNumber}</td>
                    <td className="py-4 px-4">
                      <Link to={`/reports/${r.id}`} className="font-bold text-slate-900 hover:text-[#0F7A45] block line-clamp-1">
                        {r.title}
                      </Link>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{r.address}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">{r.categoryName}</td>
                    <td className="py-4 px-4"><PriorityBadge priority={r.priority} /></td>
                    <td className="py-4 px-4"><StatusBadge status={r.status} /></td>
                    <td className="py-4 px-4 text-slate-600">{r.assignedToName || <span className="text-slate-400 italic">Unassigned</span>}</td>
                    <td className="py-4 px-4 text-right space-x-2">
                      {r.status === 'SUBMITTED' && (
                        <>
                          <button
                            onClick={() => { setSelectedReport(r); setPriorityInput('HIGH'); setCommentInput(''); setModalType('verify'); }}
                            className="px-3 py-1.5 bg-[#0F7A45] text-white font-bold rounded-xl shadow-2xs hover:bg-[#166534] transition-colors"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => { setSelectedReport(r); setCommentInput(''); setModalType('reject'); }}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 font-bold rounded-xl border border-rose-200 hover:bg-rose-100 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {(r.status === 'VERIFIED' || r.status === 'ASSIGNED') && (
                        <button
                          onClick={() => { setSelectedReport(r); setSelectedWorkerId(workers[0]?.id || ''); setCommentInput(''); setModalType('assign'); }}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Assign
                        </button>
                      )}

                      <Link to={`/reports/${r.id}`} className="px-2 py-1.5 text-slate-400 hover:text-[#0F7A45] inline-block">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modals */}
      {modalType && selectedReport && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            
            <h3 className="font-extrabold text-lg text-slate-900 capitalize">
              {modalType} Report ({selectedReport.reportNumber})
            </h3>

            {modalType === 'verify' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Set Severity Priority</label>
                  <select
                    value={priorityInput}
                    onChange={(e) => setPriorityInput(e.target.value)}
                    className="w-full p-2.5 glass-input rounded-xl text-xs font-bold"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL HAZARD</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Moderator Note</label>
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Verified hazard on site..."
                    className="w-full p-2.5 glass-input rounded-xl text-xs"
                  />
                </div>
                <button
                  disabled={actionLoading}
                  onClick={handleVerifySubmit}
                  className="w-full py-2.5 bg-[#0F7A45] text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  {actionLoading ? 'Verifying...' : 'Confirm Verification'}
                </button>
              </div>
            )}

            <button
              onClick={() => setModalType(null)}
              className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ModeratorDashboard;
