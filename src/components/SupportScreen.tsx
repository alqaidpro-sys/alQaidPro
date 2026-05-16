import { useState } from "react";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const T = {
  bg: "#050810",
  surface: "#0f172a",
  border: "rgba(255,255,255,0.05)",
  accent: "#3b82f6",
  text: "#ffffff",
  sub: "#94a3b8",
  font: "Cairo, sans-serif"
};

export function SupportScreen({ onBack, userEmail, userData, tickets = [] }: { onBack: () => void, userEmail: string, userData: any, tickets: any[] }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "create">("list");

  const handleCreateTicket = async () => {
    if (!subject || !message) return alert("يرجى ملء جميع الحقول");
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "support_tickets"), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        userName: userData?.name || auth.currentUser.email,
        subject,
        message,
        status: "open",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("✅ تم إرسال تذكرتك بنجاح. سنرد عليك في أقرب وقت.");
      setSubject("");
      setMessage("");
      setView("list");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "support_tickets");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" style={{ background: T.bg, minHeight: "100vh", position: "relative", fontFamily: T.font, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "48px 20px 20px" }}>
        <button onClick={onBack} className="tap" style={{ width: 40, height: 40, borderRadius: 12, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 18 }}>→</button>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: T.text }}>مركز الدعم 🎧</h1>
          <p style={{ fontSize: 11, color: T.sub }}>نحن هنا لمساعدتك دائماً</p>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Toggle View */}
        <div style={{ display: "flex", background: T.surface, borderRadius: 16, padding: 6, marginBottom: 24, border: `1px solid ${T.border}` }}>
          <button onClick={() => setView("list")} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", fontSize: 13, fontWeight: 800, fontFamily: T.font, background: view === "list" ? T.accent : "transparent", color: view === "list" ? "white" : T.sub, transition: "0.2s" }}>تذاكري ({tickets.length})</button>
          <button onClick={() => setView("create")} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", fontSize: 13, fontWeight: 800, fontFamily: T.font, background: view === "create" ? T.accent : "transparent", color: view === "create" ? "white" : T.sub, transition: "0.2s" }}>تذكرة جديدة</button>
        </div>

        {view === "list" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tickets.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", opacity: 0.5 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎫</div>
                <div style={{ fontSize: 14, color: T.text }}>لا توجد تذاكر حالية</div>
              </div>
            ) : (
              tickets.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map(t => (
                <div key={t.id} style={{ background: T.surface, borderRadius: 20, padding: 16, border: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{t.subject}</div>
                      <div style={{ fontSize: 10, color: T.sub, marginTop: 4 }}>{t.createdAt?.toDate ? t.createdAt.toDate().toLocaleString("ar-EG") : "قيد المعالجة..."}</div>
                    </div>
                    <div style={{ 
                      fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 8,
                      background: t.status === "open" ? "rgba(248,113,113,0.15)" : t.status === "replied" ? "rgba(79,142,247,0.15)" : "rgba(16,185,129,0.15)",
                      color: t.status === "open" ? "#f87171" : t.status === "replied" ? "#4f8ef7" : "#10b981"
                    }}>
                      {t.status === "open" ? "قيد المراجعة" : t.status === "replied" ? "تم الرد" : "مغلق"}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.6, background: "rgba(0,0,0,0.2)", padding: 12, borderRadius: 12 }}>{t.message}</div>
                  
                  {t.adminReply && (
                    <div style={{ marginTop: 12, padding: 12, background: "rgba(59,130,246,0.05)", borderRadius: 12, borderLeft: `2px solid ${T.accent}` }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: T.accent, marginBottom: 4 }}>رد الإدارة:</div>
                      <div style={{ fontSize: 12, color: T.text, lineHeight: 1.6 }}>{t.adminReply}</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="fadeUp" style={{ background: T.surface, borderRadius: 24, padding: 20, border: `1px solid ${T.border}` }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: T.sub, marginBottom: 8, display: "block" }}>موضوع التذكرة</label>
              <input 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثال: مشكلة في شحن الرصيد"
                style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}`, borderRadius: 12, padding: 14, color: "white", fontSize: 14, fontFamily: T.font, outline: "none" }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: T.sub, marginBottom: 8, display: "block" }}>رسالتك</label>
              <textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                placeholder="يرجى كتابة التفاصيل هنا..."
                style={{ width: "100%", height: 120, background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}`, borderRadius: 12, padding: 14, color: "white", fontSize: 14, fontFamily: T.font, resize: "none", outline: "none" }}
              />
            </div>
            <button 
              onClick={handleCreateTicket} 
              disabled={loading}
              style={{ width: "100%", padding: 16, borderRadius: 16, background: T.accent, color: "white", fontWeight: 900, border: "none", fontSize: 15, fontFamily: T.font, boxShadow: `0 8px 20px rgba(59,130,246,0.3)` }}
            >
              {loading ? "جاري الإرسال..." : "إرسال التذكرة الآن 🚀"}
            </button>
          </div>
        )}
      </div>

      {/* Quick Help */}
      <div style={{ padding: "30px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: T.text, marginBottom: 12 }}>تواصل سريع</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div onClick={() => window.open("https://wa.me/201001900618")} className="tap" style={{ background: "#25D36620", border: "1px solid #25D36640", padding: 14, borderRadius: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🟢</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#25D366" }}>واتساب</span>
          </div>
          <div onClick={() => window.open("mailto:support@alqaidpro.com")} className="tap" style={{ background: "#3b82f620", border: "1px solid #3b82f640", padding: 14, borderRadius: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🔵</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#3b82f6" }}>إيميل</span>
          </div>
        </div>
      </div>
    </div>
  );
}
