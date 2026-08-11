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
      alert('Verify failed: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!commentInput.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    setActionLoading(true);
    try {
      await api.patch(`/moderator/reports/${selectedReport.id}/reject?reason=${encodeURIComponent(commentInput)}`);
      setModalType(null);
      fetchModeratorReports();
    } catch (e) {
      alert('Reject failed: ' + e.message);
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
      await api.patch(`/moderator/reports/${selectedReport.id}/assign`, {
        workerId: parseInt(selectedWorkerId),
        comment: commentInput || 'Assigned by moderator',
      });
      setModalType(null);
      fetchModeratorReports();
    } catch (e) {
      alert('Assignment failed: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" /> Moderator Triage & Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review submitted environmental reports, adjust priority matrix, and assign municipal sanitation crews.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report #, title, address..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-700"
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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-semibold">No reports match current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
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
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-slate-700">{r.reportNumber}</td>
                    <td className="py-4 px-4">
                      <Link to={`/reports/${r.id}`} className="font-bold text-slate-900 hover:text-indigo-600 block line-clamp-1">
                        {r.title}
                      </Link>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{r.address}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-brand-700">{r.categoryName}</td>
                    <td className="py-4 px-4"><PriorityBadge priority={r.priority} /></td>
                    <td className="py-4 px-4"><StatusBadge status={r.status} /></td>
                    <td className="py-4 px-4 text-slate-600">{r.assignedToName || <span className="text-slate-400 italic">Unassigned</span>}</td>
                    <td className="py-4 px-4 text-right space-x-2">
                      {r.status === 'SUBMITTED' && (
                        <>
                          <button
                            onClick={() => { setSelectedReport(r); setPriorityInput('HIGH'); setCommentInput(''); setModalType('verify'); }}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-colors"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => { setSelectedReport(r); setCommentInput(''); setModalType('reject'); }}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {(r.status === 'VERIFIED' || r.status === 'ASSIGNED') && (
                        <button
                          onClick={() => { setSelectedReport(r); setSelectedWorkerId(workers[0]?.id || ''); setCommentInput(''); setModalType('assign'); }}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition-colors inline-flex items-center gap-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Assign
                        </button>
                      )}

                      <Link to={`/reports/${r.id}`} className="px-2 py-1.5 text-slate-400 hover:text-slate-700 inline-block">
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <button
                  disabled={actionLoading}
                  onClick={handleVerifySubmit}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                >
                  {actionLoading ? 'Verifying...' : 'Confirm Verification'}
                </button>
              </div>
            )}

            {modalType === 'reject' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Rejection Reason</label>
                  <textarea
                    rows={3}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Provide clear reason to citizen..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <button
                  disabled={actionLoading}
                  onClick={handleRejectSubmit}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
                >
                  {actionLoading ? 'Rejecting...' : 'Reject Report'}
                </button>
              </div>
            )}

            {modalType === 'assign' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select Field Worker</label>
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="">Choose Worker...</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assignment Instructions</label>
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="e.g. Dispatch heavyloader crew..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <button
                  disabled={actionLoading}
                  onClick={handleAssignSubmit}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
                >
                  {actionLoading ? 'Assigning...' : 'Dispatch Field Worker'}
                </button>
              </div>
            )}

            <button
              onClick={() => setModalType(null)}
              className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
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
