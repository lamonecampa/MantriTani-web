import React, { useState } from "react";
import { Search, Filter, ChevronRight, Bug, FlaskConical, X, Info } from "lucide-react";
import { PEST_DISEASE_LIBRARY } from "../constants";
import { LibraryItem, Category } from "../types";
import { motion, AnimatePresence } from "motion/react";

export default function LibraryView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "All">("All");

  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  const filteredItems = PEST_DISEASE_LIBRARY.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.plants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-6 overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${selectedItem.category === Category.HAMA ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"}`}>
                  {selectedItem.category === Category.HAMA ? <Bug size={32} /> : <FlaskConical size={32} />}
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="bg-slate-100 p-2 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">
                    {selectedItem.category}
                  </span>
                  <span className="px-2 py-1 bg-forest/10 rounded text-[10px] font-bold text-forest uppercase">
                    {selectedItem.subCategory}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-800">{selectedItem.name}</h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deskripsi & Gejala</h4>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">{selectedItem.description}</p>
                </div>

                {selectedItem.lifecycle && (
                  <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="text-[10px] font-black text-forest uppercase tracking-[0.2em]">Siklus Hidup</h4>
                    <p className="text-slate-600 text-xs leading-relaxed font-medium">{selectedItem.lifecycle}</p>
                  </div>
                )}

                {selectedItem.visualTraits && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ciri Visual Utama</h4>
                    <div className="space-y-1.5">
                      {selectedItem.visualTraits.map((trait, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <div className="w-1.5 h-1.5 bg-forest-accent rounded-full mt-1.5 shrink-0" />
                          <p className="text-slate-600 text-xs font-medium">{trait}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.controlGuide && (
                  <div className="bg-forest-subtle/30 p-5 rounded-2xl border border-forest-subtle space-y-2 shadow-inner">
                    <h4 className="text-[10px] font-black text-forest uppercase tracking-[0.2em] flex items-center gap-2">
                      <Info size={14} /> Panduan Pengendalian
                    </h4>
                    <p className="text-slate-700 text-xs leading-relaxed font-bold italic">
                      {selectedItem.controlGuide}
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tanaman Inang</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.plants.map(p => (
                      <span key={p} className="px-3 py-1 bg-white text-forest text-[10px] font-bold rounded-lg border border-forest-subtle shadow-sm uppercase tracking-wider">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedItem(null)}
                className="w-full py-4 bg-forest text-white font-bold rounded-2xl shadow-lg shadow-green-200"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Kamus Hama & Penyakit</h2>
        <p className="text-slate-500 text-sm">Daftar komprehensif untuk identifikasi masalah tanaman Anda.</p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cari hama, penyakit, atau tanaman..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-forest outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          {["All", Category.HAMA, Category.PENYAKIT].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                categoryFilter === cat 
                ? "bg-forest text-white shadow-md" 
                : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {cat === "All" ? "Semua" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {filteredItems.map((item, index) => (
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03, type: "spring", stiffness: 100 }}
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-forest/5 hover:-translate-y-1 transition-all cursor-pointer flex items-center gap-5"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-inner border shrink-0 transition-transform group-hover:scale-110 ${
              item.category === Category.HAMA 
              ? "bg-orange-50 border-orange-100 text-orange-600" 
              : "bg-blue-50 border-blue-100 text-blue-600"
            }`}>
              {item.category === Category.HAMA ? "🦟" : "🦠"}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                  item.category === Category.HAMA 
                  ? "bg-orange-50 border-orange-100 text-orange-600" 
                  : "bg-blue-50 border-blue-100 text-blue-600"
                }`}>
                  {item.category}
                </span>
                <span className="text-[10px] bg-slate-50 px-2 py-0.5 rounded-lg text-slate-400 font-bold border border-slate-100">
                  {item.plants[0]}
                </span>
              </div>
              <h3 className="font-black text-slate-800 text-sm group-hover:text-forest transition-colors truncate leading-tight">{item.name}</h3>
              <p className="text-slate-500 text-[11px] font-medium truncate mt-0.5">{item.description}</p>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-forest group-hover:text-white transition-all shadow-inner">
               <ChevronRight size={20} />
            </div>
          </motion.div>
        ))}

        {filteredItems.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-inner border border-slate-100">
              <Search size={40} />
            </div>
            <div>
              <p className="text-slate-800 font-black">Hasil Tidak Ditemukan</p>
              <p className="text-slate-400 text-xs font-medium">Coba gunakan kata kunci lain</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
