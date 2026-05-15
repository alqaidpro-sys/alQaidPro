import { useState } from "react";
import { G, TRANSACTIONS } from "../data";

export function HistoryScreen() {
  const [filter, setFilter] = useState("all");
  const filters = [
    { id: "all", label: "الكل" },
    { id: "AI_SERVICE", label: "ذكاء اصطناعي" },
    { id: "AMAZON", label: "أمازون" },
    { id: "GAMING", label: "ألعاب" },
    { id: "TOPUP", label: "شحن" },
  ];
  const shown = filter === "all" ? TRANSACTIONS : TRANSACTIONS.filter(t => t.type === filter);

  return (
    <div style={{ paddingBottom: 110 }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 24px", textAlign: "right" }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: G.text, fontFamily: G.font }}>سجل العمليات</h1>
        <p style={{ fontSize: 11, color: G.sub, marginTop: 4, fontFamily: G.font }}>تتبع جميع معاملاتك المالية والخدمية</p>
      </div>

      {/* Filter chips */}
      <div style={{ padding: "0 20px 20px", display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10 }}>
        {filters.map(f => (
          <button key={f.id} className="tap" onClick={() => setFilter(f.id)} style={{
            padding: "8px 16px", borderRadius: 14, fontSize: 12, fontFamily: G.font, fontWeight: 700, whiteSpace: "nowrap",
            background: filter === f.id ? G.blue : "#0f172a",
            border: `1px solid ${filter === f.id ? G.blue : "rgba(255,255,255,0.05)"}`,
            color: filter === f.id ? "white" : G.sub,
            transition: "all 0.3s ease"
          }}>{f.label}</button>
        ))}
      </div>

      {/* Transactions List */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {shown.map((tx, i) => (
          <div key={i} className="fadeUp" style={{
            background: "#0f172a", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 20, padding: 18,
            animationDelay: `${i * 0.05}s`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: 14, 
                  background: `${tx.color}15`, 
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 
                }}>
                  {tx.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: G.text, fontFamily: G.font }}>{tx.name}</div>
                  <div style={{ fontSize: 10, color: G.sub, marginTop: 2, fontFamily: G.font }}>{tx.date}</div>
                </div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: tx.status === "refunded" ? "#ef4444" : "#10b981", fontFamily: G.font, direction: "ltr" }}>
                  {tx.amount}
                </div>
                <div style={{ fontSize: 9, color: G.sub, marginTop: 2, fontFamily: G.font }}>مُكتمل</div>
              </div>
            </div>
            
            <div style={{ 
              display: "flex", justifyContent: "space-between", alignItems: "center", 
              paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.03)" 
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: tx.status === "refunded" ? "#ef4444" : "#10b981" }} />
                <span style={{ fontSize: 11, color: tx.status === "refunded" ? "#ef4444" : "#10b981", fontFamily: G.font, fontWeight: 700 }}>
                  {tx.status === "refunded" ? "مرفوض" : "عملية ناجحة"}
                </span>
              </div>
              <div style={{ fontSize: 10, color: G.sub, fontFamily: G.font, background: "rgba(255,255,255,0.03)", padding: "4px 10px", borderRadius: 8 }}>
                ID: #{Math.floor(Math.random()*90000) + 10000}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

