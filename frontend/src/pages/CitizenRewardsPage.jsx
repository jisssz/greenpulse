import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, Clock, DollarSign, Shield, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function CitizenRewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [summary, setSummary] = useState({ totalEarned: 0, verifiedContributions: 0, pendingRewards: 0, paidRewards: 0 });
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const [rewardsRes, summaryRes, policyRes] = await Promise.all([
        api.get('/rewards/my'),
        api.get('/rewards/my/summary'),
        api.get('/rewards/policy')
      ]);
      if (rewardsRes.success) setRewards(rewardsRes.data || []);
      if (summaryRes.success) setSummary(summaryRes.data);
      if (policyRes.success) setPolicy(policyRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="glass-panel border border-emerald-500/30 p-6 md:p-8 rounded-3xl text-white shadow-glass relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-semibold">
              <Award size={16} /> Citizen Participation Incentive Program
            </div>
            <h1 className="text-3xl font-extrabold">My Rewards & Environmental Impact</h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl">
              Thank you for keeping public spaces clean and safe. Your verified reports contribute directly to civic environmental enforcement.
            </p>
          </div>
        </div>

        {/* Safety Banner */}
        <div className="bg-amber-500/15 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-amber-200 text-xs backdrop-blur-md">
          <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-300">Community Reporting Safety Notice:</strong>
            <p className="mt-0.5 text-amber-200/80">
              GreenPulse rewards community environmental vigilance. Do not confront suspected offenders, do not follow vehicles, and do not trespass onto private property while collecting evidence.
            </p>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-emerald-500/15 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Total Earned</span>
            <span className="text-3xl font-extrabold text-emerald-400 block mt-2">₹{summary.totalEarned || 0}</span>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-emerald-500/15 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Verified Reports</span>
            <span className="text-3xl font-extrabold text-white block mt-2">{summary.verifiedContributions || 0}</span>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-amber-500/15 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Pending Review</span>
            <span className="text-3xl font-extrabold text-amber-400 block mt-2">₹{summary.pendingRewards || 0}</span>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-teal-500/15 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Disbursed</span>
            <span className="text-3xl font-extrabold text-teal-300 block mt-2">₹{summary.paidRewards || 0}</span>
          </div>
        </div>

        {/* Active Policy Rules */}
        {policy && (
          <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 space-y-2">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Active Civic Reward Rate Policy</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-1">
              <div className="bg-forest-900/60 p-2.5 rounded-xl border border-emerald-500/10">
                <span className="text-slate-400 block text-[10px]">Verified Report Bonus</span>
                <span className="font-bold text-white text-sm">₹{policy.baseRewardAmount}</span>
              </div>
              <div className="bg-forest-900/60 p-2.5 rounded-xl border border-emerald-500/10">
                <span className="text-slate-400 block text-[10px]">Enforcement Fine Share</span>
                <span className="font-bold text-emerald-400 text-sm">{policy.percentageShare}% of Fine</span>
              </div>
              <div className="bg-forest-900/60 p-2.5 rounded-xl border border-emerald-500/10">
                <span className="text-slate-400 block text-[10px]">Policy Status</span>
                <span className="font-bold text-teal-300 text-sm">{policy.active ? 'ACTIVE' : 'INACTIVE'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Rewards History Table */}
        <div className="glass-panel border border-emerald-500/20 rounded-3xl p-6 shadow-glass space-y-4">
          <h3 className="font-bold text-white text-lg border-b border-emerald-500/10 pb-3">Reward Disbursement History</h3>
          <div className="space-y-3">
            {rewards.map((r) => (
              <div key={r.id} className="glass-card p-4 rounded-2xl border border-emerald-500/15 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">REWARD #{r.id}</span>
                  <h4 className="font-bold text-white text-sm mt-0.5">{r.reason || 'Verified Environmental Contribution'}</h4>
                  <span className="text-xs text-slate-400 block mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-emerald-400 block">₹{r.amount}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
