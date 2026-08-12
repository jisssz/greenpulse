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

  const handleAdvanceCaseStatus = async (newStatus) => {
    if (!selectedCase) return;
    try {
      const res = await api.patch(`/enforcement/cases/${selectedCase.id}/status?status=${newStatus}`);
      if (res.success) {
        setActionMessage({ type: 'success', text: `Case status updated to ${newStatus}` });
        setSelectedCase(res.data);
        fetchData();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to update case status' });
    }
  };

  const handleAddInvestigationNote = async () => {
    if (!selectedCase || !newNote.trim()) return;
    try {
      const res = await api.post(`/enforcement/cases/${selectedCase.id}/notes`, { note: newNote });
      if (res.success) {
        setNewNote('');
        setActionMessage({ type: 'success', text: 'Investigation note appended successfully!' });
        fetchData();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to add note' });
    }
  };

  const handleIssueChallan = async () => {
    if (!selectedCase) return;
    try {
      const res = await api.post('/enforcement/challans', {
        caseId: selectedCase.id,
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
      setActionMessage({ type: 'error', text: err.message || 'Failed to issue challan' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen bg-forest-950 text-slate-100">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel border border-emerald-500/30 rounded-3xl p-6 shadow-glass">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" /> Enforcement & Compliance Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Municipal Authority Portal</h1>
          <p className="text-xs text-slate-400">Cryptographic evidence hashing, CCTV feed ingestion, vehicle lookup, and legal fine issuance.</p>
        </div>

        <button
          onClick={() => setIsCctvModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold text-xs shadow-glow-emerald transition-all shrink-0"
        >
          <Camera className="w-4 h-4" /> Ingest CCTV Traffic Snapshot
        </button>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between ${actionMessage.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'}`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs underline opacity-80">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-emerald-500/10 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('cases')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'cases' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald' : 'text-slate-400 hover:text-white'}`}
        >
          Enforcement Cases ({cases.length})
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'evidence' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald' : 'text-slate-400 hover:text-white'}`}
        >
          Verified Evidence Stream ({evidenceList.length})
        </button>
      </div>

      {activeTab === 'cases' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cases List */}
          <div className="glass-panel border border-emerald-500/20 rounded-3xl p-5 shadow-glass space-y-3">
            <h3 className="font-bold text-white text-sm border-b border-emerald-500/10 pb-3">Active Case Roster</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {cases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${selectedCase?.id === c.id ? 'bg-emerald-500/15 border-emerald-500/40 text-white' : 'glass-card border-emerald-500/10 text-slate-300 hover:border-emerald-500/30'}`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-emerald-400">{c.caseNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-forest-900 border border-emerald-500/20">{c.caseStatus}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-100 mt-1">{c.violationType}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{c.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Case Inspector Detail */}
          {selectedCase && (
            <div className="lg:col-span-2 glass-panel border border-emerald-500/20 rounded-3xl p-6 shadow-glass space-y-6">
              <div className="flex justify-between items-start border-b border-emerald-500/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400">Case #{selectedCase.caseNumber}</span>
                  <h2 className="text-xl font-extrabold text-white mt-0.5">{selectedCase.violationType}</h2>
                  <p className="text-xs text-slate-400">{selectedCase.location}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {selectedCase.caseStatus}
                </span>
              </div>

              {/* Enforcement Lifecycle Timeline */}
              <div className="glass-card p-4 rounded-2xl border border-emerald-500/15">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Enforcement Progression</h4>
                <EvidenceTimeline currentStatus={selectedCase.caseStatus} />
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-500/10">
                <button onClick={() => handleAdvanceCaseStatus('UNDER_INVESTIGATION')} className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold">Investigate</button>
                <button onClick={() => handleAdvanceCaseStatus('VIOLATOR_IDENTIFIED')} className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold">Mark Identified</button>
                <button onClick={() => handleAdvanceCaseStatus('CHALLAN_ISSUED')} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold">Issue Challan</button>
                <button onClick={() => handleAdvanceCaseStatus('CLOSED')} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold">Close Case</button>
              </div>

              {/* Offender Lookup & Fine Issuance */}
              <div className="glass-card p-4 rounded-2xl border border-emerald-500/15 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <DollarSign size={16} /> Issue Legal Challan Fine
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Vehicle Reg / Offender ID</label>
                    <input
                      type="text"
                      value={queryReference}
                      onChange={(e) => setQueryReference(e.target.value)}
                      className="w-full p-2 glass-input rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Fine Penalty (INR ₹)</label>
                    <input
                      type="number"
                      value={fineAmount}
                      onChange={(e) => setFineAmount(parseInt(e.target.value))}
                      className="w-full p-2 glass-input rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
                <button
                  onClick={handleIssueChallan}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold text-xs rounded-xl shadow-glow-emerald"
                >
                  Generate Official Legal Challan (₹{fineAmount})
                </button>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300">Investigation Activity Log</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Append investigation log note..."
                    className="flex-1 p-2.5 glass-input rounded-xl text-xs"
                  />
                  <button onClick={handleAddInvestigationNote} className="px-4 py-2.5 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30">
                    Add Log
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {activeTab === 'evidence' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evidenceList.map((ev) => (
            <div key={ev.id} className="glass-card rounded-2xl p-4 border border-emerald-500/15 space-y-3">
              <img src={ev.fileUrl || '/uploads/dumping_park.jpg'} alt="Evidence" className="w-full h-40 object-cover rounded-xl border border-emerald-500/20" />
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono font-bold text-emerald-400">{ev.evidenceNumber}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{ev.verificationStatus}</span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-2">{ev.description}</p>
              <div className="p-2 bg-forest-950 rounded-xl border border-emerald-500/20 font-mono text-[10px] text-emerald-300 break-all">
                SHA-256: {ev.evidenceHash}
              </div>
              <button
                onClick={() => handleCreateCaseFromEvidence(ev)}
                className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/40"
              >
                + Open Enforcement Case
              </button>
            </div>
          ))}
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

    </div>
  );
}
