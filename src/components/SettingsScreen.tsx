import { useState, useEffect } from "react";
import { AdminPanel } from "./AdminPanel";
import { G } from "../data";
import { signOut } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, updateDoc, collection, query, where, getDocs, increment, serverTimestamp, addDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";

const T = {
  bg: "var(--sett-bg)",
  surface: "var(--sett-surface)",
  surface2: "var(--sett-surface2)",
  surface3: "var(--sett-surface3)",
  border: "var(--sett-border)",
  border2: "var(--sett-border2)",
  accent: "var(--sett-accent)",
  accentSoft: "var(--sett-accent-soft)",
  text: "var(--sett-text)",
  text2: "var(--sett-text2)",
  text3: "var(--sett-text3)",
  green: "var(--sett-green)",
  orange: "var(--sett-orange)",
  red: "var(--sett-red)",
  yellow: "var(--sett-yellow)",
  radius: "var(--sett-radius)",
  font: "Cairo, sans-serif"
};

export function SettingsScreen({ onBack, userEmail, orders = [], onUpdateOrder, users = [], onUpdateUser, userData, tickets = [], onUpdateTicket, depositRequests = [] }: { 
  onBack: () => void, 
  userEmail?: string, 
  orders?: any[], 
  onUpdateOrder?: (id: string, updates: any) => void,
  users?: any[],
  onUpdateUser?: (id: string, updates: any) => void,
  userData?: any,
  tickets?: any[],
  onUpdateTicket?: (id: string, updates: any) => void,
  depositRequests?: any[]
}) {
  const [masterNotif, setMasterNotif] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [sound, setSound] = useState("افتراضي");
  const [isDark, setIsDark] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  // Admin check
  const isAdmin = userData?.isAdmin === true || userData?.email === "alqaidpro@gmail.com" || userEmail === "alqaidpro@gmail.com" || userData?.role === "admin";

  // Profile State
  const [profile, setProfile] = useState({
    name: userData?.name || "",
    country: userData?.country || "",
    province: userData?.province || "",
    city: userData?.city || "",
    address: userData?.address || "",
    phone: userData?.phone || ""
  });

  const [invitations, setInvitations] = useState<any[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [convertInput, setConvertInput] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    if (activeModal === "invitations" && auth.currentUser) {
      fetchInvitations();
    }
  }, [activeModal]);

  const fetchInvitations = async () => {
    if (!auth.currentUser) return;
    setInvitesLoading(true);
    try {
      const q = query(collection(db, "users"), where("referredBy", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setInvitations(list);
    } catch (err) {
      console.error(err);
    } finally {
      setInvitesLoading(false);
    }
  };

  const handleConvertPoints = async () => {
    if (!convertInput) {
      return alert("يرجى إدخال عدد النقاط أولاً");
    }

    const points = userData?.rewardPoints || 0;
    const amountToConvert = parseInt(convertInput);

    if (isNaN(amountToConvert) || amountToConvert <= 0) {
      return alert("يرجى إدخال عدد نقاط صحيح");
    }
    if (amountToConvert < 150) {
      return alert("عذراً، الحد الأدنى لتحويل النقاط هو 150 نقطة.");
    }
    if (amountToConvert > points) {
      return alert(`عذراً، رصيدك الحالي من النقاط (${points}) لا يكفي لتحويل ${amountToConvert} نقطة.`);
    }

    const isConfirmed = window.confirm(`هل أنت متأكد من تحويل ${amountToConvert} نقطة إلى رصيد بمبلغ £${amountToConvert}؟`);
    if (!isConfirmed) return;

    if (!auth.currentUser) return;
    
    setIsConverting(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        balance: increment(amountToConvert),
        rewardPoints: increment(-amountToConvert),
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, "notifications"), {
        userId: auth.currentUser.uid,
        title: "💰 تم تحويل جزء من النقاط لرصيد",
        msg: `لقد تم تحويل ${amountToConvert} نقطة مكافأة إلى £${amountToConvert} في رصيدك بنجاح!`,
        time: "الآن",
        type: "support",
        read: false,
        createdAt: serverTimestamp()
      });

      alert(`✅ تم تحويل ${amountToConvert} نقطة بنجاح لرصيدك!`);
      setConvertInput("");
      setActiveModal(null);
    } catch (err: any) {
      console.error(err);
      alert("⚠️ فشل تحويل النقاط");
    } finally {
      setIsConverting(false);
    }
  };

  useEffect(() => {
    if (userData) {
      setProfile({
        name: userData.name || "",
        country: userData.country || "",
        province: userData.province || "",
        city: userData.city || "",
        address: userData.address || "",
        phone: userData.phone || ""
      });
    }
  }, [userData]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), profile);
      showToast("✅ تم حفظ البيانات بنجاح");
      setActiveModal(null);
    } catch (err) {
      console.error(err);
      showToast("❌ فشل حفظ البيانات");
    }
  };

  const COUNTRIES = [
    { n: "مصر", f: "🇪🇬" },
    { n: "السعودية", f: "🇸🇦" },
    { n: "الإمارات", f: "🇦🇪" },
    { n: "الكويت", f: "🇰🇼" },
    { n: "قطر", f: "🇶🇦" },
    { n: "البحرين", f: "🇧🇭" },
    { n: "عمان", f: "🇴🇲" },
    { n: "الأردن", f: "🇯🇴" },
    { n: "العراق", f: "🇮🇶" },
    { n: "لبنان", f: "🇱🇧" },
    { n: "المغرب", f: "مغ" },
    { n: "تونس", f: "🇹🇳" },
    { n: "الجزائر", f: "🇩🇿" }
  ];
  const EGYPT_PROVINCES = [
    "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", 
    "المنوفية", "المنيا", "القليوبية", "الوادي الجديد", "السويس", "الشرقية", "دمياط", "بورسعيد", "جنوب سيناء", 
    "بني سويف", "سوهاج", "الأقصر", "أسوان", "كفر الشيخ", "قنا", "شمال سيناء", "مطروح"
  ];

  const showToast = (msg: string) => alert(msg);

  const toggleTheme = () => {
    setIsDark(!isDark);
    showToast(!isDark ? "🌙 الوضع الداكن" : "☀️ الوضع الفاتح");
  };

  const Section = ({ title, children }: any) => (
    <div className="fadeUp" style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: ".09em", textTransform: "uppercase", padding: "0 6px", marginBottom: 8, fontFamily: T.font }}>{title}</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );

  const Row = ({ icon, name, sub, badge, badgeColor, onClick, toggle, checked, onToggle, showChevron = true, danger = false }: any) => (
    <div className="row tap" onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "15px 16px", borderBottom: `1px solid ${T.border}`,
      gap: 12, position: "relative"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: `${badgeColor || "rgba(130,140,170,.14)"}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0
        }}>{icon}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: danger ? T.red : T.text, fontFamily: T.font }}>{name}</div>
          {sub && <div style={{ fontSize: 12, color: T.text2, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: T.font }}>{sub}</div>}
        </div>
      </div>
      {toggle ? (
        <div onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{ position: "relative", width: 48, height: 27, flexShrink: 0, background: checked ? T.accent : T.border2, borderRadius: 14, transition: "0.3s" }}>
          <div style={{ position: "absolute", top: 3, right: checked ? 24 : 3, width: 21, height: 21, borderRadius: "50%", background: "#fff", transition: "0.3s" }} />
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {badge && <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 11px", borderRadius: 20, background: "rgba(255,255,255,0.05)", color: T.text2, fontFamily: T.font }}>{badge}</span>}
          {showChevron && <span style={{ color: danger ? T.red : T.text3, fontSize: 14 }}>‹</span>}
        </div>
      )}
    </div>
  );

  if (showAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} orders={orders} onUpdateOrder={onUpdateOrder} users={users} onUpdateUser={onUpdateUser} tickets={tickets} onUpdateTicket={onUpdateTicket} depositRequests={depositRequests} />;
  }

  return (
    <div style={{ padding: "0 16px 110px", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div className="fadeDown" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "54px 0 26px" }}>
        <div className="tap" onClick={onBack} style={{ width: 42, height: 42, borderRadius: 13, background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.text2, fontSize: 19 }}>&#8594;</div>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: T.text, fontFamily: T.font }}>إعدادات التطبيق</h1>
          <span style={{ fontSize: 12, color: T.text3, fontFamily: T.font }}>خصّص تجربتك بالكامل</span>
        </div>
        <div className="tap" onClick={toggleTheme} style={{ width: 42, height: 42, borderRadius: 13, background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{isDark ? "🌙" : "☀️"}</div>
      </div>

      {/* Profile Info */}
      <Section title="الحساب والمعلومات">
        <Row icon="👤" name="بياناتي" sub="العنوان، رقم الهاتف، والبيانات الشخصية" onClick={() => setActiveModal("profile")} badgeColor="rgba(59,130,246,.14)" />
        <Row icon="⭐" name="نقاط المكافأة" sub={`لديك ${userData?.rewardPoints || 0} نقطة مكافأة`} onClick={() => setActiveModal("rewardPoints")} badgeColor="rgba(251,191,36,.14)" />
        <Row icon="🎁" name="دعواتي" sub="قائمة الأشخاص الذين سجلوا عن طريقك" onClick={() => setActiveModal("invitations")} badgeColor="rgba(124,92,252,.14)" />
      </Section>

      {/* Notifications */}
      <Section title="الإشعارات">
        <Row icon="🔔" name="تفعيل الإشعارات" sub="تحكم في جميع التنبيهات" toggle checked={masterNotif} onToggle={() => setMasterNotif(!masterNotif)} badgeColor="rgba(74,124,255,.14)" />
        <div style={{ opacity: masterNotif ? 1 : 0.4, pointerEvents: masterNotif ? "all" : "none", transition: "0.3s" }}>
          <Row icon="📦" name="طلبات جديدة" sub="يصلك إشعار عند التحديث علي طلبك" toggle checked={true} onToggle={() => { }} badgeColor="rgba(37,212,156,.14)" />
          <Row icon="💬" name="الرسائل" sub="رسائل علي لاميل عند الخدمات" toggle checked={true} onToggle={() => { }} badgeColor="rgba(124,92,252,.14)" />
          <Row icon="🔊" name="صوت الإشعار" sub={sound} badge={sound} onClick={() => setActiveModal("sound")} badgeColor="rgba(20,200,220,.14)" />
        </div>
      </Section>

      {/* Security */}
      <Section title="الخصوصية والأمان">
        <Row icon="🔒" name="قفل بالبصمة" sub="معطّل" toggle checked={false} onToggle={() => { }} badgeColor="rgba(37,212,156,.14)" />
        <Row icon="🛡️" name="التحقق الثنائي (2FA)" sub="مفعّل • حماية إضافية" toggle checked={true} onToggle={() => { }} badgeColor="rgba(74,124,255,.14)" />
        <Row icon="📱" name="الجلسات النشطة" sub="جهازان مسجلان" badge="٢ أجهزة" onClick={() => setActiveModal("sessions")} badgeColor="rgba(255,170,46,.14)" />
      </Section>

      {/* Admin Panel Entry */}
      {isAdmin && (
        <Section title="منطقة الإدارة (خاص)">
          <Row 
            icon="💎" 
            name="لوحة الإدارة الكاملة" 
            sub="إدارة المستخدمين، الطلبات، والطلبات المالية" 
            onClick={() => setShowAdmin(true)} 
            badgeColor="rgba(59,130,246,.25)" 
          />
        </Section>
      )}

      {/* Danger Zone */}
      <Section title="منطقة الخطر">
        <Row icon="🚪" name="تسجيل الخروج" sub="الخروج من الحساب الحالي" danger onClick={() => setActiveModal("logout")} badgeColor="rgba(255,77,106,.14)" />
        <Row icon="⚠️" name="حذف الحساب" sub="إجراء لا يمكن التراجع عنه" danger onClick={() => setActiveModal("delete")} badgeColor="rgba(255,77,106,.14)" />
      </Section>

      {/* Version */}
      <div className="fadeUp" style={{ marginTop: 24, textAlign: "center", padding: 20, background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius }}>
        <div style={{ width: 52, height: 52, borderRadius: 15, background: "linear-gradient(135deg, var(--sett-accent), var(--sett-accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 10px", boxShadow: "0 6px 20px rgba(var(--sett-accent-rgb),.35)" }}>💎</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: T.font }}>منصة الخدمات</div>
        <div style={{ fontSize: 12, color: T.text3, marginTop: 3, fontFamily: T.font }}>الإصدار 2.4.1</div>
        <div className="tap" onClick={() => showToast("✅ التطبيق محدّث بالكامل")} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(37,212,156,.12)", color: T.green, fontSize: 11.5, fontWeight: 700, padding: "5px 12px", borderRadius: 20, marginTop: 8 }}>✅ التطبيق محدّث</div>
      </div>

      {/* Modals */}
      {activeModal && (
        <div onClick={() => setActiveModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} className="fadeUp" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "26px 26px 0 0", width: "100%", maxWidth: 480, padding: "20px 20px 44px" }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: T.border2, margin: "0 auto 18px" }} />
            
            {activeModal === "rewardPoints" && (
              <div dir="rtl" style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 15, color: T.text, fontFamily: T.font }}>⭐ نقاط المكافأة</div>
                
                <div style={{ 
                  background: "linear-gradient(135deg,rgba(251,191,36,0.1),rgba(251,191,36,0.05))", 
                  border: `1px solid rgba(251,191,36,0.2)`, 
                  padding: 24, borderRadius: 24, marginBottom: 20, textAlign: "center" 
                }}>
                  <div style={{ fontSize: 11, color: T.text3, marginBottom: 6, fontFamily: T.font }}>رصيدك من النقاط</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: T.yellow }}>{(userData?.rewardPoints || 0).toLocaleString()} <span style={{ fontSize: 14 }}>نقطة</span></div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: T.text2, display: "block", marginBottom: 8, fontFamily: T.font }}>عدد النقاط المراد تحويلها</label>
                  <input 
                    type="number"
                    value={convertInput}
                    onChange={(e) => setConvertInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="أدخل عدد النقاط (مثال: 150)"
                    style={{ width: "100%", padding: 14, borderRadius: 14, background: "#000", border: `1px solid ${T.border}`, color: "#fff", fontFamily: T.font, fontSize: 16 }}
                  />
                  <div style={{ fontSize: 10, color: T.text3, marginTop: 8, fontFamily: T.font }}>* الحد الأدنى للتحويل 150 نقطة. كل 1 نقطة تعادل 1 جنيه رصيد.</div>
                </div>

                <button 
                  onClick={handleConvertPoints}
                  disabled={isConverting}
                  className="tap"
                  style={{ 
                    width: "100%", padding: 15, borderRadius: 14, 
                    background: T.yellow, color: "#000", fontWeight: 900, 
                    border: "none", fontSize: 15, fontFamily: T.font, marginBottom: 12,
                    opacity: isConverting ? 0.6 : 1
                  }}
                >
                  {isConverting ? "جاري التحويل..." : "تحويل النقاط لرصيد ✅"}
                </button>

                <button 
                  onClick={() => setActiveModal(null)}
                  className="tap"
                  style={{ 
                    width: "100%", padding: 15, borderRadius: 14, 
                    background: "rgba(255,255,255,0.05)", color: T.text2, fontWeight: 800, 
                    border: `1px solid ${T.border}`, fontSize: 15, fontFamily: T.font
                  }}
                >
                  إغلاق
                </button>
              </div>
            )}

            {activeModal === "invitations" && (
              <div dir="rtl" style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 15, color: T.text, fontFamily: T.font }}>🎁 دعواتي</div>
                
                <div style={{ fontSize: 12, color: T.text2, marginBottom: 15, fontFamily: T.font }}>
                  أهلاً بك! هنا تظهر قائمة الأشخاص الذين قاموا بالتسجيل باستخدام كود الدعوة الخاص بك ({userData?.referralCode || "---"}).
                </div>

                <div style={{ maxHeight: "50vh", overflowY: "auto", padding: "0 4px" }}>
                  {invitesLoading ? (
                    <div style={{ textAlign: "center", padding: 20, color: T.text3 }}>جاري تحميل القائمة...</div>
                  ) : invitations.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, background: "rgba(255,255,255,0.02)", borderRadius: 20, border: `1px dashed ${T.border}` }}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>Empty 💨</div>
                      <div style={{ fontSize: 12, color: T.text3, fontFamily: T.font }}>لم يقم أحد بالتسجيل باستخدام كودك بعد.</div>
                    </div>
                  ) : (
                    invitations.map((inv, i) => (
                      <div key={i} style={{ 
                        display: "flex", alignItems: "center", justifyContent: "space-between", 
                        padding: 14, background: T.surface2, border: `1px solid ${T.border}`,
                        borderRadius: 16, marginBottom: 8
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(124,92,252,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: T.font }}>{inv.name}</div>
                            <div style={{ fontSize: 10, color: T.text3, fontFamily: T.font }}>{inv.joinedAt ? new Date(inv.joinedAt).toLocaleDateString("ar-EG") : "تاريخ غير معروف"}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: T.yellow }}>{inv.rewardPoints || 0} ⭐</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {activeModal === "profile" && (
              <div dir="rtl">
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8, color: T.text, fontFamily: T.font, textAlign: "right" }}>👤 بياناتي</div>
                <div style={{ fontSize: 11, color: T.orange, background: "rgba(255,170,46,0.08)", padding: "10px 14px", borderRadius: 12, marginBottom: 15, fontFamily: T.font, textAlign: "right", border: `1px solid rgba(255,170,46,0.15)` }}> 
                  تنبيه: تُستخدم هذه البيانات لإرسال الشحنات والطلبات. يرجى التأكد من دقتها.
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxHeight: "60vh", overflowY: "auto", padding: "0 2px 10px" }}>
                  {/* Name */}
                  <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: T.text3, fontFamily: T.font }}>الاسم الكامل</label>
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      placeholder="أدخل اسمك بالكامل"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 10, background: "#000", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.font, fontSize: 13 }} 
                    />
                  </div>

                  {/* Country */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: T.text3, fontFamily: T.font }}>البلد</label>
                    <select 
                      value={profile.country} 
                      onChange={(e) => setProfile({...profile, country: e.target.value, province: ""})}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 10, background: "#000", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.font, fontSize: 13, appearance: "none" }}
                    >
                      <option value="" style={{ background: "#000" }}>اختر البلد</option>
                      {COUNTRIES.map(c => <option key={c.n} value={c.n} style={{ background: "#000" }}>{c.f} {c.n}</option>)}
                    </select>
                  </div>

                  {/* Phone */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: T.text3, fontFamily: T.font }}>رقم الهاتف</label>
                    <input 
                      type="tel" 
                      value={profile.phone} 
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="رقم الهاتف"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 10, background: "#000", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.font, fontSize: 13 }} 
                    />
                  </div>

                  {/* Province (Only for Egypt) */}
                  {profile.country === "مصر" && (
                    <div className="fadeDown" style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: T.text3, fontFamily: T.font }}>المحافظة</label>
                      <select 
                        value={profile.province} 
                        onChange={(e) => setProfile({...profile, province: e.target.value})}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 10, background: "#000", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.font, fontSize: 13, appearance: "none" }}
                      >
                        <option value="" style={{ background: "#000" }}>اختر المحافظة</option>
                        {EGYPT_PROVINCES.map(p => <option key={p} value={p} style={{ background: "#000" }}>{p}</option>)}
                      </select>
                    </div>
                  )}

                  {/* City */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: T.text3, fontFamily: T.font }}>المدينة</label>
                    <input 
                      type="text" 
                      value={profile.city} 
                      onChange={(e) => setProfile({...profile, city: e.target.value})}
                      placeholder="المدينة"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 10, background: "#000", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.font, fontSize: 13 }} 
                    />
                  </div>

                  {/* Address */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: T.text3, fontFamily: T.font }}>العنوان</label>
                    <input 
                      type="text" 
                      value={profile.address} 
                      onChange={(e) => setProfile({...profile, address: e.target.value})}
                      placeholder="العنوان"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 10, background: "#000", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.font, fontSize: 13 }} 
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
                  <button 
                    onClick={handleSaveProfile} 
                    className="tap" 
                    style={{ flex: 1, padding: 12, background: T.accent, borderRadius: 12, color: "white", fontWeight: 800, fontFamily: T.font, border: "none", fontSize: 14 }}
                  >
                    حفظ البيانات
                  </button>
                </div>
              </div>
            )}

            {activeModal === "sound" && (
              <>
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14, color: T.text, fontFamily: T.font }}>🔊 صوت الإشعار</div>
                {["افتراضي", "خفيف", "قوي", "صامت 🔇"].map(s => (
                  <div key={s} onClick={() => { setSound(s); setActiveModal(null); }} className="tap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 14px", borderRadius: 14, marginBottom: 4, background: sound === s ? T.accentSoft : "transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, background: T.surface3, display: "flex", alignItems: "center", justifyContent: "center" }}>🔔</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: T.font }}>{s}</div>
                    </div>
                    {sound === s && <span style={{ color: T.accent, fontSize: 18 }}>✓</span>}
                  </div>
                ))}
              </>
            )}

            {activeModal === "sessions" && (
              <>
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14, color: T.text, fontFamily: T.font }}>📱 الجلسات النشطة</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 13, borderRadius: 14, background: T.surface2 }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: T.surface3, display: "flex", alignItems: "center", justifyContent: "center" }}>📱</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: T.font }}>جهاز Android</div>
                      <div style={{ fontSize: 11, color: T.text2, fontFamily: T.font }}>القاهرة • منذ ساعتين</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: T.green, fontWeight: 700, background: "rgba(37,212,156,.12)", padding: "4px 10px", borderRadius: 20 }}>نشط الآن</span>
                </div>
              </>
            )}

            {activeModal === "logout" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>🚪</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: T.font }}>تسجيل الخروج</div>
                <div style={{ fontSize: 13, color: T.text2, marginBottom: 20, lineHeight: 1.6, fontFamily: T.font }}>هل أنت متأكد أنك تريد الخروج من حسابك؟ ستحتاج إلى تسجيل الدخول مجدداً.</div>
                <button onClick={handleLogout} className="tap" style={{ width: "100%", padding: 14, background: "rgba(255,77,106,.1)", border: `1px solid rgba(255,77,106,.2)`, borderRadius: 14, color: T.red, fontWeight: 700, marginBottom: 10, fontFamily: T.font }}>نعم، تسجيل الخروج</button>
              </div>
            )}

            <button onClick={() => setActiveModal(null)} className="tap" style={{ width: "100%", padding: 14, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 14, color: T.text2, fontWeight: 700, fontFamily: T.font }}>إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}

