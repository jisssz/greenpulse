import React, { useEffect, useState } from 'react';
import { 
  Shield, Camera, DollarSign, CheckCircle2, Activity, Sparkles, 
  Brain, AlertTriangle, TrendingUp, BarChart2, Eye, Check, X, Edit3 
} from 'lucide-react';
import api from '../services/api';
import CCTVImportModal from '../components/CCTVImportModal';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  "Plastic", "Paper", "Glass", "Metal", "Organic Waste", "Electronic Waste", "Hazardous Waste"
];

export default function AuthorityDashboard() {
  const [cases, setCases] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [correctedCategory, setCorrectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cases'); // 'cases' | 'evidence' | 'intelligence' | 'aiReview'
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
      const [casesRes, evidenceRes, intelRes, queueRes] = await Promise.all([
        api.get('/enforcement/cases'),
        api.get('/evidence?status=VERIFIED'),
        api.get('/ai/intelligence'),
        api.get('/ai/review-queue')
      ]);
      
      if (casesRes.success) setCases(casesRes.data.content || []);
      if (evidenceRes.success) setEvidenceList(evidenceRes.data.content || []);
      if (intelRes.data) setAiIntelligence(intelRes.data);
      if (queueRes.success) setReviewQueue(queueRes.data || []);
      
      if (casesRes.data?.content?.length > 0) {
        setSelectedCase(casesRes.data.content[0]);
      }
      if (queueRes.data?.length > 0) {
        setSelectedReview(queueRes.data[0]);
        setCorrectedCategory(queueRes.data[0].predictedCategory);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCaseFromEvidence = async (evidence) => {
    try {
      const res = await api.post('/enforcement/cases', {
        violationType: 'Evidence Hash Linked dumping',
        location: 'Ingested Feed Snapshot coordinate',
        evidenceId: evidence.id
      });
      if (res.success) {
        setActionMessage({ type: 'success', text: `Enforcement case ${res.data.caseNumber} created successfully.` });
        fetchData();
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to create enforcement case' });
    }
  };

  const handleUpdateCaseStatus = async (newStatus) => {
    if (!selectedCase) return;
    try {
      const res = await api.patch(`/enforcement/cases/${selectedCase.id}/status?status=${newStatus}`);
      if (res.success) {
        setActionMessage({ type: 'success', text: `Case status updated to ${newStatus}` });
        fetchData();
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to update case status' });
    }
  };

  const handleAddCaseNote = async (e) => {
    e.preventDefault();
    if (!selectedCase || !newNote.trim()) return;
    try {
      const res = await api.post(`/enforcement/cases/${selectedCase.id}/notes`, { note: newNote });
      if (res.success) {
        setActionMessage({ type: 'success', text: 'Case note appended successfully' });
        setNewNote('');
        fetchData();
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to add case note' });
    }
  };

  const handleIssueFine = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    try {
      const res = await api.post('/enforcement/challans', {
        caseId: selectedCase.id,
        amount: fineAmount,
        violationType: violationType,
        vehicleReference: queryReference
      });
      if (res.success) {
        setActionMessage({ type: 'success', text: `Fine Challan issued successfully: ${res.data.id}` });
        fetchData();
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to issue fine' });
    }
  };

  const handleReviewSubmit = async (action) => {
    if (!selectedReview) return;
    try {
      const res = await api.post(`/ai/review/${selectedReview.id}/action?action=${action}&category=${correctedCategory}`);
      if (res.success) {
        setActionMessage({ type: 'success', text: `Prediction checked: verified as ${action}` });
        
        // Refresh Review queue and select another item
        const updatedQueue = reviewQueue.filter(r => r.id !== selectedReview.id);
        setReviewQueue(updatedQueue);
        if (updatedQueue.length > 0) {
          setSelectedReview(updatedQueue[0]);
          setCorrectedCategory(updatedQueue[0].predictedCategory);
        } else {
          setSelectedReview(null);
        }
        fetchData();
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Verification submission failed.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-xs font-bold text-[#64748B]">
        <Loader2 className="w-6 h-6 animate-spin text-[#166534] mr-2" />
        Synchronizing Municipal Ledgers...
      </div>
    );
  }

  const displayCases = cases || [];
  const displayEvidence = evidenceList || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
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
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#166534] hover:bg-[#15803d] text-white font-extrabold text-xs shadow-sm hover:scale-[1.01] transition-all shrink-0 cursor-pointer"
        >
          <Camera className="w-4 h-4" /> Ingest CCTV Snapshot
        </button>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between ${actionMessage.type === 'success' ? 'bg-[#DCFCE7] border-emerald-200 text-[#166534]' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs underline opacity-80 cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Roster & Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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

        <div className="bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#64748B]">Pending AI Reviews</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{reviewQueue.length} Scans</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('cases')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === 'cases' ? 'bg-[#166534] text-white shadow-sm' : 'text-[#64748B] hover:bg-slate-100'}`}
        >
          Enforcement Cases ({displayCases.length})
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === 'evidence' ? 'bg-[#166534] text-white shadow-sm' : 'text-[#64748B] hover:bg-slate-100'}`}
        >
          Verified Evidence Stream ({displayEvidence.length})
        </button>
        <button
          onClick={() => setActiveTab('intelligence')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === 'intelligence' ? 'bg-[#166534] text-white shadow-sm' : 'text-[#64748B] hover:bg-slate-100'} flex items-center gap-1.5`}
        >
          <Sparkles className="w-3.5 h-3.5" /> AI Waste Intelligence
        </button>
        <button
          onClick={() => setActiveTab('aiReview')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === 'aiReview' ? 'bg-[#166534] text-white shadow-sm' : 'text-[#64748B] hover:bg-slate-100'} flex items-center gap-1.5`}
        >
          <Brain className="w-3.5 h-3.5" /> AI Review Queue ({reviewQueue.length})
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
                    selectedCase?.id === c.id ? 'border-[#166534] bg-emerald-50/20 shadow-2xs' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#64748B]">
                    <span>{c.caseNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full ${c.caseStatus === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {c.caseStatus}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 mt-1 truncate">{c.violationType}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{c.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Case Inspector Detail */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCase ? (
              <div className="bg-white border border-emerald-950/5 rounded-[20px] p-6 shadow-xs space-y-6">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{selectedCase.caseNumber} Case Audit</h2>
                    <p className="text-[10px] text-[#64748B] font-bold mt-0.5">Assigned to: Municipal Authority Officers Desk</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleUpdateCaseStatus('RESOLVED')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Resolve Case
                    </button>
                    <button
                      onClick={() => handleUpdateCaseStatus('CLOSED')}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-extrabold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Close Case
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-800">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[#64748B] font-semibold">Violation Type</span>
                      <p className="font-extrabold text-slate-900 mt-0.5">{selectedCase.violationType}</p>
                    </div>
                    <div>
                      <span className="text-[#64748B] font-semibold">Incident Location</span>
                      <p className="font-extrabold text-slate-900 mt-0.5">{selectedCase.location}</p>
                    </div>
                    <div>
                      <span className="text-[#64748B] font-semibold">Target Evidence Reference</span>
                      <p className="font-mono text-[10px] text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200 mt-1 max-w-fit">
                        EVID-{selectedCase.id}
                      </p>
                    </div>
                  </div>

                  {/* Challan Fine Trigger */}
                  <form onSubmit={handleIssueFine} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-emerald-600" /> Issue Challan Fine
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[9px] font-bold text-[#64748B] uppercase block">Vehicle Registration</label>
                        <input
                          type="text"
                          value={queryReference}
                          onChange={(e) => setQueryReference(e.target.value)}
                          className="w-full mt-1 p-2 rounded-lg border border-slate-250 bg-white text-xs font-semibold focus:outline-[#166534]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-[#64748B] uppercase block">Fine Amount (INR)</label>
                        <input
                          type="number"
                          value={fineAmount}
                          onChange={(e) => setFineAmount(e.target.value)}
                          className="w-full mt-1 p-2 rounded-lg border border-slate-250 bg-white text-xs font-semibold focus:outline-[#166534]"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[10px] rounded-lg shadow-2xs cursor-pointer"
                    >
                      Dispatch Legal Notice
                    </button>
                  </form>
                </div>

                {/* Case Note logs */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-xs">Officer Logs & Appendices</h3>
                  
                  <div className="space-y-3 max-h-[160px] overflow-y-auto">
                    {selectedCase.notes?.length === 0 ? (
                      <div className="text-[10px] text-slate-500 italic">No notes found for this case.</div>
                    ) : (
                      selectedCase.notes?.map((n) => (
                        <div key={n.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-[10px] leading-relaxed">
                          <div className="flex justify-between font-bold text-[#64748B] mb-1">
                            <span>Officer Note</span>
                            <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-800 font-medium">{n.note}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddCaseNote} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add inspection notes..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1 p-2.5 rounded-xl border border-slate-250 bg-white text-xs font-semibold focus:outline-[#166534]"
                    />
                    <button
                      type="submit"
                      className="px-5 bg-slate-850 hover:bg-slate-950 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                    >
                      Append Note
                    </button>
                  </form>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-[20px] p-8 text-center text-[#64748B] text-xs font-bold h-full flex flex-col items-center justify-center min-h-[300px]">
                <Shield className="w-10 h-10 text-emerald-150 mb-2" />
                Select a case from the roster to view operational details.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'evidence' && (
        <div className="bg-white border border-emerald-950/5 rounded-[20px] p-6 shadow-xs space-y-6">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">Verified CCTV Ingests</h3>
          {displayEvidence.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-bold">No verified CCTV feeds found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayEvidence.map((e) => (
                <div key={e.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between">
                  <div className="h-44 bg-slate-200 relative">
                    <img src={e.fileUrl} alt="CCTV Capture" className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 px-2.5 py-0.5 bg-black/60 rounded text-[9px] font-mono text-white tracking-wide">
                      {e.verificationStatus}
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-[10px] font-mono text-slate-500 break-all bg-slate-100 p-2 rounded border border-slate-200 leading-tight">
                      Hash: {e.evidenceHash.substring(0, 32)}...
                    </p>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">{e.description}</p>
                    <button
                      onClick={() => handleCreateCaseFromEvidence(e)}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[10px] rounded-lg shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5" /> Link and File Violation Case
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'intelligence' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 bg-white border border-emerald-950/5 rounded-[20px] p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-[#166534]" /> Waste Category Trends (AI Inferences)
            </h3>
            <div className="space-y-4">
              {Object.entries(aiIntelligence.categoryTrends).map(([cat, count]) => {
                const total = Object.values(aiIntelligence.categoryTrends).reduce((a, b) => a + b, 0);
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{cat}</span>
                      <span>{count} scans ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-[#166534] h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-4 space-y-6">
            <div className="bg-white border border-emerald-950/5 rounded-[20px] p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#166534]" /> AI Ingestion Volume Growth
              </h3>
              <div className="flex items-end justify-between h-28 pt-4 border-b border-slate-150">
                {aiIntelligence.scanVolumeByMonth.map((item) => {
                  const max = Math.max(...aiIntelligence.scanVolumeByMonth.map(m => m.scans));
                  const heightPercent = max > 0 ? (item.scans / max) * 100 : 0;
                  return (
                    <div key={item.month} className="flex flex-col items-center gap-1.5 w-1/4">
                      <span className="text-[9px] font-bold text-slate-500">{item.scans}</span>
                      <div className="bg-emerald-600/90 w-7 rounded-t-sm" style={{ height: `${heightPercent * 0.7}px` }}></div>
                      <span className="text-[10px] font-extrabold text-slate-700">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-emerald-950/5 rounded-[20px] p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
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

      {activeTab === 'aiReview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List queue */}
          <div className="bg-white border border-emerald-950/5 rounded-[20px] p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">
              Low Confidence AI Submissions
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {reviewQueue.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                  Queue is clear! No low confidence scans to review.
                </div>
              ) : (
                reviewQueue.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedReview(item);
                      setCorrectedCategory(item.predictedCategory);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedReview?.id === item.id ? 'border-amber-500 bg-amber-50/10 shadow-2xs' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold text-[#64748B]">
                      <span>ID: #{item.id}</span>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded">
                        {item.confidence}% confidence
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-900 mt-1 truncate">
                      AI Guess: {item.predictedCategory}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                      Submitted by: {item.user?.email || "Citizen User"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Inspector and Action Form */}
          <div className="lg:col-span-2">
            {selectedReview ? (
              <div className="bg-white border border-emerald-950/5 rounded-[20px] p-6 shadow-xs space-y-6">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">AI Waste Ingestion Review</h2>
                    <p className="text-[10px] text-[#64748B] font-bold mt-0.5">
                      Check evidence images and approve rewards or override predicted waste classifications.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReviewSubmit('APPROVE')}
                      className="px-4.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve Ingest
                    </button>
                    <button
                      onClick={() => handleReviewSubmit('REJECT')}
                      className="px-4.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Reject / Flag
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Photo details */}
                  <div className="space-y-4">
                    <div className="aspect-square w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img 
                        src={selectedReview.imageUrl.startsWith('/uploads') ? api.defaults.baseURL.replace('/api', '') + selectedReview.imageUrl : selectedReview.imageUrl} 
                        alt="Submitted Evidence" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                      <span className="text-[#64748B] block font-bold text-[9px] uppercase">Image Ingest Details</span>
                      <p className="font-semibold text-slate-800">
                        Uploaded by: <span className="font-extrabold text-slate-950">{selectedReview.user?.name} ({selectedReview.user?.email})</span>
                      </p>
                      <p className="font-semibold text-slate-800">
                        Uploaded Date: <span className="font-extrabold text-slate-950">{new Date(selectedReview.createdAt).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  {/* AI properties and override dropdown */}
                  <div className="space-y-5 text-xs text-slate-800">
                    <div className="space-y-3">
                      <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-2">
                        <span className="text-amber-700 font-extrabold flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 shrink-0" /> Low Neural Confidence
                        </span>
                        <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                          This scan has a confidence score of **{selectedReview.confidence}%** (below the 85.0% auto-approval threshold). 
                          Please verify the item visually and choose whether to override the category prediction.
                        </p>
                      </div>

                      <div>
                        <span className="text-[#64748B] font-semibold">AI Predicted Category</span>
                        <p className="font-black text-slate-950 text-base mt-0.5">{selectedReview.predictedCategory}</p>
                      </div>

                      <div>
                        <span className="text-[#64748B] font-semibold">Material Ingest Group</span>
                        <p className="font-extrabold text-slate-900 mt-0.5">{selectedReview.materialType || "Mixed Material"}</p>
                      </div>

                      <div>
                        <span className="text-[#64748B] font-semibold">Condition Assessment</span>
                        <p className="font-extrabold text-slate-900 mt-0.5">{selectedReview.conditionStatus || "Untreated"}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-2.5">
                      <label className="text-xs font-extrabold text-slate-950 block">Correct / Override Classification Category</label>
                      <div className="flex gap-2">
                        <select
                          value={correctedCategory}
                          onChange={(e) => setCorrectedCategory(e.target.value)}
                          className="flex-1 p-2.5 rounded-xl border border-slate-250 bg-white text-xs font-bold focus:outline-[#166534]"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleReviewSubmit('APPROVE')}
                          className="px-4.5 bg-slate-850 hover:bg-slate-950 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Correct
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-[20px] p-8 text-center text-[#64748B] text-xs font-bold h-full flex flex-col items-center justify-center min-h-[360px]">
                <Brain className="w-10 h-10 text-emerald-250 mb-2 animate-pulse" />
                Select a low confidence submission from the queue to start visual verification audits.
              </div>
            )}
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
