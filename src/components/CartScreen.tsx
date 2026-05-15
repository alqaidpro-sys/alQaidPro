import { G } from "../data";
import { motion } from "motion/react";

interface Props {
  cart: any[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onBack: () => void;
  balance: number;
  setBalance: (b: number) => void;
  setTab: (t: string) => void;
}

export const CartScreen = ({ cart, onRemove, onClear, onBack, balance, setBalance, setTab }: Props) => {
  const total = cart.reduce((sum, item) => sum + (item.price || item.total || 0), 0);

  const handleCheckout = () => {
    if (balance < total) return;
    
    setBalance(balance - total);
    onClear();
    alert(`تم إتمام الطلب بنجاح! \nتم خصم ${total} ج.م من رصيدك.`);
    setTab("history"); 
  };

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ 
        padding: "20px 24px", display: "flex", alignItems: "center", 
        justifyContent: "space-between", background: "#050810", 
        position: "sticky", top: 0, zIndex: 10 
      }}>
        <button onClick={onBack} className="tap" style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: `1px solid ${G.cardBorder}` }}>
          <span style={{ transform: "rotate(180deg)", display: "inline-block" }}>➔</span>
        </button>
        <span style={{ fontSize: 18, fontWeight: 800, color: G.text, fontFamily: G.font }}>سلة المشتريات</span>
        <button onClick={onClear} className="tap" style={{ color: "#ef4444", fontSize: 12, fontWeight: 700, fontFamily: G.font, background: "none", border: "none" }}>مسح الكل</button>
      </div>

      <div style={{ padding: "0 20px" }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0", opacity: 0.4 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
            <div style={{ fontSize: 14, fontFamily: G.font }}>السلة فارغة حالياً</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {cart.map((item, i) => {
                const name = item.service?.name || item.name || "خدمة غير معروفة";
                const icon = item.service?.icon || item.icon || "📦";
                const price = item.price || item.total || 0;
                const values = item.vals || item.fields || {};
                const summary = Object.values(values).join(" • ");

                return (
                  <motion.div 
                    key={item.cartId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${G.cardBorder}`,
                      borderRadius: 16,
                      padding: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 16
                    }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: G.text, fontFamily: G.font, marginBottom: 4 }}>{name}</div>
                      <div style={{ fontSize: 11, color: G.sub, fontFamily: G.font }}>{summary || "طلب مخصص"}</div>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: G.blue, fontFamily: G.font, marginBottom: 4 }}>{price} ج.م</div>
                      <button onClick={() => onRemove(item.cartId)} style={{ color: "#ef4444", fontSize: 18, background: "none", border: "none", cursor: "pointer" }}>🗑️</button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Invoice Section */}
            <div className="fadeUp" style={{ 
              background: "rgba(59,130,246,0.05)", 
              border: `2px dashed rgba(59,130,246,0.2)`, 
              borderRadius: 20, 
              padding: 24, 
              marginBottom: 40 
            }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: G.text, fontFamily: G.font, marginBottom: 20, textAlign: "center" }}>🧾 ملخص الفاتورة</div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 10 }}>
                  <span style={{ fontSize: 13, color: G.sub, fontFamily: G.font }}>عدد الخدمات:</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: G.text, fontFamily: G.font }}>{cart.length}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 10 }}>
                  <span style={{ fontSize: 13, color: G.sub, fontFamily: G.font }}>الرصيد المتاح:</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: G.text, fontFamily: G.font }}>{balance} ج.م</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: G.blue, fontFamily: G.font }}>إجمالي المطلوب:</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: G.blue, fontFamily: G.font }}>{total} ج.م</span>
                </div>
              </div>

              {balance < total && (
                <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 12, padding: "10px 14px", borderRadius: 10, marginTop: 20, textAlign: "center", fontFamily: G.font }}>
                  ⚠️ رصيدك الحالي لا يكفي لإتمام هذه العملية
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Sticky Bottom Button */}
      {cart.length > 0 && (
        <div style={{ 
          position: "fixed", bottom: 85, left: "50%", transform: "translateX(-50%)", 
          width: "100%", maxWidth: 1000, background: "#050810", 
          padding: "16px 24px", borderTop: `1px solid ${G.cardBorder}`, 
          zIndex: 20 
        }}>
          <button className="tap" 
            disabled={balance < total}
            onClick={handleCheckout}
            style={{ 
              width: "100%", padding: "18px", borderRadius: 16, 
              background: balance >= total ? G.gradient : "#1e293b", 
              color: balance >= total ? "white" : G.sub,
              fontSize: 17, fontWeight: 900, fontFamily: G.font,
              border: "none", boxShadow: balance >= total ? "0 12px 40px rgba(59,130,246,0.4)" : "none",
              cursor: balance >= total ? "pointer" : "not-allowed"
            }}>
            {balance >= total ? "إتمام الطلب الآن" : "رصيد غير كافٍ"}
          </button>
        </div>
      )}
    </div>
  );
};
