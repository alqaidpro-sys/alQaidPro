import { useState } from "react";
import { G } from "../data";
import { PageHeader, PrimaryBtn } from "./Shared";

export function WalletScreen() {
  const [showTopup, setShowTopup] = useState(false);
  const [amount, setAmount] = useState("");
  const [sender, setSender] = useState("");
  const TRANSACTIONS: any[] = [];

  return (
    <div style={{ paddingBottom: 110 }}>
      <PageHeader title="محفظتي" subtitle="إدارة رصيدك الافتراضي ومراجعة سجل المعاملات" />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05))", 
          border: `1px solid rgba(59,130,246,0.2)`, borderRadius: 24, padding: 24,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
        }}>
          <div>
            <div style={{ fontSize: 11, color: G.sub, marginBottom: 4, fontFamily: G.font, fontWeight: 700 }}>الرصيد المتاح</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: G.text, fontFamily: G.font, letterSpacing: -1 }}>£<span style={{ color: G.blue }}>5,000</span></div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>💼</div>
            <button className="tap" onClick={() => setShowTopup(!showTopup)} style={{
              background: "linear-gradient(135deg,#3B82F6,#1D4ED8)", borderRadius: 14,
              padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 900, fontFamily: G.font, border: "none",
              boxShadow: "0 4px 12px rgba(59,130,246,0.3)"
            }}>+ شحن</button>
          </div>
        </div>

        {showTopup && (
          <div className="fadeUp" style={{ background: G.card, border: `1px solid ${G.cardBorder}`, borderRadius: 24, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: G.text, fontFamily: G.font, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
              شحن المحفظة <span style={{ fontSize: 12, color: G.blue, background: "rgba(59,130,246,0.12)", padding: "4px 10px", borderRadius: 20 }}>طلب فوري</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { icon: "📱", label: "فودافون كاش", val: "01001900618", color: "#EF4444" },
                { icon: "📞", label: "اتصالات كاش", val: "01007272051", color: "#10B981" },
                { icon: "🍊", label: "اورنج كاش", val: "01270666075", color: "#F97316" },
                { icon: "🏦", label: "إنستا باي", val: "Loerd04", color: "#3B82F6" },
                { icon: "💲", label: "USDT", val: "Not 🚫 now", color: "#6B7280" },
              ].map((m, i) => (
                <div key={i} style={{
                  background: "rgba(0,0,0,0.25)", border: `1px solid ${G.cardBorder}`,
                  borderRadius: 16, padding: 12, textAlign: "center"
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, margin: "0 auto 8px" }}>{m.icon}</div>
                  <div style={{ fontSize: 10, color: G.sub, fontFamily: G.font, marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: G.text, fontFamily: G.font, marginBottom: 10, letterSpacing: 0.2 }}>{m.val}</div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(m.val);
                      alert("تم نسخ الرقم بنجاح ✅");
                    }}
                    className="tap" 
                    style={{ 
                      width: "100%", fontSize: 11, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", 
                      borderRadius: 8, padding: "6px 0", color: G.text, cursor: "pointer", fontWeight: 800, fontFamily: G.font
                    }}
                  >
                    نسخ
                  </button>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, color: G.sub, marginBottom: 8, fontFamily: G.font }}>المبلغ المرسل (ج.م)</div>
              <input className="inp" value={amount} onChange={e => setAmount(e.target.value)} placeholder="مثال: 1000" dir="ltr"
                style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${G.cardBorder}`, borderRadius: 12, padding: "12px 16px", color: G.text, fontSize: 14, fontFamily: G.font }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: G.sub, marginBottom: 8, fontFamily: G.font }}>رقم أو اسم الحساب المرسل</div>
              <input className="inp" value={sender} onChange={e => setSender(e.target.value)} placeholder="01XXXXXXXXX" dir="ltr"
                style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${G.cardBorder}`, borderRadius: 12, padding: "12px 16px", color: G.text, fontSize: 14, fontFamily: G.font }} />
            </div>
            <div style={{
              background: "rgba(59,130,246,0.06)", border: `2px dashed rgba(59,130,246,0.2)`,
              borderRadius: 12, padding: "28px 16px", textAlign: "center", cursor: "pointer",
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>⬆️</div>
              <div style={{ fontSize: 13, color: G.sub, fontFamily: G.font }}>اضغط لرفع صورة الإيصال</div>
            </div>
            <PrimaryBtn label="إرسال طلب الشحن" onClick={() => {}} icon="✓" />
          </div>
        )}

        <div style={{ background: G.card, border: `1px solid ${G.cardBorder}`, borderRadius: 18, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 18 }}>🕐</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: G.text, fontFamily: G.font }}>سجل المعاملات</span>
          </div>
          {TRANSACTIONS.length === 0 ? (
            <div style={{ border: `1px dashed ${G.cardBorder}`, borderRadius: 12, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: G.sub, fontFamily: G.font }}>لا توجد معاملات مسجلة بعد.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {TRANSACTIONS.map((tx, i) => (
                <div key={i} className="fade" style={{
                  background: "rgba(0,0,0,0.2)", border: `1px solid ${G.cardBorder}`,
                  borderRadius: 14, padding: "14px 16px",
                  animationDelay: `${i * 0.06}s`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, background: `${tx.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{tx.icon}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: G.text, fontFamily: G.font }}>{tx.name}</div>
                        <div style={{ fontSize: 9, color: G.sub, fontFamily: G.font, letterSpacing: 1 }}>TYPE: {tx.type}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: tx.status === "refunded" ? "#EF4444" : "#10B981", fontFamily: G.font }}>{tx.amount}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10, color: G.sub, fontFamily: G.font }}>{tx.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
