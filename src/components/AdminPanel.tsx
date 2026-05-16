import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { G } from "../data";
import { increment, runTransaction, doc, collection, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const T = {
  bg: "#050810",
  surface: "#0f172a",
  border: "rgba(255,255,255,0.05)",
  accent: "#3b82f6",
  text: "#ffffff",
  sub: "#94a3b8",
  green: "#10b981",
  orange: "#f59e0b",
  red: "#ef4444",
  font: "Cairo, sans-serif"
};

type AdminTab = "users" | "orders" | "topups" | "support";

export function AdminPanel({ onBack, orders = [], onUpdateUser, users = [], onUpdateOrder, tickets = [], onUpdateTicket, depositRequests = [] }: { 
  onBack: () => void, 
  orders?: any[], 
  onUpdateUser?: (id: string, updates: any) => void,
  users?: any[],
  onUpdateOrder?: (id: string, updates: any) => void,
  tickets?: any[],
  onUpdateTicket?: (id: string, updates: any) => void,
  depositRequests?: any[]
}) {
  const [tab, setTab] = useState<AdminTab>("users");
  const [submitting, setSubmitting] = useState(false);
  
  const regularOrders = orders.filter(o => o.type !== "TOPUP");

  const handleApproveDeposit = async (req: any) => {
    if (submitting) return;
    setSubmitting(true);
    
    try {
      const amount = Number(req.amount);
      if (isNaN(amount) || amount <= 0) throw new Error("المبلغ غير صالح");

      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", req.userId);
        const requestRef = doc(db, "deposit_requests", req.id);
        
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error("المستخدم غير موجود");

        // 1. Update request status
        transaction.update(requestRef, { 
          status: "approved", 
          approvedAt: serverTimestamp() 
        });

        // 2. Increment user balance
        transaction.update(userRef, {
          balance: increment(amount),
          totalTopup: increment(amount)
        });

        // 3. Create a transaction record in orders for history
        const orderRef = doc(collection(db, "orders"));
        transaction.set(orderRef, {
          name: `شحن رصيد — ${req.methodName || "إيداع"}`,
          amount: `£${amount.toLocaleString()}`,
          amountValue: amount,
          icon: "💰",
          color: "#10b981",
          type: "TOPUP",
          status: "completed",
          userId: req.userId,
          userEmail: req.userEmail,
          userName: req.userName,
          date: new Date().toLocaleDateString("ar-EG") + " " + new Date().toLocaleTimeString("ar-EG"),
          createdAt: serverTimestamp(),
          details: { ...req.paymentDetails, depositRequestId: req.id }
        });
      });

      // Send notification
      await addDoc(collection(db, "notifications"), {
        userId: req.userId,
        title: "تم شحن رصيدك بنجاح ✅",
        msg: `تمت إضافة ${amount} ج.م إلى محفظتك بنجاح. رصيدك الآن جاهز للاستخدام.`,
        time: "الآن",
        type: "wallet",
        read: false,
        createdAt: serverTimestamp()
      });

      alert(`✅ تم شحن ${amount} ج.م بنجاح للمستخدم.`);
    } catch (e: any) {
      console.error("Deposit approval error:", e);
      alert("⚠️ فشل في معالجة طلب الشحن: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectDeposit = async (req: any) => {
    if (submitting) return;
    if (!confirm("هل أنت متأكد من رفض هذا الطلب؟")) return;
    
    setSubmitting(true);
    try {
      await updateDoc(doc(db, "deposit_requests", req.id), {
        status: "rejected",
        rejectedAt: serverTimestamp()
      });

      await addDoc(collection(db, "notifications"), {
        userId: req.userId,
        title: "تم رفض طلب الشحن ❌",
        msg: `نعتذر، تم رفض طلب الشحن الخاص بك (£${req.amount}). يرجى التواصل مع الدعم.`,
        time: "الآن",
        type: "support",
        read: false,
        createdAt: serverTimestamp()
      });
      
      alert("❌ تم رفض الطلب.");
    } catch (e: any) {
      alert("⚠️ فشل في رفض الطلب: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyTicket = (id: string, userId: string) => {
    const msg = prompt("أدخل ردك على التذكرة:");
    if (msg && onUpdateTicket) {
      onUpdateTicket(id, { status: "replied", adminReply: msg });
      
      // Notification for ticket reply
      import("firebase/firestore").then(async ({ collection, addDoc, serverTimestamp }) => {
        const { db } = await import("../lib/firebase");
        await addDoc(collection(db, "notifications"), {
          userId: userId,
          title: "رد جديد على تذكرة الدعم 💬",
          msg: `وصلك رد جديد من الإدارة على تذكرتك: ${msg.substring(0, 30)}...`,
          time: "الآن",
          type: "support",
          read: false,
          createdAt: serverTimestamp()
        });
      });
    }
  };

  const handleUpdateBalance = (uid: string, amt: number) => {
    if (onUpdateUser) {
      onUpdateUser(uid, { balance: increment(amt) });
    }
  };

  const handleSetBalance = (uid: string) => {
    const val = prompt("أدخل الرصيد الجديد:");
    if (val !== null && !isNaN(Number(val)) && onUpdateUser) {
      onUpdateUser(uid, { balance: Number(val) });
    }
  };

  const handleUpdateRank = (uid: string, rank: string) => {
    if (onUpdateUser) {
      onUpdateUser(uid, { rank });
    }
  };

  const handleReject = (id: string) => {
    if (confirm("هل أنت متأكد من حذف/رفض هذا الطلب؟") && onUpdateOrder) {
      // In a real app we might delete, but here we just mark as rejected
      onUpdateOrder(id, { status: "rejected", stage: 0 });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: 120 }}>
      {/* Admin Header */}
      <div style={{ padding: "50px 20px 20px", display: "flex", alignItems: "center", gap: 15, background: "rgba(59,130,246,0.05)", borderBottom: `1px solid ${T.border}` }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 12, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 18 }}>→</button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: T.text }}>لوحة الإدارة 🔐</h1>
          <p style={{ fontSize: 11, color: T.sub }}>تحكم كامل في المستخدمين والطلبات</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: T.surface, padding: 15, borderRadius: 20, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, color: T.sub, marginBottom: 5 }}>إجمالي المستخدمين</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.accent }}>{users.length}</div>
        </div>
        <div style={{ background: T.surface, padding: 15, borderRadius: 20, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, color: T.sub, marginBottom: 5 }}>الطلبات الجديدة</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.orange }}>{regularOrders.filter(o => o.stage < 3).length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 20px", gap: 8, marginBottom: 20, overflowX: "auto" }}>
        {[
          { id: "users", l: "المستخدمين", i: "👥" },
          { id: "orders", l: "الطلبات", i: "📦" },
          { id: "topups", l: "الشحن", i: "💰" },
          { id: "support", l: "الدعم", i: "💬" }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setTab(t.id as AdminTab)}
            style={{ 
              padding: "10px 16px", borderRadius: 14, whiteSpace: "nowrap", border: "none", fontSize: 12, fontWeight: 800,
              background: tab === t.id ? T.accent : T.surface,
              color: tab === t.id ? "white" : T.sub
            }}
          >
            {t.i} {t.l}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "0 20px" }}>
        <AnimatePresence mode="wait">
          {tab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {users.map(u => (
                  <div key={u.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 900 }}>{u.name || "بدون اسم"}</div>
                          <div style={{ fontSize: 10, color: T.sub }}>{u.email}</div>
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: 9, padding: "4px 10px", borderRadius: 8, fontWeight: 800,
                        background: u.rank === "VIP" ? `${T.orange}15` : u.rank === "مميز" ? `${T.accent}15` : `${T.sub}15`,
                        color: u.rank === "VIP" ? T.orange : u.rank === "مميز" ? T.accent : T.sub,
                        border: `1px solid ${u.rank === "VIP" ? "rgba(245,158,11,0.2)" : u.rank === "مميز" ? "rgba(59,130,246,0.2)" : T.border}`
                      }}>{u.rank || "عادي"}</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 15 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: T.sub, marginBottom: 4 }}>الرصيد الحالي</div>
                        <div 
                          onClick={() => handleSetBalance(u.id)}
                          className="tap"
                          style={{ fontSize: 18, fontWeight: 900, color: T.accent, cursor: "pointer" }}
                        >£{(u.balance || 0).toLocaleString()}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleUpdateBalance(u.id, 100)} className="tap" style={{ width: 32, height: 32, borderRadius: 8, background: `${T.green}20`, color: T.green, border: "none", fontSize: 18 }}>+</button>
                        <button onClick={() => handleUpdateBalance(u.id, -100)} className="tap" style={{ width: 32, height: 32, borderRadius: 8, background: `${T.red}20`, color: T.red, border: "none", fontSize: 18 }}>-</button>
                      </div>
                    </div>

                    <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 15, display: "flex", gap: 10 }}>
                      <select 
                        value={u.rank || "عادي"} 
                        onChange={(e) => handleUpdateRank(u.id, e.target.value)}
                        style={{ flex: 1, padding: "8px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, color: T.text, fontSize: 12, outline: "none" }}
                      >
                        <option value="عادي">ترقية لـ عادي</option>
                        <option value="مميز">ترقية لـ مميز</option>
                        <option value="VIP">ترقية لـ VIP</option>
                      </select>
                      <button className="tap" style={{ padding: "8px 15px", borderRadius: 10, background: T.red, color: "white", fontSize: 11, border: "none", fontWeight: 800 }}>حظر</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "orders" && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {regularOrders.map(o => (
                  <div key={o.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: T.sub }}>{o.id}</div>
                      <div style={{ fontSize: 10, color: T.sub }}>{o.date}</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 4 }}>{o.name || o.service}</div>
                    <div style={{ fontSize: 11, color: T.accent, marginBottom: 12 }}>المستخدم: {o.userEmail || o.user}</div>
                    
                    <div style={{ background: T.bg, padding: 12, borderRadius: 12, marginBottom: 15, fontSize: 11 }}>
                      {Object.entries(o.details || {}).map(([k, v]: any) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: T.sub }}>{k}:</span>
                          <span style={{ color: T.text }}>{String(v)}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 8, color: T.sub }}>تغيير حالة الطلب:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 15 }}>
                      {[
                        { l: "مراجعة", s: 0, c: "#FBBF24" },
                        { l: "موافقة", s: 1, c: "#3B82F6" },
                        { l: "تنفيذ", s: 2, c: "#F97316" },
                        { l: "اكتمل", s: 3, c: "#10B981" }
                      ].map(st => (
                        <button 
                          key={st.s}
                          onClick={() => onUpdateOrder && onUpdateOrder(o.id, { stage: st.s, status: st.s === 3 ? "completed" : "active" })}
                          style={{ 
                            flex: 1, padding: "8px 4px", fontSize: 10, borderRadius: 8, 
                            background: o.stage === st.s ? st.c : T.surface,
                            color: o.stage === st.s ? "white" : T.sub,
                            border: `1px solid ${o.stage === st.s ? st.c : T.border}`,
                            fontWeight: 800
                          }}
                        >
                          {st.l}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleReject(o.id)} style={{ flex: 1, padding: 12, borderRadius: 12, background: `${T.red}15`, color: T.red, border: `1px solid ${T.red}30`, fontSize: 12, fontWeight: 800 }}>حذف / رفض 🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "topups" && (
            <motion.div key="topups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                 {depositRequests.filter(r => r.status === "pending").length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <div style={{ fontSize: 40, marginBottom: 15 }}>🏗️</div>
                      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 5 }}>طلبات الشحن</div>
                      <div style={{ fontSize: 12, color: T.sub }}>لا توجد طلبات معلقة حالياً</div>
                    </div>
                 ) : (
                   depositRequests.filter(r => r.status === "pending").map(req => (
                     <div key={req.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                          <div style={{ fontSize: 14, fontWeight: 900, color: T.green }}>شحن: £{req.amount}</div>
                          <div style={{ fontSize: 10, color: T.sub }}>{req.dateFormatted}</div>
                        </div>
                        <div style={{ fontSize: 12, color: T.accent, marginBottom: 10 }}>المستخدم: {req.userEmail}</div>
                        <div style={{ background: T.bg, padding: 12, borderRadius: 12, marginBottom: 15, fontSize: 11 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ color: T.sub }}>الوسيلة:</span>
                            <span style={{ color: T.text }}>{req.methodName}</span>
                          </div>
                          {Object.entries(req.paymentDetails || {}).map(([k, v]: any) => (
                            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ color: T.sub }}>{k}:</span>
                              <span style={{ color: T.text }}>{String(v)}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => handleApproveDeposit(req)} disabled={submitting} className="tap" style={{ flex: 1, padding: 10, borderRadius: 10, background: T.green, color: "white", border: "none", fontSize: 12, fontWeight: 800, opacity: submitting ? 0.5 : 1 }}>قبول والشحن ✅</button>
                          <button onClick={() => handleRejectDeposit(req)} disabled={submitting} className="tap" style={{ flex: 1, padding: 10, borderRadius: 10, background: T.red, color: "white", border: "none", fontSize: 12, fontWeight: 800, opacity: submitting ? 0.5 : 1 }}>رفض ❌</button>
                        </div>
                     </div>
                   ))
                 )}
               </div>
            </motion.div>
          )}

          {tab === "support" && (
            <motion.div key="support" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {tickets.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: T.sub }}>لا توجد تذاكر دعم حالياً</div>
                ) : (
                  tickets.map(s => (
                    <div key={s.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 900 }}>{s.subject}</div>
                        <div style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: s.status === "open" ? `${T.red}20` : `${T.green}20`, color: s.status === "open" ? T.red : T.green }}>{s.status === "open" ? "جديد" : "تم الرد"}</div>
                      </div>
                      <div style={{ fontSize: 11, color: T.accent, marginBottom: 8 }}>المستخدم: {s.userName || s.userEmail}</div>
                      <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.5, background: T.bg, padding: 12, borderRadius: 12, marginBottom: 15 }}>{s.msg || s.message}</div>
                      {s.adminReply && (
                        <div style={{ fontSize: 11, color: T.green, marginBottom: 10, padding: 10, borderLeft: `2px solid ${T.green}`, background: `${T.green}05` }}>
                          <b>رد الإدارة:</b> {s.adminReply}
                        </div>
                      )}
                      <button onClick={() => handleReplyTicket(s.id, s.userId)} className="tap" style={{ width: "100%", padding: 12, borderRadius: 12, background: T.accent, color: "white", fontWeight: 800, border: "none", fontSize: 13 }}>{s.status === "open" ? "الرد على التذكرة ⚡" : "تعديل الرد"}</button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
