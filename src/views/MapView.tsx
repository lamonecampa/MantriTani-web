import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, RefreshCw, Layers, Plus, Trash2, Check, X, ShieldAlert, CheckCircle2, ChevronRight, Map as MapIcon } from "lucide-react";

interface LandParcel {
  id: string;
  name: string;
  type: "Sawah" | "Ladang" | "Tegalan";
  crop: string;
  notes: string;
  coordinates: [number, number][];
  area: number;
  status: "Sehat" | "Waspada Hama" | "Butuh Pupuk";
}

const DEFAULT_LAND_PARCELS: LandParcel[] = [
  {
    id: "sample-1",
    name: "Sawah Sentosa",
    type: "Sawah",
    crop: "Padi Pandan Wangi",
    notes: "Akses air melimpah dari saluran sekunder. Panen sekitar 4 minggu lagi.",
    coordinates: [
      [-6.8180, 107.1350],
      [-6.8185, 107.1365],
      [-6.8198, 107.1358],
      [-6.8193, 107.1342]
    ],
    area: 2540,
    status: "Sehat"
  },
  {
    id: "sample-2",
    name: "Ladang Jagung Manis",
    type: "Ladang",
    crop: "Jagung Pioneer Hibrida",
    notes: "Persiapan pemupukan susulan tahap kedua. Pengairan tadah hujan.",
    coordinates: [
      [-6.8240, 107.1440],
      [-6.8250, 107.1461],
      [-6.8260, 107.1445],
      [-6.8252, 107.1432]
    ],
    area: 3120,
    status: "Waspada Hama"
  },
  {
    id: "sample-3",
    name: "Tegalan Singkong",
    type: "Tegalan",
    crop: "Singkong Gajah",
    notes: "Tanah gembur berpasir lereng perbukitan, bebas genangan air.",
    coordinates: [
      [-6.8205, 107.1450],
      [-6.8210, 107.1460],
      [-6.8218, 107.1453],
      [-6.8213, 107.1442]
    ],
    area: 1780,
    status: "Sehat"
  }
];

