import React, { useState } from "react";
import { TrendingUp, Wallet, MapPin, Sprout, Info } from "lucide-react";

export default function FarmerCalculatorView() {
  const [params, setParams] = useState({
    area: "1",
    soilType: "Lempung",
    commodity: "Padi",
    variety: "Inpari 32",
    plantingDate: new Date().toISOString().split('T')[0],
    targetY: "6",
    labor: "5000000",
    input: "3000000",
    price: "7000",
    elevation: "20", // Mdpl
  });

  const area = parseFloat(params.area) || 0;
  const target = parseFloat(params.targetY) || 0;
  const price = parseFloat(params.price) || 0;
  const labor = parseFloat(params.labor) || 0;
  const inputCost = parseFloat(params.input) || 0;

  const totalExpense = labor + inputCost;
  const revenueTon = target * price * 1000 * area;
  const profit = revenueTon - totalExpense;
  const roi = totalExpense > 0 ? (profit / totalExpense) * 100 : 0;

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Kalkulator Tani</h2>
        <p className="text-slate-500 text-sm">Analisa kelayakan ekonomi dan perencanaan budidaya terpadu.</p>
      </div>

      <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-2xl shadow-forest/5 space-y-7">
        <div className="space-y-6">
          <SectionTitle icon={<Sprout className="w-4 h-4" />} title="Informasi Lahan & Tanaman" />
          <div className="grid grid-cols-2 gap-5">
            <TInput 
              label="Luas Lahan" 
              value={params.area} 
              onChange={(v) => setParams({...params, area: v})} 
              suffix="Ha"
            />
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Jenis Tanah</label>
              <select 
                className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-forest-soft transition-all"
                value={params.soilType}
                onChange={(e) => setParams({...params, soilType: e.target.value})}
              >
                <option>Lempung</option>
                <option>Berpasir</option>
                <option>Gambut</option>
                <option>Tanah Liat</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Komoditas</label>
              <select 
                className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-forest-soft transition-all"
                value={params.commodity}
                onChange={(e) => setParams({...params, commodity: e.target.value})}
              >
                <option>Padi</option>
                <option>Jagung</option>
                <option>Cabai</option>
                <option>Kedelai</option>
              </select>
            </div>
            <TInput 
              label="Varietas" 
              value={params.variety} 
              onChange={(v) => setParams({...params, variety: v})} 
              type="text"
            />
            <TInput 
              label="Tanggal Tanam" 
              value={params.plantingDate} 
              onChange={(v) => setParams({...params, plantingDate: v})} 
              type="date"
            />
            <TInput 
              label="Ketinggian" 
              value={params.elevation} 
              onChange={(v) => setParams({...params, elevation: v})} 
              suffix="Mdpl"
            />
          </div>

          <SectionTitle icon={<TrendingUp className="w-4 h-4" />} title="Target & Harga" />
          <div className="grid grid-cols-2 gap-5">
            <TInput 
              label="Target Hasil" 
              value={params.targetY} 
              onChange={(v) => setParams({...params, targetY: v})} 
              suffix="Ton/Ha"
            />
            <TInput 
              label="Harga Jual" 
              value={params.price} 
              onChange={(v) => setParams({...params, price: v})} 
              suffix="Rp/Kg"
            />
          </div>

          <SectionTitle icon={<Wallet className="w-4 h-4" />} title="Biaya Operasional (Rp)" />
          <div className="grid grid-cols-2 gap-5">
            <TInput 
              label="Tenaga Kerja" 
              value={params.labor} 
              onChange={(v) => setParams({...params, labor: v})} 
            />
            <TInput 
              label="Saprodi" 
              value={params.input} 
              onChange={(v) => setParams({...params, input: v})} 
            />
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Hasil Analisa</h3>
              <p className="text-[10px] text-slate-400 font-medium">Berdasarkan input parameter riil</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Estimasi Laba</p>
              <div className={`text-3xl font-black ${profit >= 0 ? "text-forest" : "text-red-500"}`}>
                Rp {profit.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 shadow-inner">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Biaya</p>
                <p className="text-lg font-black text-slate-700">Rp {totalExpense.toLocaleString()}</p>
             </div>
             <div className="bg-forest-subtle/40 p-5 rounded-[24px] border border-forest-subtle shadow-inner">
                <p className="text-[10px] font-black text-forest uppercase mb-1">ROI (Keuntungan)</p>
                <p className="text-lg font-black text-forest-medium">{roi.toFixed(1)}%</p>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-5 rounded-3xl border border-amber-100 flex gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-amber-500 shadow-sm shrink-0">
          <Info size={22} />
        </div>
        <p className="text-amber-800 text-[11px] font-medium leading-relaxed">
          <strong>Perhatian:</strong> Kalkulasi ini bersifat estimasi berdasarkan data standard. Keberhasilan panen sangat bergantung pada manajemen OPT (Organisme Pengganggu Tumbuhan).
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 text-forest border-b border-forest-subtle pb-3">
      <div className="p-1.5 bg-forest-subtle rounded-lg">
        {icon}
      </div>
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{title}</span>
    </div>
  );
}

function TInput({ label, value, onChange, type = "number", suffix }: { label: string; value: string; onChange: (v: string) => void; type?: string; suffix?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
      <div className="relative">
        <input 
          type={type} 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-5 pr-12 py-3.5 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-forest-soft focus:bg-white border border-slate-100 outline-none transition-all shadow-inner"
        />
        {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">{suffix}</span>}
      </div>
    </div>
  );
}

