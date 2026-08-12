import React, { useState, useEffect } from 'react';
import { Shield, Save, CheckCircle2, AlertCircle, Settings } from 'lucide-react';
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
        setMessage({ type: 'success', text: 'Citizen Reward Policy updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Policy update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="glass-panel border border-purple-500/30 p-6 rounded-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Settings size={14} /> System Administrator Portal
          </div>
          <h1 className="text-2xl font-extrabold text-white">Citizen Incentive & Reward Policy Settings</h1>
          <p className="text-xs text-slate-400">Configure global fine share percentages, maximum cap per report, and minimum fine threshold.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between ${message.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'}`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-xs underline opacity-80">Dismiss</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel border border-emerald-500/20 rounded-3xl p-6 sm:p-8 space-y-5 shadow-glass">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Policy Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2.5 glass-input rounded-xl text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Fine Share Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={rewardPercentage}
                onChange={(e) => setRewardPercentage(e.target.value)}
                required
                className="w-full p-2.5 glass-input rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Max Reward Cap per Report (INR ₹)</label>
              <input
                type="number"
                value={maximumReward}
                onChange={(e) => setMaximumReward(e.target.value)}
                required
                className="w-full p-2.5 glass-input rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Min Fine Required for Reward (INR ₹)</label>
            <input
              type="number"
              value={minimumFine}
              onChange={(e) => setMinimumFine(e.target.value)}
              required
              className="w-full p-2.5 glass-input rounded-xl text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-forest-900 border-emerald-500/30"
            />
            <label htmlFor="enabled" className="text-xs font-bold text-slate-200">Enable Automated Citizen Reward Calculation</label>
          </div>

          <div className="pt-4 border-t border-emerald-500/10 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold text-xs rounded-xl shadow-glow-emerald transition-all flex items-center gap-2"
            >
              <Save size={16} /> {loading ? 'Saving Policy...' : 'Save Policy Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
