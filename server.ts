import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Initialize Gemini
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // AI API Endpoints
  app.post("/api/ai/summarize", async (req, res) => {
    try {
      const { text } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Summarize the following text professionally in Arabic: ${text}`,
      });
      res.json({ result: response.text });
    } catch (error: any) {
      console.error("AI Summarize Error:", error);
      const msg = error.message || "";
      if (msg.includes("429") || msg.includes("quota")) {
        return res.status(500).json({ error: "عذراً، وصلنا للحد الأقصى للطلبات المجانية (التلخيص). حاول لاحقاً." });
      }
      res.status(500).json({ error: "حدث خطأ أثناء تلخيص النص." });
    }
  });

  app.post("/api/ai/content", async (req, res) => {
    try {
      const { prompt } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a creative content creator. Generate engaging content in Arabic based on this request: ${prompt}`,
      });
      res.json({ result: response.text });
    } catch (error: any) {
      console.error("AI Content Error:", error);
      const msg = error.message || "";
      if (msg.includes("429") || msg.includes("quota")) {
        return res.status(500).json({ error: "عذراً، وصلنا للحد الأقصى للطلبات المجانية (المحتوى). حاول لاحقاً." });
      }
      res.status(500).json({ error: "حدث خطأ أثناء إنشاء المحتوى." });
    }
  });

  app.post("/api/ai/image", async (req, res) => {
    try {
      const { prompt } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: prompt,
      });

      let imageUrl = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!imageUrl) {
        throw new Error("عذراً، لم يتوفر المحتوى المطلوب.");
      }

      res.json({ result: imageUrl });
    } catch (error: any) {
      console.error("AI Image Error:", error);
      const msg = error.message || "";
      if (msg.includes("429") || msg.includes("quota")) {
        return res.status(500).json({ error: "عذراً، تم الوصول للحد الأقصى لتوليد الصور اليوم. المحاولة بعد ساعة." });
      }
      res.status(500).json({ error: "فشل توليد الصورة، جرب وصفاً مختلفاً." });
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
