import { useState } from "react";
import { G } from "../data";

const C = {
  bg:      "#050810",
  card:    "#0f172a",
  cardBorder: "rgba(255,255,255,0.04)",
  text:    "#ffffff",
  sub:     "#94a3b8",
  blue:    "#3B82F6",
  font:    "'Cairo', sans-serif",
};

const ALL_SERVICES_GROUPS = [
  {
    title: "الخدمات اللوجستية والاستراتيجية",
    id: "logistics",
    icon: "🛒",
    cols: 2,
    items: [
      { svcId: "temu", name: "شراء من تيمو (Temu)", icon: "🛍️", sub: "خصم 85% حصري", color: "#f97316" },
      { svcId: "ali", name: "علي إكسبريس (AliExpress)", icon: "🌐", sub: "خصم 80% حصري", color: "#3b8fd4" },
      { svcId: "amazon", name: "شراء من أمازون (Amazon)", icon: "📦", sub: "وفر 75% حصري", color: "#f59e0b" },
      { svcId: "amazon_bal", name: "شحن رصيد أمازون", icon: "💳", sub: "ضعف الرصيد", color: "#f59e0b" },
    ]
  },
  {
    title: "أدوات الذكاء الاصطناعي (خصم 85%)",
    id: "ai_subs",
    icon: "🤖",
    cols: 4,
    items: [
      { svcId: "gemini", name: "Gemini Advanced", icon: "💎", sub: "خصم 85%", color: "#3b8fd4" },
      { svcId: "claude", name: "Claude 3.5 Pro", icon: "🧠", sub: "خصم 85%", color: "#f97316" },
      { svcId: "midjourney", name: "Midjourney Pro", icon: "✨", sub: "خصم 85%", color: "#8b5cf6" },
      { svcId: "chatgpt", name: "ChatGPT Plus", icon: "🤖", sub: "خصم 85%", color: "#10b981" },
      { svcId: "eleven", name: "ElevenLabs Creator", icon: "🎙️", sub: "خصم 85%", color: "#22c55e" },
      { svcId: "canva", name: "Canva Enterprise", icon: "🎨", sub: "خصم 85%", color: "#06b6d4" },
      { svcId: "capcut", name: "CapCut Pro Desktop", icon: "🎬", sub: "خصم 85%", color: "#e2e8f0" },
      { svcId: "perplexity", name: "Perplexity Pro", icon: "🔍", sub: "خصم 85%", color: "#2ec4b6" },
    ]
  },
  {
    title: "منصات الترفيه والسينما (خصم 85%)",
    id: "tv_subs",
    icon: "🎬",
    cols: 4,
    items: [
      { svcId: "disney", name: "Disney+ Global", icon: "🏰", sub: "خصم 85%", color: "#113ccf" },
      { svcId: "shahid", name: "Shahid VIP Sports", icon: "📽️", sub: "خصم 85%", color: "#3b8fd4" },
      { svcId: "spotify", name: "Spotify Premium", icon: "🎵", sub: "خصم 85%", color: "#1db954" },
      { svcId: "netflix", name: "Netflix Premium 4K", icon: "📺", sub: "خصم 85%", color: "#e50914" },
      { svcId: "crunchyroll", name: "Crunchyroll Mega Fan", icon: "🍥", sub: "خصم 85%", color: "#f47521" },
      { svcId: "youtube", name: "YouTube Premium", icon: "▶", sub: "خصم 85%", color: "#ff0000" },
    ]
  },
  {
    title: "شحن الألعاب والعملات الرقمية (خصم 30%)",
    id: "games",
    icon: "🎮",
    cols: 3,
    items: [
      { svcId: "roblox", name: "Roblox - روبوكس", icon: "🏦", sub: "دولي - فوري", color: "#e2e8f0" },
      { svcId: "freefire", name: "Free Fire - ألماس", icon: "🔥", sub: "دولي - فوري", color: "#f97316" },
      { svcId: "pubg", name: "PUBG Mobile - شدات", icon: "🎯", sub: "دولي - فوري", color: "#f59e0b" },
      { svcId: "steam", name: "Steam Gift Cards", icon: "🎮", sub: "شحن كود", color: "#94a3b8" },
      { svcId: "valorant", name: "Valorant Points", icon: "🛡️", sub: "شحن دولي", color: "#ef4444" },
      { svcId: "cod", name: "Call of Duty Mobile", icon: "🔫", sub: "شحن CP", color: "#f59e0b" },
      { svcId: "ps", name: "PlayStation Store", icon: "🎮", sub: "Cards", color: "#3b8fd4" },
      { svcId: "google", name: "Google Play Gift", icon: "🛍️", sub: "US/EG", color: "#10b981" },
      { svcId: "ml", name: "Mobile Legends", icon: "🦅", sub: "Diamonds", color: "#f59e0b" },
    ]
  },
  {
    title: "أدوات الذكاء الاصطناعي (أدوات حقيقية)",
    id: "real_ai",
    icon: "✨",
    cols: 3,
    items: [
      { svcId: "ai_gen", name: "بالذكاء الاصطناعي", icon: "🖼️", sub: "فوري", color: "#8b5cf6" },
      { svcId: "ai_sum", name: "تلخيص النصوص الذكي", icon: "📝", sub: "فوري", color: "#3b8fd4" },
      { svcId: "ai_content", name: "صانع المحتوى الإبداعي", icon: "✍️", sub: "فوري", color: "#10b981" },
    ]
  },
  {
    title: "الخدمات المالية والشحن",
    id: "finance",
    icon: "💰",
    cols: 2,
    items: [
      { tab: "paypal", name: "PayPal / Payeer", icon: "💳", sub: "تحويل رصيد", color: "#3b8fd4" },
      { tab: "binance", name: "Binance USDT", icon: "₿", sub: "كريبتو فوري", color: "#f59e0b" },
      { tab: "pyypl", name: "شحن Pyypl", icon: "🌍", sub: "محفظة دولية", color: "#22c55e" },
      { tab: "usd_transfer", name: "تحويل مخصص", icon: "💸", sub: "دولار (USD)", color: "#10b981" },
    ]
  }
];

