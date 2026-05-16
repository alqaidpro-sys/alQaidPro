import { useState } from "react";
import { processPurchase } from "../services/purchaseService";

const C = {
  bg:      "#050810",
  card:    "#0f172a",
  border:  "rgba(255,255,255,0.05)",
  borderB: "rgba(255,255,255,0.03)",
  text:    "#ffffff",
  sub:     "#94a3b8",
  sub2:    "#64748b",
  blue:    "#3B82F6",
  green:   "#10b981",
  yellow:  "#fbbf24",
  red:     "#ef4444",
  font:    "'Cairo', sans-serif",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{background:${C.bg};font-family:${C.font}}
input,button{font-family:${C.font}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pop{0%{transform:scale(.8);opacity:0}100%{transform:scale(1);opacity:1}}
.fadeUp{animation:fadeUp .32s ease both}
.tap{cursor:pointer;transition:all .15s}
.tap:active{transform:scale(.96);opacity:.8}
.inp:focus{outline:none;border-color:${C.blue}!important;box-shadow:0 0 0 2px rgba(59,143,212,.15)}
`;

const GAME_SERVICES = [
  { id: "pubg", name: "PUBG Mobile", icon: "🎮", color: "#f59e0b", sub: "شدات ببجي", price: 100 },
  { id: "freefire", name: "Free Fire", icon: "🔥", color: "#f97316", sub: "مجوهرات فري فاير", price: 80 },
  { id: "roblox", name: "Roblox", icon: "🏦", sub: "روبوكس", price: 120 },
  { id: "valorant", name: "Valorant", icon: "🛡️", sub: "نقاط فالورانت", price: 150 },
];

export default function GamesPage({ balance, setBalance, onBack, onAddToCart }: any) {
  const [sel, setSel] = useState<any>(null);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showAdded, setShowAdded] = useState(false);

  const handleBuy = async () => {
    if (!sel || !id) return;
    if (balance < sel.price) return alert("الرصيد غير كافٍ — اشحن المحفظة أولاً");
    
    setLoading(true);
    try {
      await processPurchase({
        serviceId: sel.id,
        serviceName: sel.name,
        icon: sel.icon,
        color: sel.color || "#3b82f6",
        amount: sel.price,
        details: {
          playerId: id,
          subCategory: sel.sub,
          type: "GAME_TOPUP"
        }
      });
      setDone(true);
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء إتمام الطلب");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartInternal = () => {
    if (!sel || !id) return alert("يرجى اختيار اللعبة وإدخال الـ ID");
    if (onAddToCart) {
      onAddToCart({ ...sel, fields: { "ID اللاعب": id } });
      setShowAdded(true);
    }
  };

  if (done) return (
    <div dir="rtl" style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{css}</style>
      <div style={{ fontSize: 60 }}>✅</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginTop: 20 }}>تم الشحن بنجاح!</div>
      <button onClick={onBack} style={{ marginTop: 30, padding: "12px 40px", borderRadius: 12, background: C.card, color: C.text, border: `1px solid ${C.border}` }}>رجوع</button>
    </div>
  );

  return (
    <div dir="rtl" style={{ background: C.bg, minHeight: "100vh", padding: "20px" }}>
      <style>{css}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.text, fontSize: 24 }}>←</button>
        <div style={{ fontSize: 18, fontWeight: 900, color: C.text }}>شحن الألعاب والعملات</div>
        <div />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {GAME_SERVICES.map(s => (
          <div key={s.id} onClick={() => setSel(s)} style={{ 
            background: C.card, borderRadius: 16, padding: 20, textAlign: "center", 
            border: `2px solid ${sel?.id === s.id ? s.color : C.border}`,
            transition: "0.2s"
          }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{s.name}</div>
            <div style={{ fontSize: 12, color: s.color }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {sel && (
        <div className="fadeUp" style={{ marginTop: 30, background: C.card, padding: 20, borderRadius: 20, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 15 }}>شحن {sel.name}</div>
          <input 
            value={id}
            onChange={e => setId(e.target.value)}
            placeholder="أدخل ID اللاعب..."
            dir="ltr"
            style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, color: C.text, marginBottom: 15 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
            <span style={{ color: C.sub }}>التكلفة:</span>
            <span style={{ color: C.yellow, fontWeight: 900 }}>{sel.price} ج.م</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button 
              onClick={handleBuy}
              disabled={loading}
              style={{ flex: 1, padding: 16, borderRadius: 12, background: C.blue, color: "white", fontWeight: 900, border: "none" }}
            >
              {loading ? "جاري الشحن..." : "اشحن الآن"}
            </button>
            <button 
              onClick={handleAddToCartInternal}
              style={{ width: 56, height: 56, borderRadius: 12, background: C.card, color: C.blue, border: `1px solid ${C.border}`, fontSize: 20 }}
            >
              🛒
            </button>
          </div>
        </div>
      )}

      {/* Added to Cart Modal */}
      {showAdded && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, zIndex: 2000
        }}>
          <div className="fadeUp" style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 24, padding: 32, width: "100%", maxWidth: 350,
            textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 8 }}>تمت الإضافة للسلة</div>
            <div style={{ fontSize: 13, color: C.sub, marginBottom: 24 }}>الخدمة الآن في سلة مشترياتك، يمكنك المتابعة أو إتمام الدفع</div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button 
                className="tap" 
                onClick={() => setShowAdded(false)}
                style={{ width: "100%", padding: 14, borderRadius: 12, background: C.blue, color: "white", fontSize: 14, fontWeight: 800, border: "none" }}
              >
                أكمل تسوق
              </button>
              <button 
                className="tap" 
                onClick={onBack}
                style={{ width: "100%", padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.05)", color: C.text, fontSize: 14, fontWeight: 700, border: `1px solid ${C.border}` }}
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
