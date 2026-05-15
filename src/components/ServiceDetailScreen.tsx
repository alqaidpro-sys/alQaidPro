import { useState } from "react";
import { DURATIONS, G, NETWORKS, TOPUP_AMOUNTS } from "../data";
import { BalanceBadge, InfoBanner, PrimaryBtn } from "./Shared";

export function ServiceDetailScreen({ service, onBack }: { service: any, onBack: () => void }) {
  const [vals, setVals] = useState<any>({});
  const [duration, setDuration] = useState(DURATIONS?.[0] || "");
  const [showDrop, setShowDrop] = useState(false);
  const [network, setNetwork] = useState(NETWORKS?.[0] || "");
  const [showNetDrop, setShowNetDrop] = useState(false);
  const [topupAmt, setTopupAmt] = useState(TOPUP_AMOUNTS?.[0] || 100);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1500);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 32 }}>
        <div style={{ fontSize: 72, marginBottom: 24, animation: "pulse 1s ease" }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: G.text, fontFamily: G.font, marginBottom: 10, textAlign: "center" }}>تم إرسال الطلب!</h2>
        <p style={{ fontSize: 14, color: G.sub, fontFamily: G.font, textAlign: "center", lineHeight: 1.7, marginBottom: 32 }}>
          سيتم مراجعة طلبك وتنفيذه خلال 15-30 دقيقة. ستصلك إشعار فور الانتهاء.
        </p>
        <PrimaryBtn label="العودة للخدمات" onClick={onBack} />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 110 }}>
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
        <BalanceBadge compact />

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
                <input className="inp" value={vals[f] || ""} onChange={e => setVals({ ...vals, [f]: e.target.value })}
                  placeholder={f.includes("رابط") ? "https://..." : f.includes("بريد") ? "name@example.com" : f.includes("هاتف") ? "01XXXXXXXXX" : ""}
                  dir={f.includes("رابط") || f.includes("بريد") ? "ltr" : "rtl"}
                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${G.cardBorder}`, borderRadius: 12, padding: "12px 16px", color: G.text, fontSize: 14, fontFamily: G.font }} />
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <PrimaryBtn label={loading ? "جاري الإرسال..." : service.btn} onClick={handleSubmit} color={service.color} icon={loading ? "⏳" : "✓"} />

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
    </div>
  );
}
