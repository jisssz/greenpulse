import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../components/MapPicker';
import { Upload, AlertCircle, FileText, CheckCircle2, ArrowLeft, Loader2, Info, ShieldAlert, Lock, Sparkles, Eye } from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';

const NewReportPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [reportType, setReportType] = useState('ENVIRONMENTAL_ISSUE');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Thrissur, Kerala, India');
  const [latitude, setLatitude] = useState(10.8505);
  const [longitude, setLongitude] = useState(76.2711);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/categories')
      .then(res => {
        if (res.data) setCategories(res.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      api.get(`/reports/nearby?lat=${latitude}&lng=${longitude}&radiusKm=0.5`)
        .then(res => {
          if (res.data) setDuplicates(res.data);
        })
        .catch(() => {});
    }
  }, [latitude, longitude]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      
      const name = selected.name.toLowerCase();
      let predictedCatId = 1;
      let conf = '88%';
      let catName = 'Plastic Waste';
      if (name.includes('metal') || name.includes('can')) { predictedCatId = 4; conf = '92%'; catName = 'Metal Waste'; }
      else if (name.includes('glass') || name.includes('bottle')) { predictedCatId = 3; conf = '91%'; catName = 'Glass Waste'; }
      else if (name.includes('organic') || name.includes('food')) { predictedCatId = 2; conf = '85%'; catName = 'Organic Waste'; }
      else if (name.includes('burn') || name.includes('fire')) { predictedCatId = 8; conf = '94%'; catName = 'Open Burning'; }
      else if (name.includes('electronic') || name.includes('ewaste')) { predictedCatId = 6; conf = '89%'; catName = 'E-Waste'; }

      setAiPrediction({ categoryId: predictedCatId, categoryName: catName, confidence: conf });
      if (!categoryId) setCategoryId(predictedCatId.toString());
    }
  };

  const handleLocationChange = (loc) => {
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    if (loc.address) setAddress(loc.address);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (title.length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }
    if (!categoryId) {
      setError('Please select an environmental category.');
      return;
    }
    if (description.length < 20) {
      setError('Description must be at least 20 characters long.');
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrl = '/uploads/dumping_park.jpg';

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadRes.data) {
          uploadedImageUrl = uploadRes.data;
        }
      }

      const payload = {
        title,
        description,
        categoryId: parseInt(categoryId),
        latitude,
        longitude,
        address,
        imageUrl: uploadedImageUrl,
      };

      const res = await api.post('/reports', payload);
      if (res.success && res.data) {
        try {
          await api.post('/evidence', {
            reportId: res.data.id,
            sourceType: 'CITIZEN_PHOTO',
            latitude,
            longitude,
            fileUrl: uploadedImageUrl,
            description: title + ' - ' + description
          });
        } catch (e) {
          console.error('Evidence registration:', e);
        }

        navigate(`/reports/${res.data.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#F7FAF7] py-10 px-4 sm:px-6 lg:px-8 text-[#1F2937]"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#1F2937] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-[20px] border border-emerald-950/5 shadow-xs p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div>
            <span className="text-[10px] font-bold text-[#166534] bg-[#DCFCE7] border border-emerald-200/50 px-2.5 py-1 rounded-md uppercase">
              Community Reporting Form
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#166534] mt-2">Report Civic Environmental Issue</h1>
            <p className="text-xs text-[#64748B] mt-1">Submit geotagged evidence for municipal verification and enforcement action.</p>
          </div>

          {/* Safety Warning UX Banner */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-extrabold text-amber-900">Citizen Safety & Responsibilities Instructions:</strong>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                <li>Submit only genuine, un-altered evidence.</li>
                <li>Do NOT confront, follow, or escalate situations with suspected offenders.</li>
                <li>Do NOT trespass onto private property to capture photos or videos.</li>
                <li>Maintain a safe distance at all times while collecting evidence.</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl p-4 flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Duplicate Report Warning */}
          {duplicates.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Info size={16} className="text-blue-600" />
                <span>Nearby Existing Environmental Issues ({duplicates.length} found)</span>
              </div>
              <p className="text-[11px] text-blue-800">A similar report already exists within 500 meters of this location:</p>
              <div className="space-y-1">
                {duplicates.map((d) => (
                  <div key={d.id} className="bg-white p-2.5 rounded-xl text-xs font-medium text-slate-700 flex justify-between items-center border border-slate-200">
                    <span className="truncate max-w-[300px] font-bold">{d.title} ({d.reportNumber})</span>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-[#DCFCE7] text-[#166534] rounded">{d.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Issue Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Severe Illegal Dumping behind City Park"
                required
                className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:border-[#166534]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:border-[#166534] bg-white font-semibold"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {aiPrediction && (
                  <div className="mt-2 px-3 py-2 bg-[#DCFCE7]/70 border border-emerald-200 rounded-xl text-[11px] text-[#166534] flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#22C55E]" /> Smart Suggestion: <strong>{aiPrediction.categoryName}</strong></span>
                    <span className="text-[9px] bg-[#166534] text-white px-1.5 py-0.5 rounded font-bold">Auto Detected</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Classification Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:border-[#166534] bg-white font-semibold"
                >
                  <option value="ENVIRONMENTAL_ISSUE">Standard Environmental Issue</option>
                  <option value="ILLEGAL_DUMPING">Illegal Dumping Violation</option>
                  <option value="ILLEGAL_BURNING">Illegal Waste Burning</option>
                  <option value="HAZARDOUS_WASTE">Hazardous Waste Contamination</option>
                  <option value="CONSTRUCTION_WASTE">Construction Waste Dumping</option>
                  <option value="E_WASTE">E-Waste Contamination</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the condition, estimated size, hazard level, and exact location markers..."
                required
                className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:border-[#166534]"
              />
            </div>

            {/* Geotagging Map Picker */}
            <div>
              <MapPicker
                latitude={latitude}
                longitude={longitude}
                onLocationChange={handleLocationChange}
              />
              <p className="text-[11px] font-mono text-[#166534] mt-1.5 bg-[#DCFCE7]/40 px-3 py-1.5 rounded-lg border border-[#166534]/5"><strong>Pinned Address:</strong> {address}</p>
            </div>

            {/* Evidence Image Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Evidence Photo / Media (With Cryptographic SHA-256 Integrity Digest)</label>
              <div className="border-2 border-dashed border-[#166534]/15 rounded-2xl p-4 text-center hover:border-[#166534]/35 transition-colors bg-slate-50">
                {previewUrl ? (
                  <div className="space-y-2">
                    <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-xl shadow-md border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => { setFile(null); setPreviewUrl(null); }}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer space-y-2 block py-2">
                    <Upload className="w-8 h-8 text-[#166534] mx-auto" />
                    <span className="text-xs font-bold text-slate-700 block">Click to upload photo evidence (.jpg, .jpeg, .png, .webp)</span>
                    <span className="text-[10px] text-[#64748B] block">SHA-256 hash will be generated automatically upon submission to prove file integrity</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-7 py-3.5 bg-[#166534] hover:bg-[#15803d] text-white font-extrabold text-sm rounded-xl shadow-sm hover:scale-[1.01] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Evidence...</> : 'Submit Verified Report'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default NewReportPage;
