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
  greenDk: "rgba(16,185,129,0.1)",
  greenBdr:"rgba(16,185,129,0.2)",
  yellow:  "#fbbf24",
  red:     "#ef4444",
  orange:  "#f97316",
  teal:    "#2ec4b6",
  font:    "'Cairo', sans-serif",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{background:${C.bg};font-family:${C.font}}
::-webkit-scrollbar{width:0}
input,button,textarea{font-family:${C.font}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pop{0%{transform:scale(.8);opacity:0}100%{transform:scale(1);opacity:1}}
.fadeUp{animation:fadeUp .32s ease both}
.tap{cursor:pointer;transition:all .15s}
.tap:active{transform:scale(.96);opacity:.8}
.inp:focus{outline:none;border-color:${C.blue}!important;box-shadow:0 0 0 2px rgba(59,143,212,.15)}
`;

/* ── DATA ── */
const SERVICES = [
  {
    id: "temu",
    name: "شراء من تيمو (Temu)",
    icon: "🛍️",
    color: "#f97316",
    discount: 85,
    badge: "خصم 85% حصري",
    desc: "اطلب أي منتج من تيمو بخصم 85%. ضع الرابط وسيقوم الذكاء الاصطناعي بتحليل السعر الحقيقي تلقائياً.",
    fields: [
      { key: "link",    label: "رابط المنتج",                       ph: "https://www.temu.com/...",           dir: "ltr"  },
      { key: "details", label: "تفاصيل إضافية (اللون، المقاس، الخ)", ph: "مثال: أحمر - مقاس L",              dir: "rtl"  },
    ],
    priceField: true,
  },
  {
    id: "ali",
    name: "علي إكسبريس (AliExpress)",
    icon: "🌐",
    color: C.blue,
    discount: 80,
    badge: "خصم 80% حصري",
    desc: "اطلب من علي إكسبريس بخصم 80%. ضع رابط المنتج وسيتم تحليل السعر الحقيقي وحساب الخصم تلقائياً.",
    fields: [
      { key: "link",    label: "رابط المنتج",                       ph: "https://www.aliexpress.com/...",     dir: "ltr"  },
      { key: "details", label: "تفاصيل إضافية (اللون، المقاس، الخ)", ph: "مثال: أزرق - مقاس M",              dir: "rtl"  },
    ],
    priceField: true,
  },
  {
    id: "amazon",
    name: "شراء من أمازون (Amazon)",
    icon: "📦",
    color: "#f59e0b",
    discount: 75,
    badge: "خصم 75% حصري",
    desc: "شراء منتجات أمازون بخصم 75%. ضع رابط المنتج وسيتم تحليل السعر الحقيقي تلقائياً.",
    fields: [
      { key: "link",    label: "رابط المنتج",                       ph: "https://www.amazon.com/...",         dir: "ltr"  },
      { key: "details", label: "تفاصيل إضافية (اللون، المقاس، الخ)", ph: "مثال: أسود - مقاس XL",             dir: "rtl"  },
    ],
    priceField: true,
  },
  {
    id: "amazon_bal",
    name: "شحن رصيد أمازون",
    icon: "💳",
    color: "#f59e0b",
    discount: null,
    badge: "ضعف الرصيد",
    desc: "اشحن رصيد أمازون الخاص بك. كل £1000 رصيد القائد = £2100 رصيد أمازون مباشرة في حسابك.",
    fields: [
      { key: "phone", label: "رقم الهاتف المسجل",       ph: "01XXXXXXXXX",              dir: "ltr" },
      { key: "email", label: "البريد الإلكتروني المسجل", ph: "example@amazon.com",       dir: "ltr" },
      { key: "amount",label: "المبلغ المراد شحنه (ج.م)", ph: "مثال: 1000",              dir: "ltr" },
    ],
    priceField: false,
  },
];

/* ── HELPERS ── */
function TopBar({ onBack }: any) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 16px 14px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
        <span style={{ fontSize:13 }}>🕐</span>
        <span style={{ fontSize:11, color:C.sub }}>سجل الطلبات</span>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:15, fontWeight:900, color:C.text }}>الخدمات اللوجستية</div>
        <div style={{ fontSize:11, color:C.sub }}>والاستراتيجية</div>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <div style={{ width:36, height:36, borderRadius:10, background:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🛒</div>
        <div className="tap" onClick={onBack} style={{ width:32, height:32, borderRadius:9, background:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ color:C.sub, fontSize:15 }}>←</span>
        </div>
      </div>
    </div>
  );
}

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
    ["متى يبدأ التنفيذ؟",           "يبدأ التنفيذ فوراً بعد تأكيد الطلب وخصم الرصيد."],
    ["هل الخدمة مضمونة؟",           "نعم مضمونة 100% أو يُرجع الرصيد كاملاً."],
    ["ماذا يحدث إذا كان السعر خاطئ؟","إذا كان السعر المُدخل غير مطابق سيتم إلغاء الطلب وإرجاع الرصيد."],
    ["هل هناك حد أدنى؟",            "لا يوجد حد أدنى."],
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

/* ══════════════════════════════════════════
   MAIN
══════════════════════════════════════════ */
export default function LogisticsPage({ balance=5000, setBalance, onBack=()=>{}, onAddToCart, initialSel }: any) {
  const [sel,     setSel]     = useState<string | null>(initialSel || null);
  const [vals,    setVals]    = useState<any>({});
  const [price,   setPrice]   = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [err,     setErr]     = useState("");
  const [showAdded, setShowAdded] = useState(false);

  const svc       = SERVICES.find(s => s.id === sel);
  const origPrice = parseFloat(price) || 0;
  const discAmt   = svc?.priceField ? +(origPrice * ((svc.discount || 0) / 100)).toFixed(2) : 0;
  const finalEgp  = svc?.priceField ? +(origPrice - discAmt).toFixed(2) : 0;
  const allFilled = svc?.fields.every(f => vals[f.key]?.trim());
  const canBuy    = svc && allFilled && (svc.priceField ? origPrice > 0 && balance >= finalEgp : true);

  const reset = () => { setSel(null); setVals({}); setPrice(""); setErr(""); setDone(false); setShowAdded(false); };

  const handleAddToCartInternal = () => {
    if (!allFilled) { setErr("يرجى ملء جميع الحقول"); return; }
    if (svc?.priceField && origPrice <= 0) { setErr("يرجى إدخال السعر"); return; }
    if (onAddToCart && svc) {
      onAddToCart({...svc, total: finalEgp, fields: vals});
      setShowAdded(true);
    }
  };

  const buy = async () => {
    if (!allFilled)  { setErr("يرجى ملء جميع الحقول"); return; }
    if (svc?.priceField && origPrice <= 0) { setErr("يرجى إدخال السعر الحقيقي للمنتج"); return; }
    if (svc?.priceField && balance < finalEgp) { setErr("رصيدك غير كافٍ — اشحن المحفظة أولاً"); return; }
    
    setErr(""); 
    setLoading(true);
    
    try {
      if (!svc) return;
      await processPurchase({
        serviceId: svc.id,
        serviceName: svc.name,
        icon: svc.icon,
        color: svc.color,
        amount: svc.priceField ? finalEgp : 0,
        details: {
          ...vals,
          originalPrice: origPrice,
          discount: svc.discount,
          type: "LOGISTICS"
        }
      });
      setDone(true);
    } catch (err: any) {
      setErr(err.message || "حدث خطأ أثناء إتمام الطلب");
    } finally {
      setLoading(false);
    }
  };

  /* SUCCESS */
  if (done && svc) return (
    <>
      <style>{css}</style>
      <div dir="rtl" style={{ background:C.bg, minHeight:"100vh", maxWidth:430, margin:"0 auto", fontFamily:C.font, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:28, gap:18 }}>
        <div style={{ fontSize:68, animation:"pop .4s ease both" }}>✅</div>
        <div style={{ fontSize:20, fontWeight:900, color:C.text }}>تم الطلب بنجاح!</div>
        <p style={{ fontSize:12, color:C.sub, textAlign:"center" }}>سيتم تنفيذ طلبك خلال المدة المحددة. تابع من سجل الطلبات.</p>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:18, width:"100%" }}>
          {[
            ["الخدمة",          svc.name,               C.text  ],
            ...(svc.priceField ? [
              ["السعر الأصلي",   `£${origPrice}`,        C.sub   ],
              ["الخصم",          `${svc.discount}% = £${discAmt}`, C.green ],
              ["المدفوع",        `£${finalEgp}`,         C.yellow],
            ] : []),
            ...svc.fields.map(f => [f.label, vals[f.key] || "-", C.blue]),
          ].map(([l,v,col],i,a) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:i<a.length-1?`1px solid ${C.borderB}`:"none" }}>
              <span style={{ color:C.sub, fontSize:12 }}>{l}</span>
              <span style={{ color:col as string, fontWeight:800, fontSize:12, direction:"ltr", maxWidth:"55%", textAlign:"left", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v}</span>
            </div>
          ))}
        </div>
        <button className="tap" onClick={reset} style={{ width:"100%", padding:"13px", borderRadius:12, fontSize:14, fontWeight:800, background:C.card, border:`1px solid ${C.border}`, color:C.sub, cursor:"pointer" }}>
          + طلب جديد
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div dir="rtl" style={{ background:C.bg, minHeight:"100vh", maxWidth:430, margin:"0 auto", fontFamily:C.font, paddingBottom:40 }}>
        <TopBar onBack={onBack}/>
        <div style={{ padding:"0 14px", display:"flex", flexDirection:"column", gap:10 }}>

          {/* ── GRID VIEW ── */}
          {!sel && (
            <>
              <div style={{ background:"linear-gradient(135deg,#13141a,#161b22)", border:`1px solid rgba(249,115,22,.18)`, borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:30 }}>🛒</span>
                <div>
                  <div style={{ fontSize:14, fontWeight:900, color:C.text }}>الخدمات اللوجستية والاستراتيجية</div>
                  <div style={{ fontSize:11, color:C.sub, marginTop:3 }}>اختر الخدمة المطلوبة</div>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {SERVICES.map((s,i) => (
                  <div key={i} className="tap fadeUp" onClick={() => { setSel(s.id); setVals({}); setPrice(""); setErr(""); }}
                    style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:"20px 12px 16px", display:"flex", flexDirection:"column", alignItems:"center", gap:11, textAlign:"center", animationDelay:`${i*.05}s` }}>
                    <div style={{ width:54, height:54, borderRadius:17, background:`${s.color}14`, border:`1px solid ${s.color}24`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>
                      {s.icon}
                    </div>
                    <div style={{ fontSize:12, fontWeight:800, color:C.text, lineHeight:1.4 }}>{s.name}</div>
                    <span style={{ background:`${s.color}16`, color:s.color, fontSize:10, fontWeight:900, padding:"4px 11px", borderRadius:20, border:`1px solid ${s.color}26` }}>
                      {s.badge}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── SERVICE DETAIL ── */}
          {sel && svc && (
            <div className="fadeUp" style={{ display:"flex", flexDirection:"column", gap:11 }}>

              {/* back + title */}
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <button className="tap" onClick={() => { setSel(null); setErr(""); }}
                  style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, padding:"8px 14px", borderRadius:10, fontSize:12, cursor:"pointer" }}>
                  ← رجوع
                </button>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <div style={{ width:36, height:36, borderRadius:11, background:`${svc.color}15`, border:`1px solid ${svc.color}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{svc.icon}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:900, color:C.text }}>{svc.name}</div>
                    <div style={{ fontSize:10, fontWeight:800, color:svc.color }}>{svc.badge}</div>
                  </div>
                </div>
              </div>

              {/* desc */}
              <div style={{ background:C.card, border:`1px solid ${C.borderB}`, borderRadius:13, padding:"12px 16px" }}>
                <p style={{ fontSize:13, color:C.sub, lineHeight:1.9 }}>{svc.desc}</p>
              </div>

              {/* fields */}
              {svc.fields.map(f => (
                <div key={f.key}>
                  <div style={{ fontSize:12, color:C.sub, fontWeight:700, marginBottom:7 }}>{f.label}</div>
                  <input className="inp" value={vals[f.key]||""} onChange={e => setVals({...vals,[f.key]:e.target.value})}
                    placeholder={f.ph} dir={f.dir as any}
                    style={{ width:"100%", background:"rgba(0,0,0,.35)", border:`1px solid ${C.border}`, borderRadius:12, color:C.text, fontSize:14, fontFamily:C.font, padding:"13px 16px", transition:"border-color .2s" }}/>
                </div>
              ))}

              {/* price field */}
              {svc.priceField && (
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                    <span style={{ fontSize:12, color:C.sub, fontWeight:700 }}>السعر الحقيقي للمنتج (بالجنيه)</span>
                    <span style={{ fontSize:10, color:C.yellow }}>أدخل السعر الأصلي</span>
                  </div>
                  <div style={{ position:"relative" }}>
                    <input className="inp" value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g,""))}
                      placeholder="مثال: 500" dir="ltr"
                      style={{ width:"100%", background:"rgba(0,0,0,.35)", border:`1px solid ${C.border}`, borderRadius:12, color:C.text, fontSize:14, fontFamily:C.font, padding:"13px 50px 13px 16px", transition:"border-color .2s" }}/>
                    <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:11, color:C.sub2, fontWeight:700 }}>ج.م</span>
                  </div>

                  {/* discount breakdown */}
                  {origPrice > 0 && (
                    <div className="fadeUp" style={{ marginTop:9, background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px", display:"flex", flexDirection:"column", gap:7 }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontSize:12, color:C.sub }}>السعر الأصلي</span>
                        <span style={{ fontSize:13, fontWeight:700, color:C.text }}>£{origPrice}</span>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontSize:12, color:C.green }}>خصم {svc.discount}%</span>
                        <span style={{ fontSize:13, fontWeight:700, color:C.green }}>- £{discAmt}</span>
                      </div>
                      <div style={{ height:1, background:C.border }}/>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontSize:13, fontWeight:800, color:C.text }}>تدفع فقط</span>
                        <span style={{ fontSize:19, fontWeight:900, color:C.yellow }}>£{finalEgp}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* warning */}
              <div style={{ background:"rgba(212,160,23,.06)", border:`1px solid rgba(212,160,23,.22)`, borderRadius:11, padding:"11px 14px" }}>
                <p style={{ fontSize:11, color:C.yellow, lineHeight:1.85 }}>
                  ⚠️ تنبيه: إذا كان السعر المُدخل غير مطابق للسعر الحقيقي للمنتج، سيتم إلغاء الطلب تلقائياً وإرجاع كامل الرصيد.
                </p>
              </div>

              {/* balance */}
              {svc.priceField && origPrice > 0 && (
                <div style={{ background: balance>=finalEgp?"rgba(34,197,94,.05)":"rgba(239,68,68,.05)", border:`1px solid ${balance>=finalEgp?"rgba(34,197,94,.2)":"rgba(239,68,68,.2)"}`, borderRadius:10, padding:"9px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:12, color:balance>=finalEgp?C.green:C.red, fontWeight:700 }}>{balance>=finalEgp?"✅ رصيد كافٍ":"❌ رصيد غير كافٍ"}</span>
                  <span style={{ fontSize:12, color:C.sub2 }}>رصيدك: <strong style={{ color:balance>=finalEgp?C.green:C.red }}>£{balance.toLocaleString()}</strong></span>
                </div>
              )}

              {/* error */}
              {err && (
                <div style={{ fontSize:12, color:C.red, background:"rgba(239,68,68,.07)", border:"1px solid rgba(239,68,68,.2)", borderRadius:10, padding:"9px 14px", textAlign:"center" }}>
                  ⚠️ {err}
                </div>
              )}

              {/* buy row */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <button className="tap" onClick={buy} disabled={loading}
                  style={{ padding:"15px", borderRadius:13, fontSize:14, fontWeight:900, background: canBuy?"linear-gradient(135deg,#1d4ed8,#3b8fd4)":"rgba(255,255,255,.06)", color:canBuy?"#fff":C.sub2, border:canBuy?"none":`1px solid ${C.border}`, boxShadow:canBuy?"0 4px 20px rgba(29,78,216,.4)":"none", cursor:"pointer" }}>
                  {loading
                    ? <span style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
                        <span style={{ width:15, height:15, border:"2px solid rgba(255,255,255,.2)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 1s linear infinite", display:"inline-block" }}/>
                        جاري...
                      </span>
                    : "⚡ شراء مباشر"}
                </button>
                <button className="tap" onClick={handleAddToCartInternal}
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
