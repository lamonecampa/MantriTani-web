import React, { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Camera, User, Bot, Loader2, X, CloudRain, Thermometer, ShieldAlert, MapPin, Search } from "lucide-react";
import { diagnosePlant } from "../services/geminiService";
import { getWeatherData } from "../services/weatherService";
import { WeatherData } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  image?: string;
  timestamp: Date;
}

function WeatherDayCard({ label, tempMax, tempMin, rain, active = false, sub }: { label: string; tempMax: number; tempMin: number; rain: number; active?: boolean; sub: string }) {
  return (
    <div className={`p-2 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
      active 
      ? "bg-forest border-forest-light text-white shadow-lg shadow-forest/20 scale-105 z-10" 
      : "bg-white border-slate-100 text-slate-400"
    }`}>
      <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">{label}</span>
      <div className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center ${active ? "bg-white/20" : "bg-slate-50 shadow-inner"}`}>
        {rain > 0 ? (
          <>
            <CloudRain size={14} className={active ? "text-white" : "text-blue-400"} />
            <span className={`text-[6px] font-black mt-0.5 ${active ? "text-white" : "text-blue-500"}`}>{rain.toFixed(1)}mm</span>
          </>
        ) : (
          <Thermometer size={14} className={active ? "text-white" : "text-orange-400"} />
        )}
      </div>
      <div className="text-center leading-none">
        <div className="flex flex-col items-center">
          <p className={`text-[11px] font-black ${active ? "text-white" : "text-slate-800"}`}>{Math.round(tempMax)}°</p>
          <p className={`text-[8px] font-bold ${active ? "text-forest-soft" : "text-slate-400"}`}>{Math.round(tempMin)}°</p>
        </div>
        <p className={`text-[6px] font-black uppercase tracking-widest mt-1 ${active ? "opacity-60" : "text-slate-300"}`}>{sub}</p>
      </div>
    </div>
  );
}

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content: "Halo! Saya MantriTani. Saya bisa membantu Anda mendiagnosa penyakit atau hama pada tanaman. Silakan kirimkan foto daun yang sakit atau tanyakan masalah Anda di sini.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const [manualCity, setManualCity] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showWeatherDetails, setShowWeatherDetails] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Try to get location automatically
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        () => setShowLocationInput(true)
      );
    } else {
      setShowLocationInput(true);
    }
  }, []);

  useEffect(() => {
    if (location) {
      getWeatherData(location.lat, location.lon).then(setWeather);
    }
  }, [location]);

  const handleManualLocation = async () => {
    if (manualCity.toLowerCase().includes("jakarta")) setLocation({ lat: -6.2088, lon: 106.8456 });
    else if (manualCity.toLowerCase().includes("cianjur")) setLocation({ lat: -6.8175, lon: 107.1378 });
    else setLocation({ lat: -7.2504, lon: 112.7688 }); // Default to Surabaya
    setShowLocationInput(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      image: selectedImage || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    const imgToSend = selectedImage;
    setSelectedImage(null);
    setLoading(true);

    try {
      const response = await diagnosePlant(userMessage.content || "Diagnosa foto ini", imgToSend || undefined);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: response || "Maaf, saya tidak bisa mendiagnosa saat ini.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: "Terjadi kesalahan koneksi. Pastikan API Key sudah terkonfigurasi di Settings.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] space-y-4">
      {/* Weather Header */}
      <AnimatePresence>
        {weather && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[28px] border border-slate-100 shadow-xl shadow-forest/5 overflow-hidden"
          >
            <div 
              onClick={() => setShowWeatherDetails(!showWeatherDetails)}
              className="p-5 flex flex-col gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-forest-subtle rounded-2xl flex items-center justify-center text-forest shadow-inner">
                    {weather.current.rain > 0 ? <CloudRain size={24} /> : <Thermometer size={24} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{weather.current.condition} • {weather.current.temperature}°C</h3>
                    <div className="flex items-center gap-1 opacity-60">
                      <MapPin size={10} className="text-forest" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Lokasi Terdeteksi</span>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                  weather.risk.includes("Tinggi") ? "bg-red-50 border-red-100 text-red-600" : "bg-green-50 border-green-100 text-forest"
                }`}>
                  <ShieldAlert size={12} />
                  {weather.risk}
                </div>
              </div>
              
              {!showWeatherDetails && (
                <div className="bg-forest/5 p-4 rounded-2xl border border-forest-subtle/30 flex gap-3 items-start">
                  <div className="bg-white p-1.5 rounded-lg shadow-sm border border-forest-subtle shrink-0">
                    <Bot size={14} className="text-forest" />
                  </div>
                  <p className="text-[11px] font-medium text-slate-700 leading-relaxed italic">
                    "{weather.recommendation}"
                  </p>
                </div>
              )}
            </div>

            {showWeatherDetails && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-5 pb-5 space-y-5 border-t border-slate-50 pt-5"
              >
                <div className="grid grid-cols-5 gap-2">
                  {/* Yesterday */}
                  <WeatherDayCard 
                    label="Kmrn" 
                    tempMax={weather.yesterday.tempMax} 
                    tempMin={weather.yesterday.tempMin}
                    rain={weather.yesterday.rain} 
                    sub="H - 1"
                  />
                  {/* Today */}
                  <WeatherDayCard 
                    label="Hari Ini" 
                    tempMax={weather.forecast[0].tempMax} 
                    tempMin={weather.forecast[0].tempMin}
                    rain={weather.forecast[0].rain} 
                    active
                    sub="Prk"
                  />
                  {/* Tomorrow */}
                  <WeatherDayCard 
                    label="Besok" 
                    tempMax={weather.forecast[1].tempMax} 
                    tempMin={weather.forecast[1].tempMin}
                    rain={weather.forecast[1].rain} 
                    sub="H + 1"
                  />
                  {/* Forecast 1 */}
                  <WeatherDayCard 
                    label="Lusa" 
                    tempMax={weather.forecast[2].tempMax} 
                    tempMin={weather.forecast[2].tempMin}
                    rain={weather.forecast[2].rain} 
                    sub="H + 2"
                  />
                  {/* Forecast 2 */}
                  <WeatherDayCard 
                    label="Depan" 
                    tempMax={weather.forecast[3].tempMax} 
                    tempMin={weather.forecast[3].tempMin}
                    rain={weather.forecast[3].rain} 
                    sub="H + 3"
                  />
                </div>

                <div className="bg-forest-subtle/20 p-4 rounded-2xl border border-forest-subtle">
                   <h4 className="text-[10px] font-black text-forest uppercase tracking-widest mb-2 flex items-center gap-2">
                      <ShieldAlert size={12} /> Rekomendasi Hari Ini
                   </h4>
                   <p className="text-xs text-slate-700 font-medium leading-relaxed italic">
                      {weather.recommendation}
                   </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {showLocationInput && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-forest p-5 rounded-[28px] text-white shadow-xl space-y-4"
          >
            <div className="space-y-1">
              <h3 className="font-black text-sm uppercase tracking-widest">Aktifkan Prakiraan Cuaca</h3>
              <p className="text-[10px] text-forest-soft font-bold">Masukkan nama kota Anda untuk mendapatkan rekomendasi pemeliharaan.</p>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-medium" />
                <input 
                  type="text" 
                  placeholder="Contoh: Cianjur, Jakarta..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white/10 rounded-xl text-xs font-bold focus:bg-white focus:text-forest outline-none transition-all placeholder:text-forest-soft/50"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                />
              </div>
              <button 
                onClick={handleManualLocation}
                className="px-4 py-2.5 bg-forest-accent text-white text-xs font-black rounded-xl active:scale-95 transition-transform"
              >
                Cek
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col bg-white rounded-[32px] shadow-2xl shadow-forest/5 border border-slate-100 overflow-hidden">
      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth bg-gradient-to-b from-white to-app-bg"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
              msg.role === "user" ? "bg-forest border-forest-light text-white" : "bg-white border-slate-200 text-forest"
            }`}>
              {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
            </div>
            
            <div className={`max-w-[85%] space-y-2 ${msg.role === "user" ? "items-end" : ""}`}>
              {msg.image && (
                <div className="rounded-[24px] overflow-hidden border-4 border-white shadow-xl">
                  <img src={msg.image} alt="User plant" className="max-w-full h-auto" />
                </div>
              )}
              {msg.content && (
                <div className={`p-4 rounded-[24px] text-[13px] font-medium leading-relaxed shadow-sm ${
                  msg.role === "user" 
                  ? "bg-forest text-white rounded-tr-none shadow-forest/10" 
                  : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                }`}>
                  {msg.content}
                </div>
              )}
              <div className={`flex items-center gap-1.5 px-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.role === "bot" && <span className="w-1 h-1 bg-forest-accent rounded-full"></span>}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
             <div className="w-9 h-9 rounded-2xl bg-white border border-slate-200 text-forest flex items-center justify-center shadow-sm">
              <Bot size={18} />
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-[24px] rounded-tl-none shadow-sm flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-forest-soft rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-forest-accent rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-forest rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 space-y-4">
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="relative w-24 h-24 p-1 bg-white rounded-2xl shadow-xl border border-slate-200"
            >
              <img src={selectedImage} className="w-full h-full object-cover rounded-xl" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg active:scale-95 transition-transform"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageSelect}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 text-slate-500 hover:text-forest hover:bg-forest-subtle transition-all bg-slate-50 rounded-2xl border border-slate-100 active:scale-95"
          >
            <ImageIcon size={22} />
          </button>
          
          <div className="flex-1">
            <textarea 
              rows={1}
              placeholder="Tulis keluhan atau diagnosa..."
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[20px] text-sm font-medium focus:ring-2 focus:ring-forest-soft focus:bg-white transition-all outline-none resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>
          
          <button 
            onClick={handleSend}
            disabled={loading || (!input.trim() && !selectedImage)}
            className="p-4 bg-forest text-white rounded-[20px] disabled:opacity-30 disabled:bg-slate-300 transition-all shadow-lg shadow-forest/20 active:scale-95"
          >
            <Send size={22} className={loading ? "opacity-0" : "opacity-100"} />
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
