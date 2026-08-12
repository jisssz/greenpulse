import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { Wrench, Play, CheckCircle2, Upload, MapPin, Loader2, ArrowRight, Activity } from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const FieldWorkerDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [afterImageFile, setAfterImageFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/field-worker/assignments?page=0&size=50');
      if (res.success && res.data) {
        setAssignments(res.data.content || []);
      }
    } catch (e) {
      console.error('Failed to fetch assignments', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async (taskId) => {
    try {
      await api.patch(`/field-worker/reports/${taskId}/start`);
      fetchAssignments();
    } catch (e) {
      alert('Failed to start work: ' + e.message);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      let afterUrl = '/uploads/sample_after.jpg';
      if (afterImageFile) {
        const formData = new FormData();
        formData.append('file', afterImageFile);
        const uploadRes = await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadRes.data) afterUrl = uploadRes.data;
      }

      await api.patch(`/field-worker/reports/${selectedTask.id}/resolve`, {
        resolutionNotes,
        afterImageUrl: afterUrl,
      });

      setSelectedTask(null);
      setResolutionNotes('');
      setAfterImageFile(null);
      fetchAssignments();
    } catch (e) {
      alert('Error resolving task: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen bg-[#F7FAF7] text-[#1F2937]"
    >
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-emerald-950/5 rounded-[20px] p-6 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <Wrench className="w-3.5 h-3.5" /> Field Deployment Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">Assigned Field Resolutions</h1>
          <p className="text-xs text-[#64748B] font-semibold">Review assigned issues, log start times, and submit AFTER photo evidence upon resolution.</p>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#64748B]">Task Assignments</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{assignments.length} Tasks</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#64748B]">Active Cleanup</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {assignments.filter(a => a.status === 'IN_PROGRESS').length} In Progress
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#22C55E] flex items-center justify-center">
            <Play className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#64748B]">Completed Tasks</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {assignments.filter(a => a.status === 'RESOLVED').length} Cleaned
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Task List Grid */}
      <div className="bg-white border border-emerald-950/5 rounded-[20px] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="font-extrabold text-slate-900 text-base">Active Field Assignments</h2>
          <span className="text-xs font-bold text-[#166534] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">{assignments.length} assigned</span>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center text-[#166534]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-12 text-center text-[#64748B] text-xs font-semibold">No assigned field tasks in your queue.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((t) => (
              <div key={t.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-white transition-all space-y-4 shadow-2xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#166534]">{t.reportNumber}</span>
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1">{t.title}</h3>
                  </div>
                  <StatusBadge status={t.status} />
                </div>

                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">{t.description}</p>

                <div className="text-xs font-mono text-[#166534] flex items-center gap-1">
                  <MapPin size={14} className="text-[#166534]" /> {t.address}
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  <Link to={`/reports/${t.id}`} className="text-xs text-[#64748B] hover:text-[#166534] font-bold flex items-center gap-1">
                    Details <ArrowRight size={14} />
                  </Link>

                  {t.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleStartWork(t.id)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Play size={14} /> Start Work
                    </button>
                  )}

                  {t.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => setSelectedTask(t)}
                      className="px-4 py-2 bg-[#166534] hover:bg-[#15803d] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <CheckCircle2 size={14} /> Submit Resolution
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolution Submission Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-[20px] p-6 max-w-lg w-full shadow-md space-y-4"
            >
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#166534]" /> Submit Resolution #{selectedTask.reportNumber}
              </h3>

              <form onSubmit={handleResolveSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Resolution Notes</label>
                  <textarea
                    required
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe cleanup executed, equipment used, waste disposed..."
                    className="w-full p-2.5 glass-input rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Mandatory AFTER Cleanup Photo</label>
                  <div className="border-2 border-dashed border-emerald-950/10 rounded-2xl p-5 text-center bg-slate-50">
                    <Upload className="w-6 h-6 text-[#166534] mx-auto mb-2" />
                    <input
                      type="file"
                      required
                      accept="image/*"
                      onChange={(e) => setAfterImageFile(e.target.files[0])}
                      className="text-xs text-[#64748B]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-[#166534] text-white font-extrabold rounded-xl text-xs shadow-xs hover:bg-[#15803d]"
                  >
                    {actionLoading ? 'Uploading Evidence...' : 'Confirm Resolution'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-100 rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default FieldWorkerDashboard;
