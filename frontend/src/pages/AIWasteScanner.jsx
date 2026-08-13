import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Upload, Leaf, CheckCircle2, 
  ArrowRight, Loader2, Sparkles, Trophy, Trash2, 
  Activity, RefreshCw, AlertCircle, Sparkles as SparklesIcon 
} from 'lucide-react';
import api from '../services/api';

const exampleItems = [
  { id: 'bottle', name: 'Plastic Water Bottle', image: '/assets/waste/plastic-bottle.jpg', category: 'Plastic', confidence: 96.8, bin: 'Blue Bin' },
  { id: 'apple', name: 'Half-Eaten Apple Core', image: '/assets/waste/apple-core.jpg', category: 'Organic Waste', confidence: 94.2, bin: 'Compost Bin' },
  { id: 'laptop', name: 'Discarded Circuit Board', image: '/assets/waste/circuit-board.jpg', category: 'Electronic Waste', confidence: 97.5, bin: 'E-Waste Bin' },
  { id: 'sodacan', name: 'Crushed Soda Can', image: '/assets/waste/soda-can.jpg', category: 'Metal', confidence: 95.1, bin: 'Red Bin' }
];

const getAiReasoning = (category) => {
  const cat = category ? category.split(' ')[0] : 'Plastic';
  switch(cat) {
    case 'Plastic':
      return "Identified transparent/synthetic polymer textures and cylindrical neck geometries matching standard PET container designs.";
    case 'Organic':
      return "Detected cellular biodegradable structural patterns and organic oxidation textures indicative of food scraps or cellulose breakdown.";
    case 'Electronic':
    case 'E-Waste':
      return "Identified glass fiber resin sheets, copper trace overlays, and semiconductor outline profiles corresponding to circuit assemblies.";
    case 'Metal':
      return "Detected metallic specular reflection peaks and crush deformation characteristics of lightweight container aluminum alloy.";
    case 'Glass':
      return "Identified specularity anomalies and brittle fracture edges matching silica container glass properties.";
    case 'Paper':
      return "Detected matte fibrous pulped cellulose sheets and clean geometric fold lines matching cardboard packaging.";
    default:
      return "Matched visual features corresponding to municipal solid waste categories and recycling database profiles.";
  }
};

