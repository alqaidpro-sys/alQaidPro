import { useState } from "react";
import { G } from "../data";

const T = {
  bg: "#050810",
  surface: "rgba(255,255,255,0.032)",
  border: "rgba(255,255,255,0.07)",
  blue: "#4F8EF7",
  green: "#0ED9A0",
  yellow: "#FBBF24",
  red: "#F87171",
  purple: "#A78BFA",
  orange: "#FB923C",
  text: "#EFF4FF",
  sub: "rgba(210,225,255,0.38)",
  sub2: "rgba(210,225,255,0.6)",
  font: "'Cairo','Tajawal',sans-serif",
  r: 18, rSm: 12,
};

function Logo({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="rg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4F8EF7"/><stop offset="100%" stopColor="#0ED9A0"/></linearGradient>
        <linearGradient id="rg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#A78BFA"/><stop offset="100%" stopColor="#4F8EF7"/></linearGradient>
      </defs>
      <rect x="10" y="58" width="80" height="14" rx="7" fill="url(#rg1)"/>
      <polygon points="18,58 28,28 38,48 50,18 62,48 72,28 82,58" fill="url(#rg2)" opacity=".95"/>
      <circle cx="50" cy="18" r="7" fill="#FBBF24"/>
      <circle cx="50" cy="18" r="3.5" fill="white" opacity=".8"/>
      <circle cx="18" cy="58" r="4.5" fill="#4F8EF7"/>
      <circle cx="82" cy="58" r="4.5" fill="#0ED9A0"/>
    </svg>
  );
}

function GlassCard({ children, style = {} }: any) {
  return (
    <div className="shimmer" style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.r,
      backdropFilter: "blur(20px)", position: "relative", overflow: "hidden",
      boxShadow: "0 4px 24px rgba(0,0,0,.3)", ...style,
    }}>{children}</div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", icon, dir = "ltr", error, ok, hint }: any) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
        <label style={{ fontSize: 11, color: error ? T.red : ok ? T.green : T.sub2, fontWeight: 700, fontFamily: T.font }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: T.sub, fontFamily: T.font }}>{hint}</span>}
      </div>
      <div style={{ position: "relative" }}>
        <input
          className={`inp${error ? " error" : ok ? " ok" : ""}`}
          value={value} onChange={onChange}
          placeholder={placeholder}
          type={isPass ? (show ? "text" : "password") : type}
          dir={dir}
          style={{
            width: "100%", background: "rgba(0,0,0,.3)",
            border: `1px solid ${error ? T.red : ok ? T.green : T.border}`,
            borderRadius: T.rSm, color: T.text, fontSize: 14, fontFamily: T.font,
            padding: "13px 44px 13px 16px", transition: "border-color .2s,box-shadow .2s",
          }}
        />
        {isPass ? (
          <button onClick={() => setShow(s => !s)} className="tap" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 16, color: T.sub, padding: 2 }}>
            {show ? "🙈" : "👁️"}
          </button>
        ) : icon ? (
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: .4 }}>{icon}</span>
        ) : ok ? (
          <span className="checkpop" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: T.green, fontSize: 16 }}>✓</span>
        ) : null}
      </div>
      {error && <div style={{ fontSize: 10, color: T.red, marginTop: 5, fontFamily: T.font }}>⚠️ {error}</div>}
    </div>
  );
}

const COUNTRIES = [
  "مصر 🇪🇬", "السعودية 🇸🇦", "الإمارات 🇦🇪", "الكويت 🇰🇼",
  "قطر 🇶🇦", "البحرين 🇧🇭", "الأردن 🇯🇴", "العراق 🇮🇶",
  "أخرى 🌍",
];

