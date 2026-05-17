import { useState } from "react";
import { G } from "../data";

// Status stages definition
const STAGES = [
  { label: "قيد المراجعة", color: "#FBBF24", icon: "⏳" },
  { label: "تم الموافقة على الطلب", color: "#3B82F6", icon: "✅" },
  { label: "جاري العمل على الطلب", color: "#F97316", icon: "⚙️" },
  { label: "تم تنفيذ الطلب", color: "#10B981", icon: "🚀" },
];

// Sample Transactions to show the feature
const SAMPLE_TRANSACTIONS = [
  { id: "TX-92841", name: "اشتراك Netflix Premium", date: "منذ 15 دقيقة", amount: "£250", icon: "🍿", color: "#E50914", type: "TV_SERVICE", status: "processing", stage: 2 },
  { id: "TX-77102", name: "شحن شدات PUBG Mobile", date: "اليوم، 10:30 صباحاً", amount: "£1,200", icon: "🔫", color: "#10b981", type: "GAMING", status: "completed", stage: 3 },
  { id: "TX-44129", name: "ChatGPT Plus Pro", date: "أمس، 09:12 مساءً", amount: "£550", icon: "🤖", color: "#10b981", type: "AI_SERVICE", status: "approved", stage: 1 },
  { id: "TX-11029", name: "مشتريات Temu Logistics", date: "منذ يومين", amount: "£8,400", icon: "🛍️", color: "#f97316", type: "TOPUP", status: "review", stage: 0 },
];

