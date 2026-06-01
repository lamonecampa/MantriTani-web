import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Lazy initialize Gemini client
  let aiClient: GoogleGenAI | null = null;
  function getAiClient() {
    if (!aiClient) {
      let apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        apiKey = apiKey.trim().replace(/^['"]|['"]$/g, '');
      }
      if (!apiKey || apiKey === "" || apiKey === "MY_GEMINI_API_KEY") {
        throw new Error("GEMINI_API_KEY belum dikonfigurasikan. Silakan klik tombol 'Settings' > 'Secrets' pada pojok kanan atas layar Anda di AI Studio, tambahkan rahasia baru dengan nama 'GEMINI_API_KEY' dan nilai API Key Gemini Anda, lalu klik Simpan.");
      }
      aiClient = new GoogleGenAI({ 
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // API Route for Disease Detection
  app.post("/api/scan", async (req, res) => {
    try {
      const { image } = req.body; // base64 image
      if (!image) {
        return res.status(400).json({ error: "Image data is required" });
      }

      const ai = getAiClient();

      // Convert base64 to parts with safety check for comma-split
      let mimeType = "image/jpeg";
      let base64Data = image;
      if (image.includes(",")) {
        const parts = image.split(",");
        const match = parts[0].match(/:(.*?);/);
        if (match) {
          mimeType = match[1];
        }
        base64Data = parts[1];
      }

      const imagePart = {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      };

      const prompt = `Analisis gambar tanaman ini untuk mendeteksi penyakit atau hama. 
      Berikan respon dalam format JSON dengan struktur berikut:
      {
        "status": "success",
        "diseaseName": "Nama Penyakit (Bahasa Indonesia)",
        "scientificName": "Nama Ilmiah",
        "confidence": 0.95,
        "description": "Penjelasan singkat tentang penyakit ini",
        "symptoms": ["gejala 1", "gejala 2"],
        "recommendations": ["saran 1", "saran 2"]
      }
      Jika tidak ada penyakit atau tidak berkaitan dengan tanaman/daun, buat properti "diseaseName" berisi "Tanaman Sehat / Bukan Daun" dan berikan saran pemeliharaan umum yang relevan di properti descriptions/recommendations.
      Gunakan bahasa Indonesia secara utuh.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              diseaseName: { type: Type.STRING },
              scientificName: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              description: { type: Type.STRING },
              symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["status", "diseaseName", "description"]
          }
        }
      });

      const result = JSON.parse(response.text);
      res.json(result);
    } catch (error: any) {
      console.error("Scan error:", error);
      res.status(500).json({ error: error.message || "Gagal menganalisis gambar" });
    }
  });

  // API Route for chat consultations
  app.post("/api/chat", async (req, res) => {
    try {
      const { text, image } = req.body;
      const ai = getAiClient();
      const contents: any[] = [{ text: text || "Diagnosa foto ini" }];

      if (image) {
        let mimeType = "image/jpeg";
        let base64Data = image;
        if (image.includes(",")) {
          const parts = image.split(",");
          const match = parts[0].match(/:(.*?);/);
          if (match) {
            mimeType = match[1];
          }
          base64Data = parts[1];
        }
        contents.push({
          inlineData: {
            mimeType,
            data: base64Data,
          }
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: contents },
        config: {
          systemInstruction: `You are MantriTani, a trusted agricultural medical assistant. 
Your goal is to diagnose plant diseases and pests from photos or descriptions.
Focus strictly on agriculture and farming.
Provide clear, actionable advice on pest control and disease management.
Communicate in Bahasa Indonesia unless the user asks otherwise.
Keep your tone professional yet accessible to farmers.
If you are unsure, advise the user to consult with a local agricultural extension officer (PPL).`
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Gagal berkomunikasi dengan asisten AI" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