const AIWasteScanner = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0 = idle, 1 = uploading, 2 = scanning, 3 = generating
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

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectFile(e.dataTransfer.files[0]);
    }
  };

  const selectFile = (selectedFile) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(selectedFile.type)) {
      setError("Please upload JPG, PNG, or WEBP images only");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image must be below 5MB");
      return;
    }
    setError(null);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setPrediction(null);
    stopCamera();
  };

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

  const handleScanSubmit = async () => {
    if (!file) return;
    setIsScanning(true);
    setPrediction(null);
    setError(null);

    // Step 1: Uploading image...
    setScanStep(1);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step 2: AI Vision scanning...
      setTimeout(() => {
        if (isScanning) setScanStep(2);
      }, 800);

      // Step 3: Generating environmental report...
      setTimeout(() => {
        if (isScanning) setScanStep(3);
      }, 1600);

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
      setError(err.message || "AI service temporarily unavailable. Please try again.");
    } finally {
      setIsScanning(false);
      setScanStep(0);
    }
  };

  const loadExample = async (item) => {
    try {
      setIsScanning(true);
      setPrediction(null);
      setError(null);
      setScanStep(1);

      const response = await fetch(item.image);
      const blob = await response.blob();
      const exampleFile = new File([blob], `${item.id}.jpg`, { type: 'image/jpeg' });

      setFile(exampleFile);
      setPreviewUrl(item.image);

      setScanStep(2);
      setTimeout(() => setScanStep(3), 800);

      const formData = new FormData();
      formData.append('file', exampleFile);

      const res = await api.post('/ai/classify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success && res.data) {
        setPrediction(res.data);
        fetchHistoryAndStats();
      } else {
        throw new Error(res.message || "Failed to classify example.");
      }
    } catch (err) {
      setError("AI service temporarily unavailable");
      // Local fallback simulation
      setPrediction({
        predictedCategory: item.category,
        confidence: item.confidence,
        recyclable: item.category !== 'Hazardous Waste',
        recommendedBin: item.bin,
        ecoPoints: item.id === 'laptop' ? 50 : item.id === 'sodacan' ? 20 : 10,
        materialType: item.id === 'laptop' ? 'Silicon / PCB' : item.id === 'sodacan' ? 'Aluminium' : item.id === 'apple' ? 'Organic scrap' : 'PET Plastic',
        conditionStatus: 'Standard Recyclable'
      });
    } finally {
      setIsScanning(false);
      setScanStep(0);
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
      <div className="bg-white border border-emerald-950/5 rounded-[20px] p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534] border border-emerald-200/50 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Live Waste Classification Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">AI Waste Classification Scanner</h1>
          <p className="text-xs text-[#64748B] font-semibold">Upload pictures of household waste to classify material types, check conditions, and earn eco rewards.</p>
        </div>
        <div className="flex gap-2">
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-extrabold text-xs shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#166534]" /> Launch Camera
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

      {/* 4 Stats Cards */}
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

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Upload & Camera (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-emerald-950/5 rounded-[20px] p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-sm">Image Upload & Classification Workspace</h3>
            <span className="text-[10px] font-bold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-full uppercase">Real-Time Ingestion</span>
          </div>

          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative h-[360px] rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center"
          >
            {/* Camera Frame */}
            {isCameraActive && (
              <div className="w-full h-full relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-xl"></video>
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

            {/* Selected Image Preview with Laser Line Overlay */}
            {!isCameraActive && previewUrl && (
              <div className="w-full h-full relative flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl" />
                {isScanning && (
                  <div className="absolute inset-x-0 bg-emerald-500/10 h-1.5 border-t-2 border-emerald-400 shadow-[0_0_15px_#22c55e] animate-scan-laser z-20"></div>
                )}
              </div>
            )}

            {/* Standard Drop zone Placeholder */}
            {!isCameraActive && !previewUrl && (
              <div 
                onClick={() => fileInputRef.current.click()}
                className="space-y-4 cursor-pointer hover:opacity-80 transition-all flex flex-col items-center justify-center h-full w-full"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#166534]">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-slate-800">
                    Drop image here or <span className="text-[#166534] underline">browse device</span>
                  </p>
                  <p className="text-[10px] text-[#64748B] font-semibold">Supports JPG, JPEG, PNG, or WEBP (Max 5MB)</p>
                </div>
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

          {/* Action triggers */}
          <div className="flex gap-2">
            {previewUrl && (
              <button
                disabled={isScanning}
                onClick={handleScanSubmit}
                className="flex-1 py-3 bg-[#166534] hover:bg-[#15803d] text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer transition-all"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> 
                    {scanStep === 1 && "Uploading waste image..."}
                    {scanStep === 2 && "AI Vision scanning..."}
                    {scanStep === 3 && "Generating environmental report..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" /> Analyze Waste Image
                  </>
                )}
              </button>
            )}
            {previewUrl && (
              <button
                disabled={isScanning}
                onClick={() => { setFile(null); setPreviewUrl(null); setPrediction(null); }}
                className="px-5 py-3 border border-slate-200 text-[#64748B] hover:text-slate-800 font-extrabold text-xs rounded-xl hover:bg-slate-50 cursor-pointer transition-all"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Prediction Output Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {prediction ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border border-emerald-200 rounded-[20px] p-6 shadow-xs space-y-6 bg-gradient-to-br from-white to-emerald-50/10"
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm">AI Analysis Result 🌱</h3>
                  {prediction.confidence >= 85 ? (
                    <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-[#DCFCE7] text-[#166534] rounded-full flex items-center gap-0.5 border border-emerald-250">
                      AI Verified
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 rounded-full flex items-center gap-0.5 border border-amber-200">
                      Needs Human Verification
                    </span>
                  )}
                </div>

                <div className="space-y-4.5">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                      <img src={previewUrl} alt="Target Preview" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wide">Category Detected</span>
                      <h2 className="text-xl font-black text-slate-950 mt-0.5">{prediction.predictedCategory}</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-1">
                      <span className="text-[9px] font-bold text-[#64748B] block">Neural Confidence</span>
                      <span className="text-base font-black text-slate-900">{prediction.confidence}%</span>
                      <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-1 rounded-full transition-all" 
                          style={{ width: `${prediction.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5">
                      <span className="text-[9px] font-bold text-[#64748B] block">Disposal Bin</span>
                      <span className="text-sm font-extrabold text-slate-800">{prediction.recommendedBin}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5">
                      <span className="text-[9px] font-bold text-[#64748B] block">Material Analysis</span>
                      <span className="text-xs font-extrabold text-[#166534]">{prediction.materialType || "Mixed Recyclable"}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5">
                      <span className="text-[9px] font-bold text-[#64748B] block">Waste Condition Analysis</span>
                      <span className="text-xs font-extrabold text-amber-700">{prediction.conditionStatus || "Untreated"}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-1">
                    <span className="text-[9px] font-bold text-[#64748B] block">AI Classification Reasoning</span>
                    <p className="text-[10px] text-slate-600 leading-normal font-semibold">
                      {getAiReasoning(prediction.predictedCategory)}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-1.5">
                    <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block">Recommended Action</span>
                    <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                      {prediction.recommendedAction || "Sort and recycle item in designated municipal bins."}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-[#166534] to-[#22C55E] rounded-xl p-4 text-white flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-bold text-emerald-100 uppercase tracking-wide block">Carbon Credits Added</span>
                      <span className="text-xs font-black">Environmental Reward</span>
                    </div>
                    <div className="text-lg font-black bg-white/20 px-3 py-1 rounded-lg">
                      +{prediction.ecoPoints} XP
                    </div>
                  </div>

                  <div className="p-3 bg-[#DCFCE7]/40 rounded-xl border border-emerald-100/50 text-[10px] text-emerald-800 font-bold text-center">
                    🌿 Environmental Impact: You diverted approximately 0.2kg waste from landfill
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-[20px] p-8 text-center text-[#64748B] text-xs font-bold h-full flex flex-col items-center justify-center min-h-[360px]">
                <Sparkles className="w-10 h-10 text-emerald-200 mb-2 animate-pulse" />
                Upload a waste photograph on the left workspace to compute deep learning material classifications.
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Examples section cards */}
      <div className="bg-white border border-emerald-950/5 rounded-[20px] p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-sm">Try Examples (Quick Load Sandbox)</h3>
          <p className="text-[10px] text-[#64748B] mt-0.5">Click any of these pre-configured objects to instantly trigger deep learning model runs.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {exampleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => loadExample(item)}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-all text-left flex gap-3 items-center group shadow-2xs cursor-pointer"
            >
              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-slate-150 shrink-0" />
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-slate-950 truncate group-hover:text-[#166534]">{item.name}</h4>
                <span className="text-[10px] text-slate-400 font-bold">Category: {item.category.split(' ')[0]}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* History log contributions */}
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
                <div className="p-3.5 space-y-2.5">
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-950 truncate">{h.predictedCategory}</h4>
                      <span className={`text-[8px] font-extrabold uppercase mt-0.5 inline-block ${
                        h.status === 'AUTO_APPROVED' ? 'text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100' :
                        h.status === 'APPROVED' ? 'text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100' :
                        h.status === 'REJECTED' ? 'text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-100' :
                        'text-amber-600 bg-amber-50 px-1 py-0.2 rounded border border-amber-100 animate-pulse'
                      }`}>
                        {h.status === 'AUTO_APPROVED' ? 'AI Verified' :
                         h.status === 'APPROVED' ? 'Human Verified' :
                         h.status === 'REJECTED' ? 'Rejected' : 'Pending Review'}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700 shrink-0">+{h.ecoPoints} XP</span>
                  </div>
                  <div className="text-[9px] text-[#64748B] font-semibold flex justify-between border-t border-slate-200/60 pt-2">
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

export default AIWasteScanner;
