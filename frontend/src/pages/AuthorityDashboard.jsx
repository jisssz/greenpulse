import React, { useState, useEffect } from 'react';
import { Shield, Camera, FileCheck, DollarSign, Award, Search, AlertCircle, Plus, CheckCircle2, Lock } from 'lucide-react';
import api from '../services/api';
import CCTVImportModal from '../components/CCTVImportModal';
import EvidenceTimeline from '../components/EvidenceTimeline';

export default function AuthorityDashboard() {
  const [cases, setCases] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cases'); // 'cases' | 'evidence' | 'challans'
  const [isCctvModalOpen, setIsCctvModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Form states
  const [queryReference, setQueryReference] = useState('KA-01-EQ-9921');
  const [newNote, setNewNote] = useState('');
  const [fineAmount, setFineAmount] = useState(2000);
  const [violationType, setViolationType] = useState('Illegal Waste Dumping');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [casesRes, evidenceRes] = await Promise.all([
        api.get('/enforcement/cases'),
        api.get('/evidence?status=VERIFIED')
      ]);
      if (casesRes.success) setCases(casesRes.data.content || []);
      if (evidenceRes.success) setEvidenceList(evidenceRes.data.content || []);
      if (casesRes.data?.content?.length > 0) {
        setSelectedCase(casesRes.data.content[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCaseFromEvidence = async (ev) => {
    try {
      const res = await api.post('/enforcement/cases', {
        reportId: ev.reportId,
        evidenceId: ev.id,
        violationType: ev.description || 'Illegal Waste Dumping',
        location: 'Report Location #' + (ev.reportId || 'Central')
      });
      if (res.success) {
        setActionMessage({ type: 'success', text: `Enforcement Case ${res.data.caseNumber} opened successfully!` });
        fetchData();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to create enforcement case' });
    }
  };

  const handleMockGovernmentLookup = async () => {
    if (!selectedCase) return;
    try {
      const res = await api.post(`/enforcement/cases/${selectedCase.id}/mock-verify-identity`, {
        verificationType: 'VEHICLE_LOOKUP',
        queryReference: queryReference
      });
      if (res.success) {
        setActionMessage({ type: 'success', text: 'Simulated Government Verification complete! Masked reference stored safely.' });
        fetchCaseDetails(selectedCase.id);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Lookup failed' });
    }
  };

  const handleConfirmViolation = async () => {
    if (!selectedCase) return;
    try {
      const res = await api.patch(`/enforcement/cases/${selectedCase.id}/confirm-violation`);
      if (res.success) {
        setActionMessage({ type: 'success', text: 'Violation confirmed by authority officer!' });
        fetchCaseDetails(selectedCase.id);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Action failed' });
    }
  };

  const handleIssueChallan = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    try {
      const res = await api.post(`/fines/cases/${selectedCase.id}/issue-challan`, {
        violationType,
        fineAmount: parseFloat(fineAmount)
      });
      if (res.success) {
        setActionMessage({ type: 'success', text: `Demo Challan ${res.data.challanNumber} issued for ₹${res.data.fineAmount}!` });
        fetchCaseDetails(selectedCase.id);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Challan issuance failed' });
    }
  };

  const handleMarkFinePaid = async (fineId) => {
    try {
      const res = await api.post(`/fines/${fineId}/pay?paymentRef=DEMO-PAY-2026-${Date.now()}`);
      if (res.success) {
        setActionMessage({ type: 'success', text: 'Fine marked as PAID! Citizen reward calculated automatically.' });
        fetchCaseDetails(selectedCase.id);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Payment update failed' });
    }
  };

  const handleDisburseReward = async (rewardId) => {
    try {
      const res = await api.post(`/rewards/${rewardId}/disburse`);
      if (res.success) {
        setActionMessage({ type: 'success', text: `Citizen Reward of ₹${res.data.approvedAmount} disbursed!` });
        fetchCaseDetails(selectedCase.id);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Reward payout failed' });
    }
  };

  const fetchCaseDetails = async (caseId) => {
    try {
      const res = await api.get(`/enforcement/cases/${caseId}`);
      if (res.success) {
        setSelectedCase(res.data);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Municipal Enforcement Portal</h1>
              <p className="text-xs text-slate-500">Authorized Officer Investigation, Challan & Reward Infrastructure</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCctvModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Camera size={16} /> Import CCTV Feed
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm ${
            actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {actionMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {actionMessage.text}
          </div>
        )}

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Enforcement Case List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Active Cases ({cases.length})</h2>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('cases')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeTab === 'cases' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                  >
                    Cases
                  </button>
                  <button
                    onClick={() => setActiveTab('evidence')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeTab === 'evidence' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                  >
                    Verified Evidence ({evidenceList.length})
                  </button>
                </div>
              </div>

              {activeTab === 'cases' ? (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {cases.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedCase?.id === c.id
                          ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-400'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-mono font-bold text-emerald-700">{c.caseNumber}</span>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-slate-100 text-slate-700">
                          {c.caseStatus}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{c.violationType}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{c.location || 'Municipal Zone'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {evidenceList.map((ev) => (
                    <div key={ev.id} className="p-3 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex gap-3">
                        <img src={ev.fileUrl} alt="Evidence" className="w-16 h-16 rounded-lg object-cover border" />
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-500">{ev.evidenceNumber}</span>
                          <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">{ev.description}</h4>
                          <p className="text-[10px] font-mono text-emerald-600 truncate max-w-[200px]">
                            Hash: {ev.evidenceHash?.substring(0, 16)}...
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCreateCaseFromEvidence(ev)}
                        className="w-full py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus size={14} /> Open Enforcement Case
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Case Workspace */}
          <div className="lg:col-span-7 space-y-6">
            {selectedCase ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                
                {/* Case Header */}
                <div className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        {selectedCase.caseNumber}
                      </span>
                      <h2 className="text-lg font-extrabold text-slate-900 mt-1">{selectedCase.violationType}</h2>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
                      {selectedCase.caseStatus}
                    </span>
                  </div>
                </div>

                {/* Evidence Timeline */}
                <EvidenceTimeline currentStatus={selectedCase.caseStatus} />

                {/* Government Integration & Offender Lookup */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Lock size={14} className="text-emerald-600" /> Authorized Identity / Vehicle Lookup
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      DEMO / SIMULATED ADAPTER
                    </span>
                  </div>
                  
                  {selectedCase.offender ? (
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                      <p><strong className="text-slate-600">Verification Source:</strong> {selectedCase.offender.verificationSource}</p>
                      <p><strong className="text-slate-600">Masked Reference:</strong> <span className="font-mono text-emerald-700 font-bold">{selectedCase.offender.maskedReference}</span></p>
                      <p><strong className="text-slate-600">Vehicle Reference:</strong> {selectedCase.offender.vehicleReference}</p>
                      <p className="text-[10px] text-slate-400 italic">Strict Privacy Enforcement: Raw Aadhaar data is never queried or stored.</p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={queryReference}
                        onChange={(e) => setQueryReference(e.target.value)}
                        placeholder="Vehicle / Official Ref (e.g. KA-01-EQ-9921)"
                        className="flex-1 px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <button
                        onClick={handleMockGovernmentLookup}
                        className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
                      >
                        Execute Lookup
                      </button>
                    </div>
                  )}

                  {selectedCase.caseStatus === 'OFFENDER_IDENTIFIED' && (
                    <button
                      onClick={handleConfirmViolation}
                      className="w-full py-2 bg-amber-500 text-white font-bold text-xs rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Confirm Violation & Lock Evidence
                    </button>
                  )}
                </div>

                {/* Challan & Fine Section */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <FileCheck size={14} className="text-emerald-600" /> Municipal Fine / Challan Record
                  </h3>

                  {selectedCase.fine ? (
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-bold text-slate-900">{selectedCase.fine.challanNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          selectedCase.fine.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {selectedCase.fine.paymentStatus}
                        </span>
                      </div>
                      <p className="text-lg font-extrabold text-slate-900">₹{selectedCase.fine.fineAmount.toLocaleString()}</p>
                      
                      {selectedCase.fine.paymentStatus === 'ISSUED' && (
                        <button
                          onClick={() => handleMarkFinePaid(selectedCase.fine.id)}
                          className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                        >
                          Mark Fine as Paid (Simulated Payment)
                        </button>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleIssueChallan} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Fine Amount (₹)</label>
                          <input
                            type="number"
                            value={fineAmount}
                            onChange={(e) => setFineAmount(e.target.value)}
                            required
                            className="w-full px-3 py-1.5 border rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Violation Category</label>
                          <input
                            type="text"
                            value={violationType}
                            onChange={(e) => setViolationType(e.target.value)}
                            required
                            className="w-full px-3 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors"
                      >
                        Issue Demo Challan
                      </button>
                    </form>
                  )}
                </div>

                {/* Citizen Reward Disbursal */}
                {selectedCase.reward && (
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <Award size={16} /> Citizen Contributor Reward
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-200 text-emerald-800">
                        {selectedCase.reward.paymentStatus}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-emerald-900">
                      Reward Amount: ₹{selectedCase.reward.approvedAmount} ({selectedCase.reward.rewardPercentage}% of fine)
                    </p>
                    {selectedCase.reward.paymentStatus === 'APPROVED' && (
                      <button
                        onClick={() => handleDisburseReward(selectedCase.reward.id)}
                        className="w-full py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 transition-colors"
                      >
                        Disburse Demo Reward to Citizen
                      </button>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
                Select an enforcement case to inspect evidence, run lookups, and issue challans.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* CCTV Import Modal */}
      <CCTVImportModal
        isOpen={isCctvModalOpen}
        onClose={() => setIsCctvModalOpen(false)}
        onImportSuccess={() => fetchData()}
      />
    </div>
  );
}
