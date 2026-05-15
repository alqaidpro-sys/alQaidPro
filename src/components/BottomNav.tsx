import { G } from "../data";

export function BottomNav({ tab, setTab }: { tab: string, setTab: (t: string) => void }) {
  const tabs = [
    { id: "home", icon: "⊞", label: "الرئيسية" },
    { id: "wallet", icon: "💼", label: "المحفظة" },
    { id: "services", icon: "💎", label: "خدمات", center: true },
    { id: "history", icon: "🕐", label: "السجل" },
    { id: "settings", icon: "⚙️", label: "إعدادات" },
  ];

  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430,
      background: "rgba(5, 8, 16, 0.9)", 
      backdropFilter: "blur(24px)",
      borderTop: "1px solid rgba(255,255,255,0.04)",
      padding: "10px 10px 24px", 
      zIndex: 200,
      display: "flex", justifyContent: "space-around", alignItems: "flex-end",
    }}>
      {tabs.map(t => t.center ? (
        <div key={t.id} style={{ position: "relative", width: 56, height: 52, display: "flex", justifyContent: "center" }}>
          <button 
            onClick={() => setTab("services")}
            className="tap"
            style={{
              position: "absolute",
              top: -24,
              width: 52, height: 52, borderRadius: "50%",
              background: "linear-gradient(135deg, #1e1b4b, #312e81)",
              border: "3px solid #050810",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24,
              boxShadow: "0 8px 20px rgba(0,0,0,0.4), 0 0 12px rgba(59,130,246,0.2)",
              color: "white",
            }}
          >
            {t.icon}
          </button>
          <span style={{ position: "absolute", bottom: -2, fontSize: 9, color: tab === "services" ? G.blue : G.sub, fontWeight: 700, fontFamily: G.font }}>
            {t.label}
          </span>
        </div>
      ) : (
        <button key={t.id} onClick={() => setTab(t.id)}
          className="tap"
          style={{ 
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3, 
            padding: "8px 10px",
            background: tab === t.id ? "rgba(59,130,246,0.06)" : "transparent",
            borderRadius: 14,
            transition: "all 0.3s ease"
          }}>
          <div style={{
            fontSize: tab === t.id ? 20 : 17,
            color: tab === t.id ? G.blue : "rgba(255,255,255,0.4)",
            transition: "all 0.3s ease",
            transform: tab === t.id ? "translateY(-1px)" : "none"
          }}>{t.icon}</div>
          <span style={{ 
            fontSize: 9, fontFamily: G.font, 
            fontWeight: tab === t.id ? 900 : 500, 
            color: tab === t.id ? G.blue : "rgba(255,255,255,0.4)",
            opacity: tab === t.id ? 1 : 0.7
          }}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
}

