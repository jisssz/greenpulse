import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { Wrench, Play, CheckCircle2, Upload, MapPin, Loader2, ArrowRight } from 'lucide-react';
import api from '../services/api';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen bg-forest-950 text-slate-100">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel border border-amber-500/30 rounded-3xl p-6 shadow-glass">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Wrench className="w-3.5 h-3.5" /> Municipal Field Crew Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Assigned Field Resolution Tasks</h1>
          <p className="text-xs text-slate-400">Accept dispatched cleanup tasks, execute site resolution, and upload mandatory AFTER photo evidence.</p>
        </div>
      </div>

      {/* Task List */}
      <div className="glass-panel border border-emerald-500/20 rounded-3xl p-6 shadow-glass space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
          <h2 className="font-bold text-white text-lg">Active Task Assignments</h2>
          <span className="text-xs font-bold text-amber-400">{assignments.length} assigned</span>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">No assigned field tasks in your queue.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((t) => (
              <div key={t.id} className="glass-card rounded-2xl p-5 border border-emerald-500/15 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-amber-400">{t.reportNumber}</span>
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm mt-1">{t.title}</h3>
                  </div>
                  <StatusBadge status={t.status} />
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{t.description}</p>

                <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <MapPin size={14} /> {t.address}
                </div>

                <div className="pt-3 border-t border-emerald-500/10 flex items-center justify-between gap-2">
                  <Link to={`/reports/${t.id}`} className="text-xs text-slate-400 hover:text-white font-semibold flex items-center gap-1">
                    Details <ArrowRight size={14} />
                  </Link>

                  {t.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleStartWork(t.id)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-forest-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <Play size={14} /> Start Work
                    </button>
                  )}

                  {t.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => setSelectedTask(t)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-glow-emerald"
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
      {selectedTask && (
        <div className="fixed inset-0 bg-forest-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-emerald-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            
            <h3 className="font-extrabold text-lg text-white">
              Submit Task Resolution ({selectedTask.reportNumber})
            </h3>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Resolution Work Notes</label>
                <textarea
                  required
                  rows={3}
                  value={resolutionFeedback}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe cleanup executed, equipment used, tonnage removed..."
                  className="w-full p-2.5 glass-input rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Mandatory AFTER Cleanup Photo Evidence</label>
                <div className="border-2 border-dashed border-emerald-500/20 rounded-2xl p-4 text-center bg-forest-900/50">
                  <Upload className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAfterImageFile(e.target.files[0])}
                    className="text-xs text-slate-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold rounded-xl text-xs shadow-glow-emerald"
                >
                  {actionLoading ? 'Uploading Evidence...' : 'Confirm Resolution'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FieldWorkerDashboard;
