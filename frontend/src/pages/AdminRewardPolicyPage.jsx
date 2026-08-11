import React, { useState, useEffect } from 'react';
import { Shield, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function AdminRewardPolicyPage() {
  const [name, setName] = useState('Standard Community Environmental Incentive Policy');
  const [rewardPercentage, setRewardPercentage] = useState(10);
  const [maximumReward, setMaximumReward] = useState(500);
  const [minimumFine, setMinimumFine] = useState(500);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const res = await api.get('/rewards/policy');
      if (res.success && res.data) {
        setName(res.data.name || name);
        setRewardPercentage(res.data.rewardPercentage || 10);
        setMaximumReward(res.data.maximumReward || 500);
        setMinimumFine(res.data.minimumFine || 500);
        setEnabled(res.data.enabled !== false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await api.put('/rewards/policy', {
        name,
        rewardPercentage: parseFloat(rewardPercentage),
        maximumReward: parseFloat(maximumReward),
        minimumFine: parseFloat(minimumFine),
        enabled
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Demo Citizen Reward Policy updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Policy update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Configure Demo Citizen Reward Policy</h1>
            <p className="text-xs text-slate-500">Admin Policy Rules for Environmental Incentive Distribution</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900">
          <strong>Demo Feature Note:</strong> Policy configuration is a demonstration feature. Real-world implementation requires authorized municipal/government legal policy approval.
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Policy Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reward Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                value={rewardPercentage}
                onChange={(e) => setRewardPercentage(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Reward Cap (₹)</label>
              <input
                type="number"
                value={maximumReward}
                onChange={(e) => setMaximumReward(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Fine Trigger (₹)</label>
            <input
              type="number"
              value={minimumFine}
              onChange={(e) => setMinimumFine(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="enabled" className="text-xs font-bold text-slate-800">
              Enable Citizen Reward Incentive System
            </label>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} /> Save Reward Policy
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
