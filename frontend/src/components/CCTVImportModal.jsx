import React, { useState } from 'react';
import { Camera, X, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function CCTVImportModal({ isOpen, onClose, onImportSuccess }) {
  const [cameraId, setCameraId] = useState('CAM-MUNI-042');
  const [location, setLocation] = useState('820 Market Square Alley');
  const [description, setDescription] = useState('Municipal CCTV footage showing commercial plastic waste burning');
  const [fileUrl, setFileUrl] = useState('/uploads/burning_smoke.jpg');
  const [reportId, setReportId] = useState('3');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await api.post('/evidence', {
        reportId: reportId ? parseInt(reportId) : null,
        sourceType: 'CCTV',
        fileUrl: fileUrl,
        description: `[CCTV Feed ID: ${cameraId}] ${description} at ${location}`
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Municipal CCTV Evidence imported successfully with cryptographic SHA-256 integrity hash!' });
        setTimeout(() => {
          onImportSuccess && onImportSuccess(res.data);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to import CCTV evidence' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Camera size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Import External CCTV Evidence</h3>
            <p className="text-xs text-slate-500">Authorized Municipal Camera Feed Ingestion Interface</p>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Camera Feed ID</label>
            <input
              type="text"
              value={cameraId}
              onChange={(e) => setCameraId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Associated Report ID (Optional)</label>
            <input
              type="number"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              placeholder="e.g. 3"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Camera Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Evidence Media Snapshot URL</label>
            <input
              type="text"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">CCTV Observation Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Ingesting Evidence...' : 'Import CCTV Evidence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
