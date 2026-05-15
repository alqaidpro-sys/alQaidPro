import { useState } from "react";

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

const TV_SERVICES = [
  {
    id:"netflix", name:"Netflix Premium 4K", icon:"📺", color:"#e50914",
    desc:"نيتفلكس بريميوم أعلى باقة 4K UHD على 4 شاشات. السعر العالمي £800 ج.م شهرياً.",
    emailLabel:"البريد الإلكتروني للتسليم",
    plans:[
      {n:"شهر واحد",   egp:80,  save:null      },
      {n:"3 أشهر",    egp:216, save:"وفر £24" },
      {n:"6 أشهر",    egp:408, save:"وفر £72" },
      {n:"سنة كاملة", egp:768, save:"وفر £192"},
    ],
  },
  {
    id:"spotify", name:"Spotify Premium", icon:"🎵", color:"#1db954",
    desc:"موسيقى بلا حدود بدون إعلانات. استمع لأي أغنية في العالم بجودة عالية.",
    emailLabel:"البريد الإلكتروني للتسليم",
    plans:[
      {n:"شهر واحد",   egp:40,  save:null      },
      {n:"3 أشهر",    egp:108, save:"وفر £12" },
      {n:"6 أشهر",    egp:204, save:"وفر £36" },
      {n:"سنة كاملة", egp:384, save:"وفر £96" },
    ],
  },
  {
    id:"disney", name:"Disney+ Global", icon:"🏰", color:"#113ccf",
    desc:"ديزني بلس العالمية — مارفل وستار وورز وبيكسار وناشيونال جيوغرافيك.",
    emailLabel:"البريد الإلكتروني للتسليم",
    plans:[
      {n:"شهر واحد",   egp:50,  save:null       },
      {n:"3 أشهر",    egp:135, save:"وفر £15"  },
      {n:"6 أشهر",    egp:255, save:"وفر £45"  },
      {n:"سنة كاملة", egp:480, save:"وفر £120" },
    ],
  },
  {
    id:"shahid", name:"Shahid VIP Sports", icon:"📡", color:"#3b8fd4",
    desc:"شاهد VIP شامل الباقة الرياضية الكاملة. أفضل المسلسلات والأفلام العربية.",
    emailLabel:"البريد الإلكتروني للتسليم",
    plans:[
      {n:"شهر واحد",   egp:60,  save:null       },
      {n:"3 أشهر",    egp:162, save:"وفر £18"  },
      {n:"6 أشهر",    egp:306, save:"وفر £54"  },
      {n:"سنة كاملة", egp:576, save:"وفر £144" },
    ],
  },
  {
    id:"youtube", name:"YouTube Premium", icon:"▶", color:"#ff0000",
    desc:"يوتيوب بدون إعلانات + يوتيوب ميوزك. تشغيل في الخلفية وتنزيل الفيديوهات.",
    emailLabel:"حساب جوجل (Gmail)",
    plans:[
      {n:"شهر واحد",   egp:50,  save:null       },
      {n:"3 أشهر",    egp:135, save:"وفر £15"  },
      {n:"6 أشهر",    egp:255, save:"وفر £45"  },
      {n:"سنة كاملة", egp:480, save:"وفر £120" },
    ],
  },
  {
    id:"crunchyroll", name:"Crunchyroll Mega Fan", icon:"🍥", color:"#f47521",
    desc:"أقوى باقة أنمي في العالم بدون إعلانات. مشاهدة فورية لأحدث الحلقات.",
    emailLabel:"البريد الإلكتروني للتسليم",
    plans:[
      {n:"شهر واحد",   egp:40,  save:null      },
      {n:"3 أشهر",    egp:108, save:"وفر £12" },
      {n:"6 أشهر",    egp:204, save:"وفر £36" },
      {n:"سنة كاملة", egp:384, save:"وفر £96" },
    ],
  },
];

