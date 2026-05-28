import { useState, useEffect } from "react";
import { G } from "../data";
import { AdBanner, ModernWalletCard, NewsTicker } from "./Shared";
import { db, auth } from "../lib/firebase";
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

export function HomeScreen({ setTab, balance = 0, cartCount = 0, userData, transactions = [], globalRecentOrders = [], globalStats, notifications = [], tickerSettings }: { setTab: (t: string, svcId?: string | null) => void, balance?: number, cartCount?: number, userData?: any, transactions?: any[], globalRecentOrders?: any[], globalStats?: any, notifications?: any[], tickerSettings?: any }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (userData && !userData.referralCode && auth.currentUser) {
      const generateCode = async () => {
        const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let myCode = '';
        for (let i = 0; i < 7; i++) {
          myCode += charSet.charAt(Math.floor(Math.random() * charSet.length));
        }
        try {
          await updateDoc(doc(db, "users", auth.currentUser!.uid), {
            referralCode: myCode
          });
          console.log("Referral code generated for existing user:", myCode);
        } catch (err) {
          console.error("Error generating referral code:", err);
        }
      };
      generateCode();
    }
  }, [userData]);

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
  const points = userData?.rewardPoints || 0;

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

      {/* Top Ticker (Scrolling) */}
      <AdBanner text={tickerSettings?.top} />

      {/* Premium Wallet Display (Exact Wallet style) */}
      <ModernWalletCard 
        balance={balance} 
        points={points} 
        totalIn={totalIn} 
        totalOut={totalOut} 
        onTopup={() => setTab("wallet")}
        onTransfer={() => setTab("wallet")}
      />

      {/* Bottom Ticker (Static) */}
      <NewsTicker text={tickerSettings?.bottom} />

      {/* Promo Banner */}
      <div className="fadeUp" style={{ padding: "0 20px", marginBottom: 20, animationDelay: "0.2s" }}>
        <div style={{ 
          background: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))", 
          borderRadius: 16, 
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "1px solid rgba(16,185,129,0.25)",
          boxShadow: "0 8px 30px rgba(16,185,129,0.05)"
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#10b981", fontFamily: G.font, display: "flex", alignItems: "center", gap: 6 }}>
              <span>🐏 عرض عيد الأضحى المبارك!</span>
              <span style={{ fontSize: 10, background: "rgba(16,185,129,0.2)", color: "#10b981", padding: "2px 6px", borderRadius: 6, fontWeight: 900 }}>نشط ⚡</span>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 4, fontFamily: G.font, lineHeight: 1.5 }}>
              عرض الشحن الكاش والمحافظ: احصل على <strong style={{ color: "#10b981" }}>٣٠٪ زيادة مجانية</strong> تضاف لحسابك فوراً عند أي عملية شحن!
            </div>
          </div>
          <div onClick={() => setTab("wallet")} className="tap" style={{ background: "#10b981", color: "#050810", padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap", marginRight: 10 }}>اشحن الآن</div>
        </div>
      </div>

      {/* Global Statistics Section */}
      <div className="fadeUp" style={{ padding: "0 20px", marginBottom: 24, animationDelay: "0.25s" }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: G.text, marginBottom: 12, fontFamily: G.font, textAlign: "right" }}>إحصائيات المنصة 📊</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div style={{ background: "#0f172a", borderRadius: 20, padding: "16px 12px", border: "1px solid rgba(255,255,255,0.03)", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: G.sub, marginBottom: 4, fontFamily: G.font }}>إجمالي الأعضاء</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: G.blue, fontFamily: G.font }}>{( (Number(globalStats?.members) || 0) + 23488).toLocaleString()}</div>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 20, padding: "16px 12px", border: "1px solid rgba(255,255,255,0.03)", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: G.sub, marginBottom: 4, fontFamily: G.font }}>الطلبات المنفذة</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", fontFamily: G.font }}>{( (Number(globalStats?.orders) || 0) + 12848).toLocaleString()}</div>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 20, padding: "16px 12px", border: "1px solid rgba(255,255,255,0.03)", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: G.sub, marginBottom: 4, fontFamily: G.font }}>إجمالي الشحن</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#f59e0b", fontFamily: G.font }}>£{( (Number(globalStats?.recharge) || 0) + 2546488).toLocaleString()}</div>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 20, padding: "16px 12px", border: "1px solid rgba(255,255,255,0.03)", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: G.sub, marginBottom: 4, fontFamily: G.font }}>المصروفات</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#ef4444", fontFamily: G.font }}>£{( (Number(globalStats?.expenses) || 0) + 185454).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Global Recent Orders Section (Last 10) */}
      <div className="fadeUp" style={{ padding: "0 20px", marginBottom: 24, animationDelay: "0.3s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "#10b981", fontWeight: 800, background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 8 }}>مباشر 🟢</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: G.text, fontFamily: G.font }}>آخر 10 طلبات منفذة</div>
        </div>
        <div style={{ background: "#0f172a", borderRadius: 24, border: "1px solid rgba(255,255,255,0.03)", overflow: "hidden" }}>
          {(!globalRecentOrders || globalRecentOrders.length === 0) ? (
            <div style={{ padding: 20, textAlign: "center", color: G.sub, fontSize: 12, opacity: 0.6 }}>لا توجد طلبات حديثة حالياً</div>
          ) : (
            globalRecentOrders.map((o: any, idx: number) => (
              <div key={o.id} style={{ 
                padding: "12px 16px", 
                borderBottom: idx < globalRecentOrders.length - 1 ? "1px solid rgba(255,255,255,0.02)" : "none",
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                    {o.serviceIcon || "📦"}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: G.text }}>{o.name}</div>
                    <div style={{ fontSize: 9, color: G.sub, marginTop: 2 }}>
                      {o.completedAt?.toDate ? o.completedAt.toDate().toLocaleTimeString("ar-EG", {hour:'2-digit', minute:'2-digit'}) : (o.createdAt?.toDate ? o.createdAt.toDate().toLocaleTimeString("ar-EG", {hour:'2-digit', minute:'2-digit'}) : "الآن")}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 10, fontWeight: 900, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 6 }}>مكتمل ✅</div>
              </div>
            ))
          )}
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
                  { label: "كود الدعوة", val: userData?.referralCode || "---", icon: "🎁" },
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
      {/* SEO & About Section */}
      <div className="fadeUp" style={{ padding: "0 20px", marginTop: 40, animationDelay: "0.5s" }}>
        <div style={{ 
          background: "rgba(15,23,42,0.5)", 
          borderRadius: 24, 
          padding: 24, 
          border: "1px solid rgba(255,255,255,0.03)",
          textAlign: "right"
        }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: G.text, marginBottom: 12, fontFamily: G.font }}>حول منصة القائد للخدمات والشحن 💎</div>
          <p style={{ fontSize: 13, color: G.sub, fontFamily: G.font, lineHeight: "1.8", marginBottom: 16 }}>
            تعتبر منصة <strong>القائد للخدمات والشحن</strong>، بإدارة <strong>المهندس محمد الشيمي</strong>، الوجهة الأولى والآمنة في مصر والوطن العربي للحصول على الخدمات الرقمية المتكاملة. نحن متخصصون في <strong>القائد الهندسة</strong> وتقديم الحلول التقنية المبتكرة.
          </p>
          
          <div style={{ fontSize: 14, fontWeight: 800, color: G.blue, marginBottom: 10, fontFamily: G.font }}>خدماتنا المتميزة:</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "8px 12px" }}>
            {[
              "شحن ألعاب (ببجي موبايل، فري فاير، فالورانت)",
              "خدمات القائد للشحن الدولي",
              "المهندس محمد الشيمي - استشارات تقنية",
              "شراء من تيمو (Temu) ونون وأمازون",
              "اشتراكات نتفليكس بريميوم وشاهد VIP",
              "تفعيل يوتيوب بريميوم وسبوتيفاي",
              "أدوات الذكاء الاصطناعي (ChatGPT, Claude, Gemini)",
              "تحويلات Binance Pay و Pyypl الرسمية",
              "خدمات فودافون كاش وإنستا باي InstaPay",
              "القائد للخدمات اللوجستية والتخليص الجمركي",
              "القائد محمد الشيمي للبرمجيات",
              "شحن وتوصيل الطلبات أونلاين"
            ].map((s, i) => (
              <li key={i} style={{ fontSize: 11, color: "rgba(148,163,184,0.8)", fontFamily: G.font, background: "rgba(255,255,255,0.02)", padding: "4px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.02)" }}># {s}</li>
            ))}
          </ul>
          
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 11, color: "rgba(148,163,184,0.5)", fontFamily: G.font }}>
            جميع الحقوق محفوظة لمنصة القائد &copy; 2026 | م. محمد الشيمي
          </div>
        </div>
      </div>
    </div>
  );
}