// Flat-Earth Shoelace Area estimation in sq meters
function calculatePolygonArea(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  
  const [lat0, lng0] = coords[0];
  const rY = 111320; // Meters per degree of latitude
  const rX = 111320 * Math.cos((lat0 * Math.PI) / 180); // Meters per degree of longitude

  const planarPoints = coords.map(([lat, lng]) => ({
    y: (lat - lat0) * rY,
    x: (lng - lng0) * rX
  }));

  let area = 0;
  const n = planarPoints.length;
  for (let i = 0; i < n; i++) {
    const p1 = planarPoints[i];
    const p2 = planarPoints[(i + 1) % n];
    area += p1.x * p2.y - p2.x * p1.y;
  }
  return Math.round(Math.abs(area / 2));
}

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // States
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [drawCoordinates, setDrawCoordinates] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<"Sawah" | "Ladang" | "Tegalan">("Sawah");
  const [crop, setCrop] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"Sehat" | "Waspada Hama" | "Butuh Pupuk">("Sehat");

  // Load Initial Data from localStorage or fallback to defaults
  useEffect(() => {
    const stored = localStorage.getItem("mantritani_parcels");
    if (stored) {
      try {
        setParcels(JSON.parse(stored));
      } catch (e) {
        setParcels(DEFAULT_LAND_PARCELS);
      }
    } else {
      setParcels(DEFAULT_LAND_PARCELS);
      localStorage.setItem("mantritani_parcels", JSON.stringify(DEFAULT_LAND_PARCELS));
    }
  }, []);

  // Sync to localStorage
  const saveParcelsToStore = (newParcels: LandParcel[]) => {
    setParcels(newParcels);
    localStorage.setItem("mantritani_parcels", JSON.stringify(newParcels));
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    // Default center at Cianjur (famous Indonesian farming area)
    const map = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([-6.8219, 107.1423], 14);

    mapRef.current = map;

    // Use high-contrast green friendly tile layout from OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Zoom controls at bottom right
    L.control.zoom({
      position: "bottomright"
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle click events on map for drawing coordinates
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawing) return;
      const { lat, lng } = e.latlng;
      setDrawCoordinates((prev) => [...prev, [lat, lng]]);
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [isDrawing]);

  // Render current drawing coordinates in real-time
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const tempGroup = L.featureGroup().addTo(map);

    if (drawCoordinates.length > 0) {
      // Draw points
      drawCoordinates.forEach((coord, idx) => {
        L.circleMarker(coord, {
          radius: 7,
          color: "#15803d", // forest green
          fillColor: "#ffffff",
          fillOpacity: 1,
          weight: 3
        })
        .bindTooltip(`Titik ${idx + 1}`, { permanent: true, direction: "top", className: "px-1.5 py-0.5 font-sans font-black text-[9px] text-emerald-800 rounded shadow-md border border-emerald-100" })
        .addTo(tempGroup);
      });

      // Connect with line
      if (drawCoordinates.length > 1) {
        L.polyline(drawCoordinates, {
          color: "#16a34a",
          weight: 3,
          dashArray: "6, 10",
          lineJoin: "round"
        }).addTo(tempGroup);
      }

      // Close polygon temporarily if it has 3 or more points and user wants preview
      if (drawCoordinates.length >= 3) {
        L.polygon([...drawCoordinates, drawCoordinates[0]], {
          color: "#16a34a",
          fillColor: "#bbf7d0",
          fillOpacity: 0.3,
          weight: 1,
          dashArray: "3, 6"
        }).addTo(tempGroup);
      }
    }

    return () => {
      map.removeLayer(tempGroup);
    };
  }, [drawCoordinates]);

  // Render finalized mapping boundaries & popups on map
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const parcelGroup = L.featureGroup().addTo(map);

    parcels.forEach((parcel) => {
      if (parcel.coordinates.length < 3) return;

      const color = parcel.type === "Sawah" 
        ? "#10b981" 
        : parcel.type === "Ladang" 
          ? "#f59e0b" 
          : "#854d0e"; // bronze

      const fillColor = parcel.type === "Sawah" 
        ? "#d1fae5" 
        : parcel.type === "Ladang" 
          ? "#fef3c7" 
          : "#fef9c3";

      // Draw Polygon
      const poly = L.polygon(parcel.coordinates, {
        color: color,
        fillColor: fillColor,
        fillOpacity: 0.45,
        weight: 3,
        lineCap: "round",
        lineJoin: "round"
      }).addTo(parcelGroup);

      const statusBadge = parcel.status === "Sehat" 
        ? `<span class="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">Sehat</span>`
        : parcel.status === "Waspada Hama"
          ? `<span class="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">Waspada</span>`
          : `<span class="bg-blue-100 text-blue-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">Butuh Pupuk</span>`;

      // Custom high fidelity popup
      const popupHtml = `
        <div class="font-sans text-xs text-slate-700 min-w-[200px]">
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
            <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider font-mono">${parcel.type}</span>
            ${statusBadge}
          </div>
          <h4 class="text-sm font-black text-slate-800 mb-1">${parcel.name}</h4>
          <p class="mb-1"><strong>Tanaman:</strong> <span class="text-slate-900">${parcel.crop}</span></p>
          <p class="mb-2"><strong>Luas Lahan:</strong> <span class="font-mono text-emerald-600 font-bold">${parcel.area.toLocaleString()} m²</span></p>
          ${parcel.notes ? `<p class="border-t border-slate-100 pt-1 text-[10px] text-slate-400 italic">${parcel.notes}</p>` : ""}
        </div>
      `;

      poly.bindPopup(popupHtml, {
        closeButton: true,
        className: "custom-field-popup"
      });

      // Calculate Center for anchor Marker & Label
      const center = poly.getBounds().getCenter();

      const labelMarker = L.marker(center, {
        icon: L.divIcon({
          html: `
            <div class="flex flex-col items-center">
              <div class="w-7 h-7 rounded-full bg-white shadow-lg border-2 flex items-center justify-center transition-all hover:scale-110" style="border-color: ${color}">
                <div class="w-3.5 h-3.5 rounded-full" style="background-color: ${color}"></div>
              </div>
              <div class="bg-slate-900/90 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap border border-slate-700/50">${parcel.name}</div>
            </div>
          `,
          className: "custom-label",
          iconSize: [60, 48],
          iconAnchor: [30, 20]
        })
      }).addTo(parcelGroup);

      labelMarker.bindPopup(popupHtml, { closeButton: true });
    });

    return () => {
      map.removeLayer(parcelGroup);
    };
  }, [parcels]);

  // Locate Farmer
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert("Layanan GPS tidak didukung oleh browser Anda.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 17);
          
          // Temporary locate circle
          L.circle([latitude, longitude], {
            radius: 12,
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.3,
            weight: 2
          }).addTo(mapRef.current)
            .bindTooltip("Lokasi Anda Saat Ini", { permanent: false, direction: "top" })
            .openTooltip();
        }
      },
      () => {
        alert("Gagal mendeteksi lokasi. Pastikan izin GPS diaktifkan.");
      }
    );
  };

  // Center on a saved plot
  const handleFocusParcel = (parcel: LandParcel) => {
    if (!mapRef.current || parcel.coordinates.length < 3) return;
    const poly = L.polygon(parcel.coordinates);
    mapRef.current.fitBounds(poly.getBounds(), {
      padding: [40, 40],
      maxZoom: 18
    });
  };

  // Form Submission
  const handleSaveParcel = () => {
    if (!name.trim()) {
      alert("Nama lahan harus diisi!");
      return;
    }
    if (drawCoordinates.length < 3) {
      alert("Butuh minimal 3 titik batas untuk membuat lahan!");
      return;
    }

    const netArea = calculatePolygonArea(drawCoordinates);

    const newParcel: LandParcel = {
      id: "parcel-" + Date.now(),
      name,
      type,
      crop: crop.trim() || "Belum Ditanami",
      notes: notes.trim(),
      coordinates: drawCoordinates,
      area: netArea,
      status
    };

    const updated = [newParcel, ...parcels];
    saveParcelsToStore(updated);

    // Reset Form & Draw Map
    setName("");
    setCrop("");
    setNotes("");
    setStatus("Sehat");
    setDrawCoordinates([]);
    setIsDrawing(false);
    setShowForm(false);
    
    // Auto focus newly created plot
    setTimeout(() => {
      handleFocusParcel(newParcel);
    }, 400);
  };

  const handleDeleteParcel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Apakah Anda yakin ingin menghapus data lahan ini?")) {
      const updated = parcels.filter((p) => p.id !== id);
      saveParcelsToStore(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Pemetaan Lahan</h2>
          <p className="text-slate-500 text-sm font-medium">Batas Lahan & Lokasi Pertanian Anda</p>
        </div>
        <div className="bg-forest/10 text-forest p-3 rounded-2xl">
          <MapIcon size={24} />
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative h-[340px] rounded-[32px] overflow-hidden border-2 border-white bg-slate-100 shadow-xl shadow-forest/5 z-10">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Float Right Action Tools */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400]">
          <button
            onClick={handleLocateUser}
            className="p-3 bg-white hover:bg-slate-50 text-slate-700 hover:text-forest rounded-2xl shadow-lg border border-slate-100 transition-all active:scale-95"
            title="Lokasi GPS Anda"
          >
            <Navigation size={18} />
          </button>
        </div>

        {/* Real-Time Area Indicator during Draw */}
        {isDrawing && drawCoordinates.length > 0 && (
          <div className="absolute top-4 left-4 z-[400] bg-slate-900/90 backdrop-blur text-white text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 border border-slate-700/50 max-w-[200px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase">Titik Terpilih: {drawCoordinates.length}</p>
              {drawCoordinates.length >= 3 ? (
                <p className="font-mono text-emerald-400 font-bold">~ {calculatePolygonArea(drawCoordinates).toLocaleString()} m²</p>
              ) : (
                <p className="text-[9px] text-slate-300">Min 3 titik batas</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Drawing Actions Control Panel */}
      <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-4">
        {!isDrawing ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setIsDrawing(true);
                setShowForm(false);
                setDrawCoordinates([]);
              }}
              className="w-full flex items-center justify-center gap-2.5 py-4 bg-forest text-white hover:bg-forest-dark rounded-2xl font-black text-sm transition-all shadow-lg shadow-forest-subtle/30"
            >
              <Plus size={18} />
              Petakan Lahan Baru
            </button>
            <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Gunakan GPS atau klik map langsung untuk menggambar batas sawah
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <p className="text-xs font-bold text-slate-700">Mode Petakan Lahan Aktif</p>
            </div>
            <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
              Silakan <strong>klik pada peta</strong> satu demi satu di sekeliling sudut batas lahan Anda untuk membuat batas bidang.
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setIsDrawing(false);
                  setDrawCoordinates([]);
                }}
                className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <X size={14} />
                Batal
              </button>
              <button
                onClick={() => {
                  if (drawCoordinates.length < 3) {
                    alert("Harap berikan minimal 3 koordinat batas lahan di peta.");
                    return;
                  }
                  setShowForm(true);
                }}
                className={`py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all text-white ${
                  drawCoordinates.length >= 3 
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20" 
                    : "bg-slate-200 cursor-not-allowed text-slate-400"
                }`}
                disabled={drawCoordinates.length < 3}
              >
                <Check size={14} />
                Lanjut Detail
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Input Modal / Panel */}
      <AnimatePresence>
        {isDrawing && showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800">Simpan Batas Lahan</h3>
              <button 
                onClick={() => setShowForm(false)}
                className="p-1 px-2.5 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg text-xs"
              >
                Kembali ke Map
              </button>
            </div>

            <div className="space-y-4">
              {/* Type selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tipe Lahan</label>
                <div className="flex gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                  {(["Sawah", "Ladang", "Tegalan"] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setType(t)}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        type === t 
                          ? "bg-white text-forest shadow-sm ring-1 ring-forest/5" 
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Sawah Kidul Baru, Ladang Atas Bukit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 border border-slate-100 outline-none focus:ring-2 focus:ring-forest-soft focus:bg-white transition-all shadow-inner"
                />
              </div>

              {/* Crop & Crop Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Komoditas / Tanaman</label>
                  <input
                    type="text"
                    placeholder="Contoh: Padi IR64"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 border border-slate-100 outline-none focus:ring-2 focus:ring-forest-soft focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kondisi Tanaman</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 border border-slate-100 outline-none focus:ring-2 focus:ring-forest-soft focus:bg-white transition-all shadow-inner"
                  >
                    <option value="Sehat">Sehat Walafiat</option>
                    <option value="Waspada Hama">Waspada Serangan</option>
                    <option value="Butuh Pupuk">Butuh Pupuk</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Catatan Tambahan</label>
                <textarea
                  placeholder="Masukkan instruksi pengerjaan lahan, riwayat, atau catatan khusus lainnya..."
                  value={notes}
                  rows={2}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 border border-slate-100 outline-none focus:ring-2 focus:ring-forest-soft focus:bg-white transition-all shadow-inner resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveParcel}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all"
                >
                  Simpan Lahan ke Database
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List of Saved Land Parcels */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Daftar Lahan Terdaftar ({parcels.length})</h3>
        
        {parcels.length === 0 ? (
          <div className="bg-slate-50/50 text-center py-8 rounded-3xl border border-slate-100">
            <MapIcon size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-xs font-bold leading-relaxed">Belum ada lahan tani yang dipetakan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {parcels.map((parcel) => {
              const themeColor = parcel.type === "Sawah" 
                ? "border-emerald-200 bg-emerald-50/30 text-emerald-800" 
                : parcel.type === "Ladang"
                  ? "border-amber-200 bg-amber-50/30 text-amber-800"
                  : "border-yellow-600 bg-yellow-50/20 text-yellow-900";

              return (
                <div
                  key={parcel.id}
                  onClick={() => handleFocusParcel(parcel)}
                  className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-forest/35 transition-all group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    {/* Land category color pill */}
                    <div className={`p-3.5 rounded-2xl flex items-center justify-center border ${themeColor}`}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-800 leading-tight group-hover:text-forest transition-colors">{parcel.name}</h4>
                        <span className="text-[9px] font-mono font-extrabold bg-slate-50 text-slate-400 uppercase tracking-wide px-1.5 py-0.5 rounded border border-slate-100">
                          {parcel.type}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5 font-medium"><strong>Tanaman:</strong> {parcel.crop}</p>
                      
                      <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400">
                        <span>Luas: <b className="font-mono text-slate-600">{parcel.area.toLocaleString()} m²</b></span>
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            parcel.status === "Sehat" 
                              ? "bg-emerald-500" 
                              : parcel.status === "Waspada Hama" 
                                ? "bg-amber-500" 
                                : "bg-blue-500"
                          }`} />
                          <span className="text-slate-500">{parcel.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleDeleteParcel(parcel.id, e)}
                      className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Hapus Lahan"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