export function ServicesScreen({ setTab, cartCount = 0, tickerSettings }: any) {
  const [search, setSearch] = useState("");

  const servicesTicker = tickerSettings?.services || G.ticker;

  const renderGroup = (group: any, idx: number) => {
    const filteredItems = group.items.filter((s: any) => 
      (s.name?.toLowerCase()?.includes(search.toLowerCase())) || 
      (s.sub?.toLowerCase()?.includes(search.toLowerCase()))
    );

    if (filteredItems.length === 0) return null;

    const gridCols = group.cols || 2;

    return (
      <div key={group.id} className="fadeUp" style={{ marginBottom: 28, animationDelay: `${idx * 0.1}s` }} dir="rtl">
        <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ 
              width: 32, height: 32, borderRadius: 10, 
              background: "linear-gradient(135deg, #1e1b4b, #312e81)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              border: "1px solid rgba(255,255,255,0.1)"
            }}>
              {group.icon}
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: G.text, fontFamily: G.font }}>
              {group.title}
            </div>
          </div>
          <div style={{ fontSize: 11, color: G.blue, fontWeight: 800, fontFamily: G.font, opacity: 0.8 }}>عرض الكل</div>
        </div>
        <div style={{ 
          padding: "0 16px", 
          display: "grid", 
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`, 
          gap: 10,
          direction: "rtl"
        }}>
          {filteredItems.map((s: any, i: number) => (
            <div 
              key={i} 
              className={`tap ${s.disabled ? "opacity-50" : ""}`}
              onClick={() => !s.disabled && setTab(s.tab || group.id, s.svcId || null)}
              style={{ 
                background: "#0f172a", 
                border: "1px solid rgba(255,255,255,0.03)", 
                borderRadius: 16, 
                padding: gridCols === 4 ? "12px 4px" : "15px 8px", 
                textAlign: "center", 
                position: "relative", 
                overflow: "hidden",
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                justifyContent: "center",
                minHeight: gridCols === 4 ? 84 : 105,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}
            >
              <div style={{ 
                width: gridCols === 4 ? 32 : 40, 
                height: gridCols === 4 ? 32 : 40, 
                borderRadius: gridCols === 4 ? 8 : 12, 
                background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                border: "1px solid rgba(255,255,255,0.04)",
                marginBottom: 8,
                display: "flex", alignItems: "center", justifyContent: "center", 
                fontSize: gridCols === 4 ? 16 : 20,
                color: s.color || C.blue
              }}>
                {s.icon}
              </div>
              <div style={{ 
                fontSize: gridCols === 4 ? 9 : 11, 
                fontWeight: 800, color: G.text, 
                marginBottom: 3, fontFamily: G.font, 
                lineHeight: 1.25,
                padding: "0 2px"
              }}>
                {s.name}
              </div>
              <div style={{ 
                fontSize: gridCols === 4 ? 8 : 9, 
                color: (s.svcId?.toLowerCase()?.includes("ai") || s.sub?.includes("%")) ? "#fbbf24" : s.color || C.sub, 
                fontWeight: 900, 
                fontFamily: G.font,
                opacity: 0.9 
              }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: G.bg, minHeight: "100vh", paddingBottom: 110 }} dir="rtl">

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "48px 20px 16px" }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: G.text, fontFamily: G.font }}>استكشف الخدمات</div>
        <div onClick={() => setTab("cart")} className="tap" style={{
          width: 38, height: 38, borderRadius: 12, background: "#0f172a", border: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
          cursor: "pointer"
        }}>
          <span style={{ fontSize: 18 }}>🛒</span>
          {cartCount > 0 && <div style={{ position: "absolute", top: -5, right: -5, minWidth: 16, height: 16, borderRadius: 8, background: "#ef4444", border: `2px solid #050810`, color: "white", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{cartCount}</div>}
        </div>
      </div>

      {/* Search Header */}
      <div style={{ padding: "0 20px 12px" }}>
        <div style={{ position: "relative" }}>
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن أي خدمة..." 
            dir="rtl"
            style={{ 
              width: "100%", background: "#0f172a", border: `1px solid ${G.cardBorder}`, 
              borderRadius: 16, padding: "14px 44px 14px 18px", color: G.text, 
              fontSize: 14, fontFamily: G.font, outline: "none", textAlign: "right"
            }} 
          />
          <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>🔍</span>
        </div>
      </div>

      {/* Wide News Ticker */}
      {!search && (
        <div className="fadeUp" style={{ padding: "0 20px", marginBottom: 20, animationDelay: "0.1s" }}>
          <div style={{ 
            background: "rgba(59,130,246,0.06)", 
            border: "1px solid rgba(59,130,246,0.12)", 
            borderRadius: 12, 
            padding: "10px 0",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            alignItems: "center"
          }}>
            <div style={{ 
              position: "absolute", right: 0, top: 0, bottom: 0, width: 40, 
              background: "linear-gradient(to left, #050810, transparent)", 
              zIndex: 2 
            }} />
            <div style={{ 
              position: "absolute", left: 0, top: 0, bottom: 0, width: 40, 
              background: "linear-gradient(to right, #050810, transparent)", 
              zIndex: 2 
            }} />
            
            <div className="marquee-seamless-rtl" 
                 style={{ 
                   fontSize: 13, 
                   color: G.blue, 
                   fontWeight: 700, 
                   fontFamily: G.font,
                   animationDuration: "40s" 
                 }}
            >
              <div dangerouslySetInnerHTML={{ __html: servicesTicker + "&nbsp;&nbsp;•&nbsp;&nbsp;" }} />
              <div dangerouslySetInnerHTML={{ __html: servicesTicker + "&nbsp;&nbsp;•&nbsp;&nbsp;" }} />
            </div>
          </div>
        </div>
      )}

      {/* Notifications Opt-in */}
      {!search && (
        <div className="fadeUp" style={{ padding: "0 20px", marginBottom: 26, animationDelay: "0.2s" }}>
          <div style={{ 
            background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.02))", 
            border: "1px dashed rgba(59,130,246,0.3)", 
            borderRadius: 16, 
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 24 }}>🔔</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: G.text, fontFamily: G.font }}>هل تود تفعيل الإشعارات؟</div>
                <div style={{ fontSize: 10, color: G.sub, fontFamily: G.font, marginTop: 2 }}>لتلقي تحديثات فورية حول طلباتك وعروضنا</div>
              </div>
            </div>
            <button className="tap" style={{ 
              background: G.blue, 
              color: "#fff", 
              border: "none", 
              borderRadius: 10, 
              padding: "8px 16px", 
              fontSize: 12, 
              fontWeight: 900, 
              fontFamily: G.font,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(59,130,246,0.3)"
            }} onClick={() => alert("✅ تم تفعيل الإشعارات بنجاح!")}>
              تشغيل الآن
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column" }}>
        {ALL_SERVICES_GROUPS.map((group, i) => renderGroup(group, i))}
      </div>

      {search && ALL_SERVICES_GROUPS.every(g => g.items.filter(s => (s.name?.toLowerCase()?.includes(search.toLowerCase()) || s.sub?.toLowerCase()?.includes(search.toLowerCase()))).length === 0) && (
        <div style={{ textAlign: "center", padding: "60px 20px", opacity: 0.4 }} dir="rtl">
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 14, color: G.text, fontFamily: G.font, textAlign: "center" }}>لا توجد نتائج بحث...</div>
        </div>
      )}
    </div>
  );
}
