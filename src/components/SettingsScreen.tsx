import { useState } from "react";
import { G } from "../data";

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

export function SettingsScreen() {
  const [masterNotif, setMasterNotif] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [sound, setSound] = useState("افتراضي");
  const [isDark, setIsDark] = useState(true);

  const showToast = (msg: string) => alert(msg); // Placeholder for actual toast

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

  return (
    <div style={{ padding: "0 16px 110px", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div className="fadeDown" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "54px 0 26px" }}>
        <div className="tap" style={{ width: 42, height: 42, borderRadius: 13, background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.text2, fontSize: 19 }}>&#8594;</div>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: T.text, fontFamily: T.font }}>إعدادات التطبيق</h1>
          <span style={{ fontSize: 12, color: T.text3, fontFamily: T.font }}>خصّص تجربتك بالكامل</span>
        </div>
        <div className="tap" onClick={toggleTheme} style={{ width: 42, height: 42, borderRadius: 13, background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{isDark ? "🌙" : "☀️"}</div>
      </div>

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
                <button onClick={() => window.location.reload()} className="tap" style={{ width: "100%", padding: 14, background: "rgba(255,77,106,.1)", border: `1px solid rgba(255,77,106,.2)`, borderRadius: 14, color: T.red, fontWeight: 700, marginBottom: 10, fontFamily: T.font }}>نعم، تسجيل الخروج</button>
              </div>
            )}

            <button onClick={() => setActiveModal(null)} className="tap" style={{ width: "100%", padding: 14, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 14, color: T.text2, fontWeight: 700, fontFamily: T.font }}>إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}

