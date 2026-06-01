import { useState, useEffect } from "react";
import { HelpCircle, RefreshCcw, ChevronDown, FlaskConical, Info, CheckCircle, Calculator } from "lucide-react";

const PRODUCT_DATA = {
  Herbisida: [
    "Roundup (Glifosat)", "Gramoxone (Parakuat)", "Berantas (Glifosat)", "Calaris (Mesotrion + Atrazin)", 
    "Loyant (Florpirauksifen-benzil)", "Clipper (Penoksulam)", "Garlon (Triklopir)", "Ally (Metsulfuron-metil)", 
    "Goal (Oksifluorfen)", "Rambo (Glifosat)", "Supremo (Glifosat)", "DMA 6 (2,4-D Dimetil Amina)", 
    "Lindomin (2,4-D Dimetil Amina)", "Elang (Glifosat)", "Sidafos (Glifosat)", "Kleenup (Glifosat)", 
    "Basagran (Bentazon)", "Satunil (Propanil + Tiobencarb)", "Nominee (Bispiribak-natrium)", "Basta (Glufosinat-amonium)"
  ],
  Insektisida: [
    "Regent (Fipronil)", "Curacron (Profenofos)", "Prevathon (Klorantraniliprol)", "Virtako (Klorantraniliprol + Tiametoksam)", 
    "Spontan (Dimehipo)", "Decis (Deltametrin)", "Alika (Lamda Sihalotrin + Tiametoksam)", "Movento (Spirotetramat)", 
    "Abacel (Abamektin)", "Demolish (Abamektin)", "Pegasus (Diafentiuron)", "Buldok (Beta Siflutrin)", 
    "Marshal (Karbosulfan)", "Matador (Lamda Sihalotrin)", "Belt Expert (Flubendiamid + Tiakloprid)", "Applaud (Buprofezin)", 
    "Confidor (Imidakloprid)", "Kanebi (Piridaben)", "Fastac (Alfametrin)", "Lannate (Metomil)"
  ],
  Fungisida: [
    "Amistartop (Azoksistrobin + Difenokonazol)", "Score (Difenokonazol)", "Antracol (Propineb)", "Dithane (Mankozeb)", 
    "Nordox (Tembaga Oksida)", "Tandem (Azoksistrobin + Difenokonazol)", "Cabrio Top (Piraklostrobin + Metiram)", "Nativo (Tebukonazol + Trifloksistrobin)", 
    "Ridomil Gold (Mankozeb + Metalaksil)", "Topsin (Metil Tiofanat)", "Bion M (Asibenzolar-S-metil + Mankozeb)", "Explore (Difenokonazol)", 
    "Filia (Propikonazol + Trisiklazol)", "RecorPlus (Difenokonazol)", "Revus (Mandipropamid)", "Syngenta Anvil (Heksakonazol)", 
    "Prozol (Difenokonazol)", "Aliette (Fosetil-aluminium)", "Dakonil (Klorotalonil)", "Sorento (Difenokonazol)"
  ]
};

