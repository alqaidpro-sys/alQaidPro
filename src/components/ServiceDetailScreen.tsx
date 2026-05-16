import { useState } from "react";
import { motion } from "motion/react";
import { DURATIONS, G, NETWORKS, TOPUP_AMOUNTS } from "../data";
import { BalanceBadge, InfoBanner, PrimaryBtn } from "./Shared";
import { auth } from "../lib/firebase";
import { processPurchase } from "../services/purchaseService";

interface Props {
  service: any;
  onBack: () => void;
  onAddToCart: (item: any) => void;
  balance: number;
  userData: any;
}

export function ServiceDetailScreen({ service, onBack, onAddToCart, balance, userData }: Props) {
  const [vals, setVals] = useState<any>({});
  const [duration, setDuration] = useState(DURATIONS?.[0] || "");
  const [showDrop, setShowDrop] = useState(false);
  const [network, setNetwork] = useState(NETWORKS?.[0] || "");
  const [showNetDrop, setShowNetDrop] = useState(false);
  const [topupAmt, setTopupAmt] = useState(TOPUP_AMOUNTS?.[0] || 100);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [showToast, setShowToast] = useState(false);

  const price = 240; // Fixed price for sample, should ideally come from service data

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      alert("يرجى تسجيل الدخول أولاً");
      return;
    }

    if (balance < price) {
      alert(`⚠️ رصيدك الحالي (${balance} ج.م) غير كافٍ لإتمام هذا الطلب. سعر الخدمة ${price} ج.م.`);
      return;
    }

    const newErrors: any = {};
    
    // Check fields for email validation
    if (!service.isTopup && service.fields) {
      service.fields.forEach((f: string) => {
        if (f && typeof f === "string" && f.includes("بريد")) {
          const emailVal = vals[f] || "";
          if (!emailVal) {
            newErrors[f] = "يرجى إدخال البريد الإلكتروني";
          } else if (!validateEmail(emailVal)) {
            newErrors[f] = "صيغة البريد الإلكتروني غير صحيحة";
          }
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await processPurchase({
        serviceId: service.id,
        serviceName: service.name,
        icon: service.icon,
        color: service.color,
        amount: price,
        details: {
          ...vals,
          duration: service.hasDuration ? duration : null,
          network: service.isTopup ? network : null,
          topupAmount: service.isTopup ? topupAmt : null,
          userName: userData?.name || "مستخدم",
        }
      });

      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء إتمام الطلب");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartInternal = () => {
    const newErrors: any = {};
    if (!service.isTopup && service.fields) {
      service.fields.forEach((f: string) => {
        if (f && typeof f === "string" && f.includes("بريد")) {
          const emailVal = vals[f] || "";
          if (!emailVal || !validateEmail(emailVal)) newErrors[f] = "خطأ في البريد";
        }
      });
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    
    onAddToCart({ service, vals, price });
    setShowToast(true);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 32 }}>
        <div style={{ fontSize: 72, marginBottom: 24, animation: "bounce 2s infinite" }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: G.text, fontFamily: G.font, marginBottom: 10, textAlign: "center" }}>تمت العملية بنجاح!</h2>
        <p style={{ fontSize: 14, color: G.sub, fontFamily: G.font, textAlign: "center", lineHeight: 1.7, marginBottom: 32 }}>
          تم استلام طلبك ({service.name}) بنجاح. سيتم البدء في التنفيذ فوراً وموافيك بالنتائج عبر الإشعارات خلال 15-30 دقيقة.
        </p>
        <PrimaryBtn label="العودة للرئيسية" onClick={onBack} />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 110 }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 0", display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn" onClick={onBack} style={{ width: 38, height: 38, borderRadius: 12, background: G.card, border: `1px solid ${G.cardBorder}`, color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: `linear-gradient(135deg,${service.color}25,${service.color}08)`,
            border: `1px solid ${service.color}25`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>{service.icon}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: G.text, fontFamily: G.font }}>{service.name}</div>
            <div style={{ fontSize: 10, color: G.sub, letterSpacing: 1, fontFamily: G.font }}>{service.note}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Balance */}
        <BalanceBadge compact balance={balance} />

        {/* Info banner */}
        <InfoBanner icon={service.icon} title={service.name} text={service.desc} color={service.color} />

        {/* Duration selector */}
        {service.hasDuration && (
          <div style={{ background: G.card, border: `1px solid ${G.cardBorder}`, borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 11, color: G.sub, marginBottom: 10, fontFamily: G.font }}>اختر مدة الاشتراك</div>
            <div className="btn" onClick={() => setShowDrop(!showDrop)} style={{
              background: "rgba(0,0,0,0.3)", border: `1px solid ${showDrop ? G.blue : G.cardBorder}`,
              borderRadius: 12, padding: "12px 16px", color: G.text, fontSize: 14,
              display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: G.font, fontWeight: 600,
              cursor: "pointer",
            } as any}>
              <span>{duration}</span><span style={{ opacity: 0.5 }}>{showDrop ? "▲" : "▼"}</span>
            </div>
            {showDrop && (
              <div style={{ marginTop: 8, background: "rgba(0,0,0,0.4)", borderRadius: 12, overflow: "hidden", border: `1px solid ${G.cardBorder}` }}>
                {DURATIONS.map((d, i) => (
                  <div key={i} onClick={() => { setDuration(d); setShowDrop(false); }}
                    style={{
                      padding: "12px 16px", cursor: "pointer", fontFamily: G.font, fontSize: 14,
                      color: duration === d ? G.blue : G.text,
                      background: duration === d ? "rgba(59,130,246,0.1)" : "transparent",
                      display: "flex", alignItems: "center", gap: 10,
                      borderBottom: i < DURATIONS.length - 1 ? `1px solid ${G.cardBorder}` : "none",
                    }}>
                    {duration === d && <span style={{ color: G.blue }}>✓</span>}
                    {d}
                  </div>
                ))}
              </div>
            )}
            {/* Price badge */}
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: G.text, fontFamily: G.font }}>£240</div>
              <div style={{
                display: "inline-block", background: `${service.color}20`, border: `1px solid ${service.color}40`,
                borderRadius: 20, padding: "4px 14px", marginTop: 6,
                fontSize: 10, color: service.color, fontWeight: 700, letterSpacing: 1, fontFamily: G.font,
              }}>AL-QAID SMART AI PRICE</div>
            </div>
          </div>
        )}

        {/* Network topup */}
        {service.isTopup && (
          <div style={{ background: G.card, border: `1px solid ${G.cardBorder}`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: G.sub, marginBottom: 8, fontFamily: G.font }}>اختر شبكتك</div>
              <div className="btn" onClick={() => setShowNetDrop(!showNetDrop)} style={{
                background: "rgba(0,0,0,0.3)", border: `1px solid ${showNetDrop ? G.blue : G.cardBorder}`,
                borderRadius: 12, padding: "12px 16px", color: G.text, fontSize: 14,
                display: "flex", justifyContent: "space-between", cursor: "pointer", fontFamily: G.font, fontWeight: 600,
              } as any}>
                <span>{network}</span><span style={{ opacity: 0.5 }}>{showNetDrop ? "▲" : "▼"}</span>
              </div>
              {showNetDrop && (
                <div style={{ marginTop: 8, background: "rgba(0,0,0,0.4)", borderRadius: 12, overflow: "hidden", border: `1px solid ${G.cardBorder}` }}>
                  {NETWORKS.map((n, i) => (
                    <div key={i} onClick={() => { setNetwork(n); setShowNetDrop(false); }}
                      style={{
                        padding: "12px 16px", cursor: "pointer", fontFamily: G.font, fontSize: 14,
                        color: network === n ? G.blue : G.text,
                        background: network === n ? "rgba(59,130,246,0.1)" : "transparent",
                        borderBottom: i < NETWORKS.length - 1 ? `1px solid ${G.cardBorder}` : "none",
                        display: "flex", alignItems: "center", gap: 10,
                      }}>
                      {network === n && <span style={{ color: G.blue }}>✓</span>}{n}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 11, color: G.sub, marginBottom: 8, fontFamily: G.font }}>رقم الهاتف</div>
              <input className="inp" placeholder="01XXXXXXXXX" dir="ltr"
                style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${G.cardBorder}`, borderRadius: 12, padding: "12px 16px", color: G.text, fontSize: 14, fontFamily: G.font }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: G.sub, marginBottom: 10, fontFamily: G.font }}>مبلغ الشحن (صافي)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                {TOPUP_AMOUNTS.map(a => (
                  <div key={a} onClick={() => setTopupAmt(a)} className="btn" style={{
                    padding: "10px 6px", borderRadius: 12, textAlign: "center",
                    background: topupAmt === a ? G.blue : "rgba(0,0,0,0.3)",
                    border: `1px solid ${topupAmt === a ? G.blue : G.cardBorder}`,
                    color: G.text, fontSize: 14, fontWeight: 700, fontFamily: G.font, cursor: "pointer",
                  }}>{a}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Regular fields */}
        {!service.isTopup && service.fields.length > 0 && (
          <div style={{ background: G.card, border: `1px solid ${G.cardBorder}`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            {service.fields.map((f: any, i: any) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: G.sub, marginBottom: 8, fontFamily: G.font }}>{f}</div>
                <input className={`inp ${errors[f] ? "error" : ""}`} value={vals[f] || ""} onChange={e => {
                  setVals({ ...vals, [f]: e.target.value });
                  if (errors[f]) setErrors({ ...errors, [f]: null });
                }}
                  placeholder={f?.includes("رابط") ? "https://..." : f?.includes("بريد") ? "name@example.com" : f?.includes("هاتف") ? "01XXXXXXXXX" : ""}
                  dir={f?.includes("رابط") || f?.includes("بريد") ? "ltr" : "rtl"}
                  style={{ 
                    width: "100%", background: "rgba(0,0,0,0.3)", 
                    border: `1px solid ${errors[f] ? "#ef4444" : G.cardBorder}`, 
                    borderRadius: 12, padding: "12px 16px", color: G.text, fontSize: 14, fontFamily: G.font,
                    outline: "none", transition: "all 0.2s"
                  }} />
                {errors[f] && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 6, fontFamily: G.font, fontWeight: 700 }}>⚠️ {errors[f]}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <PrimaryBtn label={loading ? "جاري الإرسال..." : service.btn} onClick={handleSubmit} color={service.color} icon={loading ? "⏳" : "✓"} />
          </div>
          <button className="tap" onClick={handleAddToCartInternal} style={{
            width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.05)",
            border: `1px solid ${G.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, cursor: "pointer"
          }}>🛒</button>
        </div>

        {/* Security note */}
        <div style={{
          background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)",
          borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 14 }}>🛡️</span>
          <div style={{ fontSize: 11, color: G.sub, lineHeight: 1.6, fontFamily: G.font }}>
            تنبيه: سيصلك البريد الإلكتروني وكلمة المرور الخاصة بالحساب في قسم الطلبات خلال 15-30 دقيقة من الآن.
          </div>
        </div>
      </div>

      {/* Add to Cart Confirmation Modal */}
      {showToast && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, zIndex: 2000
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: "#111827", border: `1px solid ${G.cardBorder}`,
              borderRadius: 24, padding: 32, width: "100%", maxWidth: 350,
              textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: G.text, fontFamily: G.font, marginBottom: 8 }}>تمت الإضافة للسلة</div>
            <div style={{ fontSize: 13, color: G.sub, fontFamily: G.font, marginBottom: 24 }}>الخدمة الآن في سلة مشترياتك، يمكنك المتابعة أو إتمام الدفع</div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button 
                className="tap" 
                onClick={() => setShowToast(false)}
                style={{ width: "100%", padding: 14, borderRadius: 12, background: G.gradient, color: "white", fontSize: 14, fontWeight: 800, fontFamily: G.font, border: "none" }}
              >
                أكمل تسوق
              </button>
              <button 
                className="tap" 
                onClick={onBack}
                style={{ width: "100%", padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.05)", color: G.text, fontSize: 14, fontWeight: 700, fontFamily: G.font, border: `1px solid ${G.cardBorder}` }}
              >
                العودة للرئيسية
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
