import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Leaf, ArrowRight, ShieldCheck, Award, MapPin, CheckCircle, 
  Users, Sparkles, User, Shield, ShieldAlert, X, Scan, 
  Loader2, Cpu, Upload, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const exampleItems = [
  { id: 'bottle', name: 'Plastic Water Bottle', image: '/assets/waste/plastic-bottle.jpg', category: 'Plastic Waste', confidence: '96.8%', points: '15 points' },
  { id: 'apple', name: 'Half-Eaten Apple Core', image: '/assets/waste/apple-core.jpg', category: 'Organic Waste', confidence: '94.2%', points: '10 points' },
  { id: 'laptop', name: 'Discarded Circuit Board', image: '/assets/waste/circuit-board.jpg', category: 'E-Waste', confidence: '97.5%', points: '30 points' },
  { id: 'sodacan', name: 'Crushed Soda Can', image: '/assets/waste/soda-can.jpg', category: 'Metal Waste', confidence: '95.1%', points: '20 points' }
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

const LandingPage = () => {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [loadingRole, setLoadingRole] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // AI Sandbox states
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0 = idle, 1 = uploading, 2 = scanning, 3 = generating
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Animated counters
  const [stats, setStats] = useState({ volunteers: 100, wasteDiverted: 500, complianceRate: 70 });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        const volunteersDone = prev.volunteers >= 486;
        const wasteDone = prev.wasteDiverted >= 1842;
        const complianceDone = prev.complianceRate >= 98;

        if (volunteersDone && wasteDone && complianceDone) {
          clearInterval(interval);
          return prev;
        }

        return {
          volunteers: volunteersDone ? 486 : prev.volunteers + 20,
          wasteDiverted: wasteDone ? 1842 : prev.wasteDiverted + 70,
          complianceRate: complianceDone ? 98 : prev.complianceRate + 1
        };
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  const handleDemoLogin = async (demoEmail, roleName) => {
    setLoadingRole(roleName);
    try {
      const u = await login(demoEmail, 'password123');
      if (u && (u.role === 'AUTHORITY_OFFICER' || u.role === 'ADMIN')) {
        navigate('/enforcement');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      alert('Demo login failed: ' + err.message);
    } finally {
      setLoadingRole(null);
      setShowDemoModal(false);
    }
  };

  const selectFile = (selectedFile) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(selectedFile.type)) {
      setScanError("Please upload JPG, PNG, or WEBP images only");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setScanError("Image must be below 5MB");
      return;
    }
    setScanError(null);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setScanResult(null);
    stopCamera();
  };

  const startCamera = async () => {
    setFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setScanError(null);
    setIsCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setScanError("Camera access denied or unavailable. Please upload an image file instead.");
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
    setScanResult(null);
    setScanError(null);
    setScanStep(1);

    try {
      // 1. Resolve token or sign in guest automatically
      let token = localStorage.getItem('token');
      if (!token) {
        const authRes = await api.post('/auth/login', {
          email: 'citizen@greenpulse.demo',
          password: 'password123'
        });
        if (authRes.token) {
          token = authRes.token;
          localStorage.setItem('token', token);
        }
      }

      setScanStep(2);
      setTimeout(() => { if (isScanning) setScanStep(3); }, 800);

      // 2. Compile Multipart form
      const formData = new FormData();
      formData.append('file', file);

      const headers = { 'Content-Type': 'multipart/form-data' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 3. Dispatch to classification controller
      const res = await api.post('/ai/classify', formData, { headers });

      if (res.success && res.data) {
        setScanResult(res.data);
      } else {
        throw new Error(res.message || "Failed to classify");
      }
    } catch (err) {
      console.warn("AI demo scan failed, running local sandbox prediction:", err.message);
      // Fallback local mock simulation to keep workspace active even if backend is offline
      setScanResult({
        predictedCategory: "Plastic",
        confidence: 94.5,
        recyclable: true,
        recommendedBin: "Blue Bin",
        ecoPoints: 10,
        materialType: "PET Plastic",
        conditionStatus: "Standard Recyclable",
        recommendedAction: "Clean and place in blue recycling bin"
      });
      setScanError("AI service temporarily unavailable. Falling back to simulated output.");
    } finally {
      setIsScanning(false);
      setScanStep(0);
    }
  };

  const loadExample = async (item) => {
    try {
      setIsScanning(true);
      setScanResult(null);
      setScanError(null);
      setScanStep(1);

      const response = await fetch(item.image);
      const blob = await response.blob();
      const exampleFile = new File([blob], `${item.id}.jpg`, { type: 'image/jpeg' });

      setFile(exampleFile);
      setPreviewUrl(item.image);

      setScanStep(2);
      setTimeout(() => setScanStep(3), 800);

      let token = localStorage.getItem('token');
      if (!token) {
        const authRes = await api.post('/auth/login', {
          email: 'citizen@greenpulse.demo',
          password: 'password123'
        });
        if (authRes.token) {
          token = authRes.token;
          localStorage.setItem('token', token);
        }
      }

      const formData = new FormData();
      formData.append('file', exampleFile);

      const headers = { 'Content-Type': 'multipart/form-data' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await api.post('/ai/classify', formData, { headers });

      if (res.success && res.data) {
        setScanResult(res.data);
      } else {
        throw new Error("Failed to classify");
      }
    } catch (err) {
      console.warn("Example scan failed, applying local prediction simulation: ", err.message);
      setScanResult({
        predictedCategory: item.category.replace(" Waste", ""),
        confidence: parseFloat(item.confidence),
        recyclable: item.category !== 'Hazardous Waste',
        recommendedBin: item.id === 'bottle' ? 'Blue Bin' : item.id === 'apple' ? 'Compost Bin' : item.id === 'laptop' ? 'E-Waste Bin' : 'Red Bin',
        ecoPoints: item.id === 'bottle' ? 10 : item.id === 'apple' ? 10 : item.id === 'laptop' ? 50 : 20,
        materialType: item.id === 'laptop' ? 'Silicon / PCB' : item.id === 'sodacan' ? 'Aluminium' : item.id === 'apple' ? 'Organic scraps' : 'PET Plastic',
        conditionStatus: 'Clean / Recyclable',
        recommendedAction: item.id === 'bottle' ? 'Rinse thoroughly and place in the Blue plastic bin.' : 'Sort and recycle item in designated municipal bins.'
      });
      setScanError("AI service temporarily unavailable. Running fallback output.");
    } finally {
      setIsScanning(false);
      setScanStep(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF7] text-[#1F2937] overflow-hidden pb-24 relative">
      <div className="eco-glow top-0 right-0 translate-x-1/3 -translate-y-1/3 scale-110 opacity-70"></div>
      <div className="eco-glow-subtle bottom-0 left-0 -translate-x-1/3 translate-y-1/3 opacity-70"></div>

      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DCFCE7] border border-emerald-200 text-xs font-extrabold text-[#166534] shadow-2xs">
              <Cpu className="w-3.5 h-3.5 text-[#166534] animate-pulse" /> AI-Powered Civic Environmental Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Cleaner Cities <br />
              Accelerated by <br />
              <span className="text-[#166534] relative">
                Computer Vision
                <span className="absolute bottom-1 left-0 w-full h-2 bg-[#DCFCE7]/70 -z-10"></span>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] font-medium leading-relaxed max-w-xl">
              Report environmental issues in India. GreenPulse uses intelligent computer vision algorithms to categorize waste, verify evidence integrity, and dispatch municipal crews instantly.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setShowDemoModal(true)}
                className="px-6 py-3.5 bg-[#166534] hover:bg-[#15803d] text-white font-extrabold text-sm rounded-xl shadow-sm hover:scale-[1.01] transition-all flex items-center gap-2"
              >
                Try Live Demo <Sparkles className="w-4 h-4 text-emerald-200" />
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('ai-scanner');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-[#1F2937] font-extrabold text-sm rounded-xl border border-slate-200 shadow-2xs hover:scale-[1.01] transition-all flex items-center gap-2"
              >
                Test AI Sandbox <ArrowRight className="w-4 h-4 text-[#166534]" />
              </button>
            </div>

            <div className="pt-6 border-t border-slate-200/60 grid grid-cols-3 gap-4">
              <div>
                <span className="text-2xl font-black text-[#1F2937]">{stats.volunteers}+</span>
                <span className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-1">Volunteers</span>
              </div>
              <div>
                <span className="text-2xl font-black text-[#166534]">{stats.wasteDiverted} kg+</span>
                <span className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-1">Waste Managed</span>
              </div>
              <div>
                <span className="text-2xl font-black text-emerald-600">{stats.complianceRate}%</span>
                <span className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-1">Resolution SLA</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-6 relative flex items-center justify-center min-h-[380px]"
          >
            <svg viewBox="0 0 500 400" className="w-full max-w-[460px] drop-shadow-md z-0" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0 350 Q 150 280 300 330 T 500 350 L 500 400 L 0 400 Z" fill="#E8F5E9" />
              <path d="M 100 360 Q 250 310 400 350 T 500 370 L 500 400 L 100 400 Z" fill="#C8E6C9" opacity="0.7" />
              
              <rect x="70" y="270" width="45" height="28" rx="2" fill="#374151" transform="skewX(-15)" />
              <line x1="78" y1="270" x2="78" y2="298" stroke="#9CA3AF" strokeWidth="1" transform="skewX(-15)" />
              <line x1="90" y1="270" x2="90" y2="298" stroke="#9CA3AF" strokeWidth="1" transform="skewX(-15)" />
              <line x1="102" y1="270" x2="102" y2="298" stroke="#9CA3AF" strokeWidth="1" transform="skewX(-15)" />
              
              <line x1="390" y1="330" x2="390" y2="180" stroke="#9CA3AF" strokeWidth="3" />
              <circle cx="390" cy="180" r="7" fill="#4B5563" />
              <path d="M 390 180 L 330 160 M 390 180 L 420 130 M 390 180 L 400 240" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" />
              
              <rect x="230" y="190" width="80" height="130" rx="4" fill="#F1F5F9" />
              <path d="M 225 190 L 315 190 L 270 170 Z" fill="#166534" />
              <rect x="245" y="210" width="14" height="18" rx="1" fill="#BAF3E6" />
              <rect x="278" y="210" width="14" height="18" rx="1" fill="#BAF3E6" />
              <rect x="245" y="240" width="14" height="18" rx="1" fill="#BAF3E6" />
              <rect x="278" y="240" width="14" height="18" rx="1" fill="#BAF3E6" />
              
              <circle cx="140" cy="290" r="28" fill="#22C55E" opacity="0.85" />
              <line x1="140" y1="290" x2="140" y2="345" stroke="#78350F" strokeWidth="3.5" />
              <circle cx="330" cy="300" r="22" fill="#15803D" opacity="0.9" />
              <line x1="330" y1="300" x2="330" y2="345" stroke="#78350F" strokeWidth="2.5" />
            </svg>

            <div className="absolute bottom-10 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3 animate-float-slow">
              <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Resolved Issues</div>
                <div className="text-lg font-black text-[#1F2937]">278 Tickets Closed</div>
              </div>
            </div>

            <div className="absolute top-10 left-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3 animate-float-slow [animation-delay:3s]">
              <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Demographics</div>
                <div className="text-lg font-black text-[#1F2937]">India Monitoring</div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Interactive AI Waste Sandbox Section */}
      <section id="ai-scanner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 relative z-10">
        <div className="bg-white border border-slate-200 rounded-[24px] p-6 sm:p-10 shadow-xs space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#166534] bg-[#DCFCE7] border border-emerald-200/50 px-2.5 py-1 rounded-md uppercase">
              Interactive Computer Vision Simulator
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Try our AI Waste Classifier</h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Upload any waste or object image to compute real-time category classifications, material types, and eco reward incentives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch pt-4">
            
            {/* Left side: Upload card & camera capture (Workspace) */}
            <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-[#64748B]">Sandbox Image Ingestion</span>
                <button
                  onClick={() => {
                    if (isCameraActive) stopCamera();
                    else startCamera();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-[#DCFCE7] border border-emerald-100 text-[#166534] font-extrabold text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" /> {isCameraActive ? "Close Camera" : "Use Camera"}
                </button>
              </div>

              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) selectFile(e.dataTransfer.files[0]);
                }}
                className="relative h-[280px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-4 text-center cursor-pointer overflow-hidden"
              >
                {/* Camera View */}
                {isCameraActive && (
                  <div className="w-full h-full relative">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-lg"></video>
                    <button
                      onClick={captureSnapshot}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-white hover:bg-emerald-50 text-[#166534] rounded-full flex items-center justify-center border-4 border-emerald-600/20 cursor-pointer shadow-md"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Preview Image */}
                {!isCameraActive && previewUrl && (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <img src={previewUrl} alt="Target Ingest" className="max-w-full max-h-full object-contain rounded-lg" />
                    {isScanning && (
                      <div className="absolute inset-x-0 bg-emerald-500/10 h-1.5 border-t-2 border-emerald-400 shadow-[0_0_15px_#22c55e] animate-scan-laser z-20"></div>
                    )}
                  </div>
                )}

                {/* Dropzone text */}
                {!isCameraActive && !previewUrl && (
                  <div onClick={() => fileInputRef.current.click()} className="space-y-3 py-6 w-full h-full flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="text-xs">
                      <span className="font-extrabold text-[#166534] underline">Upload Waste Image</span> or drag & drop here
                    </div>
                    <p className="text-[9px] text-[#64748B] font-semibold">JPG, JPEG, PNG or WEBP (Max 5MB)</p>
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

              {/* Predict triggers */}
              <div className="flex gap-2">
                {previewUrl && (
                  <button
                    disabled={isScanning}
                    onClick={handleScanSubmit}
                    className="flex-1 py-3 bg-[#166534] hover:bg-[#15803d] text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
                    onClick={() => { setFile(null); setPreviewUrl(null); setScanResult(null); }}
                    className="px-4.5 py-3 border border-slate-200 text-[#64748B] hover:text-slate-800 font-extrabold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Right side: Detailed Analysis Result Card */}
            <div className="md:col-span-5 bg-[#F7FAF7] border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden">
              
              {!activeItem && !previewUrl ? (
                <div className="text-center space-y-2 text-[#64748B]">
                  <Scan className="w-12 h-12 mx-auto text-slate-300 animate-pulse" />
                  <p className="text-xs font-bold">Select an example or upload an image to start</p>
                  <p className="text-[10px] text-slate-400">Deep learning predictions are calculated in real-time</p>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center space-y-4">
                  <div className="w-full flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-xs font-bold text-[#64748B]">AI Model Output:</span>
                    {isScanning ? (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Analyzing...
                      </span>
                    ) : (
                      <div className="flex gap-1.5 items-center">
                        {((scanResult ? scanResult.confidence : (activeItem ? parseFloat(activeItem.confidence) : 95.0)) >= 85) ? (
                          <span className="text-[9px] font-bold bg-[#DCFCE7] text-[#166534] border border-emerald-250 px-2 py-0.5 rounded flex items-center gap-0.5">
                            AI Verified
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-0.5">
                            Needs Human Verification
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500" /> Complete
                        </span>
                      </div>
                    )}
                  </div>

                  {isScanning ? (
                    <div className="space-y-3.5 py-6 w-full">
                      <div className="h-3.5 bg-slate-200 rounded-full w-3/4 animate-pulse"></div>
                      <div className="h-3.5 bg-slate-200 rounded-full w-1/2 animate-pulse"></div>
                      <div className="h-3.5 bg-slate-200 rounded-full w-2/3 animate-pulse"></div>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full space-y-3 text-xs text-slate-800"
                    >
                      {scanError && (
                        <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/60 leading-normal font-semibold">
                          ⚠️ {scanError}
                        </p>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Detected Category:</span>
                        <span className="font-extrabold text-slate-900">
                          {scanResult ? scanResult.predictedCategory : (activeItem ? activeItem.category : "Plastic")}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-semibold">Confidence:</span>
                          <span className="font-mono font-extrabold text-emerald-600">
                            {scanResult ? `${scanResult.confidence}%` : (activeItem ? activeItem.confidence : "95.0%")}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: `${scanResult ? scanResult.confidence : (activeItem ? parseFloat(activeItem.confidence) : 95.0)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Material:</span>
                        <span className="font-extrabold text-slate-900">
                          {scanResult ? scanResult.materialType : (activeItem ? (activeItem.id === 'laptop' ? 'Silicon / PCB' : activeItem.id === 'sodacan' ? 'Aluminium' : activeItem.id === 'apple' ? 'Organic scraps' : 'PET Plastic') : "PET Plastic")}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Waste Condition:</span>
                        <span className="font-extrabold text-amber-700">
                          {scanResult ? scanResult.conditionStatus : "Clean / Recyclable"}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-50 border border-slate-200/60 rounded-xl space-y-0.5">
                        <span className="text-[8px] font-bold text-[#64748B] block">AI Classification Reasoning</span>
                        <p className="text-[9px] text-slate-600 leading-normal font-semibold">
                          {getAiReasoning(scanResult ? scanResult.predictedCategory : (activeItem ? activeItem.category : 'Plastic'))}
                        </p>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Recommended action:</span>
                        <span className="font-extrabold text-slate-900 text-right max-w-[180px] truncate">
                          {scanResult ? scanResult.recommendedBin : (activeItem ? activeItem.category : "Blue Bin")} Bin
                        </span>
                      </div>

                      <div className="flex justify-between border-t border-slate-200/60 pt-2">
                        <span className="text-slate-500 font-semibold">Eco Points:</span>
                        <span className="font-extrabold text-slate-950 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          +{scanResult ? scanResult.ecoPoints : (activeItem ? activeItem.points.split(' ')[0] : "10")} XP
                        </span>
                      </div>

                      <div className="p-2.5 bg-[#DCFCE7]/40 rounded-lg border border-emerald-100/50 text-[10px] text-emerald-800 font-semibold text-center mt-1">
                        🌿 Environmental Impact: You diverted approximately 0.2kg waste from landfill
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* Sandbox Examples list */}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <span className="text-xs font-bold text-[#64748B] block">Try Examples (Quick Load Sandbox)</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {exampleItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => loadExample(item)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 bg-slate-50 hover:bg-white hover:shadow-2xs transition-all ${activeItem?.id === item.id ? 'border-[#166534] ring-1 ring-[#DCFCE7]' : 'border-slate-200'}`}
                >
                  <img src={item.image} alt={item.name} className="w-9 h-9 object-cover rounded border border-slate-100" />
                  <span className="text-[10px] font-bold text-slate-800 truncate leading-tight">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Live City Impact Board Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 relative z-10">
        <div className="bg-white border border-slate-200 rounded-[24px] p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#166534]" /> Live City Impact Board
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">Municipal enforcement metrics tracked across active Indian urban corridors.</p>
            </div>
            <div className="text-[10px] font-bold text-[#166534] bg-[#DCFCE7] px-3 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-ping"></span> Live Seed Database Status
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[#64748B] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Urban Corridor</th>
                  <th className="py-3 px-4">Active Responders</th>
                  <th className="py-3 px-4">Recovered Material</th>
                  <th className="py-3 px-4">SLA Compliance</th>
                  <th className="py-3 px-4 text-right">Monitoring Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { city: 'Thrissur, Kerala', volunteers: 172, waste: '1,240 kg', sla: '96.8%', status: 'HIGHLY ACTIVE' },
                  { city: 'Kochi, Kerala', volunteers: 98, waste: '942 kg', sla: '97.2%', status: 'ACTIVE' },
                  { city: 'Bangalore, Karnataka', volunteers: 126, waste: '1,050 kg', sla: '94.5%', status: 'ACTIVE' },
                  { city: 'Mumbai, Maharashtra', volunteers: 89, waste: '870 kg', sla: '95.1%', status: 'MONITORED' },
                  { city: 'Delhi', volunteers: 54, waste: '540 kg', sla: '92.0%', status: 'STABLE' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> {row.city}
                    </td>
                    <td className="py-3.5 px-4">{row.volunteers} citizens</td>
                    <td className="py-3.5 px-4 text-slate-700">{row.waste}</td>
                    <td className="py-3.5 px-4 text-[#166534] font-extrabold">{row.sla}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${row.status === 'HIGHLY ACTIVE' ? 'bg-[#DCFCE7] text-[#166534] border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white border border-slate-200 rounded-[20px] p-8 space-y-4 shadow-2xs hover:scale-[1.01] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#1F2937]">Geo-Tagged Incident Map</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Capture GPS coordinates, evidence photos, and category details instantly for precise municipal action.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[20px] p-8 space-y-4 shadow-2xs hover:scale-[1.01] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#1F2937]">Compliance Workflow</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Triage queue for moderators, field worker resolution, and authority officer fine issuance.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[20px] p-8 space-y-4 shadow-2xs hover:scale-[1.01] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#1F2937]">Eco Contribution Rewards</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Earn Eco-Points for verified environmental contributions and redeem community perks.
            </p>
          </div>

        </div>
      </section>

      {/* Demo Access Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-[20px] p-6 max-w-2xl w-full shadow-md space-y-6 relative"
            >
              <button 
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <div className="w-10 h-10 bg-[#166534] rounded-xl mx-auto flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900">Explore GreenPulse Live Demo</h3>
                <p className="text-xs text-[#64748B]">Select one of the pre-seeded municipal roles to instantly enter the workspace.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between items-center text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Citizen Portal</h4>
                    <p className="text-[10px] text-[#64748B] leading-relaxed mt-1">Submit reports, view live map, and claim Eco-Point rewards.</p>
                  </div>
                  <button
                    onClick={() => handleDemoLogin('citizen@greenpulse.demo', 'Citizen')}
                    disabled={loadingRole !== null}
                    className="w-full py-2 bg-[#166534] hover:bg-[#15803d] text-white font-extrabold text-[11px] rounded-lg shadow-xs hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                    {loadingRole === 'Citizen' ? 'Logging in...' : 'Enter as Citizen'}
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between items-center text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-indigo-700 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Municipal Desk</h4>
                    <p className="text-[10px] text-[#64748B] leading-relaxed mt-1">Ingest CCTV evidence, trace offenders, and issue fine challans.</p>
                  </div>
                  <button
                    onClick={() => handleDemoLogin('authority@greenpulse.demo', 'Authority')}
                    disabled={loadingRole !== null}
                    className="w-full py-2 bg-[#166534] hover:bg-[#15803d] text-white font-extrabold text-[11px] rounded-lg shadow-xs hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                    {loadingRole === 'Authority' ? 'Logging in...' : 'Enter as Authority'}
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between items-center text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-amber-700 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Moderator Desk</h4>
                    <p className="text-[10px] text-[#64748B] leading-relaxed mt-1">Audit incoming submissions and verify crypto hashing of files.</p>
                  </div>
                  <button
                    onClick={() => handleDemoLogin('moderator@greenpulse.demo', 'Moderator')}
                    disabled={loadingRole !== null}
                    className="w-full py-2 bg-[#166534] hover:bg-[#15803d] text-white font-extrabold text-[11px] rounded-lg shadow-xs hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                    {loadingRole === 'Moderator' ? 'Logging in...' : 'Enter as Moderator'}
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
