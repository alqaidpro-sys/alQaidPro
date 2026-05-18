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

type AdminTab = "users" | "orders" | "topups" | "support" | "history";

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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Custom Modal State
  const [modalType, setModalType] = useState<"message" | "reject" | "balance" | "reply" | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [modalInput, setModalInput] = useState("");
  
  const regularOrders = orders.filter(o => o.type !== "TOPUP");

  const closeModals = () => {
    setModalType(null);
    setModalData(null);
    setModalInput("");
  };

  const handleApproveDeposit = async (req: any) => {
    if (submitting) return;
    setSubmitting(true);
    
    try {
      const amount = Number(req.amount);
      if (isNaN(amount) || amount <= 0) throw new Error("المبلغ غير صالح");

      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", req.userId);
        const requestRef = doc(db, "deposit_requests", req.id);
        
        const [userSnap, requestSnap] = await Promise.all([
          transaction.get(userRef),
          transaction.get(requestRef)
        ]);

        if (!userSnap.exists()) throw new Error("المستخدم غير موجود في قاعدة البيانات");
        if (!requestSnap.exists()) throw new Error("طلب الشحن هذا غير موجود أو تم حذفه");
        
        const requestData = requestSnap.data();
        if (requestData.status !== "pending") throw new Error("تمت معالجة هذا الطلب مسبقاً");

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
      });

      // Send notification
      await addDoc(collection(db, "notifications"), {
        userId: req.userId,
        title: "تم شحن رصيدك بنجاح ✅",
        msg: "شكراً لك! تم قبول طلب الشحن وإضافة الرصيد إلى محفظتك بنجاح. رصيد مميز مع القائد! 🚀",
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
      const docRef = doc(db, "deposit_requests", req.id);
      
      // Check if document exists before updating
      await updateDoc(docRef, {
        status: "rejected",
        rejectedAt: serverTimestamp()
      });

      await addDoc(collection(db, "notifications"), {
        userId: req.userId,
        title: "تم رفض طلب الشحن ❌",
        msg: "نعتذر منك، تم رفض طلب الشحن. لقد انتظرنا وصول التحويل ولم يصلنا شيء. يرجى التأكد من بيانات التحويل والمحاولة مرة أخرى. 🛑",
        time: "الآن",
        type: "support",
        read: false,
        createdAt: serverTimestamp()
      });
      
      alert("❌ تم رفض الطلب.");
    } catch (e: any) {
      console.error("Reject deposit error:", e);
      alert("⚠️ فشل في رفض الطلب: " + (e.message || "خطأ غير معروف"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyTicket = async () => {
    if (!modalInput.trim() || !modalData || !onUpdateTicket) return;
    setSubmitting(true);
    try {
      onUpdateTicket(modalData.id, { status: "closed", adminReply: modalInput });
      
      await addDoc(collection(db, "notifications"), {
        userId: modalData.userId,
        title: "تم الرد على تذكرتك 💬",
        msg: `المدير رد عليك: ${modalInput}`,
        time: "الآن",
        type: "support",
        read: false,
        createdAt: serverTimestamp()
      });
      alert("تم الرد بنجاح.");
      closeModals();
    } catch (err) {
      alert("فشل الرد");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBalance = (uid: string, amt: number) => {
    if (onUpdateUser) {
      onUpdateUser(uid, { balance: increment(amt) });
    }
  };

  const handleSetBalance = () => {
    const val = Number(modalInput);
    if (isNaN(val) || !modalData?.uid || !onUpdateUser) return;
    onUpdateUser(modalData.uid, { balance: val });
    alert("تم تحديث الرصيد بنجاح.");
    closeModals();
  };

  const handleUpdateRank = (uid: string, rank: string) => {
    if (onUpdateUser) {
      onUpdateUser(uid, { rank });
    }
  };

  const handleRejectOrderSubmit = async () => {
    if (!modalInput.trim() || !modalData || !onUpdateOrder) return;
    setSubmitting(true);
    try {
      const order = modalData;
      // 1. Update order status
      onUpdateOrder(order.id, { status: "rejected", stage: 3, adminNote: modalInput });
      
      // 2. Refund the amount to the user
      const refundAmount = Number(String(order.amount || "0").replace(/[^\d.]/g, "") || 0);
      if (refundAmount > 0) {
        const userRef = doc(db, "users", order.userId);
        await updateDoc(userRef, {
          balance: increment(refundAmount),
          updatedAt: serverTimestamp()
        });
      }

      // 3. Send notification with special flag for alert
      await addDoc(collection(db, "notifications"), {
        userId: order.userId,
        title: "تم رفض طلبك واسترداد المبلغ 💰",
        msg: `نعتذر منك، تم رفض طلبك (${order.name}) وتم إعادة مبلغ (£${refundAmount}) لرصيدك. السبب: ${modalInput}`,
        time: "الآن",
        type: "support",
        read: false,
        isPopup: true,
        createdAt: serverTimestamp()
      });

      alert(`✅ تم الرفض وإعادة مبلغ £${refundAmount} للمستخدم.`);
      closeModals();
    } catch (err) {
      console.error("Error rejecting order:", err);
      alert("حدث خطأ أثناء عملية الرفض والاسترداد");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendDirectMessageSubmit = async () => {
    if (!modalInput.trim() || !modalData) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "notifications"), {
        userId: modalData.userId,
        title: "رسالة من الإدارة 🔔",
        msg: modalInput,
        time: "الآن",
        type: "support",
        read: false,
        isPopup: true,
        createdAt: serverTimestamp()
      });
      alert("✅ تم إرسال الرسالة بنجاح كرسالة منبثقة.");
      closeModals();
    } catch (err) {
      alert("فشل إرسال الرسالة");
    } finally {
      setSubmitting(false);
    }
  };

  // Improved filtering logic to ensure items are visible until fully completed/rejected
  const activeOrders = regularOrders.filter(o => {
    // Include any order that isn't terminal (completed/rejected) and hasn't reached stage 3
    const isTerminal = o.status === "completed" || o.status === "rejected";
    return !isTerminal && o.stage !== 3;
  });
  const pendingTopups = depositRequests.filter(r => r.status === "pending" || r.status === "processing");
  const pendingTickets = tickets.filter(s => s.status === "open");

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
          <div style={{ fontSize: 22, fontWeight: 900, color: T.orange }}>{activeOrders.length + pendingTopups.length + pendingTickets.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 20px", gap: 8, marginBottom: 20, overflowX: "auto" }}>
        {[
          { id: "users", l: "المستخدمين", i: "👥" },
          { id: "orders", l: "الطلبات النشطة", i: "⚡" },
          { id: "history", l: "سجل الطلبات", i: "📜" },
          { id: "topups", l: "الشحن", i: "💰" },
          { id: "support", l: "الدعم", i: "💬" }
        ].map(t => {
          const count = t.id === "orders" ? activeOrders.length : t.id === "topups" ? pendingTopups.length : t.id === "support" ? pendingTickets.length : 0;
          return (
            <button 
              key={t.id}
              onClick={() => setTab(t.id as AdminTab)}
              style={{ 
                padding: "10px 16px", borderRadius: 14, whiteSpace: "nowrap", border: "none", fontSize: 12, fontWeight: 800,
                background: tab === t.id ? T.accent : T.surface,
                color: tab === t.id ? "white" : T.sub,
                position: "relative"
              }}
            >
              {t.i} {t.l}
              {count > 0 && (
                <span style={{ position: "absolute", top: -5, right: -5, background: T.red, color: "white", borderRadius: "50%", width: 18, height: 18, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, border: `2px solid ${T.bg}` }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ padding: "0 20px" }}>
        <AnimatePresence mode="wait">
          {tab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {users.map(u => (
                  <div key={u.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 18 }}>
                    <div onClick={() => setSelectedUserId(u.id === selectedUserId ? null : u.id)} style={{ cursor: "pointer" }}>
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

                      <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: selectedUserId === u.id ? 15 : 0 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: T.sub, marginBottom: 4 }}>الرصيد الحالي</div>
                          <div 
                            onClick={(e) => { e.stopPropagation(); setModalType("balance"); setModalData({uid: u.id, name: u.name, balance: u.balance}); e.stopPropagation(); }}
                            className="tap"
                            style={{ fontSize: 18, fontWeight: 900, color: T.accent, cursor: "pointer" }}
                          >£{(u.balance || 0).toLocaleString()}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={(e) => { e.stopPropagation(); handleUpdateBalance(u.id, 100); }} className="tap" style={{ width: 32, height: 32, borderRadius: 8, background: `${T.green}20`, color: T.green, border: "none", fontSize: 18 }}>+</button>
                          <button onClick={(e) => { e.stopPropagation(); handleUpdateBalance(u.id, -100); }} className="tap" style={{ width: 32, height: 32, borderRadius: 8, background: `${T.red}20`, color: T.red, border: "none", fontSize: 18 }}>-</button>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedUserId === u.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                          <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 15, paddingTop: 15 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: T.sub, marginBottom: 10 }}>آخر الطلبات لهذا المستخدم:</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto", paddingRight: 5 }}>
                              {regularOrders.filter(o => o.userId === u.id).length === 0 ? (
                                <div style={{ fontSize: 10, color: T.sub, textAlign: "center" }}>لا توجد طلبات سابقة</div>
                              ) : regularOrders.filter(o => o.userId === u.id).map(o => (
                                <div key={o.id} style={{ background: T.bg, padding: 8, borderRadius: 10, fontSize: 10 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                    <span style={{ fontWeight: 800 }}>{o.name}</span>
                                    <span style={{ color: o.status === "completed" ? T.green : o.status === "rejected" ? T.red : T.orange }}>{o.status === "completed" ? "مكتمل" : o.status === "rejected" ? "مرفوض" : "قيد المعالجة"}</span>
                                  </div>
                                  <div style={{ fontSize: 9, color: T.sub }}>{o.date} — {o.amount}</div>
                                </div>
                              ))}
                            </div>
                            
                            <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 15, paddingTop: 15, display: "flex", gap: 10 }}>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setModalType("message"); setModalData({userId: u.id, email: u.email}); }}
                                className="tap" 
                                style={{ flex: 1, padding: "8px 15px", borderRadius: 10, background: T.accent, color: "white", fontSize: 11, border: "none", fontWeight: 800 }}
                              >إرسال تنبيه 🔔</button>
                              
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "orders" && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {activeOrders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: T.sub }}>
                    <div style={{ fontSize: 40, marginBottom: 15 }}>📦</div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>لا توجد طلبات نشطة</div>
                    <div style={{ fontSize: 12, color: T.sub }}>كل الطلبات تمت معالجتها بنجاح</div>
                  </div>
                ) : activeOrders.map(o => (
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
                        { l: "مرفوض", s: 3, c: T.red, status: "rejected" },
                        { l: "اكتمل", s: 3, c: "#10B981" }
                      ].map(st => (
                        <button 
                          key={st.l}
                          onClick={() => onUpdateOrder && onUpdateOrder(o.id, { 
                            stage: st.s, 
                            status: st.status || (st.s === 3 ? "completed" : "active") 
                          })}
                          style={{ 
                            flex: 1, padding: "8px 4px", fontSize: 10, borderRadius: 8, 
                            background: (o.status === st.status || (o.stage === st.s && !st.status)) ? st.c : T.surface,
                            color: (o.status === st.status || (o.stage === st.s && !st.status)) ? "white" : T.sub,
                            border: `1px solid ${(o.status === st.status || (o.stage === st.s && !st.status)) ? st.c : T.border}`,
                            fontWeight: 800
                          }}
                        >
                          {st.l}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { setModalType("reject"); setModalData(o); }} style={{ flex: 1, padding: 12, borderRadius: 12, background: `${T.red}15`, color: T.red, border: `1px solid ${T.red}30`, fontSize: 12, fontWeight: 800 }}>رفض مع توضيح السبب 🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {regularOrders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: T.sub }}>
                    <div style={{ fontSize: 40, marginBottom: 15 }}>📜</div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>لا يوجد سجل طلبات</div>
                  </div>
                ) : regularOrders.map(o => (
                  <div key={o.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 18, opacity: (o.status === "completed" || o.status === "rejected") ? 0.7 : 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: T.sub }}>{o.id}</div>
                      <div style={{ 
                        fontSize: 9, padding: "4px 10px", borderRadius: 8, fontWeight: 800,
                        background: o.status === "completed" ? `${T.green}15` : o.status === "rejected" ? `${T.red}15` : `${T.orange}15`,
                        color: o.status === "completed" ? T.green : o.status === "rejected" ? T.red : T.orange
                      }}>
                        {o.status === "completed" ? "مكتمل" : o.status === "rejected" ? "مرفوض" : "قيد المعالجة"}
                      </div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 4 }}>{o.name || o.service}</div>
                    <div style={{ fontSize: 11, color: T.accent, marginBottom: 6 }}>المستخدم: {o.userEmail}</div>
                    <div style={{ fontSize: 10, color: T.sub, marginBottom: 12 }}>التاريخ: {o.date}</div>
                    
                    <div style={{ background: T.bg, padding: 12, borderRadius: 12, fontSize: 11 }}>
                      {Object.entries(o.details || {}).map(([k, v]: any) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: T.sub }}>{k}:</span>
                          <span style={{ color: T.text }}>{String(v)}</span>
                        </div>
                      ))}
                      {o.adminNote && (
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed rgba(255,255,255,0.1)", color: T.red }}>
                          <b>سبب الرفض:</b> {o.adminNote}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "topups" && (
            <motion.div key="topups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                 {pendingTopups.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <div style={{ fontSize: 40, marginBottom: 15 }}>💰</div>
                      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 5 }}>طلبات الشحن</div>
                      <div style={{ fontSize: 12, color: T.sub }}>لا توجد طلبات معلقة حالياً</div>
                    </div>
                 ) : (
                   pendingTopups.map(req => (
                     <div key={req.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ fontSize: 14, fontWeight: 900, color: T.green }}>شحن: £{req.amount}</div>
                            <button 
                              onClick={() => handleRejectDeposit(req)} 
                              className="tap"
                              style={{ 
                                padding: "3px 8px", fontSize: 10, borderRadius: 6, 
                                background: T.red + "20", color: T.red, border: `1px solid ${T.red}40`, fontWeight: 900 
                              }}
                            >
                              مرفوض ❌
                            </button>
                          </div>
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
                {pendingTickets.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: T.sub }}>
                    <div style={{ fontSize: 40, marginBottom: 15 }}>💬</div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>لا توجد تذاكر دعم نشطة</div>
                    <div style={{ fontSize: 12, color: T.sub }}>تم الرد على جميع التذاكر</div>
                  </div>
                ) : (
                  pendingTickets.map(s => (
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
                      <button onClick={() => { setModalType("reply"); setModalData(s); }} className="tap" style={{ width: "100%", padding: 12, borderRadius: 12, background: T.accent, color: "white", fontWeight: 800, border: "none", fontSize: 13 }}>{s.status === "open" ? "الرد على التذكرة ⚡" : "تعديل الرد"}</button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Admin Modal System */}
      <AnimatePresence>
        {modalType && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} 
               animate={{ scale: 1, opacity: 1 }} 
               exit={{ scale: 0.9, opacity: 0 }} 
               style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 24, padding: 25, width: "100%", maxWidth: 400 }}
             >
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                 <h3 style={{ fontSize: 18, fontWeight: 900 }}>
                   {modalType === "message" ? "إرسال تنبيه مباشر 🔔" : 
                    modalType === "reject" ? "توضيح سبب الرفض 🗑️" : 
                    modalType === "balance" ? "تعديل رصيد المستخدم 💰" : "الرد على تذكرة دعم 💬"}
                 </h3>
                 <button onClick={closeModals} style={{ background: "transparent", border: "none", color: T.sub, fontSize: 20, cursor: "pointer" }}>✕</button>
               </div>

               <p style={{ fontSize: 11, color: T.sub, marginBottom: 15 }}>
                 {modalType === "message" ? `أرسل رسالة فورية تظهر للمستخدم (${modalData?.email})` : 
                  modalType === "reject" ? `سيتم رفض الطلب وإعادة المبلغ للمستخدم. يرجى توضيح السبب:` : 
                  modalType === "balance" ? `تعديل رصيد المستخدم (${modalData?.name})` : `اكتب ردك على استفسار المستخدم:`}
               </p>

               {modalType === "balance" ? (
                 <input 
                   type="number" 
                   value={modalInput === "" && modalData?.balance !== undefined ? modalData.balance : modalInput}
                   onChange={(e) => setModalInput(e.target.value)}
                   placeholder="أدخل المبلغ هنا..."
                   style={{ width: "100%", padding: 15, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, color: "white", fontSize: 14, marginBottom: 20, outline: "none", textAlign: "center" }}
                 />
               ) : (
                 <textarea 
                   value={modalInput}
                   onChange={(e) => setModalInput(e.target.value)}
                   placeholder="اكتب رسالتك هنا..."
                   rows={4}
                   style={{ width: "100%", padding: 15, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, color: "white", fontSize: 14, marginBottom: 20, outline: "none", resize: "none" }}
                 />
               )}

               <div style={{ display: "flex", gap: 10 }}>
                 <button 
                   disabled={submitting}
                   onClick={() => {
                     if (modalType === "message") handleSendDirectMessageSubmit();
                     if (modalType === "reject") handleRejectOrderSubmit();
                     if (modalType === "balance") handleSetBalance();
                     if (modalType === "reply") handleReplyTicket();
                   }}
                   style={{ flex: 2, padding: 14, borderRadius: 14, background: T.accent, color: "white", fontWeight: 900, border: "none", fontSize: 14, opacity: submitting ? 0.5 : 1 }}
                 >
                   {submitting ? "جاري المعالجة..." : "تأكيد وإرسال ✅"}
                 </button>
                 <button onClick={closeModals} style={{ flex: 1, padding: 14, borderRadius: 14, background: "rgba(255,255,255,0.05)", color: "white", fontWeight: 800, border: `1px solid ${T.border}`, fontSize: 14 }}>إلغاء</button>
               </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
