import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { processPurchase } from "../services/purchaseService";

const C = {
  bg:      "#0d0d12",
  card:    "#13141a",
  border:  "#1e2028",
  borderB: "#191b22",
  text:    "#e8eaf0",
  sub:     "#6b7280",
  sub2:    "#4b5563",
  blue:    "#3b8fd4",
  green:   "#22c55e",
  yellow:  "#d4a017",
  red:     "#ef4444",
  font:    "'Cairo','Tajawal',sans-serif",
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

const GAME_SERVICES = [
  {
    id: "pubg", name: "PUBG Mobile", icon: "🎮", color: "#f59e0b",
    desc: "شحن شدات ببجي موبايل (UC) بطريقة رسمية وآمنة عبر الـ Player ID. تصل الشدات لحسابك خلال ثوانٍ.",
    inputLabel: "ID اللاعب (Player ID)",
    plans: [
      { n: "60 UC", egp: 39, save: "خصم 40%" },
      { n: "180 UC", egp: 110, save: "وفر £30" },
      { n: "325 UC", egp: 186, save: "الأكثر طلباً" },
      { n: "660 UC", egp: 360, save: "وفر £40" },
      { n: "985 UC", egp: 540, save: "وفر £80" },
      { n: "1800 UC", egp: 930, save: "وفر £120" },
      { n: "2460 UC", egp: 1250, save: "وفر £180" },
      { n: "3850 UC", egp: 1680, save: "وفر £300" },
      { n: "5650 UC", egp: 2400, save: "توفير كبير" },
      { n: "8100 UC", egp: 3480, save: "وفر £700" },
      { n: "16200 UC", egp: 6800, save: "أفضل تعبئة" },
      { n: "24300 UC", egp: 9900, save: "توفير مذهل" },
    ],
  },
  {
    id: "freefire", name: "Free Fire", icon: "🔥", color: "#f97316",
    desc: "جواهر فري فاير (Diamonds) لتطوير حسابك وشراء الملابس والأسلحة النادرة. شحن فوري وآمن.",
    inputLabel: "ID اللاعب (Player ID)",
    plans: [
      { n: "100 Diamond", egp: 33, save: "خصم 40%" },
      { n: "210 Diamond", egp: 65, save: "وفر £15" },
      { n: "310 Diamond", egp: 96, save: "وفر ج.م" },
      { n: "520 Diamond", egp: 156, save: "وفر £30" },
      { n: "1060 Diamond", egp: 306, save: "وفر £80" },
      { n: "2180 Diamond", egp: 600, save: "وفر £180" },
      { n: "4360 Diamond", egp: 1200, save: "وفر £300" },
      { n: "5600 Diamond", egp: 1500, save: "وفر £400" },
    ],
  },
  {
    id: "roblox", name: "Roblox", icon: "🏦", color: "#6366f1",
    desc: "روبوكس (Robux) لشراء الملابس والألعاب داخل عالم روبلوكس الممتع. تسليم فوري.",
    inputLabel: "اسم المستخدم (Username)",
    plans: [
      { n: "400 Robux", egp: 150, save: "خصم 40%" },
      { n: "800 Robux", egp: 288, save: "وفر £40" },
      { n: "1700 Robux", egp: 570, save: "وفر £120" },
      { n: "4500 Robux", egp: 1440, save: "وفر £350" },
      { n: "10000 Robux", egp: 3120, save: "توفير VIP" },
      { n: "22000 Robux", egp: 6600, save: "الأعلى توفيراً" },
    ],
  },
  {
    id: "valorant", name: "Valorant Points", icon: "🛡️", color: "#ff4655",
    desc: "نقاط فالورانت (VP) لشراء السكنات والأسلحة في اللعبة الأكثر إثارة. تسليم عبر الـ Riot ID.",
    inputLabel: "Riot ID",
    plans: [
      { n: "475 VP", egp: 168, save: "خصم 40%" },
      { n: "1000 VP", egp: 336, save: "وفر £50" },
      { n: "2050 VP", egp: 660, save: "وفر £150" },
      { n: "5350 VP", egp: 1650, save: "وفر £400" },
      { n: "11000 VP", egp: 3300, save: "توفير هائل" },
    ],
  },
  {
    id: "cod", name: "Call of Duty", icon: "🔫", color: "#34d399",
    desc: "نقاط كول اوف دوتي (CP) لـ Mobile و Warzone. تسليم فوري عبر الـ UID.",
    inputLabel: "UID / Activision ID",
    plans: [
      { n: "80 CP", egp: 45, save: "خصم 40%" },
      { n: "420 CP", egp: 210, save: "وفر £30" },
      { n: "880 CP", egp: 408, save: "وفر £70" },
      { n: "2400 CP", egp: 1050, save: "وفر £250" },
      { n: "5000 CP", egp: 2100, save: "وفر £600" },
      { n: "10800 CP", egp: 4300, save: "توفير الضباط" },
    ],
  },
  {
    id: "ml", name: "Mobile Legends", icon: "🦅", color: "#f59e0b",
    desc: "شحن جواهر موبايل ليجندز (Diamonds) فوري بالـ ID لتطوير أبطالك.",
    inputLabel: "Player ID + Zone ID",
    plans: [
      { n: "11 Diamonds", egp: 6, save: null },
      { n: "50 Diamonds", egp: 28, save: null },
      { n: "250 Diamonds", egp: 140, save: "وفر £20" },
      { n: "500 Diamonds", egp: 275, save: "وفر £50" },
      { n: "1000 Diamonds", egp: 540, save: "وفر £120" },
      { n: "2500 Diamonds", egp: 1300, save: "وفر £400" },
    ],
  },
  {
    id: "steam", name: "Steam Cards", icon: "🎮", color: "#1b2838",
    desc: "بطاقات رصيد ستيم لشراء الألعاب والمنتجات من المتجر العالمي.",
    inputLabel: "البريد الالكتروني للارسال",
    plans: [
      { n: "$5 Steam", egp: 150, save: "وفر £100" },
      { n: "$10 Steam", egp: 300, save: "وفر £200" },
      { n: "$20 Steam", egp: 600, save: "وفر £400" },
      { n: "$50 Steam", egp: 1500, save: "وفر £1000" },
    ],
  },
  {
    id: "google", name: "Google Play", icon: "🛍️", color: "#22c55e",
    desc: "بطاقات جوجل بلاي لشراء التطبيقات والكتب والأفلام.",
    inputLabel: "البريد الالكتروني للارسال",
    plans: [
      { n: "$10 Google", egp: 300, save: "خصم حصري" },
      { n: "$25 Google", egp: 750, save: "خصم حصري" },
      { n: "$50 Google", egp: 1500, save: "خصم حصري" },
    ],
  },
  {
    id: "ps", name: "PlayStation Store", icon: "🎮", color: "#3b8fd4",
    desc: "بطاقات بلايستيشن لشراء الألعاب والاشتراكات. الأسعار مخفضة بنسبة 40% عن المتجر الرسمي.",
    inputLabel: "البريد الإلكتروني للارسال",
    plans: [
      { n: "$10 Card", egp: 300, save: "وفر £200" },
      { n: "$20 Card", egp: 600, save: "وفر £400" },
      { n: "$50 Card", egp: 1500, save: "وفر £1000" },
      { n: "$100 Card", egp: 3000, save: "وفر £2000" },
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
    ["متى يصل الشحن لحسابي؟", "يتم الشحن فوراً وتلقائياً خلال 1-5 دقائق كحد أقصى."],
    ["هل الشحن رسمي وآمن؟", "نعم، الشحن يتم عبر الطرق الرسمية المعتمدة ولا يسبب أي حظر للحساب."],
    ["ماذا أفعل إذا كتبت الـ ID خطأ؟", "يرجى التواصل مع الدعم فوراً، ولكن إذا تم الشحن للـ ID الخاطئ فلا يمكن استرداد المبلغ."],
    ["هل أحتاج لإعطاء كلمة مرور حسابي؟", "لا أبداً، الشحن يتم عبر الـ ID فقط ولا نطلب كلمة مرور حسابك."],
    ["كيف أعرف أنني شحنت بالفعل؟", "ستصلك رسالة في اللعبة أو ستجد زيادة في رصيد عملاتك مباشرة."],
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

export default function GamesPage({ balance = 0, setBalance, onBack = () => {}, onAddToCart, initialSel }: any) {
  const [sel, setSel] = useState<any>(initialSel || null);
  const [plan, setPlan] = useState<any>(null);
  const [playerId, setPlayerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (initialSel) {
      setSel(initialSel);
    }
  }, [initialSel]);

  const svc = GAME_SERVICES.find(s => s.id === sel);
  const selPlan = svc?.plans.find(p => p.n === plan);
  const canBuy = svc && selPlan && playerId.trim() && balance >= selPlan.egp;

  const reset = () => { setSel(null); setPlan(null); setPlayerId(""); setErr(""); setDone(false); };

  const handleBuy = async () => {
    if (!playerId.trim()) { setErr("يرجى إدخال " + svc?.inputLabel); return; }
    if (!selPlan) { setErr("يرجى اختيار كمية الشحن"); return; }
    if (!canBuy) { setErr("رصيدك غير كافٍ — اشحن المحفظة أولاً"); return; }
    
    setErr("");
    setLoading(true);
    
    try {
      if (!svc || !selPlan || !auth.currentUser) throw new Error("يجب تسجيل الدخول أولاً");
      
      await processPurchase({
        serviceId: svc.id,
        serviceName: svc.name,
        icon: svc.icon,
        color: svc.color || C.blue,
        amount: selPlan.egp,
        type: "GAMES",
        details: { 
          playerId, 
          planName: selPlan.n,
          category: "GAMES" 
        }
      });
      
      if (setBalance) setBalance((b: number) => b - selPlan.egp);
      
      setDone(true);
    } catch (err: any) {
      console.error(err);
      let errorMsg = "حدث خطأ أثناء إتمام الطلب";
      try {
        const data = JSON.parse(err.message);
        if (data.error) {
          if (data.error.includes("insufficient permissions")) errorMsg = "رصيدك غير كافي أو هناك خطأ في الاتصال";
          else errorMsg = data.error;
        }
      } catch (e) {
        errorMsg = err.message || errorMsg;
      }
      setErr(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartInternal = () => {
    if (!svc || !selPlan || !playerId.trim()) return setErr("يرجى إكمال جميع البيانات");
    if (onAddToCart) {
      onAddToCart({
        id: svc.id,
        name: svc.name,
        plan: selPlan,
        icon: svc.icon,
        total: selPlan.egp,
        fields: { [svc.inputLabel]: playerId }
      });
      alert("✅ تمت الإضافة للسلة بنجاح");
    }
  };

  if (done) return (
    <>
      <style>{css}</style>
      <div dir="rtl" style={{ background:C.bg, minHeight:"100vh", maxWidth:430, margin:"0 auto", fontFamily:C.font, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:28, gap:18 }}>
        <div style={{ fontSize:68, animation:"pop .4s ease both" }}>✅</div>
        <div style={{ fontSize:20, fontWeight:900, color:C.text }}>تم طلب الشحن بنجاح!</div>
        <p style={{ fontSize:12, color:C.sub, textAlign:"center" }}>جاري مراجعة الطلب وتنفيذه خلال دقائق. شكرًا لثقتك بنا.</p>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:18, width:"100%" }}>
          {[["اللعبة",svc?.name,C.text],["الشحن",selPlan?.n,C.yellow],["الـ ID",playerId,C.blue],["المدفوع",`£${selPlan?.egp}`,C.green]].map(([l,v,col],i,a)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:i<a.length-1?`1px solid ${C.borderB}`:"none" }}>
              <span style={{ color:C.sub, fontSize:12 }}>{l}</span>
              <span style={{ color:col as string, fontWeight:800, fontSize:13, direction:"ltr" }}>{v}</span>
            </div>
          ))}
        </div>
        <button className="tap" onClick={reset} style={{ width:"100%", padding:"13px", borderRadius:12, fontSize:14, fontWeight:800, background:C.card, border:`1px solid ${C.border}`, color:C.sub, cursor:"pointer" }}>
          + شحن لعبة أخرى
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
            <span style={{ fontSize:11, color:C.sub }}>السجل</span>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:15, fontWeight:900, color:C.text }}>شحن الألعاب والعملات</div>
            <div style={{ fontSize:11, color:C.sub }}>تفعيل فوري بالـ ID</div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🎮</div>
            <div className="tap" onClick={onBack} style={{ width:32, height:32, borderRadius:9, background:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:C.sub, fontSize:15 }}>←</span>
            </div>
          </div>
        </div>

        <div style={{ padding:"0 14px", display:"flex", flexDirection:"column", gap:10 }}>

          {/* GRID */}
          {!sel && (
            <>
              <div style={{ background:"linear-gradient(135deg,rgba(59,130,246,.1),rgba(59,130,246,.03))", border:`1px solid rgba(59,130,246,.22)`, borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:28 }}>🔫</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:900, color:C.text }}>جميع الألعاب المتاحة</div>
                  <div style={{ fontSize:11, color:C.sub, marginTop:3 }}>اختر اللعبة المفضلة لديك وابدأ الشحن</div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9 }}>
                {GAME_SERVICES.map((s,i)=>(
                  <div key={i} className="tap fadeUp" onClick={()=>{ setSel(s.id); setPlan(null); setPlayerId(""); setErr(""); }}
                    style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 6px 12px", display:"flex", flexDirection:"column", alignItems:"center", gap:8, textAlign:"center", animationDelay:`${i*.04}s` }}>
                    <div style={{ width:44, height:44, borderRadius:13, background:`${s.color}14`, border:`1px solid ${s.color}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:s.color, fontWeight:900 }}>
                      {s.icon}
                    </div>
                    <div style={{ fontSize:10, fontWeight:800, color:C.text }}>{s.name}</div>
                    <span style={{ background:"rgba(34,197,94,.1)", color:C.green, fontSize:8, fontWeight:900, padding:"2px 7px", borderRadius:20 }}>فوري ⚡</span>
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
                    <div style={{ fontSize:10, color:C.blue, fontWeight:700 }}>شحن فوري بالـ ID</div>
                  </div>
                </div>
              </div>

              <div style={{ background:C.card, border:`1px solid ${C.borderB}`, borderRadius:13, padding:"12px 16px" }}>
                <p style={{ fontSize:13, color:C.sub, lineHeight:1.9 }}>{svc.desc}</p>
              </div>

              {/* plans */}
              <div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 900, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                  <span>اختر كمية الشحن</span>
                  <span style={{ color: C.green }}>خصم 40% مفعل 🏷️</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {svc.plans.map((p: any, i: number)=>(
                    <button key={i} className="tap" onClick={()=>setPlan(p.n)}
                      style={{ padding: "12px 8px", borderRadius: 14, fontSize: 11, fontWeight: 800, background: plan === p.n ? `${svc.color}25` : C.card, border: `2px solid ${plan === p.n ? svc.color : C.border}`, color: plan === p.n ? svc.color : C.text, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, position: "relative", overflow: "hidden", minHeight: 75 }}>
                      {p.save && (
                        <span style={{ position: "absolute", top: 3, left: 3, background: plan === p.n ? svc.color : "rgba(34,197,94,.15)", color: plan === p.n ? "#fff" : C.green, fontSize: 7, fontWeight: 900, padding: "1px 5px", borderRadius: 20 }}>
                          {p.save}
                        </span>
                      )}
                      <span style={{ fontSize: 12, fontWeight: 900, marginTop: p.save ? 10 : 0 }}>{p.n}</span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                        <span style={{ fontSize: 15, fontWeight: 900, color: C.yellow }}>£{p.egp}</span>
                        <span style={{ fontSize: 8, color: C.sub }}>ج.م</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Player ID */}
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                  <span style={{ fontSize:12, color:C.sub, fontWeight:700 }}>{svc.inputLabel}</span>
                  <span style={{ fontSize:10, color:C.yellow }}>يرجى التأكد من الـ ID</span>
                </div>
                <input className="inp" value={playerId} onChange={e=>setPlayerId(e.target.value)}
                  placeholder={`أدخل ${svc.inputLabel}...`} dir="ltr"
                  style={{ width:"100%", background:"rgba(0,0,0,.35)", border:`1px solid ${C.border}`, borderRadius:12, color:C.text, fontSize:14, fontFamily:C.font, padding:"13px 16px", transition:"border-color .2s" }}/>
              </div>

              {/* summary */}
              {selPlan && (
                <div className="fadeUp" style={{ background:"rgba(34,197,94,.04)", border:`1px solid rgba(34,197,94,.18)`, borderRadius:13, padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:11, color:C.sub }}>{svc.name} · {selPlan.n}</div>
                    <div style={{ fontSize:10, color:C.sub, marginTop:3 }}>الـ ID: <span style={{ color:C.blue }}>{playerId||"..."}</span></div>
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
                <button className="tap" onClick={handleBuy} disabled={loading}
                  style={{ padding:"15px", borderRadius:13, fontSize:14, fontWeight:900, background:canBuy?"linear-gradient(135deg,#1d4ed8,#3b8fd4)":"rgba(255,255,255,.06)", color:canBuy?"#fff":C.sub2, border:canBuy?"none":`1px solid ${C.border}`, boxShadow:canBuy?"0 4px 20px rgba(29,78,216,.4)":"none", cursor:"pointer" }}>
                  {loading
                    ? <span style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
                        <span style={{ width:15, height:15, border:"2px solid rgba(255,255,255,.2)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 1s linear infinite", display:"inline-block" }}/>
                        جاري...
                      </span>
                    : "⚡ شحن الآن"}
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

        </div>
      </div>
    </>
  );
}