// Typical active ingredient dose per hectare in ml or gr depending on the product
const PRODUCT_RATES: Record<string, { rate: number; unit: string }> = {
  // Herbisida
  "Roundup (Glifosat)": { rate: 3000, unit: "ml" },
  "Gramoxone (Parakuat)": { rate: 2000, unit: "ml" },
  "Berantas (Glifosat)": { rate: 3000, unit: "ml" },
  "Calaris (Mesotrion + Atrazin)": { rate: 1500, unit: "ml" },
  "Loyant (Florpirauksifen-benzil)": { rate: 1000, unit: "ml" },
  "Clipper (Penoksulam)": { rate: 800, unit: "ml" },
  "Garlon (Triklopir)": { rate: 1000, unit: "ml" },
  "Ally (Metsulfuron-metil)": { rate: 200, unit: "g" },
  "Goal (Oksifluorfen)": { rate: 1000, unit: "ml" },
  "Rambo (Glifosat)": { rate: 3000, unit: "ml" },
  "Supremo (Glifosat)": { rate: 3000, unit: "ml" },
  "DMA 6 (2,4-D Dimetil Amina)": { rate: 1200, unit: "ml" },
  "Lindomin (2,4-D Dimetil Amina)": { rate: 1200, unit: "ml" },
  "Elang (Glifosat)": { rate: 3000, unit: "ml" },
  "Sidafos (Glifosat)": { rate: 3000, unit: "ml" },
  "Kleenup (Glifosat)": { rate: 3000, unit: "ml" },
  "Basagran (Bentazon)": { rate: 2000, unit: "ml" },
  "Satunil (Propanil + Tiobencarb)": { rate: 2500, unit: "ml" },
  "Nominee (Bispiribak-natrium)": { rate: 250, unit: "ml" },
  "Basta (Glufosinat-amonium)": { rate: 2000, unit: "ml" },

  // Insektisida
  "Regent (Fipronil)": { rate: 500, unit: "ml" },
  "Curacron (Profenofos)": { rate: 1000, unit: "ml" },
  "Prevathon (Klorantraniliprol)": { rate: 600, unit: "ml" },
  "Virtako (Klorantraniliprol + Tiametoksam)": { rate: 200, unit: "ml" },
  "Spontan (Dimehipo)": { rate: 1500, unit: "ml" },
  "Decis (Deltametrin)": { rate: 500, unit: "ml" },
  "Alika (Lamda Sihalotrin + Tiametoksam)": { rate: 400, unit: "ml" },
  "Movento (Spirotetramat)": { rate: 500, unit: "ml" },
  "Abacel (Abamektin)": { rate: 750, unit: "ml" },
  "Demolish (Abamektin)": { rate: 750, unit: "ml" },
  "Pegasus (Diafentiuron)": { rate: 1000, unit: "ml" },
  "Buldok (Beta Siflutrin)": { rate: 600, unit: "ml" },
  "Marshal (Karbosulfan)": { rate: 1500, unit: "ml" },
  "Matador (Lamda Sihalotrin)": { rate: 400, unit: "ml" },
  "Belt Expert (Flubendiamid + Tiakloprid)": { rate: 400, unit: "ml" },
  "Applaud (Buprofezin)": { rate: 1000, unit: "g" },
  "Confidor (Imidakloprid)": { rate: 250, unit: "g" },
  "Kanebi (Piridaben)": { rate: 500, unit: "g" },
  "Fastac (Alfametrin)": { rate: 500, unit: "ml" },
  "Lannate (Metomil)": { rate: 1000, unit: "g" },

  // Fungisida
  "Amistartop (Azoksistrobin + Difenokonazol)": { rate: 500, unit: "ml" },
  "Score (Difenokonazol)": { rate: 400, unit: "ml" },
  "Antracol (Propineb)": { rate: 1500, unit: "g" },
  "Dithane (Mankozeb)": { rate: 2000, unit: "g" },
  "Nordox (Tembaga Oksida)": { rate: 600, unit: "g" },
  "Tandem (Azoksistrobin + Difenokonazol)": { rate: 500, unit: "ml" },
  "Cabrio Top (Piraklostrobin + Metiram)": { rate: 1000, unit: "g" },
  "Nativo (Tebukonazol + Trifloksistrobin)": { rate: 300, unit: "g" },
  "Ridomil Gold (Mankozeb + Metalaksil)": { rate: 1250, unit: "g" },
  "Topsin (Metil Tiofanat)": { rate: 1000, unit: "g" },
  "Bion M (Asibenzolar-S-metil + Mankozeb)": { rate: 1000, unit: "g" },
  "Explore (Difenokonazol)": { rate: 500, unit: "ml" },
  "Filia (Propikonazol + Trisiklazol)": { rate: 1000, unit: "ml" },
  "RecorPlus (Difenokonazol)": { rate: 500, unit: "ml" },
  "Revus (Mandipropamid)": { rate: 400, unit: "ml" },
  "Syngenta Anvil (Heksakonazol)": { rate: 800, unit: "ml" },
  "Prozol (Difenokonazol)": { rate: 500, unit: "ml" },
  "Aliette (Fosetil-aluminium)": { rate: 1500, unit: "g" },
  "Dakonil (Klorotalonil)": { rate: 1500, unit: "g" },
  "Sorento (Difenokonazol)": { rate: 500, unit: "ml" }
};

type Category = keyof typeof PRODUCT_DATA;

