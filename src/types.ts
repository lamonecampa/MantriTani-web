export enum Category {
  HAMA = "Hama",
  PENYAKIT = "Penyakit",
}

export enum SubCategory {
  PENGHISAP_PENGGEREK = "Penghisap & Penggerek",
  PEMAKAN_DAUN_AKAR = "Pemakan Daun & Akar",
  NON_SERANGGA = "Non-Serangga",
  JAMUR = "Jamur (Fungi)",
  BAKTERI = "Bakteri (Bacteria)",
  VIRUS = "Virus",
  LAINNYA = "Lainnya",
}

export interface LibraryItem {
  id: string;
  name: string;
  category: Category;
  subCategory: SubCategory;
  description: string;
  plants: string[];
  lifecycle?: string; // Information about lifecycle
  visualTraits?: string[]; // Visual identification features
  controlGuide?: string; // Control recommendations
}

export interface DailyWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  rain: number;
}

export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    rain: number;
    condition: string;
  };
  recommendation: string;
  risk: string;
  yesterday: DailyWeather;
  forecast: DailyWeather[]; // Next 3 days (today, tomorrow, +2)
}

export interface CalculationParams {
  landArea: number; // in hectares
  tankCapacity: number; // in liters
  recommendedDose?: number; // ml per liter
}

export interface TaniParams {
  luasLahan: number;
  jenisTanah: string;
  komoditas: string;
  varietas: string;
  tanggalTanam: string;
  targetHasil: number;
  biayaTenagaKerja: number;
  modalSaprodi: number;
}
