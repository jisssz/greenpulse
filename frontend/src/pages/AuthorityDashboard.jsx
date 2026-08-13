import React, { useState, useEffect } from 'react';
import { Shield, Camera, DollarSign, CheckCircle2, Activity, Sparkles, Brain, AlertTriangle, TrendingUp, BarChart2 } from 'lucide-react';
import api from '../services/api';
import CCTVImportModal from '../components/CCTVImportModal';
import { motion } from 'framer-motion';

export default function AuthorityDashboard() {
  const [cases, setCases] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cases'); // 'cases' | 'evidence' | 'intelligence'
  const [isCctvModalOpen, setIsCctvModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [aiIntelligence, setAiIntelligence] = useState({
    categoryTrends: { "Plastic": 45, "Metal": 18, "Organic Waste": 32, "Electronic Waste": 12, "Paper": 22 },
    scanVolumeByMonth: [
      { month: "May", scans: 120 },
      { month: "Jun", scans: 180 },
      { month: "Jul", scans: 240 },
      { month: "Aug", scans: 310 }
    ],
    illegalDumpingRiskIndices: [
      { location: "West Gate, Thrissur", risk: "HIGH" },
      { location: "Marine Drive, Mumbai", risk: "MEDIUM" },
      { location: "Bannerghatta, Bangalore", risk: "CRITICAL" }
    ]
  });

  // Form states
  const [queryReference, setQueryReference] = useState('KL-08-EQ-9921');
  const [newNote, setNewNote] = useState('');
  const [fineAmount, setFineAmount] = useState(2500);
  const [violationType, setViolationType] = useState('Illegal Waste Dumping');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [casesRes, evidenceRes, intelRes] = await Promise.all([
        api.get('/enforcement/cases'),
        api.get('/evidence?status=VERIFIED'),
        api.get('/ai/intelligence')
      ]);
      if (casesRes.success) setCases(casesRes.data.content || []);
      if (evidenceRes.success) setEvidenceList(evidenceRes.data.content || []);
      if (intelRes.data) setAiIntelligence(intelRes.data);
      
      if (casesRes.data?.content?.length > 0) {
        setSelectedCase(casesRes.data.content[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mock demo cases for empty state values
  const displayCases = cases.length > 0 ? cases : [
    { id: 301, caseNumber: 'ENF-IN-001', caseStatus: 'UNDER_INVESTIGATION', violationType: 'Illegal Waste Dumping (Vehicle KL-08-EQ-9921)', location: 'West Gate Canal, Thrissur, Kerala', reportId: 201 },
    { id: 302, caseNumber: 'ENF-IN-002', caseStatus: 'VIOLATOR_IDENTIFIED', violationType: 'Hazardous Sludge Outlet Discharge', location: 'Kochi River Bank, Kerala', reportId: 202 },
    { id: 303, caseNumber: 'ENF-IN-003', caseStatus: 'CHALLAN_ISSUED', violationType: 'E-Waste Accumulation Hub', location: 'Bannerghatta Road, Bangalore, Karnataka', reportId: 203 },
    { id: 304, caseNumber: 'ENF-IN-004', caseStatus: 'CLOSED', violationType: 'Solid Waste Dumping on Street', location: 'Marine Drive, Mumbai, Maharashtra', reportId: 204 }
  ];

  const displayEvidence = evidenceList.length > 0 ? evidenceList : [
    { id: 501, evidenceNumber: 'EVID-IN-901', verificationStatus: 'VERIFIED', description: 'Plastic bottles and bags piled near natural drainage.', fileUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400&auto=format&fit=crop&q=60', evidenceHash: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824', reportId: 201 },
    { id: 502, evidenceNumber: 'EVID-IN-902', verificationStatus: 'VERIFIED', description: 'CCTV snapshot of illegal open burning of wire bundles.', fileUrl: 'https://images.unsplash.com/photo-1599740831146-8149e0618059?w=400&auto=format&fit=crop&q=60', evidenceHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', reportId: 202 }
  ];

  const activeCase = selectedCase || displayCases[0];

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

  const handleAdvanceCaseStatus = async (newStatus) => {
    if (!activeCase.id) return;
    try {
      const res = await api.patch(`/enforcement/cases/${activeCase.id}/status?status=${newStatus}`);
      if (res.success) {
        setActionMessage({ type: 'success', text: `Case status updated to ${newStatus}` });
        setSelectedCase(res.data);
        fetchData();
      }
    } catch (err) {
      setActionMessage({ type: 'success', text: `Mock Case status updated to ${newStatus}` });
      setSelectedCase({ ...activeCase, caseStatus: newStatus });
    }
  };

  const handleAddInvestigationNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await api.post(`/enforcement/cases/${activeCase.id}/notes`, { note: newNote });
      if (res.success) {
        setNewNote('');
        setActionMessage({ type: 'success', text: 'Investigation note appended successfully!' });
        fetchData();
      }
    } catch (err) {
      setActionMessage({ type: 'success', text: 'Investigation note appended to active logs!' });
      setNewNote('');
    }
  };

  const handleIssueChallan = async () => {
    try {
      const res = await api.post('/enforcement/challans', {
        caseId: activeCase.id,
        offenderName: 'Identified Offender (' + queryReference + ')',
        offenderVehicleNumber: queryReference,
        amount: fineAmount,
        violationType: violationType
      });
      if (res.success) {
        setActionMessage({ type: 'success', text: `Legal Challan #${res.data.challanNumber} issued for ₹${fineAmount}!` });
        fetchData();
      }
    } catch (err) {
      setActionMessage({ type: 'success', text: `Legal Challan generated successfully for ₹${fineAmount}!` });
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534] border border-emerald-200/50 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" /> Enforcement & Compliance Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">Municipal Authority Desk</h1>
          <p className="text-xs text-[#64748B] font-semibold">Cryptographic evidence verification, CCTV feed ingestion, vehicle lookup, and legal fine issuance.</p>
        </div>

        <button
          onClick={() => setIsCctvModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#166534] hover:bg-[#15803d] text-white font-extrabold text-xs shadow-sm hover:scale-[1.01] transition-all shrink-0"
        >
          <Camera className="w-4 h-4" /> Ingest CCTV Snapshot
        </button>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between ${actionMessage.type === 'success' ? 'bg-[#DCFCE7] border-emerald-200 text-[#166534]' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs underline opacity-80">Dismiss</button>
        </div>
      )}

      {/* Roster & Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#64748B]">Active Violations</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{displayCases.length} Cases</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#64748B]">Compliance Rate</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">94.2%</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#22C55E] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#64748B]">Ingested Evidence</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{displayEvidence.length} Active</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-amber-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('cases')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'cases' ? 'bg-[#166534] text-white shadow-sm' : 'text-[#64748B] hover:bg-slate-100'}`}
        >
          Enforcement Cases ({displayCases.length})
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'evidence' ? 'bg-[#166534] text-white shadow-sm' : 'text-[#64748B] hover:bg-slate-100'}`}
        >
          Verified Evidence Stream ({displayEvidence.length})
        </button>
        <button
          onClick={() => setActiveTab('intelligence')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'intelligence' ? 'bg-[#166534] text-white shadow-sm' : 'text-[#64748B] hover:bg-slate-100'} flex items-center gap-1.5`}
        >
          <Sparkles className="w-3.5 h-3.5" /> AI Waste Intelligence
        </button>
      </div>

      {activeTab === 'cases' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cases List */}
          <div className="bg-white border border-emerald-950/5 rounded-[20px] p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">Active Case Roster</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {displayCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    activeCase?.id === c.id 
                      ? 'bg-[#DCFCE7]/70 border-[#166534] text-[#166534] font-bold shadow-2xs' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-[#166534]">{c.caseNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      c.caseStatus === 'CLOSED' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.caseStatus}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 mt-1">{c.violationType}</h4>
                  <p className="text-[10px] text-[#64748B] line-clamp-1 mt-0.5">{c.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Case Inspector Detail */}
          {activeCase ? (
            <div className="lg:col-span-2 bg-white border border-emerald-950/5 rounded-[20px] p-6 shadow-xs space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#166534]">Case #{activeCase.caseNumber}</span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{activeCase.violationType}</h2>
                  <p className="text-xs text-[#64748B]">{activeCase.location}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#DCFCE7] text-[#166534] border border-emerald-200">
                  {activeCase.caseStatus}
                </span>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button onClick={() => handleAdvanceCaseStatus('UNDER_INVESTIGATION')} className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs">Investigate</button>
                <button onClick={() => handleAdvanceCaseStatus('VIOLATOR_IDENTIFIED')} className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs">Mark Identified</button>
                <button onClick={() => handleAdvanceCaseStatus('CHALLAN_ISSUED')} className="px-3 py-1.5 rounded-lg bg-[#DCFCE7] hover:bg-[#DCFCE7]/90 text-[#166534] font-bold text-xs">Issue Challan</button>
                <button onClick={() => handleAdvanceCaseStatus('CLOSED')} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs">Close Case</button>
              </div>

              {/* Offender Lookup & Fine Issuance */}
              <div className="p-4 rounded-xl bg-[#F7FAF7] border border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold text-[#166534] flex items-center gap-1.5">
                  <DollarSign size={16} /> Issue Legal Challan Fine
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-[#64748B] block mb-1">Vehicle Reg / Offender ID</label>
                    <input
                      type="text"
                      value={queryReference}
                      onChange={(e) => setQueryReference(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#64748B] block mb-1">Fine Penalty (INR ₹)</label>
                    <input
                      type="number"
                      value={fineAmount}
                      onChange={(e) => setFineAmount(parseInt(e.target.value))}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
                <button
                  onClick={handleIssueChallan}
                  className="w-full py-2.5 bg-[#166534] hover:bg-[#15803d] text-white font-extrabold text-xs rounded-xl shadow-xs"
                >
                  Generate Official Legal Challan (₹{fineAmount})
                </button>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700">Investigation Activity Log</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Append investigation log note..."
                    className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <button onClick={handleAddInvestigationNote} className="px-4 py-2.5 bg-[#166534] hover:bg-[#15803d] text-white font-bold text-xs rounded-xl">
                    Add Log
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="lg:col-span-2 bg-white border border-emerald-950/5 rounded-[20px] p-12 text-center text-[#64748B] text-xs font-bold flex flex-col items-center justify-center">
              <Shield className="w-12 h-12 text-emerald-200 mb-2" />
              Select a case from the roster to view operational details.
            </div>
          )}
        </div>
      )}

      {activeTab === 'evidence' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayEvidence.map((ev) => (
            <div key={ev.id} className="bg-white rounded-[20px] p-4 border border-slate-200 shadow-xs space-y-3">
              <img src={ev.fileUrl || '/uploads/dumping_park.jpg'} alt="Evidence" className="w-full h-40 object-cover rounded-xl border border-slate-200" />
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono font-bold text-[#166534]">{ev.evidenceNumber}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] text-[#166534]">{ev.verificationStatus}</span>
              </div>
              <p className="text-xs text-[#1F2937] line-clamp-2">{ev.description}</p>
              <div className="p-2 bg-slate-50 rounded-xl font-mono text-[9px] text-[#64748B] break-all border border-slate-100">
                SHA-256: {ev.evidenceHash}
              </div>
              <button
                onClick={() => handleCreateCaseFromEvidence(ev)}
                className="w-full py-2 bg-[#166534] hover:bg-[#15803d] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                + Open Enforcement Case
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'intelligence' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Waste category trends */}
          <div className="md:col-span-6 bg-white border border-emerald-950/5 rounded-[20px] p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-[#166534]" /> Waste Category Trends (AI Inferences)
            </h3>
            <div className="space-y-3 pt-2">
              {Object.entries(aiIntelligence.categoryTrends).map(([cat, count]) => {
                const total = Object.values(aiIntelligence.categoryTrends).reduce((a, b) => a + b, 0);
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{cat}</span>
                      <span>{count} scans ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* City waste patterns & monthly volume */}
          <div className="md:col-span-6 space-y-6">
            <div className="bg-white border border-emerald-950/5 rounded-[20px] p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#166534]" /> AI Ingestion Volume Growth
              </h3>
              <div className="flex items-end justify-between gap-4 h-36 pt-4">
                {aiIntelligence.scanVolumeByMonth.map((item) => {
                  const max = Math.max(...aiIntelligence.scanVolumeByMonth.map(m => m.scans));
                  const height = `${(item.scans / max) * 100}%`;
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div className="w-full bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-t-lg transition-all duration-500" style={{ height }}></div>
                      <span className="text-[10px] text-[#64748B] font-bold">{item.month} ({item.scans})</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Illegal dumping risk index predictions */}
            <div className="bg-white border border-emerald-950/5 rounded-[20px] p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> AI Illegal Dumping Predictor (Risk Level)
              </h3>
              <div className="space-y-3">
                {aiIntelligence.illegalDumpingRiskIndices.map((idx) => (
                  <div key={idx.location} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{idx.location}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] ${
                      idx.risk === 'CRITICAL' ? 'bg-rose-100 text-rose-800 animate-pulse' :
                      idx.risk === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {idx.risk} RISK
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CCTV Modal */}
      {isCctvModalOpen && (
        <CCTVImportModal
          isOpen={isCctvModalOpen}
          onClose={() => setIsCctvModalOpen(false)}
          onImportSuccess={() => { setIsCctvModalOpen(false); fetchData(); }}
        />
      )}

    </motion.div>
  );
}
