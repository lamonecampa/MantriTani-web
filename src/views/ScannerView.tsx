import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, RefreshCw, X, ShieldCheck, AlertTriangle, List, Info, ArrowLeft, Upload } from "lucide-react";

interface ScanResult {
  status: string;
  diseaseName: string;
  scientificName?: string;
  confidence: number;
  description: string;
  symptoms: string[];
  recommendations: string[];
}

export default function ScannerView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      try {
        videoRef.current.srcObject = stream;
        // Force play to prevent black screen freeze on older devices & desktop browsers
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Autoplay was prevented or video play issue:", err);
          });
        }
      } catch (err) {
        console.error("Gagal menyematkan video stream:", err);
      }
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      setError(null);
      // Request standard environment facing camera
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });
      setStream(mediaStream);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Izin kamera ditolak atau tidak didukung pada browser ini. Anda dapat menggunakan Kamera Sistem atau Galeri HP secara langsung di bawah.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) return;

      setIsAnalyzing(true);
      setError(null);
      stopCamera();

      try {
        const response = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Data }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Gagal menganalisis gambar");
        }

        const data = await response.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat pemindaian");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    setIsAnalyzing(true);
    setError(null);

    // Set canvas dimensions to match video
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    const imageData = canvasRef.current.toDataURL("image/jpeg", 0.8);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal menganalisis gambar");
      }

      const data = await response.json();
      setResult(data);
      stopCamera();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat pemindaian");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setError(null);
    startCamera();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-800">Scanner Penyakit</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Deteksi Cepat via AI</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
            <Camera size={20} />
          </div>
        </div>

        <div className="relative aspect-square rounded-2xl bg-slate-900 overflow-hidden shadow-inner border border-slate-200">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative"
              >
                {stream ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover bg-black"
                    />
                    {/* Scanning Animation */}
                    <div className="absolute inset-0 border-2 border-emerald-500/30">
                      <motion.div
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_15px_#10b981] z-10"
                      />
                    </div>
                  </>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center text-white bg-slate-900/90 overflow-y-auto">
                    <AlertTriangle size={36} className="text-amber-500 mb-3" />
                    <p className="text-xs leading-relaxed font-semibold mb-4 text-slate-200">{error}</p>
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                      <button 
                        onClick={startCamera}
                        className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all"
                      >
                        Coba Kamera Langsung
                      </button>
                      <label className="cursor-pointer bg-white/10 hover:bg-white/20 active:scale-95 text-white py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all border border-white/20 inline-flex items-center justify-center gap-2">
                        <Upload size={14} className="text-emerald-400" />
                        <span>Kamera HP / Upload File</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          onChange={handleFileChange} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="animate-spin text-emerald-500" size={32} />
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full bg-slate-50 flex flex-col p-6 overflow-y-auto"
              >
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="text-emerald-500" size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Terdeteksi</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 leading-tight">{result.diseaseName}</h3>
                  {result.scientificName && (
                    <p className="text-slate-400 italic text-sm">{result.scientificName}</p>
                  )}
                </div>

                <div className="space-y-4 text-slate-600 text-sm">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-slate-800">
                      <Info size={16} className="text-emerald-500" />
                      <span className="font-black text-xs uppercase tracking-wider">Keterangan</span>
                    </div>
                    <p className="leading-relaxed opacity-80">{result.description}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                      <div className="flex items-center gap-2 mb-2 text-amber-900">
                        <AlertTriangle size={16} />
                        <span className="font-black text-xs uppercase tracking-wider">Gejala Utama</span>
                      </div>
                      <ul className="space-y-1.5">
                        {result.symptoms.map((s, i) => (
                          <li key={i} className="flex gap-2 text-xs opacity-80">
                            <span className="text-amber-500">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                      <div className="flex items-center gap-2 mb-2 text-emerald-900">
                        <List size={16} />
                        <span className="font-black text-xs uppercase tracking-wider">Rekomendasi Penanganan</span>
                      </div>
                      <ul className="space-y-1.5">
                        {result.recommendations.map((r, i) => (
                          <li key={i} className="flex gap-2 text-xs opacity-80">
                            <span className="text-emerald-500">•</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={resetScanner}
                  className="mt-8 bg-slate-800 text-white w-full py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Scan Gambar Lain
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!result && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center px-4 leading-relaxed">
              Posisikan daun yang sakit di tengah kotak atau unggah foto dari kamera sistem/galeri Anda
            </p>
            
            <div className="flex flex-col items-center gap-4 w-full">
              {stream && (
                <button
                  onClick={captureAndAnalyze}
                  disabled={isAnalyzing}
                  className={`w-20 h-20 rounded-full border-4 border-white shadow-2xl flex items-center justify-center transition-all ${
                    isAnalyzing ? "bg-slate-200 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600 active:scale-95"
                  }`}
                >
                  {isAnalyzing ? (
                    <RefreshCw className="text-white animate-spin" size={32} />
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              )}

              <div className="flex justify-center w-full">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 px-5 py-3 rounded-2xl font-black text-xs transition-all border border-slate-200/50 shadow-sm uppercase tracking-wider">
                  <Upload size={14} className="text-emerald-600" />
                  <span>Kamera HP / Pilih Gambar</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    disabled={isAnalyzing}
                  />
                </label>
              </div>
            </div>

            {isAnalyzing && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-emerald-600 font-bold text-xs animate-pulse mt-2"
              >
                Menganalisis dengan Mantri AI...
              </motion.p>
            )}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
