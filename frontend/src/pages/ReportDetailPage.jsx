import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Timeline from '../components/Timeline';
import EvidenceTimeline from '../components/EvidenceTimeline';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import HotspotMap from '../components/HotspotMap';
import { ArrowLeft, MapPin, User, Calendar, CheckCircle2, XCircle, Send, MessageSquare, Shield, Clock, FileCheck, Lock } from 'lucide-react';
import api from '../services/api';

const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [enforcementCase, setEnforcementCase] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [resolutionFeedback, setResolutionFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    setLoading(true);
    try {
      const [repRes, histRes, commRes, evRes] = await Promise.all([
        api.get(`/reports/${id}`),
        api.get(`/reports/${id}/history`),
        api.get(`/reports/${id}/comments`),
        api.get(`/evidence/report/${id}`)
      ]);
      if (repRes.data) setReport(repRes.data);
      if (histRes.data) setHistory(histRes.data);
      if (commRes.data) setComments(commRes.data);
      if (evRes.data) setEvidenceList(evRes.data);

      // Attempt to load associated enforcement case if user authorized
      try {
        const enfRes = await api.get(`/enforcement/cases`);
        if (enfRes.data?.content) {
          const matched = enfRes.data.content.find(c => c.reportId === parseInt(id));
          if (matched) setEnforcementCase(matched);
        }
      } catch (e) {}

    } catch (e) {
      console.error('Failed to load report details', e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResolution = async (isResolved) => {
    setActionLoading(true);
    try {
      await api.post(`/reports/${id}/verify-resolution`, {
        isResolved,
        feedback: resolutionFeedback || (isResolved ? 'Confirmed resolved by citizen' : 'Issue is still present on site'),
      });
      fetchReportDetails();
    } catch (e) {
      alert('Error recording resolution verification: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/reports/${id}/comments`, {
        comment: newComment,
        isInternal: user?.role === 'CITIZEN' ? false : isInternal,
      });
      setNewComment('');
      setIsInternal(false);
      const res = await api.get(`/reports/${id}/comments`);
      if (res.data) setComments(res.data);
    } catch (e) {
      alert('Error adding comment: ' + e.message);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 font-bold text-sm">Loading report details...</div>;
  }

  if (!report) {
    return <div className="py-20 text-center text-slate-500 font-bold text-sm">Report not found.</div>;
  }

  const isCitizenOwner = user?.role === 'CITIZEN' && report.citizenId === user.id;
  const isAwaitingCitizenConfirm = (report.status === 'RESOLVED' || report.status === 'RESOLUTION_VERIFICATION') && isCitizenOwner;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
                {report.reportNumber}
              </span>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                {report.categoryName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{report.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={report.priority} />
            <StatusBadge status={report.status} />
          </div>
        </div>

        {/* 8-Stage Operational Resolution Timeline */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resolution Lifecycle Progress</h3>
          <Timeline currentStatus={report.status} />
        </div>

        {/* Enforcement Progress Timeline (If Applicable) */}
        {enforcementCase && (
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Shield size={16} /> Enforcement Case {enforcementCase.caseNumber}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-800">
                {enforcementCase.caseStatus}
              </span>
            </div>
            <EvidenceTimeline currentStatus={enforcementCase.caseStatus} />
          </div>
        )}

        {/* Citizen Resolution Verification Prompt */}
        {isAwaitingCitizenConfirm && (
          <div className="bg-gradient-to-r from-brand-600 to-teal-700 text-white p-6 rounded-2xl shadow-lg space-y-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-brand-200" />
              <div>
                <h3 className="text-lg font-bold">Field Worker Resolution Confirmation Required</h3>
                <p className="text-xs text-brand-100 mt-1">
                  The assigned field worker has marked this issue as resolved. Please inspect the site and confirm if the environmental issue is completely solved.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <textarea
                value={resolutionFeedback}
                onChange={(e) => setResolutionFeedback(e.target.value)}
                placeholder="Optional feedback / site condition notes..."
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white/10 border border-white/20 text-white placeholder-brand-200 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleConfirmResolution(true)}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-white text-brand-800 hover:bg-brand-50 font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={16} /> YES, RESOLVED
                </button>
                <button
                  onClick={() => handleConfirmResolution(false)}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  <XCircle size={16} /> NO, STILL PRESENT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Description & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</h3>
              <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">{report.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Reported By</span>
                <span className="font-semibold text-slate-800">{report.citizenName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Worker</span>
                <span className="font-semibold text-slate-800">{report.assignedToName || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</h3>
            <div className="h-48 rounded-2xl overflow-hidden border border-slate-200">
              <HotspotMap hotspots={[{ id: report.id, latitude: report.latitude, longitude: report.longitude, title: report.title, priority: report.priority }]} />
            </div>
            <p className="text-xs font-mono text-slate-500 mt-2 flex items-center gap-1">
              <MapPin size={14} /> {report.address}
            </p>
          </div>
        </div>

        {/* Evidence & Photographs Section with Cryptographic SHA-256 Hashes */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck size={16} className="text-emerald-600" /> Evidence & Cryptographic Integrity Hashes ({report.images?.length || 0})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.images && report.images.map((img) => (
              <div key={img.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <img src={img.imageUrl} alt="Evidence" className="w-full h-40 object-cover rounded-xl border" />
                <div className="flex justify-between items-center text-[10px]">
                  <span className={`font-bold px-2 py-0.5 rounded ${img.imageType === 'AFTER' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                    {img.imageType} EVIDENCE
                  </span>
                  <span className="text-slate-400">{new Date(img.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {evidenceList.length > 0 && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <Lock size={14} /> Cryptographic SHA-256 Integrity Verification
                </span>
                <span className="text-[10px] text-slate-400">Immutable Hash</span>
              </div>
              {evidenceList.map(ev => (
                <div key={ev.id} className="font-mono text-[11px] bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>{ev.evidenceNumber} ({ev.sourceType})</span>
                    <span className="text-emerald-400 font-bold">{ev.verificationStatus}</span>
                  </div>
                  <div className="text-slate-200 break-all">
                    Hash: <span className="text-emerald-300 font-bold">{ev.evidenceHash}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments & Activity Stream */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare size={16} /> Activity Notes & Comments ({comments.length})
          </h3>

          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className={`p-4 rounded-2xl border text-xs space-y-1 ${c.isInternal ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{c.userName} ({c.userRole})</span>
                  <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-slate-700">{c.comment}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment or update note..."
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl hover:bg-brand-700 transition-colors flex items-center gap-1.5"
            >
              <Send size={14} /> Comment
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ReportDetailPage;
