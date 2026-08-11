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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 md:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
              <Award size={16} /> Citizen Participation Incentive Program
            </div>
            <h1 className="text-3xl font-black">My Rewards & Environmental Impact</h1>
            <p className="text-emerald-100 text-xs md:text-sm max-w-xl">
              Thank you for keeping public spaces clean and safe. Your verified reports contribute directly to civic environmental enforcement.
            </p>
          </div>
        </div>

        {/* Safety Banner */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-900 text-xs shadow-sm">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Community Reporting Safety Notice:</strong>
            <p className="mt-0.5 text-amber-800">
              GreenPulse rewards community environmental vigilance. Do not confront suspected offenders, do not follow vehicles, and do not trespass onto private property while collecting evidence.
            </p>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold">Total Rewards Earned</span>
            <p className="text-2xl font-black text-emerald-600">₹{summary.totalEarned.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold">Verified Contributions</span>
            <p className="text-2xl font-black text-slate-900">{summary.verifiedContributions}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold">Pending Rewards</span>
            <p className="text-2xl font-black text-amber-500">{summary.pendingRewards}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold">Paid Rewards</span>
            <p className="text-2xl font-black text-teal-600">{summary.paidRewards}</p>
          </div>
        </div>

        {/* Active Reward Policy Info */}
        {policy && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-emerald-600" />
              <span className="font-bold text-slate-800">{policy.name}</span>
            </div>
            <div className="text-right text-slate-600">
              <span className="font-semibold">{policy.rewardPercentage}% of collected fine</span> (Max ₹{policy.maximumReward} cap per case)
            </div>
          </div>
        )}

        {/* Reward History Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Reward Transaction History</h2>

          {rewards.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No reward records yet. Submit verified environmental evidence to participate!
            </div>
          ) : (
            <div className="space-y-3">
              {rewards.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-700">Case ID #{r.enforcementCaseId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        r.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Calculated {r.rewardPercentage}% reward on verified municipal challan collection
                    </p>
                    {r.paymentReference && (
                      <p className="text-[11px] font-mono text-slate-400">Ref: {r.paymentReference}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900">₹{r.approvedAmount.toLocaleString()}</span>
                    <p className="text-[10px] text-slate-400">Status: {r.paymentStatus}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
