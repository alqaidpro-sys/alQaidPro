import React from "react";
import { motion } from "motion/react";
import { G } from "../data";

export function PageHeader({ title, subtitle, onBack }: { title: string, subtitle?: string, onBack?: () => void }) {
  return (
    <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 12 }}>
      {onBack && (
        <button className="btn" onClick={onBack} style={{
          width: 38, height: 38, borderRadius: 12,
          background: G.card, border: `1px solid ${G.cardBorder}`,
          color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
        }}>←</button>
      )}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: G.text, fontFamily: G.font }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 11, color: G.sub, letterSpacing: 1, fontFamily: G.font, marginTop: 2 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

export function BalanceBadge({ compact, balance = 0 }: { compact?: boolean, balance?: number }) {
  return (
    <div style={{
      background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)",
      borderRadius: compact ? 12 : 18, padding: compact ? "10px 16px" : "16px 20px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div>
        <div style={{ fontSize: 10, color: G.sub, marginBottom: 3 }}>الرصيد المتاح</div>
        <div style={{ fontSize: compact ? 22 : 28, fontWeight: 900, color: G.text, fontFamily: G.font, letterSpacing: -1 }}>
          £<span style={{ color: G.blue }}>{balance.toLocaleString()}</span>
        </div>
      </div>
      <div style={{
        width: compact ? 36 : 46, height: compact ? 36 : 46, borderRadius: 12,
        background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: compact ? 18 : 22,
      }}>💼</div>
    </div>
  );
}

export function InfoBanner({ icon, title, text, color }: { icon: string, title: string, text: string, color: string }) {
  return (
    <div style={{
      background: `linear-gradient(135deg,${color}18,${color}08)`,
      border: `1px solid ${color}30`, borderRadius: 16, padding: "14px 16px",
      display: "flex", gap: 12, alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 4, fontFamily: G.font }}>{title}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, fontFamily: G.font }}>{text}</div>
      </div>
    </div>
  );
}

export function PrimaryBtn({ label, onClick, color = G.blue, icon }: { label: string, onClick: () => void, color?: string, icon?: React.ReactNode }) {
  return (
    <button className="btn" onClick={onClick} style={{
      width: "100%", padding: "15px",
      background: `linear-gradient(135deg,${color},${color}cc)`,
      borderRadius: 16, color: "#fff",
      fontSize: 15, fontWeight: 700, fontFamily: G.font,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      boxShadow: `0 4px 20px ${color}40`,
    }}>
      {icon && <span>{icon}</span>}{label}
    </button>
  );
}

export function ModernWalletCard({ balance, points, totalIn, totalOut, onTopup, onTransfer }: any) {
  const pointsVal = Math.floor(points / 10);
  
  return (
    <div className="fadeUp" style={{ padding: "0 20px", marginBottom: 20 }}>
      <div style={{
        background: "linear-gradient(135deg,rgba(79,142,247,.08),rgba(14,217,160,.04))",
        border: "1px solid rgba(79,142,247,.22)",
        borderRadius: 24,
        padding: 22,
        backdropFilter: "blur(20px)",
        boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Subtle Glows */}
        <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: "rgba(79,142,247,0.1)", borderRadius: "50%", filter: "blur(30px)" }} />
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: G.sub, marginBottom: 5, fontFamily: G.font, fontWeight: 700 }}>الرصيد المتاح</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: G.text, direction: "ltr", display: "flex", alignItems: "baseline", gap: 4, justifyContent: "flex-end", lineHeight: 1 }}>
              <span style={{ fontSize: 34 }}>{balance.toLocaleString()}</span>
              <span style={{ fontSize: 20, color: G.blue, fontWeight: 900 }}>£</span>
            </div>
            <div style={{ fontSize: 9, color: G.sub, marginTop: 4, fontFamily: G.font, fontWeight: 600 }}>جنيه مصري</div>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 10, color: G.sub, marginBottom: 5, fontFamily: G.font, fontWeight: 700 }}>نقاط المكافآت</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#FBBF24", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 22 }}>{points.toLocaleString()}</span>
              <span style={{ fontSize: 16 }}>⭐</span>
            </div>
            <div style={{ fontSize: 9, color: G.sub, fontFamily: G.font, fontWeight: 600 }}>= £{pointsVal} خصم</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, background: "rgba(0,0,0,.25)", borderRadius: 16, padding: "16px 14px", marginBottom: 20 }}>
          {[
            { l: "إجمالي الشحن", v: `£${totalIn.toLocaleString()}`, i: "⬆️" },
            { l: "إجمالي المصروف", v: `£${totalOut.toLocaleString()}`, i: "⬇️" },
            { l: "قيمة النقاط", v: `£${pointsVal}`, i: "💎" }
          ].map((st, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{st.i}</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: G.text, direction: "ltr", marginBottom: 2 }}>{st.v}</div>
              <div style={{ fontSize: 9, color: G.sub, fontFamily: G.font, fontWeight: 700 }}>{st.l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="tap" onClick={onTopup} style={{
            flex: 1, background: `linear-gradient(135deg, ${G.blue}, #1d4ed8)`, padding: "14px", borderRadius: 14, color: "white", fontSize: 13, fontWeight: 900, border: "none", fontFamily: G.font,
            boxShadow: "0 8px 20px rgba(59,142,247,0.3)"
          }}>شحن الرصيد</button>
          <button className="tap" onClick={onTransfer} style={{
            flex: 1, background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: 14, color: G.text, fontSize: 13, fontWeight: 900, border: "1px solid rgba(255,255,255,0.08)", fontFamily: G.font
          }}>تحويل أموال</button>
        </div>
      </div>
    </div>
  );
}

export function AnnouncementModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2000, padding: 25
      }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} 
        animate={{ scale: 1, y: 0 }}
        style={{
          background: "linear-gradient(135deg, #111827, #030712)",
          border: "1px solid rgba(59,142,247,0.3)",
          borderRadius: 32, padding: 30, width: "100%", maxWidth: 400,
          textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          position: "relative", overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, background: "rgba(59,142,247,0.15)", borderRadius: "50%", filter: "blur(40px)" }} />
        
        <div style={{ fontSize: 48, marginBottom: 20 }}>✨</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 15, fontFamily: G.font }}>إشعار هام</h2>
        
        <p style={{ 
          fontSize: 15, color: "rgba(255,255,255,0.8)", 
          lineHeight: 1.8, marginBottom: 30, fontWeight: 600, 
          fontFamily: G.font, textAlign: "center"
        }}>
          صباح الخير عليكم الحمد لله التطبيق يعمل بشكل جيد ميه في الميه يمكنكم الآن الاستمتاع بكل شيء ❤️
        </p>

        <button 
          className="tap"
          onClick={onClose}
          style={{
            width: "100%", padding: "16px", borderRadius: 18,
            background: G.blue, color: "white", border: "none",
            fontSize: 16, fontWeight: 900, fontFamily: G.font,
            boxShadow: "0 10px 25px rgba(59,142,247,0.4)"
          }}
        >
          حسناً، فهمت
        </button>
      </motion.div>
    </motion.div>
  );
}
