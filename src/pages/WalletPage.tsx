import { useState } from "react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, collection, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { G } from "../data";
import { ModernWalletCard } from "../components/Shared";

const T = {
  bg:      "#050810",
  surface: "#0f172a",
  border:  "rgba(255,255,255,0.05)",
  blue:    "#3B82F6",
  green:   "#10b981",
  yellow:  "#fbbf24",
  red:     "#ef4444",
  purple:  "#8b5cf6",
  text:    "#ffffff",
  sub:     "#94a3b8",
  sub2:    "#64748b",
  font:    "'Cairo', sans-serif",
  r: 18, rSm: 12,
};

const PAYMENT_METHODS = [
  { id: "vodafone",  name: "فودافون كاش", icon: "📱", color: "#EF4444", fields: ["رقم الهاتف (المرسل منه)", "الاسم الكامل"], val: "01001900618", fee: 0,   note: "فوري 24/7" },
  { id: "etisalat", name: "اتصالات كاش",  icon: "📶", color: "#10B981", fields: ["رقم الهاتف (المرسل منه)", "الاسم الكامل"], val: "01007272051", fee: 0,   note: "فوري 24/7" },
  { id: "orange",   name: "أورانج كاش",    icon: "🟠", color: "#FB923C", fields: ["رقم الهاتف (المرسل منه)", "الاسم الكامل"], val: "01270666075", fee: 0,   note: "فوري 24/7" },
  { id: "instapay", name: "InstaPay",      icon: "⚡", color: "#8B5CF6", fields: ["اسم المرسل", "رقم العملية"], val: "Loerd04", fee: 0,   note: "فوري" },
  { id: "crypto",   name: "USDT",          icon: "🪙", color: "#FBBF24", fields: ["عنوان محفظتك", "رقم المعاملة (TXID)"], val: "Not 🚫 now", fee: 0,   note: "شبكة TRC20" },
];

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{background:${T.bg};font-family:${T.font}}
::-webkit-scrollbar{width:0}
input,button{font-family:${T.font}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
.fadeUp{animation:fadeUp .4s ease both}
.fadeIn{animation:fadeIn .3s ease both}
.float{animation:float 3s ease-in-out infinite}
.btn{cursor:pointer;border:none;transition:all .18s ease}
.btn:hover{transform:translateY(-1px);filter:brightness(1.1)}
.btn:active{transform:scale(.97)}
.card{transition:all .18s ease}
.card:hover{transform:translateY(-2px)}
.inp:focus{outline:none;border-color:${T.blue}!important;box-shadow:0 0 0 3px rgba(79,142,247,.15)}
.shimmer{position:relative;overflow:hidden}
.shimmer::after{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent);animation:shimmer 2.5s infinite;pointer-events:none}
`;

function Logo({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4F8EF7"/><stop offset="100%" stopColor="#0ED9A0"/></linearGradient>
        <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#A78BFA"/><stop offset="100%" stopColor="#4F8EF7"/></linearGradient>
      </defs>
      <rect x="10" y="58" width="80" height="14" rx="7" fill="url(#wg1)"/>
      <polygon points="18,58 28,28 38,48 50,18 62,48 72,28 82,58" fill="url(#wg2)" opacity=".95"/>
      <circle cx="50" cy="18" r="7" fill="#FBBF24"/>
      <circle cx="50" cy="18" r="3.5" fill="white" opacity=".8"/>
      <circle cx="18" cy="58" r="4.5" fill="#4F8EF7"/>
      <circle cx="82" cy="58" r="4.5" fill="#0ED9A0"/>
    </svg>
  );
}

function GlassCard({ children, style = {}, onClick, glow = false }: any) {
  return (
    <div className="card shimmer" onClick={onClick} style={{
      background: T.surface, border: `1px solid ${glow ? "rgba(79,142,247,.35)" : T.border}`,
      borderRadius: T.r, backdropFilter: "blur(20px)", position: "relative", overflow: "hidden",
      boxShadow: glow ? "0 0 30px rgba(79,142,247,.1)" : "0 4px 24px rgba(0,0,0,.3)", ...style,
    }}>{children}</div>
  );
}

function Btn({ label, onClick, color = T.blue, full = false, size = "md", variant = "solid", disabled = false, style = {} }: any) {
  const p  = size === "lg" ? "16px 28px" : size === "sm" ? "8px 14px" : "13px 22px";
  const fs = size === "lg" ? 15 : size === "sm" ? 11 : 13;
  const vs: any = { solid: { background: `linear-gradient(135deg,${color},${color}cc)`, color: "#fff", boxShadow: `0 4px 20px ${color}40` }, ghost: { background: `${color}14`, border: `1px solid ${color}30`, color }, outline: { background: "transparent", border: `1px solid ${color}50`, color } };
  return <button className="btn" onClick={onClick} disabled={disabled} style={{ width: full ? "100%" : "auto", padding: p, fontSize: fs, fontWeight: 800, borderRadius: T.rSm, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: disabled ? .5 : 1, ...vs[variant], ...style }}>{label}</button>;
}

function Input({ label, value, onChange, placeholder, type = "text", icon, dir = "ltr" }: any) {
  return (
    <div style={{ width: "100%" }}>
      {label && <label style={{ fontSize: 11, color: T.sub2, marginBottom: 7, display: "block", fontWeight: 700 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        <input className="inp" value={value} onChange={onChange} placeholder={placeholder} type={type} dir={dir}
          style={{ width: "100%", background: "rgba(0,0,0,.3)", border: `1px solid ${T.border}`, borderRadius: T.rSm, color: T.text, fontSize: 14, fontFamily: T.font, padding: icon ? "13px 44px 13px 16px" : "13px 16px", transition: "border-color .2s,box-shadow .2s" }}/>
        {icon && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: .4 }}>{icon}</span>}
      </div>
    </div>
  );
}

function StepBar({ current }: any) {
  const steps = ["المبلغ", "طريقة الدفع", "التأكيد"];
  const idx: any = { amount: 0, method: 1, confirm: 2 }[current] ?? 0;
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 22 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: i < idx ? T.green : i === idx ? T.blue : "rgba(255,255,255,.06)", border: `2px solid ${i <= idx ? (i < idx ? T.green : T.blue) : T.border}`, fontSize: 11, fontWeight: 900, color: i <= idx ? "#fff" : T.sub, transition: "all .3s" }}>{i < idx ? "✓" : i + 1}</div>
            <span style={{ fontSize: 9, color: i === idx ? T.blue : i < idx ? T.green : T.sub, fontWeight: 700, whiteSpace: "nowrap" }}>{s}</span>
          </div>
          {i < 2 && <div style={{ flex: 1, height: 2, background: i < idx ? T.green : T.border, margin: "0 6px 14px", transition: "background .3s" }}/>}
        </div>
      ))}
    </div>
  );
}

function Badge({ label, color }: any) {
  return <span style={{ padding: "2px 8px", fontSize: 9, fontWeight: 800, borderRadius: 20, background: `${color}20`, color, border: `1px solid ${color}30`, display: "inline-block", whiteSpace: "nowrap" }}>{label}</span>;
}

export default function WalletPage({ balance = 0, setBalance, onBack, transactions = [], userData }: any) {
  const [txs, setTxs]           = useState([]);
  const [step, setStep]         = useState("main");
  const [amount, setAmount]     = useState(200);
  const [custom, setCustom]     = useState("");
  const [method, setMethod]     = useState<any>(null);
  const [fields, setFields]     = useState<any>({});
  const [loading, setLoading]   = useState(false);
  const [receipt, setReceipt]   = useState<any>(null);
  const [filter, setFilter]     = useState("الكل");

  const finalAmt  = custom ? Number(custom) : amount;
  const fee       = method ? +((method.fee / 100) * finalAmt).toFixed(2) : 0;
  const totalPay  = +(finalAmt + fee).toFixed(2);

  const reset = () => { setStep("main"); setAmount(200); setCustom(""); setMethod(null); setFields({}); };

  const confirm = async () => {
    const miss = method.fields.find((f: any) => !fields[f]?.trim());
    if (miss) { alert(`يرجى ملء: ${miss}`); return; }
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      const id = "DEP-" + Math.random().toString(36).substr(2, 8).toUpperCase();
      
      // Create deposit request in a specific collection
      await setDoc(doc(db, "deposit_requests", id), {
        id,
        methodName: method.name,
        amount: finalAmt, // numeric value
        fee,
        totalPay,
        paymentDetails: fields,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        userName: userData?.name || auth.currentUser.displayName || auth.currentUser.email,
        status: "pending", // strictly pending for admin review
        createdAt: serverTimestamp(),
        dateFormatted: new Date().toLocaleString("ar-EG")
      });

      setReceipt({ amount: finalAmt, fee, method: method.name, id, time: new Date().toLocaleTimeString("ar-EG") });
      setLoading(false);
      setStep("success");
    } catch (err: any) {
      console.error("Deposit request error:", err);
      setLoading(false);
      alert("⚠️ فشل في إرسال طلب الشحن: " + (err.message || "خطأ غير معروف"));
    }
  };

  // Only count completed transactions in totals to avoid confusion
  const totalIn   = transactions.filter((t: any) => t.type === "TOPUP" && t.status === "completed").reduce((a: any, t: any) => {
    const val = t.amountValue !== undefined ? t.amountValue : Number(String(t.amount || "0").replace(/[^\d.]/g, ""));
    return a + val;
  }, 0);
  const totalOut  = transactions.filter((t: any) => t.type !== "TOPUP" && (t.status === "completed" || t.status === "active" || t.status === "processing")).reduce((a: any, t: any) => {
    const val = t.amountValue !== undefined ? t.amountValue : Number(String(t.amount || "0").replace(/[^\d.]/g, ""));
    return a + val;
  }, 0);
  const points = Math.floor(totalOut / 10);
  const filtered  = filter === "الكل" ? transactions : transactions.filter((t: any) => {
    if (filter === "شحن") return t.type === "TOPUP";
    if (filter === "مدفوع") return t.type !== "TOPUP";
    return true;
  });

  /* ── SUCCESS ── */
  if (step === "success") return (
    <>
      <style>{css}</style>
      <div dir="rtl" style={{ background: T.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 32, fontFamily: T.font }}>
        <div className="float" style={{ fontSize: 86, marginBottom: 18 }}>⏳</div>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: T.text, marginBottom: 6 }}>طلب الشحن قيد المراجعة</h2>
        <p style={{ fontSize: 13, color: T.sub2, textAlign: "center", marginBottom: 22 }}>تم استلام طلبك بنجاح. سيتم مراجعة البيانات وإضافة الرصيد لمحفظتك خلال دقائق قليلة.</p>
        <GlassCard glow style={{ padding: 22, width: "100%", maxWidth: 340 }}>
          {[["المبلغ المطلوب", `£${receipt?.amount}`, T.green], ["العمولة", receipt?.fee > 0 ? `£${receipt.fee}` : "مجاناً ✓", T.yellow], ["طريقة الدفع", receipt?.method, T.text], ["حالة الطلب", "جاري المراجعة...", T.yellow], ["رقم الطلب", receipt?.id, T.blue]].map(([l, v, c], i, a) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < a.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <span style={{ color: T.sub as string, fontSize: 12 }}>{l}</span>
              <span style={{ color: c as string, fontWeight: 800, fontSize: 13, direction: "ltr" }}>{v}</span>
            </div>
          ))}
        </GlassCard>
        <div style={{ marginTop: 22, display: "flex", gap: 12 }}>
          <Btn label="شحن مرة أخرى" onClick={reset} color={T.blue} />
          <Btn label="رجوع للمحفظة" onClick={reset} variant="ghost" color={T.sub2} />
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div dir="rtl" style={{ background: T.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", paddingBottom: 60, fontFamily: T.font, position: "relative" }}>

        {/* BG glows */}
        <div style={{ position: "fixed", top: "-10%", right: "-20%", width: 400, height: 400, background: "radial-gradient(circle,rgba(79,142,247,.05),transparent 70%)", pointerEvents: "none", zIndex: 0 }}/>
        <div style={{ position: "fixed", bottom: "-10%", left: "-15%", width: 350, height: 350, background: "radial-gradient(circle,rgba(14,217,160,.04),transparent 70%)", pointerEvents: "none", zIndex: 0 }}/>

        <div style={{ position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ padding: "50px 20px 0", display: "flex", gap: 15, alignItems: "center" }}>
            <div className="tap" onClick={onBack} style={{ width: 42, height: 42, borderRadius: 12, background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.text, fontSize: 20 }}>&#8594;</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: T.text }}>المحفظة الرقمية</h1>
              <p style={{ fontSize: 11, color: T.sub, marginTop: 3 }}>رصيدك ومعاملاتك</p>
            </div>
            <div className="float"><Logo size={42}/></div>
          </div>

          {/* Balance card */}
          <ModernWalletCard 
            balance={balance} 
            points={points} 
            totalIn={totalIn} 
            totalOut={totalOut} 
            onTopup={() => { setStep("main"); }}
            onTransfer={onBack}
          />

          {/* ══ TOPUP FLOW ══ */}
          <div style={{ padding: "20px 20px 0" }}>

            {/* STEP: main / amount */}
            {step === "main" && (
              <div className="fadeIn">
                <div style={{ fontSize: 13, color: T.sub2, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 3, height: 14, background: T.green, borderRadius: 4 }}/>
                  شحن الرصيد — اختر المبلغ
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
                  {QUICK_AMOUNTS.map(a => (
                    <button key={a} onClick={() => { setAmount(a); setCustom(""); }} className="btn" style={{ padding: "14px 8px", borderRadius: 14, fontSize: 15, fontWeight: 900, background: amount === a && !custom ? "rgba(79,142,247,.2)" : T.surface, border: `1px solid ${amount === a && !custom ? T.blue : T.border}`, color: amount === a && !custom ? T.blue : T.text }}>£{a}</button>
                  ))}
                </div>
                <Input label="أو أدخل مبلغاً مخصصاً" value={custom} onChange={(e: any) => setCustom(e.target.value.replace(/\D/g, ""))} placeholder="مثال: 750 (الحد الأدنى £10)" icon="✏️"/>
                <div style={{ marginTop: 16 }}>
                  <Btn full label={`التالي ← شحن £${finalAmt || 0}`} onClick={() => finalAmt >= 10 && setStep("method")} disabled={!finalAmt || finalAmt < 10} size="lg" color={T.green}/>
                  {finalAmt > 0 && finalAmt < 10 && <div style={{ fontSize: 11, color: T.red, textAlign: "center", marginTop: 8 }}>الحد الأدنى £10</div>}
                </div>
              </div>
            )}

            {/* STEP: method */}
            {step === "method" && (
              <div className="fadeUp">
                <StepBar current="method"/>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <button onClick={() => setStep("main")} className="btn" style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text, padding: "8px 14px", borderRadius: 10, fontSize: 12 }}>← رجوع</button>
                  <div style={{ fontSize: 13, color: T.sub2, fontWeight: 700 }}>اختر طريقة الدفع ({PAYMENT_METHODS.length} وسيلة)</div>
                </div>

                {/* Methods grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {PAYMENT_METHODS.map(m => (
                    <GlassCard key={m.id} onClick={() => setMethod(m)} style={{ 
                      padding: "16px 12px", cursor: "pointer", textAlign: "center", position: "relative",
                      border: `1px solid ${method?.id === m.id ? m.color : T.border}`, 
                      background: method?.id === m.id ? `${m.color}12` : T.surface 
                    }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${m.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, margin: "0 auto 10px" }}>{m.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: T.text, fontFamily: T.font }}>{m.name}</div>
                      <div style={{ fontSize: 9, color: T.sub, marginTop: 4, fontFamily: T.font }}>{m.note}</div>
                      {method?.id === m.id && (
                        <div style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: m.color, border: "2px solid rgba(255,255,255,0.2)" }} />
                      )}
                    </GlassCard>
                  ))}
                </div>

                {method && (
                  <div className="fadeUp" style={{ marginTop: 24, paddingBottom: 60 }}>
                    <Btn 
                      full 
                      label={`استمرار ← أدخل بيانات ${method.name}`} 
                      onClick={() => setStep("confirm")} 
                      size="lg" 
                      color={T.blue}
                      style={{ height: 58, boxShadow: `0 12px 24px -10px ${method.color}80` }}
                    />
                    <div style={{ textAlign: "center", color: T.yellow, fontSize: 10, marginTop: 12, fontWeight: 700 }}>
                      ⚠️ اضغط على الزر الأزرق بالأعلى للاستمرار
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP: confirm */}
            {step === "confirm" && (
              <div className="fadeUp">
                <StepBar current="confirm"/>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <button onClick={() => setStep("method")} className="btn" style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text, padding: "8px 14px", borderRadius: 10, fontSize: 12 }}>← رجوع</button>
                  <div style={{ fontSize: 13, color: T.sub2, fontWeight: 700 }}>بيانات {method?.name}</div>
                </div>

                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: `${method.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 8px", border: `1.5px solid ${method.color}35` }}>{method.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{method.name}</div>
                  {method.fee > 0 && <div style={{ fontSize: 11, color: T.yellow, marginTop: 3 }}>عمولة {method.fee}%</div>}
                </div>

                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: T.rSm, padding: 16, border: `1px dashed ${method.color}80`, marginBottom: 18 }}>
                  <div style={{ fontSize: 10, color: T.sub, marginBottom: 8, textAlign: "center", fontFamily: T.font }}>يرجى التحويل إلى الحساب التالي:</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 10 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: T.text, letterSpacing: 0.5, direction: "ltr" }}>{method.val}</div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(method.val);
                        alert("تم نسخ الرقم بنجاح ✅");
                      }}
                      className="tap" 
                      style={{ background: method.color, border: "none", color: "white", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 900, cursor: "pointer", fontFamily: T.font }}
                    >نسخ</button>
                  </div>
                  <div style={{ fontSize: 10, color: T.yellow, marginTop: 8, textAlign: "center", fontFamily: T.font }}>⚠️ بعد التحويل، أدخل بياناتك في الأسفل للتأكيد</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
                  {method.fields.map((f: any) => (
                    <Input key={f} label={f} value={fields[f] || ""} onChange={(e: any) => setFields({ ...fields, [f]: e.target.value })} placeholder={`أدخل ${f}`} dir="ltr"/>
                  ))}
                </div>

                {/* Summary */}
                <GlassCard style={{ padding: 18, background: "rgba(79,142,247,.05)", border: "1px solid rgba(79,142,247,.18)" }}>
                  {[["المبلغ المطلوب", `£${finalAmt}`, T.text], ...(fee > 0 ? [["العمولة", `+£${fee}`, T.yellow]] : []), ["الإجمالي المدفوع", `£${totalPay}`, T.green], ["يُضاف للرصيد", `£${finalAmt}`, T.blue]].map(([l, v, c], i, a) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < a.length - 1 ? `1px solid ${T.border}` : "none", ...(i === a.length - 1 ? { borderTop: `1px solid ${T.border}` } : {}) }}>
                      <span style={{ color: T.sub as string, fontSize: 13 }}>{l}</span>
                      <span style={{ color: c as string, fontWeight: 900, fontSize: i === a.length - 1 ? 20 : 14 }}>{v}</span>
                    </div>
                  ))}
                </GlassCard>

                <div style={{ marginTop: 14 }}>
                  {loading
                    ? <div style={{ display: "flex", justifyContent: "center", padding: 20 }}><div style={{ width: 24, height: 24, border: "2px solid rgba(79,142,247,.2)", borderTopColor: T.blue, borderRadius: "50%", animation: "spin 1s linear infinite" }}/></div>
                    : <Btn full label={`✅ تأكيد الشحن — £${totalPay}`} onClick={confirm} size="lg" color={T.green}/>}
                  <div style={{ fontSize: 10, color: T.sub, textAlign: "center", marginTop: 10 }}>🔒 عملية آمنة ومشفرة · الرصيد يُضاف فوراً</div>
                </div>
              </div>
            )}
          </div>

          {/* Transactions — shown only on main */}
          {step === "main" && (
            <div style={{ padding: "24px 20px 0" }}>
              <div style={{ height: 1, background: T.border, marginBottom: 20 }}/>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 3, height: 14, background: T.blue, borderRadius: 4 }}/>
                  <span style={{ fontSize: 13, color: T.sub2, fontWeight: 700 }}>سجل المعاملات</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["الكل", "شحن", "مدفوع"].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className="btn" style={{ padding: "5px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: filter === f ? T.blue : T.surface, color: filter === f ? "#fff" : T.sub, border: `1px solid ${filter === f ? T.blue : T.border}` }}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 120 }}>
                {filtered.map((tx, i) => (
                  <GlassCard key={i} className="fadeUp" style={{ padding: 14, animationDelay: `${i * .04}s` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 13, background: `${tx.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: `1px solid ${tx.color}25`, flexShrink: 0 }}>{tx.icon}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{tx.name}</div>
                          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                            <Badge label={tx.type === "TOPUP" ? "⬆️ شحن" : "⬇️ مدفوع"} color={tx.type === "TOPUP" ? T.green : T.red}/>
                            {tx.status === "processing" && <Badge label="⏳ قيد المراجعة" color={T.yellow}/>}
                            {tx.status === "rejected" && <Badge label="❌ مرفوض" color={T.red}/>}
                            <span style={{ fontSize: 9, color: T.sub }}>{tx.date}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: tx.type === "TOPUP" ? T.green : T.text }}>{tx.type === "TOPUP" ? "+" : "-"}£{tx.amount}</div>
                        {tx.status === "completed" && <div style={{ fontSize: 8, color: T.green, textAlign: "left", marginTop: 2 }}>مكتمل ✓</div>}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
