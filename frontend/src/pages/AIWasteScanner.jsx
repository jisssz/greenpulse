import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Upload, Leaf, ShieldAlert, CheckCircle2, 
  ArrowRight, Loader2, Sparkles, Trophy, Trash2, 
  Activity, RefreshCw, AlertCircle, FileImage 
} from 'lucide-react';
import api from '../services/api';

const AIWasteScanner = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    ecoPointsEarned: 0,
    wasteDivertedKg: 0.0,
    recyclingAccuracy: 0.0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHistoryAndStats();
  }, []);

  const fetchHistoryAndStats = async () => {
    try {
      const [histRes, statsRes] = await Promise.all([
        api.get('/ai/history'),
        api.get('/ai/stats')
      ]);
      if (histRes.data) setHistory(histRes.data);
      if (statsRes.data) setStats(statsRes.data);
    } catch (e) {
      console.error("Failed to load history or statistics: ", e);
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectFile(e.dataTransfer.files[0]);
    }
  };

  const selectFile = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError("Please select a valid image file (JPG, JPEG, PNG)");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds maximum limit of 5MB");
      return;
    }
    setError(null);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setPrediction(null);
    stopCamera();
  };

  // Web Camera handlers
  const startCamera = async () => {
    setFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
    setIsCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera access denied or unavailable. Please upload an image file instead.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const capturedFile = new File([blob], `capture_${Date.now()}.png`, { type: 'image/png' });
        setFile(capturedFile);
        setPreviewUrl(URL.createObjectURL(capturedFile));
        stopCamera();
      }, 'image/png');
    }
  };

  // REST API request handler
  const handleScanSubmit = async () => {
    if (!file) return;
    setIsScanning(true);
    setPrediction(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/ai/classify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.success && res.data) {
        setPrediction(res.data);
        fetchHistoryAndStats();
      } else {
        throw new Error(res.message || "Failed to classify image.");
      }
    } catch (err) {
      setError(err.message || "ML prediction failed. Please try a different waste image.");
    } finally {
      setIsScanning(false);
    }
  };

  const getRecommendedAction = (cat) => {
    if ("Plastic".equalsIgnoreCase(cat)) return "Discard in the Blue recycling receptacle after rinsing off liquids.";
    if ("Metal".equalsIgnoreCase(cat)) return "Toss in the Red bin for sorting and crushing.";
    if ("Paper".equalsIgnoreCase(cat)) return "Ensure the item is dry and drop in the Green paper bin.";
    if ("Glass".equalsIgnoreCase(cat)) return "Rinse clean and place in the Yellow glass bottle bin.";
    if ("Organic Waste".equalsIgnoreCase(cat)) return "Place in Compost bin or bio-degradable container.";
    if ("Electronic Waste".equalsIgnoreCase(cat)) return "Deliver to the nearest municipal E-waste dropoff counter.";
    return "Hazardous material detected. Do not compost. Transfer to safe disposal center.";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen bg-[#F7FAF7] text-[#1F2937]"
    >
      
      {/* Hero Banner Header */}
      <div className="bg-white border border-emerald-950/5 rounded-[20px] p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534] border border-emerald-200/50 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Environmental Intelligence API Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">AI Waste Classification Scanner</h1>
          <p className="text-xs text-[#64748B] font-semibold">Upload or capture pictures of household waste to classify targets and earn GreenPulse eco reward points.</p>
        </div>
        <div className="flex gap-2">
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-extrabold text-xs shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#166534]" /> Live Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-extrabold text-xs hover:bg-rose-100 transition-all cursor-pointer"
            >
              Stop Camera
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#64748B]">Total AI Scans</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalScans}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#64748B]">Waste Diverted</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.wasteDivertedKg} kg</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#22C55E] flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#64748B]">Eco Points Earned</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">+{stats.ecoPointsEarned} XP</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-emerald-950/5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#64748B]">Recycling Accuracy</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.recyclingAccuracy}%</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Scanner Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Video stream / Upload window (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-emerald-950/5 rounded-[20px] p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">Inference Workspace</h3>
          
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative h-[340px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center"
          >
            {/* 1. Camera mode */}
            {isCameraActive && (
              <div className="w-full h-full relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <button
                    onClick={captureSnapshot}
                    className="w-14 h-14 bg-white hover:bg-emerald-50 text-[#166534] rounded-full flex items-center justify-center border-4 border-emerald-600/30 cursor-pointer shadow-md transform hover:scale-105 active:scale-95 transition-all"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. File Preview */}
            {!isCameraActive && previewUrl && (
              <div className="w-full h-full relative">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                
                {/* Laser scan animation overlay */}
                {isScanning && (
                  <div className="absolute inset-x-0 bg-emerald-500/10 h-1 border-t border-emerald-400 shadow-[0_0_15px_#22c55e] animate-scan-laser z-20"></div>
                )}
              </div>
            )}

            {/* 3. Drag Drop Placeholder */}
            {!isCameraActive && !previewUrl && (
              <div className="text-center p-6 space-y-3 cursor-pointer" onClick={() => fileInputRef.current.click()}>
                <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                <div className="text-xs">
                  <span className="font-extrabold text-[#166534]">Upload a picture</span> or drag and drop files here
                </div>
                <p className="text-[10px] text-[#64748B] font-semibold">JPG, JPEG or PNG up to 5MB</p>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files[0] && selectFile(e.target.files[0])}
              className="hidden"
              accept="image/*"
            />
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>

          <div className="flex gap-2">
            {previewUrl && (
              <button
                disabled={isScanning}
                onClick={handleScanSubmit}
                className="flex-1 py-3 bg-[#166534] hover:bg-[#15803d] text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer transition-all"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Classifying Waste...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run Deep Learning Prediction
                  </>
                )}
              </button>
            )}
            {previewUrl && (
              <button
                disabled={isScanning}
                onClick={() => { setFile(null); setPreviewUrl(null); setPrediction(null); }}
                className="px-4.5 py-3 border border-slate-200 text-[#64748B] hover:text-slate-800 font-extrabold text-xs rounded-xl hover:bg-slate-50 cursor-pointer transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right column: Prediction result card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <AnimatePresence mode="wait">
            {prediction ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border border-emerald-200 rounded-[20px] p-6 shadow-xs space-y-6 bg-gradient-to-br from-white to-emerald-50/10"
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h3 className="font-extrabold text-slate-900 text-sm">AI Analysis Complete 🌱</h3>
                  <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-[#DCFCE7] text-[#166534] rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> CLASSIFIED
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wide">Category Detected</span>
                    <h2 className="text-2xl font-black text-slate-950 mt-0.5">{prediction.predictedCategory}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-150 rounded-xl p-3.5">
                      <span className="text-[9px] font-bold text-[#64748B] block">Neural Confidence</span>
                      <span className="text-lg font-black text-slate-900">{prediction.confidence}%</span>
                    </div>
                    <div className="bg-white border border-slate-150 rounded-xl p-3.5">
                      <span className="text-[9px] font-bold text-[#64748B] block">Recyclable Status</span>
                      <span className={`text-sm font-extrabold ${prediction.recyclable ? 'text-emerald-700' : 'text-amber-800'}`}>
                        {prediction.recyclable ? 'RECYCLABLE' : 'SPECIAL DISPOSAL'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-150 rounded-xl p-4 space-y-2">
                    <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block">Recommended Action</span>
                    <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                      Recycle in: <span className="font-extrabold text-[#166534]">{prediction.recommendedBin}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">
                      {getRecommendedAction(prediction.predictedCategory)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-600 to-[#22C55E] rounded-xl p-4 text-white flex justify-between items-center shadow-xs">
                    <div>
                      <span className="text-[9px] font-bold text-emerald-100 uppercase tracking-wide block">Carbon Credits Added</span>
                      <span className="text-base font-black">Environmental Reward</span>
                    </div>
                    <div className="text-2xl font-black bg-white/20 px-3 py-1 rounded-lg">
                      +{prediction.ecoPoints} XP
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-[20px] p-8 text-center text-[#64748B] text-xs font-bold h-full flex flex-col items-center justify-center min-h-[300px]">
                <Sparkles className="w-10 h-10 text-emerald-200 mb-2 animate-pulse" />
                Provide a waste photo to run deep learning classification.
              </div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* History Log: My AI Recycling Contributions */}
      <div className="bg-white border border-emerald-950/5 rounded-[20px] p-5 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">My AI Recycling Contributions</h3>

        {history.length === 0 ? (
          <div className="py-8 text-center text-[#64748B] text-xs font-semibold">No recent AI scans found. Start scanning your items today!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {history.slice(0, 8).map((h) => (
              <div key={h.id} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-150 flex flex-col justify-between shadow-2xs">
                <div className="relative h-32 bg-slate-200">
                  <img src={h.imageUrl.startsWith('/uploads') ? api.defaults.baseURL.replace('/api', '') + h.imageUrl : h.imageUrl} alt="Scan Target" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-mono text-white">
                    {h.confidence}% conf
                  </div>
                </div>
                <div className="p-3.5 space-y-2">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-extrabold text-xs text-slate-950 truncate">{h.predictedCategory}</h4>
                    <span className="text-[9px] font-black text-emerald-700 shrink-0">+{h.ecoPoints} XP</span>
                  </div>
                  <div className="text-[9px] text-[#64748B] font-bold flex justify-between">
                    <span>Bin: {h.recommendedBin}</span>
                    <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
};

// Simple utility helper mapping String equalsIgnoreCase
String.prototype.equalsIgnoreCase = function (anotherString) {
  return (anotherString == null) ? false : (this.toLowerCase() === anotherString.toLowerCase());
};

export default AIWasteScanner;
