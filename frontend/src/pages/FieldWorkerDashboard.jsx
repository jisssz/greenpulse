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
      alert('Resolve error: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-600" /> Field Worker Task Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">Accept tasks, execute cleanup, and submit resolution photo evidence.</p>
        </div>
        <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold">
          {assignments.filter(a => a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS').length} Active Assignments
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-lg">Assigned Cleanup Tasks</h2>

        {loading ? (
          <div className="py-12 flex justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-semibold">No assigned tasks found.</div>
        ) : (
          <div className="grid gap-4">
            {assignments.map((task) => (
              <div key={task.id} className="border border-slate-200 rounded-2xl p-5 hover:border-brand-500 transition-colors bg-slate-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-500">{task.reportNumber}</span>
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                  <span className="text-[11px] font-semibold text-brand-700">{task.categoryName}</span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">{task.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{task.description}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" /> {task.address}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/80 pt-3">
                  <Link to={`/reports/${task.id}`} className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1">
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex gap-2">
                    {task.status === 'ASSIGNED' && (
                      <button
                        onClick={() => handleStartWork(task.id)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" /> Start Work
                      </button>
                    )}

                    {(task.status === 'IN_PROGRESS' || task.status === 'ASSIGNED') && (
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Submit Evidence & Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolution Evidence Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900">
              Submit Resolution Evidence ({selectedTask.reportNumber})
            </h3>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Resolution Work Notes</label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe cleanup actions taken, waste hauled away, and equipment used..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Upload AFTER Photo Evidence</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAfterImageFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
                >
                  {actionLoading ? 'Uploading & Saving...' : 'Confirm Resolution'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800"
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
