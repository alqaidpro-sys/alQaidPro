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
  const getAI = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not set correctly in environment variables.");
    }
    return ai;
  };

  app.get("/api/ai/health", (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    res.json({ 
      status: "ok", 
      hasKey: !!key && key !== "MY_GEMINI_API_KEY",
      model: "gemini-3-flash-preview"
    });
  });

  app.post("/api/ai/summarize", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "النص مطلوب للتلخيص." });

      const client = getAI();
      const response = await client.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: `Summarize the following text professionally in Arabic: ${text}` }] }],
      });
      
      const resultText = response.text;
      if (!resultText) throw new Error("لم يتمكن الذكاء الاصطناعي من تلخيص النص.");

      res.json({ result: resultText });
    } catch (error: any) {
      console.error("AI Summarize Error:", error);
      const msg = error?.message || String(error);
      if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("429")) {
        return res.status(500).json({ error: "عذراً، محرك التلخيص مشغول حالياً (الحد الأقصى للمجاني). حاول لاحقاً." });
      }
      res.status(500).json({ error: `خطأ من الذكاء الاصطناعي: ${msg.substring(0, 70)}` });
    }
  });

  app.post("/api/ai/content", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "الوصف مطلوب لطلب المحتوى." });

      const client = getAI();
      const response = await client.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: `You are a creative content creator. Generate engaging content in Arabic based on this request: ${prompt}` }] }],
      });

      const resultText = response.text;
      if (!resultText) throw new Error("لم يتمكن الذكاء الاصطناعي من إنشاء المحتوى.");

      res.json({ result: resultText });
    } catch (error: any) {
      console.error("AI Content Error:", error);
      const msg = error?.message || String(error);
      if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
        return res.status(500).json({ error: "عذراً، محرك المحتوى مشغول حالياً (الحد الأقصى للمجاني). حاول لاحقاً." });
      }
      res.status(500).json({ error: `خطأ من الذكاء الاصطناعي: ${msg.substring(0, 70)}` });
    }
  });

  app.post("/api/ai/image", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "الوصف مطلوب لتوليد الصورة." });

      const client = getAI();
      // Try image generation
      try {
        const response = await client.models.generateContent({
          model: "gemini-2.0-flash-exp", // Trying 2.0 experimental which often has separate/fresh quota
          contents: [{ role: "user", parts: [{ text: `Generate a detailed image based on: ${prompt}` }] }],
        });

        let imageUrl = "";
        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }

        if (imageUrl) {
          return res.json({ result: imageUrl, isImage: true });
        }
      } catch (innerError: any) {
        console.warn("Primary image model failed, trying fallback description:", innerError.message);
      }

      // Fallback: Just return a text description using a text model
      const fallbackResponse = await client.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: `I am trying to generate an image for "${prompt}" but the engine is busy. Describe what this image would look like in vivid detail (in Arabic) so the user can imagine it.` }] }],
      });
      
      const desc = fallbackResponse.text || "عذراً، محرك الصور غير متاح حالياً.";
      res.json({ 
        result: `[تنبيه: محرك الصور مشغول حالياً]\n\nإليك وصف تخيلي لما كنت سأرسمه:\n\n${desc}`, 
        isImage: false 
      });

    } catch (error: any) {
      console.error("AI Image Error:", error);
      const msg = error?.message || String(error);
      if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
        return res.status(500).json({ error: "عذراً، جميع محركات الذكاء الاصطناعي مشغولة حالياً بالطلبات المجانية. يرجى الانتظار قليلاً." });
      }
      res.status(500).json({ error: `خطأ من الذكاء الاصطناعي: ${msg.substring(0, 70)}` });
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
