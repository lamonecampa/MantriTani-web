/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  Library, 
  Calculator, 
  LayoutDashboard, 
  User, 
  Leaf,
  Bug,
  Thermometer,
  Zap,
  Info,
  LogOut,
  Camera,
  Map
} from "lucide-react";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import ChatView from "./views/ChatView";
import LibraryView from "./views/LibraryView";
import CalculatorView from "./views/CalculatorView";
import FarmerCalculatorView from "./views/FarmerCalculatorView";
import ScannerView from "./views/ScannerView";
import MapView from "./views/MapView";
import { AuthView } from "./views/AuthView";

type Tab = "chat" | "library" | "scan" | "calculator" | "tani" | "map";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Memberikan user dummy untuk akses sementara tanpa login
    setUser({
      displayName: "Tamu MantriTani",
      email: "guest@mantritani.id",
      photoURL: null
    });
    setAuthLoading(false);
    
    // Nonaktifkan sementara listener auth asli
    /*
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
    */
  }, []);

  const handleLogout = async () => {
    // Nonaktifkan logout sementara
    alert("Logout dinonaktifkan sementara.");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-bold animate-pulse">Menghubungkan ke MantriTani...</p>
        </div>
      </div>
    );
  }

  // Bypass AuthView
  // if (!user) return <AuthView onAuthSuccess={() => {}} />;

  return (
    <div className="min-h-screen bg-app-bg font-sans text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-forest px-8 py-5 sticky top-0 z-50 shadow-lg border-b border-forest-light">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <div className="bg-forest-light p-2.5 rounded-xl shadow-inner border border-forest-accent">
              <Leaf className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white font-black text-2xl tracking-tight">MantriTani</h1>
              <div className="flex items-center gap-1.5 opacity-80">
                <span className="w-1.5 h-1.5 bg-forest-accent rounded-full animate-pulse"></span>
                <p className="text-forest-soft text-[10px] font-bold uppercase tracking-widest leading-none">Status: Online</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="p-2 text-forest-subtle hover:text-white transition-colors"
              title="Keluar"
            >
              <LogOut size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-forest-medium border-2 border-forest-accent flex items-center justify-center text-white font-bold shadow-md cursor-default overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={20} />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
          >
            {activeTab === "chat" && <ChatView />}
            {activeTab === "library" && <LibraryView />}
            {activeTab === "scan" && <ScannerView />}
            {activeTab === "calculator" && <CalculatorView />}
            {activeTab === "tani" && <FarmerCalculatorView />}
            {activeTab === "map" && <MapView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-4 py-4 flex justify-between items-center z-50 shadow-[0_-10px_25px_rgba(0,0,0,0.05)] rounded-t-[32px]">
        <NavButton 
          active={activeTab === "chat"} 
          onClick={() => setActiveTab("chat")} 
          icon={<MessageSquare size={24} />} 
          label="Tanya" 
        />
        <NavButton 
          active={activeTab === "library"} 
          onClick={() => setActiveTab("library")} 
          icon={<Library size={24} />} 
          label="Kamus" 
        />
        <NavButton 
          active={activeTab === "map"} 
          onClick={() => setActiveTab("map")} 
          icon={<Map size={24} />} 
          label="Lahan" 
        />
        <div className="relative -top-8 bg-app-bg p-2 rounded-full">
          <button 
            onClick={() => setActiveTab("scan")}
            className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-xl ${
              activeTab === "scan" 
                ? "bg-forest text-white ring-4 ring-forest-subtle" 
                : "bg-white text-forest hover:bg-forest hover:text-white"
            }`}
          >
            <Camera size={31} />
          </button>
          <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest ${activeTab === "scan" ? "text-forest" : "text-slate-400 opacity-60"}`}>Scan</span>
        </div>
        <NavButton 
          active={activeTab === "calculator"} 
          onClick={() => setActiveTab("calculator")} 
          icon={<Bug size={24} />} 
          label="Hama" 
        />
        <NavButton 
          active={activeTab === "tani"} 
          onClick={() => setActiveTab("tani")} 
          icon={<Calculator size={24} />} 
          label="Kalkul" 
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all relative ${active ? "text-forest" : "text-slate-400 opacity-60 hover:opacity-100"}`}
    >
      <div className={`p-2 rounded-2xl transition-colors ${active ? "bg-forest-subtle text-forest" : ""}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? "opacity-100" : "opacity-80"}`}>{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-glow" 
          className="absolute -bottom-1 w-1 h-1 bg-forest-accent rounded-full shadow-[0_0_8px_#52B788]" 
        />
      )}
    </button>
  );
}