export function AuthScreen({ onLogin }: { onLogin: () => void }) {
  const [view, setView] = useState<"login" | "register">("login");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Register Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("مصر 🇪🇬");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pin, setPin] = useState("");
  const [agree, setAgree] = useState(false);

  // Login Fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1500);
  };

  const handleRegister = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1500);
  };

  if (view === "login") {
    return (
      <div dir="rtl" style={{ background: T.bg, minHeight: "100vh", display: "flex", flexDirection: "column", padding: "60px 24px", fontFamily: T.font }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
           <div className="float" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 80, height: 80, borderRadius: 26, background: "linear-gradient(135deg,rgba(79,142,247,.15),rgba(14,217,160,.08))", border: "1.5px solid rgba(79,142,247,.3)", marginBottom: 14, boxShadow: "0 12px 40px rgba(79,142,247,.2)" }}>
              <Logo size={48}/>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: T.text, marginBottom: 4 }}>
              القائد <span style={{ background: "linear-gradient(135deg,#4F8EF7,#0ED9A0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PRO</span>
            </h1>
            <p style={{ fontSize: 11, color: T.sub, letterSpacing: 2, textTransform: "uppercase" }}>بوابة الدخول الذكية</p>
        </div>

        <div className="fadeUp" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="البريد الإلكتروني" value={loginEmail} onChange={(e: any) => setLoginEmail(e.target.value)} placeholder="name@example.com" type="email" />
          <Field label="كلمة المرور" value={loginPass} onChange={(e: any) => setLoginPass(e.target.value)} placeholder="••••••••" type="password" />
          
          <div style={{ textAlign: "left", marginTop: -8 }}>
            <span style={{ fontSize: 12, color: T.blue, fontWeight: 700, cursor: "pointer" }}>نسيت كلمة المرور؟</span>
          </div>

          <button onClick={handleLogin} className="tap" style={{
            width: "100%", padding: 16, borderRadius: 14, background: "linear-gradient(135deg,#4F8EF7,#0ED9A0)",
            color: "#fff", fontSize: 16, fontWeight: 900, border: "none", fontFamily: T.font,
            boxShadow: "0 8px 24px rgba(79,142,247,0.3)", marginTop: 8
          }}>
            {loading ? "جاري الدخول..." : "تسجيل الدخول 🚀"}
          </button>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <span style={{ fontSize: 13, color: T.sub, fontFamily: T.font }}>ليس لديك حساب؟ </span>
            <span onClick={() => setView("register")} style={{ fontSize: 13, color: T.blue, fontWeight: 900, cursor: "pointer", fontFamily: T.font }}>إنشاء حساب جديد</span>
          </div>

          <GlassCard style={{ padding: 14, background: "rgba(14,217,160,.05)", border: "1px solid rgba(14,217,160,.1)", marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🛡️</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.text, fontFamily: T.font }}>حماية متقدمة</div>
                <div style={{ fontSize: 10, color: T.sub, fontFamily: T.font }}>بياناتك مشفرة بالكامل ومعالجة بدقة متناهية</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Register view
  return (
    <div dir="rtl" style={{ background: T.bg, minHeight: "100vh", display: "flex", flexDirection: "column", padding: "50px 24px", fontFamily: T.font }}>
       <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="float" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 70, height: 70, borderRadius: 22, background: "linear-gradient(135deg,rgba(79,142,247,.15),rgba(14,217,160,.08))", border: "1.5px solid rgba(79,142,247,.3)", marginBottom: 12, boxShadow: "0 12px 40px rgba(79,142,247,.2)" }}>
            <Logo size={40}/>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: T.text, marginBottom: 4 }}>
            انضم لأسرة <span style={{ background: "linear-gradient(135deg,#4F8EF7,#0ED9A0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>القائد</span>
          </h1>
          <p style={{ fontSize: 10, color: T.sub, letterSpacing: 1.5 }}>ابدأ رحلتك الإلكترونية الآن</p>
      </div>

      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 4, width: step === i ? 24 : 6, borderRadius: 10, background: step === i ? T.blue : step > i ? T.green : "rgba(255,255,255,.1)", transition: "0.3s" }}/>
        ))}
      </div>

      <div className="fadeUp" key={step}>
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="الاسم الكامل" value={name} onChange={(e: any) => setName(e.target.value)} placeholder="محمد أحمد" icon="👤" />
            <Field label="البريد الإلكتروني" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="name@example.com" type="email" />
            <Field label="رقم الهاتف" value={phone} onChange={(e: any) => setPhone(e.target.value)} placeholder="+201xxxxxxxxx" icon="📱" />
            <div>
              <label style={{ fontSize: 11, color: T.sub2, fontWeight: 700, marginBottom: 7, display: "block" }}>الدولة</label>
              <select value={country} onChange={(e: any) => setCountry(e.target.value)} style={{ width: "100%", background: "rgba(0,0,0,.3)", border: `1px solid ${T.border}`, borderRadius: T.rSm, color: T.text, fontSize: 14, padding: "13px 16px", fontFamily: T.font, appearance: "none" }}>
                {COUNTRIES.map(c => <option key={c} value={c} style={{ background: "#0d1425" }}>{c}</option>)}
              </select>
            </div>
            <button onClick={() => setStep(2)} className="tap" style={{ width: "100%", padding: 16, borderRadius: 14, background: T.blue, color: "#fff", fontWeight: 900, border: "none", marginTop: 10 }}>المرحلة التالية ←</button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="كلمة المرور" value={pass} onChange={(e: any) => setPass(e.target.value)} type="password" placeholder="••••••••" />
            <Field label="تأكيد كلمة المرور" value={confirm} onChange={(e: any) => setConfirm(e.target.value)} type="password" placeholder="••••••••" />
            <Field label="PIN الأمان (4 أرقام)" value={pin} onChange={(e: any) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} type="password" placeholder="••••" icon="🔐" />
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button onClick={() => setStep(1)} className="tap" style={{ flex: 1, padding: 14, borderRadius: 14, border: `1px solid ${T.border}`, color: T.sub, background: "transparent" }}>رجوع</button>
              <button onClick={() => setStep(3)} className="tap" style={{ flex: 2, padding: 14, borderRadius: 14, background: T.blue, color: "#fff", fontWeight: 900, border: "none" }}>التالي</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <GlassCard style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: T.sub, marginBottom: 12 }}>مراجعة البيانات:</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: T.sub }}>الاسم:</span>
                <span style={{ fontSize: 12, color: T.text, fontWeight: 700 }}>{name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: T.sub }}>البريد:</span>
                <span style={{ fontSize: 12, color: T.text, fontWeight: 700 }}>{email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: T.sub }}>الهاتف:</span>
                <span style={{ fontSize: 12, color: T.text, fontWeight: 700 }}>{phone}</span>
              </div>
            </GlassCard>
            
            <div onClick={() => setAgree(!agree)} style={{ display: "flex", gap: 10, cursor: "pointer", alignItems: "center" }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${agree ? T.green : T.border}`, background: agree ? T.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {agree && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
              </div>
              <span style={{ fontSize: 11, color: T.sub2 }}>أوافق على الشروط والأحكام وسياسة الخصوصية</span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(2)} className="tap" style={{ flex: 1, padding: 14, borderRadius: 14, border: `1px solid ${T.border}`, color: T.sub, background: "transparent" }}>رجوع</button>
              <button onClick={handleRegister} className="tap" disabled={!agree || loading} style={{
                flex: 2, padding: 14, borderRadius: 14, background: agree ? T.green : T.border, color: "#fff",
                fontWeight: 900, border: "none", opacity: (agree && !loading) ? 1 : 0.5
              }}>
                {loading ? "جاري الحفظ..." : "إنشاء الحساب 🚀"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 30 }}>
        <span style={{ fontSize: 13, color: T.sub }}>لديك حساب؟ </span>
        <span onClick={() => setView("login")} style={{ fontSize: 13, color: T.blue, fontWeight: 900, cursor: "pointer" }}>تسجيل الدخول</span>
      </div>
    </div>
  );
}