function SupportSection() {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:11 }}>
        <span>🛡️</span><span style={{ fontSize:13, color:C.sub, fontWeight:700 }}>الدعم والمساعدة</span>
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
    ["متى يبدأ التفعيل؟",         "فوراً بعد تأكيد الطلب خلال دقائق."],
    ["هل الاشتراك أصلي؟",         "نعم، أصلي 100% بحسابات حقيقية."],
    ["كيف يصلني الحساب؟",         "يُرسل على البريد الإلكتروني الذي أدخلته."],
    ["هل هناك ضمان؟",            "مضمون طوال مدة الاشتراك أو يُرجع الرصيد."],
    ["هل يعمل على أجهزة متعددة؟", "نعم يعمل على جميع الأجهزة بشكل طبيعي."],
  ];
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:11 }}>
        <span>❓</span><span style={{ fontSize:13, color:C.sub, fontWeight:700 }}>الأسئلة الشائعة</span>
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

export default function TVSubsPage({ balance=5000, setBalance, onBack=()=>{}, onAddCart, initialSel }: any) {
  const [sel,     setSel]     = useState<string | null>(initialSel || null);
  const [plan,    setPlan]    = useState<string | null>(null);
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [err,     setErr]     = useState("");

  const svc     = TV_SERVICES.find(s => s.id === sel);
  const selPlan = svc?.plans.find(p => p.n === plan);
  const canBuy  = svc && selPlan && email.trim() && balance >= (selPlan.egp || 0);

  const reset = () => { setSel(null); setPlan(null); setEmail(""); setErr(""); setDone(false); };

  const buy = () => {
    if (!email.trim()) { setErr("يرجى إدخال " + svc?.emailLabel); return; }
    if (!selPlan)      { setErr("يرجى اختيار مدة الاشتراك"); return; }
    if (!canBuy)       { setErr("رصيدك غير كافٍ — اشحن المحفظة أولاً"); return; }
    setErr(""); setLoading(true);
    setTimeout(() => {
      if (setBalance && selPlan) setBalance((b: number) => b - (selPlan.egp || 0));
      setLoading(false); setDone(true);
    }, 1800);
  };

  /* SUCCESS */
  if (done && svc && selPlan) return (
    <>
      <style>{css}</style>
      <div dir="rtl" style={{ background:C.bg, minHeight:"100vh", maxWidth:430, margin:"0 auto", fontFamily:C.font, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:28, gap:18 }}>
        <div style={{ fontSize:68, animation:"pop .4s ease both" }}>✅</div>
        <div style={{ fontSize:20, fontWeight:900, color:C.text }}>تم الاشتراك بنجاح!</div>
        <p style={{ fontSize:12, color:C.sub, textAlign:"center" }}>سيصلك الحساب على بريدك الإلكتروني خلال دقائق.</p>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:18, width:"100%" }}>
          {[["المنصة",svc.name,C.text],["الخطة",selPlan.n,C.yellow],["البريد",email,C.blue],["المدفوع",`£${selPlan.egp}`,C.green]].map(([l,v,col],i,a)=>(
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
            <div style={{ fontSize:15, fontWeight:900, color:C.text }}>منصات الترفيه والسينما</div>
            <div style={{ fontSize:11, color:C.sub }}>خصم 90% حقيقي</div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🎬</div>
            <div className="tap" onClick={onBack} style={{ width:32, height:32, borderRadius:9, background:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:C.sub, fontSize:15 }}>←</span>
            </div>
          </div>
        </div>

        <div style={{ padding:"0 14px", display:"flex", flexDirection:"column", gap:10 }}>

          {/* GRID */}
          {!sel && (
            <>
              <div style={{ background:"linear-gradient(135deg,rgba(239,68,68,.1),rgba(239,68,68,.03))", border:`1px solid rgba(239,68,68,.22)`, borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:28 }}>🎬</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:900, color:C.text }}>منصات الترفيه والسينما</div>
                  <div style={{ fontSize:11, color:C.sub, marginTop:3 }}>اختر المنصة وحدد مدة الاشتراك</div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:9 }}>
                {TV_SERVICES.map((s,i)=>(
                  <div key={i} className="tap fadeUp" onClick={()=>{ setSel(s.id); setPlan(null); setEmail(""); setErr(""); }}
                    style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 6px 12px", display:"flex", flexDirection:"column", alignItems:"center", gap:8, textAlign:"center", animationDelay:`${i*.04}s` }}>
                    <div style={{ width:44, height:44, borderRadius:13, background:`${s.color}14`, border:`1px solid ${s.color}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:s.color, fontWeight:900 }}>
                      {s.icon}
                    </div>
                    <div style={{ fontSize:9, fontWeight:800, color:C.text, lineHeight:1.35 }}>{s.name}</div>
                    <span style={{ background:"rgba(239,68,68,.1)", color:C.red, fontSize:8, fontWeight:900, padding:"2px 7px", borderRadius:20 }}>خصم 90%</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* DETAIL */}
          {sel && svc && (
            <div className="fadeUp" style={{ display:"flex", flexDirection:"column", gap:11 }}>

              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <button className="tap" onClick={()=>{ setSel(null); setErr(""); }}
                  style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, padding:"8px 14px", borderRadius:10, fontSize:12, cursor:"pointer" }}>
                  ← رجوع
                </button>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <div style={{ width:38, height:38, borderRadius:12, background:`${svc.color}15`, border:`1px solid ${svc.color}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:svc.color, fontWeight:900 }}>
                    {svc.icon}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:900, color:C.text }}>{svc.name}</div>
                    <div style={{ fontSize:10, color:C.red, fontWeight:700 }}>اشتراك · خصم 90%</div>
                  </div>
                </div>
              </div>

              <div style={{ background:C.card, border:`1px solid ${C.borderB}`, borderRadius:13, padding:"12px 16px" }}>
                <p style={{ fontSize:13, color:C.sub, lineHeight:1.9 }}>{svc.desc}</p>
              </div>

              {/* plans */}
              <div>
                <div style={{ fontSize:12, color:C.sub, fontWeight:700, marginBottom:10 }}>اختر مدة الاشتراك</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                  {svc.plans.map((p,i)=>(
                    <button key={i} className="tap" onClick={()=>setPlan(p.n)}
                      style={{ padding:"14px 10px", borderRadius:14, fontSize:12, fontWeight:800, background:plan===p.n?`${svc.color}18`:C.card, border:`2px solid ${plan===p.n?svc.color:C.border}`, color:plan===p.n?svc.color:C.text, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, position:"relative", overflow:"hidden" }}>
                      {p.save && (
                        <span style={{ position:"absolute", top:6, left:6, background:"rgba(34,197,94,.15)", color:C.green, fontSize:8, fontWeight:900, padding:"2px 7px", borderRadius:20 }}>
                          {p.save}
                        </span>
                      )}
                      <span style={{ fontSize:13, marginTop:p.save?10:0 }}>{p.n}</span>
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
                <div style={{ background:balance>=selPlan.egp?"rgba(34,197,94,.05)":"rgba(239,68,68,.05)", border:`1px solid ${balance>=selPlan.egp?"rgba(34,197,94,.2)":"rgba(239,68,68,.2)"}`, borderRadius:10, padding:"9px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:12, color:balance>=selPlan.egp?C.green:C.red, fontWeight:700 }}>
                    {balance>=selPlan.egp?"✅ رصيد كافٍ":"❌ رصيد غير كافٍ"}
                  </span>
                  <span style={{ fontSize:12, color:C.sub2 }}>رصيدك: <strong style={{ color:balance>=selPlan.egp?C.green:C.red }}>£{balance.toLocaleString()}</strong></span>
                </div>
              )}

              {err && (
                <div style={{ fontSize:12, color:C.red, background:"rgba(239,68,68,.07)", border:"1px solid rgba(239,68,68,.2)", borderRadius:10, padding:"9px 14px", textAlign:"center" }}>
                  ⚠️ {err}
                </div>
              )}

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
                <button className="tap" onClick={()=>{ if(onAddCart&&svc&&selPlan) onAddCart({...svc,plan:selPlan,total:selPlan.egp}); }}
                  style={{ padding:"15px", borderRadius:13, fontSize:14, fontWeight:800, background:C.card, border:`1px solid ${C.border}`, color:C.blue, cursor:"pointer" }}>
                  🛒 إضافة للسلة
                </button>
              </div>

              <SupportSection/>
              <FaqSection/>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
