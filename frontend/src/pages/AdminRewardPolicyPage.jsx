import React, { useState, useEffect } from 'react';
import { Shield, Save, CheckCircle2, AlertCircle, Settings } from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';

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
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#F7FAF7] text-[#1F2937] py-10 px-4 sm:px-6 lg:px-8 space-y-6"
    >
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white border border-slate-200 p-6 rounded-[20px] space-y-2 shadow-2xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold">
            <Settings size={14} /> System Administrator Portal
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Citizen Incentive & Reward Policy Settings</h1>
          <p className="text-xs text-[#64748B]">Configure global fine share percentages, maximum cap per report, and minimum fine threshold.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between ${message.type === 'success' ? 'bg-[#DCFCE7]/70 border-emerald-200 text-[#166534]' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-xs underline opacity-80">Dismiss</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[20px] p-6 sm:p-8 space-y-5 shadow-2xs">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Policy Name</label>
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
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Fine Share Percentage (%)</label>
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
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Max Reward Cap per Report (INR ₹)</label>
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
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Min Fine Required for Reward (INR ₹)</label>
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
              className="w-4 h-4 rounded text-[#166534] bg-white border-slate-300"
            />
            <label htmlFor="enabled" className="text-xs font-bold text-slate-700 select-none">Enable Automated Citizen Reward Calculation</label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#166534] hover:bg-[#15803d] text-white font-extrabold text-xs rounded-xl shadow-2xs hover:scale-[1.01] transition-all flex items-center gap-2"
            >
              <Save size={16} /> {loading ? 'Saving Policy...' : 'Save Policy Changes'}
            </button>
          </div>
        </form>

      </div>
    </motion.div>
  );
}
