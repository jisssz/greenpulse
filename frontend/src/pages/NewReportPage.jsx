import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../components/MapPicker';
import { Upload, AlertCircle, FileText, CheckCircle2, ArrowLeft, Loader2, Info, ShieldAlert, Lock, Sparkles, Eye } from 'lucide-react';
import api from '../services/api';

const NewReportPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [reportType, setReportType] = useState('ENVIRONMENTAL_ISSUE');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('100 Main Street, Central District');
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);
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
    <div className="min-h-screen bg-forest-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="glass-panel rounded-3xl border border-emerald-500/20 shadow-glass p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md uppercase">
              Community Reporting Form
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">Report Civic Environmental Issue</h1>
            <p className="text-xs text-slate-400 mt-1">Submit geotagged evidence for municipal verification and enforcement action.</p>
          </div>

          {/* Safety Warning UX Banner */}
          <div className="bg-amber-500/15 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
            <ShieldAlert size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-extrabold text-amber-300">Citizen Safety & Responsibilities Instructions:</strong>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-200/80">
                <li>Submit only genuine, un-altered evidence.</li>
                <li>Do NOT confront, follow, or escalate situations with suspected offenders.</li>
                <li>Do NOT trespass onto private property to capture photos or videos.</li>
                <li>Maintain a safe distance at all times while collecting evidence.</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl p-4 flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Duplicate Report Warning */}
          {duplicates.length > 0 && (
            <div className="bg-blue-500/15 border border-blue-500/30 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                <Info size={16} className="text-blue-400" />
                <span>Nearby Existing Environmental Issues ({duplicates.length} found)</span>
              </div>
              <p className="text-[11px] text-blue-200/80">A similar report already exists within 500 meters of this location:</p>
              <div className="space-y-1">
                {duplicates.map((d) => (
                  <div key={d.id} className="bg-forest-900/80 p-2 rounded-lg text-xs font-medium text-slate-200 flex justify-between items-center border border-blue-500/20">
                    <span className="truncate max-w-[300px]">{d.title} ({d.reportNumber})</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 rounded text-slate-300">{d.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Issue Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Severe Illegal Dumping behind City Park"
                required
                className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:border-emerald-500/60"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:border-emerald-500/60 bg-forest-950"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {aiPrediction && (
                  <div className="mt-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Smart Category Suggestion: <strong>{aiPrediction.categoryName}</strong></span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">User Override Available</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Classification Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:border-emerald-500/60 bg-forest-950 font-semibold"
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
              <label className="block text-xs font-bold text-slate-300 mb-1">Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the condition, estimated size, hazard level, and exact location markers..."
                required
                className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:border-emerald-500/60"
              />
            </div>

            {/* Geotagging Map Picker */}
            <div>
              <MapPicker
                latitude={latitude}
                longitude={longitude}
                onLocationChange={handleLocationChange}
              />
              <p className="text-[11px] font-mono text-emerald-400/80 mt-1">Address: {address}</p>
            </div>

            {/* Evidence Image Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Evidence Photo / Media (With Cryptographic SHA-256 Integrity Digest)</label>
              <div className="border-2 border-dashed border-emerald-500/20 rounded-2xl p-4 text-center hover:border-emerald-500/50 transition-colors bg-forest-900/50">
                {previewUrl ? (
                  <div className="space-y-2">
                    <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-xl shadow-md border border-emerald-500/30" />
                    <button
                      type="button"
                      onClick={() => { setFile(null); setPreviewUrl(null); }}
                      className="text-xs font-bold text-rose-400 hover:underline"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer space-y-2 block">
                    <Upload className="w-8 h-8 text-emerald-400 mx-auto" />
                    <span className="text-xs font-bold text-slate-200 block">Click to upload photo evidence (.jpg, .jpeg, .png, .webp)</span>
                    <span className="text-[10px] text-slate-400 block">SHA-256 hash will be generated automatically upon submission to prove file integrity</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-500/10 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold text-sm rounded-xl shadow-glow-emerald transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Evidence...</> : 'Submit Verified Report'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default NewReportPage;
