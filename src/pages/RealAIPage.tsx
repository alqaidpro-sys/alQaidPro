import { useState } from "react";
import { G } from "../data";

const C = {
  bg:      "#050810",
  card:    "#0f172a",
  border:  "rgba(255,255,255,0.05)",
  text:    "#ffffff",
  sub:     "#94a3b8",
  blue:    "#3b82f6",
  font:    "'Cairo', sans-serif",
};

export default function RealAIPage({ onBack, initialTool }: any) {
  const [tool, setTool] = useState(initialTool || "img");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tools: any = {
    img: { name: "توليد صور", icon: "🖼️", desc: "حول كلماتك إلى صور مذهلة فورا" },
    summ: { name: "تلخيص نصوص", icon: "📝", desc: "لخص أطول النصوص بضغطة زر واحدة" },
    content: { name: "صانع محتوى", icon: "✍️", desc: "اصنع محتوى إبداعي لمنصاتك" },
  };

  const currentTool = tools[tool] || tools.img;

  const handleProcess = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const endpoint = tool === "img" ? "/api/ai/image" : (tool === "summ" ? "/api/ai/summarize" : "/api/ai/content");
      const body = tool === "img" ? { prompt: input } : (tool === "summ" ? { text: input } : { prompt: input });
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        // Handle Gemini Quota and other errors gracefully
        if (data.error?.includes("429") || data.error?.includes("quota")) {
          throw new Error("عذراً، وصلنا للحد الأقصى للطلبات المجانية حالياً. يرجى المحاولة لاحقاً.");
        }
        throw new Error(data.error || "حدث خطأ غير متوقع");
      }
      
      setOutput(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" style={{ background: C.bg, minHeight: "100vh", paddingBottom: 40, fontFamily: C.font }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "48px 20px 16px" }}>
        <button onClick={onBack} className="tap" style={{ 
          width: 36, height: 36, borderRadius: 10, background: C.card, border: `1px solid ${C.border}`,
          color: "white", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center"
        }}>←</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>{currentTool.name}</div>
          <div style={{ fontSize: 10, color: C.sub }}>مختبر القائد الذكي</div>
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Simple Tool Switcher - Compact */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "center" }}>
          {Object.keys(tools).map(key => (
            <button 
              key={key}
              onClick={() => { setTool(key); setOutput(null); setInput(""); setError(null); }}
              style={{
                width: 32, height: 32, borderRadius: 8, border: "none",
                background: tool === key ? G.blue : C.card,
                fontSize: 16, opacity: tool === key ? 1 : 0.4,
                transition: "all 0.2s"
              }}
              className="tap"
            >
              {tools[key].icon}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="fadeUp" style={{ background: C.card, borderRadius: 20, padding: 18, border: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: C.blue, fontWeight: 800, marginBottom: 6, textTransform: "uppercase" }}>المختبر الذكي</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 4 }}>{currentTool.name}</div>
          <div style={{ fontSize: 10, color: C.sub, marginBottom: 16 }}>{currentTool.desc}</div>
          
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tool === "img" ? "صف الصورة التي تريدها باللغة العربية أو الإنجليزية..." : "أدخل النص الذي تريد معالجته هنا..."}
            style={{
              width: "100%", height: 100, background: "rgba(0,0,0,0.2)", borderRadius: 12, border: `1px solid ${C.border}`,
              padding: 14, color: "white", fontSize: 12, resize: "none", fontFamily: C.font, outline: "none",
              lineHeight: 1.6
            }}
          />

          <button 
            className="tap"
            onClick={handleProcess}
            disabled={loading || !input.trim()}
            style={{
              width: "100%", marginTop: 16, padding: 14, borderRadius: 12,
              background: loading ? "rgba(255,255,255,0.05)" : G.blue,
              color: "white", fontSize: 14, fontWeight: 900, border: "none",
              opacity: !input.trim() ? 0.4 : 1,
            }}
          >
            {loading ? "جاري التفكير... 🔨" : `بدء الـ ${currentTool.name} 🚀`}
          </button>
        </div>

        {/* Results Area */}
        {(output || error || loading) && (
          <div className="fadeUp" style={{ background: C.card, borderRadius: 20, padding: 18, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
               النتيجة
            </div>

            {loading ? (
              <div style={{ padding: "30px 0", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }} className="marquee-ltr">⚡</div>
                <div style={{ fontSize: 11, color: C.sub }}>الذكاء الاصطناعي يحلل طلبك...</div>
              </div>
            ) : error ? (
              <div style={{ padding: 14, background: "rgba(239,68,68,0.05)", borderRadius: 12, border: "1px solid rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 11, lineHeight: 1.6, textAlign: "center" }}>
                {error}
              </div>
            ) : output ? (
              <div style={{ animation: "pop 0.4s ease" }}>
                {tool === "img" ? (
                  <img 
                    src={output} 
                    alt="AI Result" 
                    style={{ width: "100%", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }} 
                  />
                ) : (
                  <div style={{ 
                    color: "rgba(255,255,255,0.9)", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap",
                    padding: 14, background: "rgba(0,0,0,0.15)", borderRadius: 12
                  }}>
                    {output}
                  </div>
                )}
                
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button onClick={() => {
                    navigator.clipboard.writeText(output);
                    alert("تم النسخ!");
                  }} className="tap" style={{ flex: 1, padding: 10, borderRadius: 10, background: "rgba(255,255,255,0.03)", color: "white", fontSize: 11, border: `1px solid ${C.border}`, fontWeight: 800 }}>نسخ</button>
                  <button onClick={() => setOutput(null)} className="tap" style={{ flex: 1, padding: 10, borderRadius: 10, background: "rgba(255,255,255,0.03)", color: "white", fontSize: 11, border: `1px solid ${C.border}`, fontWeight: 800 }}>جديد</button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
