import { useState } from "react";

const USD_RATE = 54.4;

const C = {
  bg:      "#050810",
  card:    "#0f172a",
  cardAlt: "rgba(255,255,255,0.03)",
  border:  "rgba(255,255,255,0.05)",
  borderAlt: "rgba(255,255,255,0.02)",
  text:    "#ffffff",
  sub:     "#94a3b8",
  sub2:    "#64748b",
  blue:    "#3B82F6",
  yellow:  "#fbbf24", 
  yellowBg: "rgba(251,191,36,0.08)", 
  yellowBdr: "rgba(251,191,36,0.2)",
  greenBadgeBg: "rgba(16,185,129,0.1)", 
  greenBadge: "#10b981", 
  greenBdr: "rgba(16,185,129,0.2)",
  red:     "#ef4444", 
  input:   "rgba(0,0,0,0.3)",
  font:    "'Cairo', sans-serif",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
* { margin:0; padding:0; box-sizing:border-box; }
body { background:${C.bg}; font-family:${C.font}; }
::-webkit-scrollbar { width:0; }
input,button { font-family:${C.font}; }
@keyframes spin    { to { transform:rotate(360deg); } }
@keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes pop     { 0%{transform:scale(.85);opacity:0} 100%{transform:scale(1);opacity:1} }
.fadeUp { animation:fadeUp .3s ease both; }
.btn { cursor:pointer; border:none; transition:all .15s ease; font-family:'Cairo',sans-serif; }
.btn:active { transform:scale(.97); opacity:.9; }
.inp { transition: border-color .2s; }
.inp:focus { outline:none; border-color:${C.yellow} !important; }
.faq-row:hover { background:${C.cardAlt} !important; }
.support-card:hover { border-color:${C.border} !important; background:${C.cardAlt} !important; }
`;

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "متى يبدأ التنفيذ؟",        a: "يبدأ التنفيذ فوراً بعد تأكيد الطلب، في معظم الحالات خلال دقائق." },
    { q: "هل الخدمة مضمونة؟",        a: "نعم، جميع طلباتنا مضمونة 100% أو يُرجع لك الرصيد كاملاً." },
    { q: "كيف يمكنني تتبع طلبي؟",    a: 'من صفحة "سجل الطلبات" يمكنك متابعة حالة طلبك لحظة بلحظة.' },
  ];
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
      {faqs.map((f, i) => (
        <div key={i}>
          <div className="faq-row"
            onClick={() => setOpen(open === i ? null : i)}
            style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 16px", cursor:"pointer", background:"transparent", borderBottom: i < faqs.length - 1 || open === i ? `1px solid ${C.borderAlt}` : "none" }}>
            <span style={{ fontSize:14, color: C.text, fontWeight:600 }}>{f.q}</span>
            <span style={{ color: C.sub2, fontSize:10, display:"inline-block", transform: open === i ? "rotate(180deg)" : "none", transition:"transform .2s" }}>▼</span>
          </div>
          {open === i && (
            <div className="fadeUp" style={{ padding:"12px 16px 15px", background: C.cardAlt, borderBottom: i < faqs.length - 1 ? `1px solid ${C.borderAlt}` : "none" }}>
              <p style={{ fontSize:12, color: C.sub, lineHeight:1.9 }}>{f.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function USDTransferPage({ balance = 5000, setBalance, onBack, onAddToCart }: any) {
  const [playerId, setPlayerId] = useState("");
  const [email,    setEmail]    = useState("");
  const [usdAmt,   setUsdAmt]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [showAdded, setShowAdded] = useState(false);
  const [error,    setError]    = useState("");

  const usdNum = parseFloat(usdAmt) || 0;
  const egpAmt = +(usdNum * USD_RATE).toFixed(2);
  const canBuy = balance >= egpAmt && egpAmt > 0 && playerId.trim() && email.trim();

  const handleBuy = () => {
    if (!playerId.trim()) { setError("يرجى إدخال الـ ID"); return; }
    if (!email.trim())    { setError("يرجى إدخال البريد الإلكتروني"); return; }
    if (usdNum <= 0)      { setError("يرجى إدخال مبلغ صحيح بالدولار"); return; }
    if (!canBuy)          { setError("رصيدك غير كافٍ — اشحن المحفظة أولاً"); return; }
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (setBalance) setBalance((b: number) => b - egpAmt);
      setLoading(false);
      setDone(true);
    }, 1800);
  };

  const handleAddToCartInternal = () => {
    if (!playerId.trim()) { setError("يرجى إدخال الـ ID"); return; }
    if (!email.trim())    { setError("يرجى إدخال البريد الإلكتروني"); return; }
    if (usdNum <= 0)      { setError("يرجى إدخال مبلغ صحيح بالدولار"); return; }
    if (onAddToCart) {
      onAddToCart({ name: "تحويل رصيد مخصص", icon: "💸", total: egpAmt, fields: { "ID": playerId, "البريد": email, "المبلغ": `$${usdNum}` } });
      setShowAdded(true);
    }
  };

  const reset = () => { setDone(false); setPlayerId(""); setEmail(""); setUsdAmt(""); setError(""); setShowAdded(false); };

  const inputStyle = {
    width:"100%", background: C.input,
    border:`1px solid ${C.border}`,
    borderRadius:12, color: C.text,
    fontSize:14, fontFamily:"'Cairo',sans-serif",
    padding:"14px 16px",
  };

  /* ── SUCCESS ── */
  if (done) return (
    <>
      <style>{css}</style>
      <div dir="rtl" style={{ fontFamily:"'Cairo',sans-serif", background: C.bg, minHeight:"100vh", maxWidth:430, margin:"0 auto", padding:24, display:"flex", flexDirection:"column", alignItems:"center", gap:18 }}>
        <div style={{ fontSize:64, animation:"pop .4s ease both" }}>✅</div>
        <div style={{ fontSize:20, fontWeight:900, color: C.text }}>تم الطلب بنجاح!</div>
        <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:18, width:"100%" }}>
          {[["الـ ID", playerId, C.text],["البريد", email, "#4F8EF7"],["المبلغ بالدولار",`$${usdNum}`, C.yellow],["المخصوم من رصيدك",`£ ${egpAmt}`, C.red]].map(([l,v,c],i,a)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom: i<a.length-1?`1px solid ${C.borderAlt}`:"none" }}>
              <span style={{ color: C.sub, fontSize:13 }}>{l}</span>
              <span style={{ color:c as string, fontWeight:800, fontSize:13, direction:"ltr" }}>{v}</span>
            </div>
          ))}
        </div>
        <button className="btn" onClick={reset} style={{ width:"100%", padding:"14px", borderRadius:12, fontSize:14, fontWeight:800, background: C.card, border:`1px solid ${C.border}`, color: C.sub }}>+ طلب جديد</button>
      </div>
    </>
  );

  /* ── MAIN ── */
  return (
    <>
      <style>{css}</style>
      <div dir="rtl" style={{ fontFamily:"'Cairo',sans-serif", background: C.bg, minHeight:"100vh", maxWidth:430, margin:"0 auto", paddingBottom:40 }}>

        {/* ─── HEADER ─── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 16px 16px" }}>

          {/* right: history */}
          <div style={{ display:"flex", alignItems:"center", gap:5, cursor:"pointer" }}>
            <span style={{ fontSize:14 }}>🕐</span>
            <span style={{ fontSize:12, color: C.sub }}>سجل الطلبات</span>
          </div>

          {/* center: title */}
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:16, fontWeight:900, color: C.text, lineHeight:1.3 }}>تحويل رصيد مخصص</div>
            <div style={{ fontSize:13, fontWeight:700, color: C.sub }}>(USD)</div>
          </div>

          {/* left: icon + back */}
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"#1a2e1a", border:`1px solid #243424`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>💸</div>
            <div onClick={onBack} style={{ width:34, height:34, borderRadius:10, background: C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <span style={{ color: C.sub, fontSize:16 }}>←</span>
            </div>
          </div>
        </div>

        <div style={{ padding:"0 14px", display:"flex", flexDirection:"column", gap:10 }}>

          {/* ─── PRICE CARD ─── */}
          <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ marginBottom:8 }}>
                  <span style={{ background: C.greenBadgeBg, color: C.greenBadge, fontSize:11, fontWeight:800, padding:"4px 11px", borderRadius:20, border:`1px solid ${C.greenBdr}` }}>الأفضل حالياً</span>
                </div>
                <div style={{ fontSize:12, color: C.sub, display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ color: C.yellow }}>⚡</span>
                  <span>تنفيذ فوري</span>
                </div>
              </div>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:11, color: C.sub2, marginBottom:5 }}>السعر لكل 1 دولار</div>
                <div style={{ fontSize:24, fontWeight:900, color: C.yellow, direction:"ltr" }}>
                  £ {USD_RATE} <span style={{ fontSize:13, color: C.sub }}>ج.م</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── DESCRIPTION ─── */}
          <div style={{ background: C.card, border:`1px solid ${C.borderAlt}`, borderRadius:14, padding:"13px 16px" }}>
            <p style={{ fontSize:13, color: C.sub, lineHeight:1.9, textAlign:"right" }}>
              حول أي مبلغ بالدولار لأي محفظة إلكترونية أو حساب بنكي دولي. السعر شامل الرسوم.
            </p>
          </div>

          {/* ─── ID ─── */}
          <div className="fadeUp" style={{ animationDelay:"0s" }}>
            <label style={{ fontSize:12, color: C.sub, fontWeight:700, display:"block", marginBottom:8 }}>الـ ID</label>
            <input className="inp" value={playerId} onChange={e=>setPlayerId(e.target.value)} placeholder="أدخل ID الحساب" dir="ltr" style={inputStyle as any}/>
          </div>

          {/* ─── EMAIL ─── */}
          <div className="fadeUp" style={{ animationDelay:".05s" }}>
            <label style={{ fontSize:12, color: C.sub, fontWeight:700, display:"block", marginBottom:8 }}>البريد الإلكتروني</label>
            <input className="inp" value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@email.com" dir="ltr" style={inputStyle as any}/>
          </div>

          {/* ─── USD ─── */}
          <div className="fadeUp" style={{ animationDelay:".1s" }}>
            <label style={{ fontSize:12, color: C.sub, fontWeight:700, display:"block", marginBottom:8 }}>المبلغ بالدولار (USD)</label>
            <div style={{ position:"relative" }}>
              <input className="inp" value={usdAmt} onChange={e=>setUsdAmt(e.target.value.replace(/[^0-9.]/g,""))} placeholder="مثال: 10" dir="ltr" style={{ ...inputStyle, paddingLeft:54 } as any}/>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:12, color: C.sub2, fontWeight:700, pointerEvents:"none" }}>USD $</span>
            </div>
          </div>

          {/* ─── EGP auto ─── */}
          <div className="fadeUp" style={{ animationDelay:".15s" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <label style={{ fontSize:12, color: C.sub, fontWeight:700 }}>المبلغ بالجنيه المصري</label>
              <span style={{ fontSize:10, color: C.sub2 }}>$1 = £{USD_RATE} · تلقائي</span>
            </div>
            <div style={{ width:"100%", background: egpAmt > 0 ? C.yellowBg : C.input, border:`1px solid ${egpAmt > 0 ? C.yellowBdr : C.border}`, borderRadius:12, padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", minHeight:50, transition:"all .3s" }}>
              <span style={{ fontSize:13, color: C.sub2 }}>ج.م</span>
              <span style={{ fontSize: egpAmt > 0 ? 21 : 14, fontWeight:900, color: egpAmt > 0 ? C.yellow : C.sub2, direction:"ltr", transition:"all .3s" }}>
                {egpAmt > 0 ? `£ ${egpAmt.toLocaleString()}` : "يظهر تلقائياً..."}
              </span>
            </div>
          </div>

          {/* ─── Balance status ─── */}
          {usdNum > 0 && (
            <div className="fadeUp" style={{ background: canBuy ? "rgba(74,222,128,.05)" : "rgba(224,85,85,.05)", border:`1px solid ${canBuy ? "rgba(74,222,128,.2)" : "rgba(224,85,85,.2)"}`, borderRadius:10, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12, color: canBuy ? C.greenBadge : C.red, fontWeight:700 }}>{canBuy ? "✅ رصيد كافٍ" : "❌ رصيد غير كافٍ"}</span>
              <span style={{ fontSize:12, color: C.sub2 }}>رصيدك: <span style={{ fontWeight:800, color: canBuy ? C.greenBadge : C.red }}>£{balance.toLocaleString()}</span></span>
            </div>
          )}

          {/* ─── Error ─── */}
          {error && (
            <div style={{ fontSize:12, color: C.red, background:"rgba(224,85,85,.07)", border:"1px solid rgba(224,85,85,.2)", borderRadius:10, padding:"10px 14px", textAlign:"center" }}>⚠️ {error}</div>
          )}

          {/* ─── BUY BUTTON ─── */}
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button className="btn" onClick={handleBuy} disabled={loading}
              style={{ flex: 1, padding:"18px", borderRadius:14, fontSize:18, fontWeight:900, letterSpacing:.3, background: canBuy ? `linear-gradient(135deg,${C.yellow},#b8890f)` : C.card, color: canBuy ? "#1a0f00" : C.sub2, border: canBuy ? "none" : `1px solid ${C.border}`, boxShadow: canBuy ? `0 4px 28px rgba(212,160,23,.3)` : "none" }}>
              {loading
                ? <span style={{ display:"inline-flex", alignItems:"center", gap:10 }}>
                    <span style={{ width:18, height:18, border:"2px solid rgba(0,0,0,.2)", borderTopColor:"#1a0f00", borderRadius:"50%", animation:"spin 1s linear infinite", display:"inline-block" }}/>
                    جاري...
                  </span>
                : "شراء مباشر ⚡"}
            </button>
            <button className="tap" onClick={handleAddToCartInternal}
              style={{ width: 64, height: 64, borderRadius: 14, background: C.card, color: C.blue, border: `1px solid ${C.border}`, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
              🛒
            </button>
          </div>

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

          {/* ─── SUPPORT ─── */}
          <div style={{ marginTop:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <span style={{ fontSize:16 }}>🛡️</span>
              <span style={{ fontSize:13, color: C.sub, fontWeight:700 }}>الدعم والمساعدة</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              {[["🎟️","تذكرة دعم"],["✉️","البريد"],["💬","دردشة حية"]].map(([icon,label],i)=>(
                <div key={i} className="support-card" style={{ background: C.card, border:`1px solid ${C.borderAlt}`, borderRadius:14, padding:"16px 10px", display:"flex", flexDirection:"column", alignItems:"center", gap:8, cursor:"pointer", transition:"all .15s" }}>
                  <span style={{ fontSize:24 }}>{icon}</span>
                  <span style={{ fontSize:11, color: C.sub, fontWeight:700 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── FAQ ─── */}
          <div style={{ marginTop:12, paddingBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <span style={{ fontSize:16 }}>❓</span>
              <span style={{ fontSize:13, color: C.sub, fontWeight:700 }}>الأسئلة الشائعة</span>
            </div>
            <FaqSection />
          </div>

        </div>
      </div>
    </>
  );
}
