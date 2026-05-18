import { useState, useEffect } from "react";
import { G } from "../data";
import { ModernWalletCard } from "./Shared";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit, updateDoc, doc } from "firebase/firestore";

interface ServiceItem {
  id: string;
  name: string;
  sub: string;
  icon: string;
  color: string;
  badge?: string;
  desc: string;
  fields: string[];
  btn: string;
  note: string;
  isTopup?: boolean;
  hasDuration?: boolean;
}

export function HomeScreen({ setTab, balance = 0, cartCount = 0, userData, transactions = [], notifications = [] }: { setTab: (t: string, svcId?: string | null) => void, balance?: number, cartCount?: number, userData?: any, transactions?: any[], notifications?: any[] }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const displayName = userData?.name || "المستخدم";
  const displayRank = userData?.rank === "VIP" ? "عضو VIP ✨" : userData?.rank === "مميز" ? "عضو مميز ⚡" : "عضو عادي";

  const totalIn = transactions.filter(t => t.type === "TOPUP" && t.status === "completed").reduce((a, t) => {
    const val = t.amountValue !== undefined ? t.amountValue : Number(String(t.amount || "0").replace(/[^\d.]/g, "") || 0);
    return a + val;
  }, 0);
  const totalOut = transactions.filter(t => t.type !== "TOPUP" && (t.status === "completed" || t.status === "active" || t.status === "processing")).reduce((a, t) => {
    const val = t.amountValue !== undefined ? t.amountValue : Number(String(t.amount || "0").replace(/[^\d.]/g, "") || 0);
    return a + val;
  }, 0);
  const points = Math.floor(totalOut / 10);

  const recentActivity = transactions.slice(0, 3).map((t, i) => ({
    id: t.id,
    title: t.name,
    price: (t.type === "TOPUP" ? "+ " : "- ") + t.amount,
    time: t.date || "اليوم",
    icon: t.icon || "📦",
    color: t.color || "#3b82f6"
  }));

  return (
    <div style={{ paddingBottom: 110 }}>
      {/* Top Profile Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "48px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div onClick={() => setShowProfile(true)} className="glow tap" style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #1e293b, #0f172a)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            cursor: "pointer"
          }}>👤</div>
          <div>
            <div style={{ fontSize: 11, color: G.sub, fontFamily: G.font }}>أهلاً بك 👋</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: G.text, fontFamily: G.font }}>{displayName}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div onClick={() => setTab("cart")} className="tap" style={{
            width: 36, height: 36, borderRadius: 10, background: "#0f172a", border: "1px solid rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            cursor: "pointer"
          }}>
            <span style={{ fontSize: 16 }}>🛒</span>
            {cartCount > 0 && <div style={{ position: "absolute", top: -5, right: -5, minWidth: 16, height: 16, borderRadius: 8, background: "#ef4444", border: `2px solid #050810`, color: "white", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{cartCount}</div>}
          </div>
          <div onClick={() => setShowNotifs(true)} className="tap" style={{
            width: 36, height: 36, borderRadius: 10, background: "#0f172a", border: "1px solid rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            cursor: "pointer"
          }}>
            <span style={{ fontSize: 16 }}>🔔</span>
            <div style={{ position: "absolute", top: 8, right: 8, width: 6, height: 6, borderRadius: "50%", background: "#ef4444", border: `2px solid #0f172a` }} />
          </div>
        </div>
      </div>

      {/* Premium Wallet Display (Exact Wallet style) */}
      <ModernWalletCard 
        balance={balance} 
        points={points} 
        totalIn={totalIn} 
        totalOut={totalOut} 
        onTopup={() => setTab("wallet")}
        onTransfer={() => setTab("services")}
      />

      {/* Wide News Ticker */}
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
          
          <div className="marquee-ltr" 
               style={{ fontSize: 13, color: G.blue, fontWeight: 700, fontFamily: G.font }}
               dangerouslySetInnerHTML={{ __html: G.ticker }} 
          />
        </div>
      </div>

      {/* Promo Banner */}
      <div className="fadeUp" style={{ padding: "0 20px", marginBottom: 20, animationDelay: "0.2s" }}>
        <div style={{ 
          background: "linear-gradient(135deg, #064e3b, #065f46)", 
          borderRadius: 16, 
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "1px solid rgba(16,185,129,0.2)"
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "white", fontFamily: G.font }}>عرض الأسبوع ⚡</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2, fontFamily: G.font }}>خصم يصل لـ 90% على اشتراكات AI</div>
          </div>
          <div style={{ background: "#4ade80", color: "#064e3b", padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 900 }}>استفد الآن</div>
        </div>
      </div>

      {/* Real AI Tools Section */}
      <div className="fadeUp" style={{ padding: "0 20px", marginBottom: 24, animationDelay: "0.25s" }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: G.text, marginBottom: 12, fontFamily: G.font, textAlign: "right" }}>أدوات الذكاء الاصطناعي ✨</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { id: "real_ai", sub: "img", name: "بالذكاء الاصطناعي", icon: "🖼️", status: "فوري", color: "#8b5cf6" },
            { id: "real_ai", sub: "summ", name: "تلخيص النصوص", icon: "📝", status: "فوري", color: "#0ea5e9" },
            { id: "real_ai", sub: "content", name: "صانع المحتوى", icon: "✍️", status: "فوري", color: "#f43f5e" },
          ].map((act, i) => (
            <div key={i} className="tap" 
              onClick={() => setTab("real_ai", act.sub)}
              style={{ 
                textAlign: "center", 
                background: "#0f172a", 
                borderRadius: 16, 
                padding: "12px 8px",
                border: "1px solid rgba(255,255,255,0.03)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6
              }}>
              <div style={{ fontSize: 22 }}>{act.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: G.text, fontFamily: G.font }}>{act.name}</div>
              <div style={{ fontSize: 8, color: "#10b981", fontWeight: 700, fontFamily: G.font }}>{act.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Summary */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: G.blue, fontWeight: 800, fontFamily: G.font }}>عرض الكل</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: G.text, fontFamily: G.font }}>آخر النشاطات</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recentActivity.map((item, idx) => (
            <div key={item.id || idx} className="fadeUp" style={{ 
              background: "#0f172a", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 14, padding: "10px 14px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              animationDelay: `${0.3 + idx * 0.1}s`
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: G.text, fontFamily: G.font }}>{item.title}</div>
                  <div style={{ fontSize: 9, color: G.sub, fontFamily: G.font }}>{item.time}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 900, color: item.price.startsWith("+") ? "#10b981" : G.text, direction: "ltr" }}>{item.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile Modal */}
      {showProfile && (
        <div onClick={() => setShowProfile(false)} style={{ 
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", 
          backdropFilter: "blur(12px)", zIndex: 2000, 
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24 
        }}>
          <div onClick={e => e.stopPropagation()} className="fadeUp" style={{ 
            background: "#050810", border: "1px solid rgba(255,255,255,0.1)", 
            borderRadius: 28, width: "100%", maxWidth: 360, padding: 24, 
            position: "relative", overflow: "hidden", 
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
          }}>
            {/* Decorative Glow */}
            <div style={{ position: "absolute", top: -50, right: -50, width: 140, height: 140, background: "rgba(59,130,246,0.12)", borderRadius: "50%", filter: "blur(40px)" }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, position: "relative" }}>
              <div style={{ fontWeight: 900, fontSize: 18, color: G.text, fontFamily: G.font }}>بيانات الحساب</div>
              <div onClick={() => setShowProfile(false)} className="tap" style={{ 
                width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.05)", 
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 
              }}>✕</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ 
                display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.03)", 
                padding: 16, borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" 
              }}>
                <div style={{ 
                  width: 58, height: 58, borderRadius: 16, 
                  background: "linear-gradient(135deg, #1e293b, #0f172a)", 
                  border: "1px solid rgba(255,255,255,0.1)", 
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 
                }}>👤</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: G.text, fontFamily: G.font }}>{displayName}</div>
                  <div style={{ 
                    fontSize: 10, color: G.blue, background: "rgba(59,130,246,0.12)", 
                    padding: "3px 10px", borderRadius: 20, display: "inline-block", 
                    marginTop: 4, fontWeight: 800, fontFamily: G.font 
                  }}>{displayRank}</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "البريد الإلكتروني", val: userData?.email || "غير معروف", icon: "✉️" },
                  { label: "رقم الهاتف", val: userData?.phone || "غير مسجل", icon: "📱" },
                  { label: "الدولة", val: userData?.country ? `${userData.country} ${userData.country === "مصر" ? "🇪🇬" : ""}` : "لم تحدد", icon: "🌍" },
                  { label: "الرصيد المتاح", val: `${balance.toLocaleString()} ج.م`, icon: "💰", color: "#10b981" },
                  { label: "الرتبة", val: displayRank, icon: "👑" },
                ].map((item, i) => (
                  <div key={i} style={{ 
                    display: "flex", justifyContent: "space-between", alignItems: "center", 
                    padding: "12px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none" 
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span style={{ fontSize: 12, color: G.sub, fontFamily: G.font }}>{item.label}</span>
                    </div>
                    <span style={{ 
                      fontSize: 13, fontWeight: 800, color: item.color || G.text, 
                      fontFamily: G.font, direction: "ltr" 
                    }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setShowProfile(false)} className="tap" style={{ 
              width: "100%", marginTop: 24, padding: 16, borderRadius: 16, background: G.blue, 
              color: "#fff", border: "none", fontSize: 14, fontWeight: 900, fontFamily: G.font,
              boxShadow: "0 10px 20px rgba(59,130,246,0.3)"
            }}>إغلاق النافذة</button>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifs && (
        <div onClick={() => setShowNotifs(false)} style={{ 
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", 
          backdropFilter: "blur(12px)", zIndex: 2000, 
          display: "flex", alignItems: "flex-end", justifyContent: "center"
        }}>
          <div onClick={e => e.stopPropagation()} className="fadeUp" style={{ 
            background: "#050810", borderTop: "1px solid rgba(255,255,255,0.1)", 
            borderRadius: "32px 32px 0 0", width: "100%", maxWidth: 480, padding: "24px 20px 44px", 
            position: "relative", boxShadow: "0 -20px 50px rgba(0,0,0,0.5)"
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", margin: "0 auto 20px" }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontWeight: 900, fontSize: 18, color: G.text, fontFamily: G.font }}>الإشعارات والتنبيهات</div>
              <div onClick={() => setShowNotifs(false)} className="tap" style={{ 
                width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.05)", 
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 
              }}>✕</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "60vh", overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", opacity: 0.5 }}>
                  <div style={{ fontSize: 40, marginBottom: 15 }}>🔔</div>
                  <div style={{ fontSize: 13, color: G.sub, fontFamily: G.font }}>لا توجد إشعارات حالياً</div>
                </div>
              ) : (
                notifications.map((notif, idx) => (
                  <div key={notif.id} className="fadeUp" style={{ 
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", 
                    padding: 16, borderRadius: 20, display: "flex", gap: 14, animationDelay: `${idx * 0.1}s`
                  }}>
                    <div style={{ 
                      width: 44, height: 44, borderRadius: 14, 
                      background: `${notif.color || G.blue}15`, display: "flex", 
                      alignItems: "center", justifyContent: "center", fontSize: 20, shrink: 0
                    }}>{notif.icon || "🔔"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: G.text, fontFamily: G.font, marginBottom: 4, textAlign: "right" }}>{notif.title}</div>
                      <div style={{ fontSize: 11, color: G.sub, fontFamily: G.font, lineHeight: 1.5, marginBottom: 8, textAlign: "right" }}>{notif.msg || notif.desc}</div>
                      <div style={{ fontSize: 9, color: G.blue, fontWeight: 700, fontFamily: G.font, textAlign: "right" }}>{notif.time || "الآن"}</div>
                    </div>
                  </div>
                ))
              )}
              
              {notifications.length > 0 && (
                <div style={{ textAlign: "center", padding: "20px 0", opacity: 0.5 }}>
                  <div style={{ fontSize: 11, color: G.sub, fontFamily: G.font }}>لقد وصلت لنهاية الإشعارات ✨</div>
                </div>
              )}
            </div>

            <button onClick={() => setShowNotifs(false)} className="tap" style={{ 
              width: "100%", marginTop: 24, padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.05)", 
              color: G.text, border: "1px solid rgba(255,255,255,0.08)", fontSize: 14, fontWeight: 800, fontFamily: G.font
            }}>فهمت، شكراً</button>
          </div>
        </div>
      )}
    </div>
  );
}

