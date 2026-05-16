import { useState } from "react";
import { processPurchase } from "../services/purchaseService";

const C = {
  bg:      "#050810",
  card:    "#0f172a",
  border:  "rgba(255,255,255,0.05)",
  borderB: "rgba(255,255,255,0.03)",
  text:    "#ffffff",
  sub:     "#94a3b8",
  sub2:    "#64748b",
  blue:    "#3B82F6",
  green:   "#10b981",
  yellow:  "#fbbf24",
  red:     "#ef4444",
  orange:  "#f97316",
  purple:  "#8b5cf6",
  teal:    "#2ec4b6",
  font:    "'Cairo', sans-serif",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{background:${C.bg};font-family:${C.font}}
::-webkit-scrollbar{width:0}
input,button{font-family:${C.font}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pop{0%{transform:scale(.8);opacity:0}100%{transform:scale(1);opacity:1}}
.fadeUp{animation:fadeUp .32s ease both}
.tap{cursor:pointer;transition:all .15s}
.tap:active{transform:scale(.96);opacity:.8}
.inp:focus{outline:none;border-color:${C.blue}!important;box-shadow:0 0 0 2px rgba(59,143,212,.15)}
`;

/* ══════════════════════════
   DATA
══════════════════════════ */
const AI_SERVICES = [
  {
    id: "chatgpt", name: "ChatGPT Plus", icon: "🤖", color: "#10b981", badge: "AI", sub: "خصم 80%",
    desc: "اشتراك ChatGPT Plus الأصلي بميزات GPT-4o و DALL-E و Web Browsing. السعر العالمي £1000 ج.م شهرياً.",
    emailLabel: "البريد الإلكتروني للتفعيل",
    plans: [
      { n:"شهر واحد",  months:1,  egp:100,  save:null        },
      { n:"3 أشهر",   months:3,  egp:270,  save:"وفر £30"   },
      { n:"6 أشهر",   months:6,  egp:510,  save:"وفر £90"   },
      { n:"سنة كاملة",months:12, egp:960,  save:"وفر £240"  },
    ],
  },
  {
    id: "claude", name: "Claude Pro", icon: "🧠", color: "#f97316", badge: "AI", sub: "خصم 80%",
    desc: "Claude Pro — أفضل موديل للمبرمجين والباحثين والكتّاب. قدرات استثنائية في التحليل والكود.",
    emailLabel: "البريد الإلكتروني للتفعيل",
    plans: [
      { n:"شهر واحد",  months:1,  egp:100,  save:null        },
      { n:"3 أشهر",   months:3,  egp:270,  save:"وفر £30"   },
      { n:"6 أشهر",   months:6,  egp:510,  save:"وفر £90"   },
      { n:"سنة كاملة",months:12, egp:960,  save:"وفر £240"  },
    ],
  },
  {
    id: "midjourney", name: "Midjourney", icon: "✨", color: "#8b5cf6", badge: "AI", sub: "خصم 80%",
    desc: "أقوى محرك رسم بالذكاء الاصطناعي في العالم. إنشاء صور احترافية من النص.",
    emailLabel: "بريد Discord أو الإيميل",
    plans: [
      { n:"Basic شهر",   months:1, egp:100, save:null      },
      { n:"Standard شهر",months:1, egp:240, save:null      },
      { n:"Pro شهر",     months:1, egp:480, save:"الأقوى"  },
      { n:"Mega شهر",    months:1, egp:960, save:"غير محدود"},
    ],
  },
  {
    id: "gemini", name: "Gemini Advanced", icon: "💎", color: "#3b8fd4", badge: "AI", sub: "خصم 80%",
    desc: "Gemini Advanced من جوجل مع Google One Premium كامل. أذكى موديل من جوجل.",
    emailLabel: "حساب جوجل (Gmail)",
    plans: [
      { n:"شهر واحد",  months:1,  egp:100, save:null       },
      { n:"3 أشهر",   months:3,  egp:270, save:"وفر £30"  },
      { n:"6 أشهر",   months:6,  egp:510, save:"وفر £90"  },
      { n:"سنة كاملة",months:12, egp:960, save:"وفر £240" },
    ],
  },
  {
    id: "capcut", name: "CapCut Pro", icon: "🎬", color: "#ef4444", badge: "AI", sub: "خصم 80%",
    desc: "CapCut Pro لتحرير الفيديو الاحترافي بجميع الأدوات المدفوعة.",
    emailLabel: "البريد الإلكتروني للتفعيل",
    plans: [
      { n:"شهر واحد",  months:1,  egp:60,  save:null       },
      { n:"3 أشهر",   months:3,  egp:165, save:"وفر £15"  },
      { n:"6 أشهر",   months:6,  egp:315, save:"وفر £45"  },
      { n:"سنة كاملة",months:12, egp:600, save:"وفر £120" },
    ],
  },
  {
    id: "canva", name: "Canva Pro", icon: "🎨", color: "#06b6d4", badge: "AI", sub: "خصم 80%",
    desc: "Canva Enterprise بجميع الميزات المدفوعة والتصاميم الاحترافية وإزالة الخلفية.",
    emailLabel: "البريد الإلكتروني للتفعيل",
    plans: [
      { n:"شهر واحد",  months:1,  egp:60,  save:null       },
      { n:"3 أشهر",   months:3,  egp:165, save:"وفر £15"  },
      { n:"6 أشهر",   months:6,  egp:315, save:"وفر £45"  },
      { n:"سنة كاملة",months:12, egp:600, save:"وفر £120" },
    ],
  },
  {
    id: "perplexity", name: "Perplexity Pro", icon: "🔍", color: "#2ec4b6", badge: "AI", sub: "خصم 80%",
    desc: "Perplexity Pro — محرك البحث الذكي الأقوى. إجابات فورية من مصادر موثوقة.",
    emailLabel: "البريد الإلكتروني للتفعيل",
    plans: [
      { n:"شهر واحد",  months:1,  egp:100, save:null       },
      { n:"3 أشهر",   months:3,  egp:270, save:"وفر £30"  },
      { n:"سنة كاملة",months:12, egp:960, save:"وفر £240" },
    ],
  },
];

/* ══════════════════════════
   SHARED
══════════════════════════ */
function SupportSection() {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:11 }}>
        <span>🛡️</span>
        <span style={{ fontSize:13, color:C.sub, fontWeight:700 }}>الدعم والمساعدة</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9 }}>
        {[["💬","دردشة حية"],["✉️","البريد"],["🎟️","تذكرة دعم"]].map(([ic,lb],i)=>(
          <div key={i} className="tap" style={{ background:C.card, border:`1px solid ${C.borderB}`, borderRadius:13, padding:"14px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:7 }}>
            <span style={{ fontSize:22 }}>{ic}</span>
            <span style={{ fontSize:11, color:C.sub, fontWeight:700 }}>{lb}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    ["متى يبدأ التفعيل؟",           "يبدأ التفعيل فوراً بعد تأكيد الطلب خلال دقائق."],
    ["هل الاشتراك أصلي؟",           "نعم، جميع اشتراكاتنا أصلية 100% بحسابات حقيقية."],
    ["كيف يصلني الحساب؟",           "يُرسل الحساب على البريد الإلكتروني الذي أدخلته."],
    ["هل هناك ضمان؟",              "نعم، مضمون طوال مدة الاشتراك أو يُرجع الرصيد."],
  ];
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:11 }}>
        <span>❓</span>
        <span style={{ fontSize:13, color:C.sub, fontWeight:700 }}>الأسئلة الشائعة</span>
      </div>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
        {faqs.map(([q,a],i)=>(
          <div key={i}>
            <div className="tap" onClick={()=>setOpen(open===i?null:i)}
              style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", borderBottom:i<faqs.length-1||open===i?`1px solid ${C.borderB}`:"none" }}>
              <span style={{ fontSize:13, color:C.text, fontWeight:600 }}>{q}</span>
              <span style={{ color:C.sub2, fontSize:10, display:"inline-block", transform:open===i?"rotate(180deg)":"none", transition:"transform .2s" }}>▼</span>
            </div>
            {open===i && (
              <div className="fadeUp" style={{ padding:"11px 16px 14px", background:C.bg, borderBottom:i<faqs.length-1?`1px solid ${C.borderB}`:"none" }}>
                <p style={{ fontSize:12, color:C.sub, lineHeight:1.9 }}>{a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════
   MAIN
══════════════════════════ */
export default function AISubsPage({ balance=5000, setBalance, onBack=()=>{}, onAddToCart, initialSel }: any) {
  const [sel,     setSel]     = useState<string | null>(initialSel || null);
  const [plan,    setPlan]    = useState<string | null>(null);
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [err,     setErr]     = useState("");
  const [showAdded, setShowAdded] = useState(false);

  const svc    = AI_SERVICES.find(s => s.id === sel);
  const selPlan= svc?.plans.find(p => p.n === plan);
  const canBuy = svc && selPlan && email.trim() && balance >= selPlan.egp;

  const reset = () => { setSel(null); setPlan(null); setEmail(""); setErr(""); setDone(false); setShowAdded(false); };

  const addToCartInternal = () => {
    if (!email.trim())  { setErr("يرجى إدخال "+svc?.emailLabel); return; }
    if (!selPlan)       { setErr("يرجى اختيار مدة الاشتراك"); return; }
    if (onAddToCart && svc && selPlan) {
      onAddToCart({...svc, plan: selPlan, total: selPlan.egp, fields: { [svc.emailLabel]: email } });
      setShowAdded(true);
    }
  };

  const buy = async () => {
    if (!email.trim())  { setErr("يرجى إدخال "+svc?.emailLabel); return; }
    if (!selPlan)       { setErr("يرجى اختيار مدة الاشتراك"); return; }
    if (balance < selPlan.egp) { setErr("رصيدك غير كافٍ — اشحن المحفظة أولاً"); return; }
    
    setErr(""); 
    setLoading(true);
    
    try {
      if (!svc || !selPlan) return;
      await processPurchase({
        serviceId: svc.id,
        serviceName: svc.name,
        icon: svc.icon,
        color: svc.color,
        amount: selPlan.egp,
        details: {
          email,
          plan: selPlan.n,
          months: selPlan.months,
          type: "AI_SUBSCRIPTION"
        }
      });
      setDone(true);
    } catch (err: any) {
      setErr(err.message || "حدث خطأ أثناء إتمام الطلب");
    } finally {
      setLoading(false);
    }
  };

  /* ── SUCCESS ── */
  if (done && svc && selPlan) return (
    <>
      <style>{css}</style>
      <div dir="rtl" style={{ background:C.bg, minHeight:"100vh", maxWidth:430, margin:"0 auto", fontFamily:C.font, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:28, gap:18 }}>
        <div style={{ fontSize:68, animation:"pop .4s ease both" }}>✅</div>
        <div style={{ fontSize:20, fontWeight:900, color:C.text }}>تم الاشتراك بنجاح!</div>
        <p style={{ fontSize:12, color:C.sub, textAlign:"center" }}>سيصلك الحساب على بريدك الإلكتروني خلال دقائق.</p>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:18, width:"100%" }}>
          {[
            ["الخدمة",    svc.name,       C.text  ],
            ["الخطة",     selPlan.n,      C.yellow],
            ["البريد",    email,          C.blue  ],
            ["المدفوع",   `£${selPlan.egp}`, C.green ],
          ].map(([l,v,col],i,a)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:i<a.length-1?`1px solid ${C.borderB}`:"none" }}>
              <span style={{ color:C.sub, fontSize:12 }}>{l}</span>
              <span style={{ color:col as string, fontWeight:800, fontSize:13, direction:"ltr" }}>{v}</span>
            </div>
          ))}
        </div>
        <button className="tap" onClick={reset} style={{ width:"100%", padding:"13px", borderRadius:12, fontSize:14, fontWeight:800, background:C.card, border:`1px solid ${C.border}`, color:C.sub, cursor:"pointer" }}>
          + اشتراك جديد
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div dir="rtl" style={{ background:C.bg, minHeight:"100vh", maxWidth:430, margin:"0 auto", fontFamily:C.font, paddingBottom:40 }}>

        {/* TOP BAR */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 16px 14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
            <span style={{ fontSize:13 }}>🕐</span>
            <span style={{ fontSize:11, color:C.sub }}>سجل الطلبات</span>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:15, fontWeight:900, color:C.text }}>أدوات الذكاء الاصطناعي</div>
            <div style={{ fontSize:11, color:C.sub }}>خصم 90% حقيقي</div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</div>
            <div className="tap" onClick={onBack} style={{ width:32, height:32, borderRadius:9, background:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:C.sub, fontSize:15 }}>←</span>
            </div>
          </div>
        </div>

        <div style={{ padding:"0 14px", display:"flex", flexDirection:"column", gap:10 }}>

          {/* ── GRID ── */}
          {!sel && (
            <>
              {/* banner */}
              <div style={{ background:"linear-gradient(135deg,rgba(139,92,246,.12),rgba(59,143,212,.06))", border:`1px solid rgba(139,92,246,.25)`, borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:28 }}>✨</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:900, color:C.text }}>أدوات الذكاء الاصطناعي (أدوات حقيقية)</div>
                  <div style={{ fontSize:11, color:C.sub, marginTop:3 }}>اختر الأداة وحدد مدة الاشتراك</div>
                </div>
              </div>

              {/* grid 3 cols */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                {AI_SERVICES.map((s,i)=>(
                  <div key={i} className="tap fadeUp" onClick={()=>{ setSel(s.id); setPlan(null); setEmail(""); setErr(""); }}
                    style={{
                      background:C.card, border:`1px solid ${C.border}`,
                      borderRadius: 16, padding: "14px 10px", textAlign: "center",
                      position: "relative", overflow: "hidden",
                      display: "flex", flexDirection: "column", alignItems: "center",
                      animationDelay: `${i * 0.04}s`,
                    } as any}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color, opacity: 0.6 }} />
                    {s.badge && (
                      <div style={{
                        position: "absolute", top: 6, right: 6,
                        background: `${s.color}25`, borderRadius: 6,
                        padding: "2px 5px", fontSize: 8, color: s.color, fontWeight: 700, fontFamily: C.font,
                      }}>{s.badge}</div>
                    )}
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 2, fontFamily: C.font, lineHeight: 1.3 }}>{s.name}</div>
                    <div style={{ fontSize: 9, color: s.color, fontWeight: 600, fontFamily: C.font }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── DETAIL ── */}
          {sel && svc && (
            <div className="fadeUp" style={{ display:"flex", flexDirection:"column", gap:11 }}>

              {/* back */}
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <button className="tap" onClick={()=>{ setSel(null); setErr(""); }}
                  style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, padding:"8px 14px", borderRadius:10, fontSize:12, cursor:"pointer" }}>
                  ← رجوع
                </button>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <div style={{ width:38, height:38, borderRadius:12, background:`${svc.color}15`, border:`1px solid ${svc.color}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                    {svc.icon}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:900, color:C.text }}>{svc.name}</div>
                    <div style={{ fontSize:10, color:C.green, fontWeight:700 }}>اشتراك · خصم 90%</div>
                  </div>
                </div>
              </div>

              {/* desc */}
              <div style={{ background:C.card, border:`1px solid ${C.borderB}`, borderRadius:13, padding:"12px 16px" }}>
                <p style={{ fontSize:13, color:C.sub, lineHeight:1.9 }}>{svc.desc}</p>
              </div>

              {/* plans grid */}
              <div>
                <div style={{ fontSize:12, color:C.sub, fontWeight:700, marginBottom:10 }}>اختر مدة الاشتراك</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                  {svc.plans.map((p,i)=>(
                    <button key={i} className="tap" onClick={()=>setPlan(p.n)}
                      style={{ padding:"14px 10px", borderRadius:14, fontSize:12, fontWeight:800, background: plan===p.n?`${svc.color}18`:C.card, border:`2px solid ${plan===p.n?svc.color:C.border}`, color: plan===p.n?svc.color:C.text, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, position:"relative", overflow:"hidden" }}>
                      {p.save && (
                        <span style={{ position:"absolute", top:6, left:6, background: (p.save?.includes("محدود")||p.save?.includes("الأقوى"))?`${svc.color}22`:"rgba(34,197,94,.15)", color: (p.save?.includes("محدود")||p.save?.includes("الأقوى"))?svc.color:C.green, fontSize:8, fontWeight:900, padding:"2px 7px", borderRadius:20 }}>
                          {p.save}
                        </span>
                      )}
                      <span style={{ fontSize:13, marginTop: p.save?10:0 }}>{p.n}</span>
                      <span style={{ fontSize:18, fontWeight:900, color:C.yellow }}>£{p.egp}</span>
                      <span style={{ fontSize:9, color:C.sub }}>ج.م · خصم 90%</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* email */}
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                  <span style={{ fontSize:12, color:C.sub, fontWeight:700 }}>{svc.emailLabel}</span>
                  <span style={{ fontSize:10, color:C.yellow }}>الحساب يُرسل هنا</span>
                </div>
                <input className="inp" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder={`أدخل ${svc.emailLabel}...`} dir="ltr"
                  style={{ width:"100%", background:"rgba(0,0,0,.35)", border:`1px solid ${C.border}`, borderRadius:12, color:C.text, fontSize:14, fontFamily:C.font, padding:"13px 16px", transition:"border-color .2s" }}/>
              </div>

              {/* summary */}
              {selPlan && (
                <div className="fadeUp" style={{ background:"rgba(34,197,94,.04)", border:`1px solid rgba(34,197,94,.18)`, borderRadius:13, padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:11, color:C.sub }}>{svc.name} · {selPlan.n}</div>
                    <div style={{ fontSize:10, color:C.sub, marginTop:3 }}>يُرسل على: <span style={{ color:C.blue }}>{email||"..."}</span></div>
                  </div>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ fontSize:22, fontWeight:900, color:C.green }}>£{selPlan.egp}</div>
                    <div style={{ fontSize:9, color:C.sub }}>ج.م</div>
                  </div>
                </div>
              )}

              {/* balance */}
              {selPlan && (
                <div style={{ background: balance>=selPlan.egp?"rgba(34,197,94,.05)":"rgba(239,68,68,.05)", border:`1px solid ${balance>=selPlan.egp?"rgba(34,197,94,.2)":"rgba(239,68,68,.2)"}`, borderRadius:10, padding:"9px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:12, color:balance>=selPlan.egp?C.green:C.red, fontWeight:700 }}>
                    {balance>=selPlan.egp?"✅ رصيد كافٍ":"❌ رصيد غير كافٍ"}
                  </span>
                  <span style={{ fontSize:12, color:C.sub2 }}>
                    رصيدك: <strong style={{ color:balance>=selPlan.egp?C.green:C.red }}>£{balance.toLocaleString()}</strong>
                  </span>
                </div>
              )}

              {/* error */}
              {err && (
                <div style={{ fontSize:12, color:C.red, background:"rgba(239,68,68,.07)", border:"1px solid rgba(239,68,68,.2)", borderRadius:10, padding:"9px 14px", textAlign:"center" }}>
                  ⚠️ {err}
                </div>
              )}

              {/* buttons */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <button className="tap" onClick={buy} disabled={loading}
                  style={{ padding:"15px", borderRadius:13, fontSize:14, fontWeight:900, background:canBuy?"linear-gradient(135deg,#1d4ed8,#3b8fd4)":"rgba(255,255,255,.06)", color:canBuy?"#fff":C.sub2, border:canBuy?"none":`1px solid ${C.border}`, boxShadow:canBuy?"0 4px 20px rgba(29,78,216,.4)":"none", cursor:"pointer" }}>
                  {loading
                    ? <span style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
                        <span style={{ width:15, height:15, border:"2px solid rgba(255,255,255,.2)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 1s linear infinite", display:"inline-block" }}/>
                        جاري...
                      </span>
                    : "⚡ شراء مباشر"}
                </button>
                <button className="tap" onClick={addToCartInternal}
                  style={{ padding:"15px", borderRadius:13, fontSize:14, fontWeight:800, background:C.card, border:`1px solid ${C.border}`, color:C.blue, cursor:"pointer" }}>
                  🛒 إضافة للسلة
                </button>
              </div>

              <SupportSection/>
              <FaqSection/>
            </div>
          )}

          {/* Added to Cart Modal */}
          {showAdded && (
            <div style={{
              position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
              background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 24, zIndex: 2000
            }}>
              <div className="fadeUp" style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 24, padding: 32, width: "100%", maxWidth: 350,
                textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 8 }}>تمت الإضافة للسلة</div>
                <div style={{ fontSize: 13, color: C.sub, marginBottom: 24 }}>الخدمة الآن في سلة مشترياتك، يمكنك المتابعة أو إتمام الدفع</div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <button 
                    className="tap" 
                    onClick={() => setShowAdded(false)}
                    style={{ width: "100%", padding: 14, borderRadius: 12, background: C.blue, color: "white", fontSize: 14, fontWeight: 800, border: "none" }}
                  >
                    أكمل تسوق
                  </button>
                  <button 
                    className="tap" 
                    onClick={onBack}
                    style={{ width: "100%", padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.05)", color: C.text, fontSize: 14, fontWeight: 700, border: `1px solid ${C.border}` }}
                  >
                    العودة للرئيسية
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