export default function CalculatorView() {
  const [category, setCategory] = useState<Category>("Insektisida");
  const [product, setProduct] = useState<string>("");
  const [area, setArea] = useState<string>("1");
  const [tank, setTank] = useState<string>("16");
  const [dose, setDose] = useState<string>("1.5");
  const [vol, setVol] = useState<string>("400");
  const [isAutoMode, setIsAutoMode] = useState<boolean>(true);

  const landArea = parseFloat(area) || 0;
  const tankCap = parseFloat(tank) || 0;
  const sprayVol = parseFloat(vol) || 0;

  // Determine target rate/Ha based on chosen product or category defaults
  const activeProductRateObj = product && PRODUCT_RATES[product] 
    ? PRODUCT_RATES[product] 
    : { rate: category === "Herbisida" ? 2000 : category === "Insektisida" ? 600 : 800, unit: "ml" };

  // Adjust recommended dose state automatically as specified in prompt:
  // "untuk dosis rekomendasi secara otomatis akan menyesuaikan langsung dengan parameter luas lahan, kapasitas tangki, volume semprot"
  useEffect(() => {
    if (isAutoMode) {
      if (sprayVol > 0) {
        // Optimal concentration based on product manufacturer rate and spray water volume
        const computedDose = (activeProductRateObj.rate / sprayVol);
        setDose(computedDose.toFixed(2));
      }
    }
  }, [category, product, area, tank, vol, isAutoMode, activeProductRateObj.rate, sprayVol]);

  const recomDose = parseFloat(dose) || 0;

  // Key Calculations
  const totalWater = landArea * sprayVol;
  const totalPesticide = totalWater * recomDose;
  const numTanks = tankCap > 0 ? totalWater / tankCap : 0;
  const dosePerTank = tankCap * recomDose;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-800">Kalkulator Obat Tani</h2>
        <p className="text-slate-500 text-sm font-medium">Hitung dosis tepat untuk efisiensi dan keamanan.</p>
      </div>

      <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-2xl shadow-forest/5 space-y-6">
        {/* Category & Product Select */}
        <div className="space-y-4">
          <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
            {(Object.keys(PRODUCT_DATA) as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setProduct("");
                }}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  category === cat 
                    ? "bg-white text-forest shadow-sm ring-1 ring-forest/10" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Pilih Produk (Top 20 {category})
              </label>
              {product && (
                <span className="text-[9px] bg-forest-subtle/40 text-forest font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                  Rate Target: {activeProductRateObj.rate} {activeProductRateObj.unit}/Ha
                </span>
              )}
            </div>
            
            <div className="relative group">
              <select 
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full appearance-none pl-12 pr-10 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-forest-soft focus:bg-white outline-none border border-slate-100 transition-all shadow-inner"
              >
                <option value="">-- Gunakan Dosis Standard Produsen --</option>
                {PRODUCT_DATA[category].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-medium">
                <FlaskConical size={20} />
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-forest transition-colors pointer-events-none">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-2 gap-5">
          <InputGroup 
            label="Luas Lahan" 
            value={area} 
            onChange={setArea} 
            placeholder="1" 
            suffix="Ha"
          />
          <InputGroup 
            label="Kapasitas Tangki" 
            value={tank} 
            onChange={setTank} 
            placeholder="16" 
            suffix="L"
          />
          <InputGroup 
            label="Dosis Rekom." 
            value={dose} 
            onChange={(val) => {
              setDose(val);
              setIsAutoMode(false); // Disable auto mode if user manually updates it
            }} 
            placeholder="1.5" 
            suffix={activeProductRateObj.unit === "g" ? "g/L" : "ml/L"}
            isAuto={isAutoMode}
            onResetAuto={!isAutoMode ? () => setIsAutoMode(true) : undefined}
          />
          <InputGroup 
            label="Vol. Semprot" 
            value={vol} 
            onChange={setVol} 
            placeholder="400" 
            suffix="L/Ha"
          />
        </div>

        {/* Adaptive Calculation Explainer Badge */}
        {isAutoMode && (
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex gap-3">
            <Info size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-slate-600 text-xs leading-relaxed">
              <span className="font-extrabold text-emerald-800 block text-[10px] uppercase tracking-wider mb-0.5">Penyesuaian Dosis Pintar Aktif</span>
              Dosis otomatis dihitung menjadi <strong className="text-emerald-700 font-black">{dose}</strong> ml/L menyesuaikan rate sasaran produsen ({activeProductRateObj.rate} {activeProductRateObj.unit}/Ha) dan Volume Semprot ({sprayVol} L/Ha) Anda agar obat tersebar merata.
            </div>
          </div>
        )}

        {/* Results Presentation */}
        <div className="pt-6 border-t border-dashed border-slate-200">
           <div className="grid grid-cols-1 gap-4">
              <ResultCard 
                label={`Total Kebutuhan ${category}`} 
                value={`${Math.round(totalPesticide).toLocaleString()} ${activeProductRateObj.unit}`} 
                subValue={`(~ ${(totalPesticide / 1000).toFixed(2)} Liter/Kg ${product ? `untuk ${product}` : ''})`}
                primary
              />
              
              <div className="grid grid-cols-2 gap-4">
                <ResultCard 
                  label="Dosis per Tangki" 
                  value={`${dosePerTank.toFixed(1)} ${activeProductRateObj.unit}`} 
                  subValue={`Untuk Tangki ${tankCap} Liter`}
                />
                <ResultCard 
                  label="Estimasi Pengisian Tangki" 
                  value={`${Math.ceil(numTanks)} Kali`} 
                  subValue={`Tepatnya: ${numTanks.toFixed(1)} isi`}
                />
              </div>
           </div>
        </div>

        {/* Reset Control */}
        <button 
          onClick={() => {
            setCategory("Insektisida"); 
            setProduct(""); 
            setArea("1"); 
            setTank("16"); 
            setDose("1.5"); 
            setVol("400");
            setIsAutoMode(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-4 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-forest transition-colors bg-slate-50 rounded-2xl border border-slate-100 shadow-inner"
        >
          <RefreshCcw size={14} /> Reset ke Standard
        </button>
      </div>

      {/* Helpful Tips Panel */}
      <div className="bg-forest-subtle/30 p-5 rounded-3xl border border-forest-subtle flex gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-forest shadow-sm shrink-0">
          <HelpCircle size={20} />
        </div>
        <p className="text-forest text-xs font-medium leading-relaxed font-sans">
          <strong>Tips Aplikasi:</strong> Volume semprot standar padi/jagung berkisar 400-500 L/Ha. Pada herbisida pratumbuh, volume tinggi dibutuhkan untuk pembasahan lapisan permukaan tanah yang optimal.
        </p>
      </div>
    </div>
  );
}

function InputGroup({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  suffix, 
  isAuto = false,
  onResetAuto
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  placeholder: string; 
  suffix: string;
  isAuto?: boolean;
  onResetAuto?: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        {isAuto && (
          <span className="text-[9px] bg-emerald-500/10 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded shadow-sm">
            🛡️ Auto
          </span>
        )}
        {onResetAuto && (
          <button 
            onClick={onResetAuto}
            className="text-[9px] text-forest font-bold hover:underline"
            type="button"
          >
            Aktifkan Auto
          </button>
        )}
      </div>
      <div className="relative">
        <input 
          type="number" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step="any"
          className={`w-full pl-5 pr-12 py-3.5 rounded-2xl text-sm font-bold text-slate-700 outline-none border transition-all ${
            isAuto 
              ? "bg-emerald-50/40 text-emerald-800 border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white" 
              : "bg-slate-50 border-slate-100 focus:ring-2 focus:ring-forest-soft focus:bg-white shadow-inner"
          }`}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">{suffix}</span>
      </div>
    </div>
  );
}

function ResultCard({ label, value, subValue, primary = false }: { label: string; value: string; subValue?: string; primary?: boolean }) {
  return (
    <div className={`p-5 rounded-[24px] border transition-all ${
      primary 
      ? "bg-gradient-to-br from-forest to-forest-medium border-forest-light text-white shadow-xl shadow-forest/20" 
      : "bg-white border-slate-100 text-slate-800 shadow-sm"
    }`}>
      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${primary ? "text-forest-soft" : "text-slate-400"}`}>{label}</p>
      <p className={`text-xl font-black ${primary ? "text-white" : "text-forest"}`}>{value}</p>
      {subValue && <p className={`text-[10px] font-bold mt-0.5 ${primary ? "text-forest-subtle/80" : "text-slate-400"}`}>{subValue}</p>}
    </div>
  );
}