export function HistoryScreen({ onBack, transactions = [], onSetTab }: { onBack: () => void, transactions?: any[], onSetTab?: (tab: string) => void }) {
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const filters = [
    { id: "all", label: "الكل" },
    { id: "AI_SERVICE", label: "ذكاء اصطناعي" },
    { id: "TV_SERVICE", label: "ترفيه" },
    { id: "GAMING", label: "ألعاب" },
    { id: "TOPUP", label: "شحن" },
  ];

  const shown = filter === "all" ? transactions : transactions.filter(t => t.type === filter);

  return (
    <div style={{ paddingBottom: 110 }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 24px", display: "flex", alignItems: "center", gap: 15 }}>
        <div className="tap" onClick={onBack} style={{ width: 42, height: 42, borderRadius: 13, background: "#0f172a", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: G.sub, fontSize: 19 }}>&#8594;</div>
        <div style={{ flex: 1, textAlign: "right" }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: G.text, fontFamily: G.font }}>سجل العمليات</h1>
          <p style={{ fontSize: 11, color: G.sub, marginTop: 4, fontFamily: G.font }}>تتبع مراحل تنفيذ طلباتك بدقة</p>
        </div>
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
          <div key={i} onClick={() => setSelectedOrder(tx)} className="fadeUp tap" style={{
            background: "#0f172a", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 20, padding: 18,
            animationDelay: `${i * 0.05}s`, cursor: "pointer"
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
                <div style={{ fontSize: 16, fontWeight: 900, color: tx.type === "TOPUP" ? "#10B981" : G.text, fontFamily: G.font, direction: "ltr" }}>
                  {tx.type === "TOPUP" ? "+" : ""}{tx.amount}
                </div>
                <div style={{ 
                  fontSize: 10, 
                  color: tx.status === "rejected" ? "#EF4444" : STAGES[tx.stage || 0].color, 
                  marginTop: 4, 
                  fontFamily: G.font, 
                  fontWeight: 800,
                  background: tx.status === "rejected" ? "rgba(239,68,68,0.15)" : `${STAGES[tx.stage || 0].color}15`,
                  padding: "2px 8px",
                  borderRadius: 6
                }}>
                  {tx.status === "rejected" ? "مرفوض ❌" : STAGES[tx.stage || 0].label}
                </div>
              </div>
            </div>
            
            <div style={{ 
              display: "flex", justifyContent: "space-between", alignItems: "center", 
              paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.03)" 
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: STAGES[tx.stage || 0].color }} />
                <span style={{ fontSize: 10, color: G.sub, fontFamily: G.font }}>اضغط للتفاصيل والتتبع</span>
              </div>
              <div style={{ fontSize: 10, color: G.sub, fontFamily: G.font, background: "rgba(255,255,255,0.03)", padding: "4px 10px", borderRadius: 8 }}>
                ID: #{tx.id}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Tracking Modal */}
      {selectedOrder && (
        <div onClick={() => setSelectedOrder(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
          zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24
        }}>
          <div onClick={e => e.stopPropagation()} className="fadeUp" style={{
            background: "#050810", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 32,
            width: "100%", maxWidth: 360, padding: 26, position: "relative"
          }}>
            {/* Header info */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{ 
                width: 58, height: 58, borderRadius: 18, background: `${selectedOrder.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28
              }}>
                {selectedOrder.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: G.text, fontFamily: G.font }}>{selectedOrder.name}</div>
                <div style={{ fontSize: 11, color: G.sub, fontFamily: G.font, marginTop: 2 }}>معرف الطلب: #{selectedOrder.id}</div>
              </div>
              <div onClick={() => setSelectedOrder(null)} className="tap" style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>✕</div>
            </div>

            {/* Tracking Map (Visual Timeline) */}
            <div style={{ position: "relative", paddingRight: 40, paddingLeft: 10 }}>
              {/* Line background */}
              <div style={{ 
                position: "absolute", right: 23, top: 15, bottom: 15, width: 2, 
                background: "rgba(255,255,255,0.05)", borderRadius: 2 
              }} />
              
              {/* Active line progress */}
              <div style={{ 
                position: "absolute", right: 23, top: 15, width: 2, 
                height: `${(selectedOrder.stage / (STAGES.length - 1)) * 100}%`,
                background: `linear-gradient(to bottom, ${STAGES[0].color}, ${STAGES[selectedOrder.stage].color})`, 
                borderRadius: 2, transition: "height 0.8s ease"
              }} />

              {/* Stages List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {STAGES.map((s, i) => {
                  const isActive = i <= selectedOrder.stage;
                  const isCurrent = i === selectedOrder.stage;
                  
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 20, position: "relative" }}>
                      {/* Circle Indicator */}
                      <div style={{ 
                        width: 14, height: 14, borderRadius: "50%", 
                        background: isActive ? s.color : "#1e293b",
                        border: `4px solid ${isActive ? `${s.color}30` : "transparent"}`,
                        position: "absolute", right: -30, top: 4, zIndex: 2,
                        transition: "all 0.3s ease",
                        boxShadow: isCurrent ? `0 0 15px ${s.color}80` : "none"
                      }} />

                      <div>
                        <div style={{ 
                          fontSize: 13, fontWeight: isCurrent ? 900 : 700, 
                          color: isActive ? G.text : G.sub, 
                          fontFamily: G.font 
                        }}>{s.label}</div>
                        {isCurrent && (
                          <div style={{ 
                            fontSize: 10, color: s.color, background: `${s.color}15`, 
                            padding: "3px 10px", borderRadius: 8, display: "inline-block", 
                            marginTop: 6, fontWeight: 800, fontFamily: G.font
                          }}>نشط حالياً ✨</div>
                        )}
                        {!isActive && (
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 4, fontFamily: G.font }}>بانتظار اتمام المرحلة السابقة</div>
                        )}
                      </div>
                      <div style={{ fontSize: 18, opacity: isActive ? 1 : 0.2 }}>{s.icon}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Bottom */}
            <div style={{ marginTop: 32, padding: 18, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: G.sub, fontFamily: G.font }}>المبلغ الإجمالي</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: G.text, direction: "ltr" }}>{selectedOrder.amount}</span>
               </div>
               <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: G.sub, fontFamily: G.font }}>وقت الطلب</span>
                  <span style={{ fontSize: 12, color: G.text, fontFamily: G.font }}>{selectedOrder.date}</span>
               </div>
            </div>

            {/* Support Actions */}
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button onClick={() => window.open(`https://wa.me/201001900618?text=استفسار بخصوص الطلب ${selectedOrder.id}`)} className="tap" style={{
                     padding: "12px", borderRadius: 14, background: "#25D36620", border: "1px solid #25D36640",
                     color: "#25D366", fontSize: 12, fontWeight: 800, fontFamily: G.font, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                  }}>
                     <span>💬</span>
                     تواصل مباشر
                  </button>
                  <button onClick={() => window.open(`mailto:support@alqaidpro.com?subject=استفسار بخصوص الطلب ${selectedOrder.id}`)} className="tap" style={{
                     padding: "12px", borderRadius: 14, background: "#3b82f620", border: "1px solid #3b82f640",
                     color: "#3b82f6", fontSize: 12, fontWeight: 800, fontFamily: G.font, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                  }}>
                     <span>✉️</span>
                     مراسلة بريدية
                  </button>
               </div>
               
               {onSetTab && (
                 <button onClick={() => { onSetTab("support"); setSelectedOrder(null); }} className="tap" style={{
                    padding: "12px", borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    color: G.text, fontSize: 12, fontWeight: 800, fontFamily: G.font, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                 }}>
                    <span>🎫</span>
                    فتح تذكرة دعم لهذا الطلب
                 </button>
               )}
            </div>

            <button onClick={() => setSelectedOrder(null)} className="tap" style={{
              width: "100%", marginTop: 24, padding: 16, borderRadius: 16, background: G.blue,
              color: "#fff", border: "none", fontSize: 14, fontWeight: 900, fontFamily: G.font,
              boxShadow: "0 10px 20px rgba(59,130,246,0.3)"
            }}>إغلاق التتبع</button>
          </div>
        </div>
      )}
    </div>
  );
}

