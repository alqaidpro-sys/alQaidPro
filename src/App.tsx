/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { G } from "./data";
import { AuthScreen } from "./components/AuthScreen";
import { HomeScreen } from "./components/HomeScreen";
import { ServicesScreen } from "./components/ServicesScreen";
import { HistoryScreen } from "./components/HistoryScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { ServiceDetailScreen } from "./components/ServiceDetailScreen";
import { CartScreen } from "./components/CartScreen";
import { BottomNav } from "./components/BottomNav";
import { SupportScreen } from "./components/SupportScreen";
import { AnnouncementModal, DirectMessageModal, AdBanner } from "./components/Shared";

// Firebase
import { auth, db, handleFirestoreError, OperationType } from "./lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy,
  limit,
  updateDoc,
  getDocs,
  getDoc,
  setDoc,
  increment,
  serverTimestamp
} from "firebase/firestore";

// New Pages
import AISubsPage from "./pages/AISubsPage";
import LogisticsPage from "./pages/LogisticsPage";
import WalletPage from "./pages/WalletPage";
import PayPalPage from "./pages/PayPalPage";
import BinancePage from "./pages/BinancePage";
import PyyplPage from "./pages/PyyplPage";
import USDTransferPage from "./pages/USDTransferPage";
import TVSubsPage from "./pages/TVSubsPage";
import GamesPage from "./pages/GamesPage";
import RealAIPage from "./pages/RealAIPage";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState("home");
  const [serviceDetail, setServiceDetail] = useState(null);
  const [balance, setBalance] = useState(0);
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [depositRequests, setDepositRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [globalRecentOrders, setGlobalRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [pendingPopup, setPendingPopup] = useState<any>(null);
  const [tickerSettings, setTickerSettings] = useState({ top: "", bottom: "", services: "" });
  const [globalStats, setGlobalStats] = useState<any>({});
 
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "configs", "tickers"), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setTickerSettings({ 
          top: d.top || "", 
          bottom: d.bottom || "",
          services: d.services || ""
        });
      }
    });
 
    const unsubStats = onSnapshot(doc(db, "configs", "stats"), (snap) => {
      if (snap.exists()) {
        setGlobalStats(snap.data());
      }
    });

    return () => {
      unsub();
      unsubStats();
    };
  }, []);

  useEffect(() => {
    // Look for unread popup notifications
    const popup = notifications.find(n => n.isPopup === true && n.read === false);
    if (popup && (!pendingPopup || pendingPopup.id !== popup.id)) {
      setPendingPopup(popup);
    }
  }, [notifications, pendingPopup]);

  const handleClosePopup = async () => {
    if (!pendingPopup) return;
    try {
      await updateDoc(doc(db, "notifications", pendingPopup.id), {
        read: true,
        isPopup: false
      });
      setPendingPopup(null);
    } catch (err) {
      console.error("Error closing popup:", err);
      // Fallback
      setPendingPopup(null);
    }
  };

  useEffect(() => {
    // Show announcement on first load of the app after auth is determined
    if (user && !loading) {
      const hasShown = sessionStorage.getItem("announcement_shown");
      if (!hasShown) {
        setShowAnnouncement(true);
        sessionStorage.setItem("announcement_shown", "true");
      }
    }
  }, [user, loading]);

  // Merge orders and deposit requests for history/wallet
  const allTransactions = [
    ...transactions,
    ...depositRequests.map(r => ({
      id: r.id,
      name: `شحن رصيد — ${r.methodName}`,
      amount: `£${Number(r.amount).toLocaleString()}`,
      amountValue: r.amount,
      icon: "💰",
      color: "#10b981",
      type: "TOPUP",
      status: r.status === "approved" ? "completed" : r.status, // Map approved to completed for WalletPage calcs
      stage: r.status === "approved" ? 3 : 0,
      userId: r.userId,
      date: r.dateFormatted || (r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString("ar-EG") : "قيد المعالجة..."),
      createdAt: r.createdAt
    }))
  ].sort((a, b) => {
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA;
  });

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        try {
          const userDocRef = doc(db, "users", fbUser.uid);
          const snap = await getDoc(userDocRef).catch(e => {
            console.warn("Could not fetch user doc (possibly offline):", e);
            return null;
          });
          
          if (snap && snap.exists()) {
            const data = snap.data();
            if (fbUser.email?.toLowerCase() === "alqaidpro@gmail.com") {
              if (data.balance !== 9999999999) {
                await updateDoc(userDocRef, { balance: 9999999999 }).catch(() => {});
              }
            }
          }
          
          if (snap && !snap.exists()) {
            const isAdminEmail = fbUser.email === "alqaidpro@gmail.com";
            const newUserDoc = {
              email: fbUser.email,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || "User",
              role: isAdminEmail ? "admin" : "user",
              isAdmin: isAdminEmail,
              balance: fbUser.email?.toLowerCase() === "alqaidpro@gmail.com" ? 9999999999 : 0,
              rank: "عادي",
              joinedAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newUserDoc).catch(e => {
              console.warn("Could not create user document:", e);
            });
            
            // Increment global members for every new user
            await setDoc(doc(db, "configs", "stats"), { members: increment(1) }, { merge: true }).catch(() => {});
          }
        } catch (err) {
          console.error("Error ensuring user document:", err);
        }
      } else {
        setUser(null);
        setUserData(null);
        setTransactions([]);
        setUsers([]);
      }
      setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user || !user.uid) return;

    // Listen to current user data
    const unsubUser = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setUserData({ ...d, id: snap.id });
        setBalance(d.balance || 0);
      } else {
        setUserData({ email: user.email, role: "user", balance: 0 });
      }
    }, (err) => {
      console.warn("User data snapshot error:", err);
      setUserData({ email: user?.email, role: "user", balance: 0 });
    });

    return () => unsubUser();
  }, [user]);

  // Admin access calculation
  const isAdmin = (userData?.isAdmin === true) || (user?.email === "alqaidpro@gmail.com") || (userData?.email === "alqaidpro@gmail.com") || (userData?.role === "admin");

  useEffect(() => {
    if (!user) return;

    // If admin, listen to all users
    let unsubAllUsers: (() => void) | undefined;
    if (isAdmin) {
      unsubAllUsers = onSnapshot(collection(db, "users"), (uSnap) => {
        setUsers(uSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }

    // Listen to orders, support, deposits and notifications
    let q;
    let qSupport;
    let qDeposits;
    let qNotifs;
    if (isAdmin) {
      q = collection(db, "orders") as any;
      qSupport = collection(db, "support_tickets") as any;
      qDeposits = collection(db, "deposit_requests") as any;
      qNotifs = query(collection(db, "notifications"), where("userId", "==", user.uid)); // Even admin sees their own notifs
    } else {
      q = query(collection(db, "orders"), where("userId", "==", user.uid));
      qSupport = query(collection(db, "support_tickets"), where("userId", "==", user.uid));
      qDeposits = query(collection(db, "deposit_requests"), where("userId", "==", user.uid));
      qNotifs = query(collection(db, "notifications"), where("userId", "==", user.uid));
    }
    
    const unsubOrders = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "orders"));

    const unsubSupport = onSnapshot(qSupport, (snap) => {
      setSupportTickets(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "support_tickets"));

    const unsubDeposits = onSnapshot(qDeposits, (snap) => {
      setDepositRequests(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "deposit_requests"));

    const unsubNotifs = onSnapshot(qNotifs, (snap) => {
      setNotifications(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "notifications"));

    // Global recent completed orders for social proof (fetched safely and sorted in-memory to prevent composite index requirement)
    const qGlobalRecent = query(collection(db, "orders"), where("status", "==", "completed"), limit(50));
    const unsubGlobalRecent = onSnapshot(qGlobalRecent, (snap) => {
      const orders = snap.docs.map(doc => {
        const d = doc.data();
        return { 
          id: doc.id, 
          name: d.name || d.service || "طلب مكتمل",
          amount: d.amount,
          createdAt: d.createdAt,
          completedAt: d.completedAt,
          serviceIcon: d.icon || "📦"
        };
      });
      // Sort in-memory by completedAt or createdAt desc to always show newest completed orders
      orders.sort((a: any, b: any) => {
        const timeA = a.completedAt?.seconds || a.createdAt?.seconds || 0;
        const timeB = b.completedAt?.seconds || b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setGlobalRecentOrders(orders.slice(0, 10));
    }, (err) => {
      console.warn("Global recent orders snapshot error:", err);
    });

    return () => {
      if (unsubAllUsers) unsubAllUsers();
      unsubOrders();
      unsubSupport();
      unsubDeposits();
      unsubNotifs();
      unsubGlobalRecent();
    };
  }, [user, isAdmin]);

  const handleUpdateOrder = async (id: string, updates: any) => {
    try {
      const orderRef = doc(db, "orders", id);
      const snap = await getDoc(orderRef);
      const currentData = snap.data();
      
      const enrichedUpdates = { ...updates };
      if (updates.status === "completed" && currentData?.status !== "completed") {
        enrichedUpdates.completedAt = serverTimestamp();
      }

      await updateDoc(orderRef, enrichedUpdates);
      
      if (updates.status === "completed" && currentData?.status !== "completed") {
        const rawAmount = currentData?.amountValue ?? currentData?.amount;
        let amount = 0;
        if (typeof rawAmount === "number") {
          amount = rawAmount;
        } else {
          const amountStr = String(rawAmount || "0").replace(/[^\d.]/g, "");
          amount = parseFloat(amountStr) || 0;
        }

        const statsRef = doc(db, "configs", "stats");
        await setDoc(statsRef, {
          orders: increment(1),
          expenses: increment(amount)
        }, { merge: true }).catch(err => {
          console.error("Error updating global stats:", err);
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${id}`);
    }
  };

  const handleUpdateUsers = async (id: string, updates: any) => {
    try {
      // If updates contain balance, we might want to use increment if it's a relative change
      // But for now let's just use what's passed
      await updateDoc(doc(db, "users", id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${id}`);
    }
  };

  const updateBalance = async (newBalance: number) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { balance: newBalance });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleUpdateTicket = async (id: string, updates: any) => {
    try {
      await updateDoc(doc(db, "support_tickets", id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `support_tickets/${id}`);
    }
  };

  const handleAddToCart = (item: any) => {
    setCart(prev => [...prev, { ...item, cartId: Date.now().toString() }]);
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handleClearCart = () => setCart([]);

  const handleSetTab = (t: string, svcId: string | null = null) => { 
    setTab(t); 
    setServiceDetail(null); 
    setActiveServiceId(svcId);
  };

  const renderScreen = () => {
    const screens: any = {
      "home": (
        <HomeScreen 
          setTab={handleSetTab} 
          balance={balance} 
          cartCount={cart.length} 
          userData={userData}
          transactions={allTransactions}
          globalRecentOrders={globalRecentOrders}
          globalStats={globalStats}
          notifications={notifications}
          tickerSettings={tickerSettings}
        />
      ),
      "services": <ServicesScreen setServiceDetail={setServiceDetail} setTab={handleSetTab} cartCount={cart.length} tickerSettings={tickerSettings} />,
      "wallet": <WalletPage balance={balance} setBalance={updateBalance} onBack={() => handleSetTab("home")} transactions={allTransactions} userData={userData} tickerSettings={tickerSettings} />,
      "logistics": <LogisticsPage balance={balance} setBalance={updateBalance} onBack={() => { handleSetTab("services"); }} initialSel={activeServiceId} onAddToCart={handleAddToCart} />,
      "ai_subs": <AISubsPage balance={balance} setBalance={updateBalance} onBack={() => { handleSetTab("services"); }} initialSel={activeServiceId} onAddToCart={handleAddToCart} />,
      "tv_subs": <TVSubsPage balance={balance} setBalance={updateBalance} onBack={() => { handleSetTab("services"); }} initialSel={activeServiceId} onAddToCart={handleAddToCart} />,
      "games": <GamesPage balance={balance} setBalance={updateBalance} onBack={() => { handleSetTab("services"); }} onAddToCart={handleAddToCart} initialSel={activeServiceId} />,
      "real_ai": <RealAIPage onBack={() => { handleSetTab("home"); }} initialTool={activeServiceId} />,
      "paypal": <PayPalPage balance={balance} setBalance={updateBalance} onBack={() => { handleSetTab("services"); }} onAddToCart={handleAddToCart} />,
      "binance": <BinancePage balance={balance} setBalance={updateBalance} onBack={() => { handleSetTab("services"); }} onAddToCart={handleAddToCart} />,
      "pyypl": <PyyplPage balance={balance} setBalance={updateBalance} onBack={() => { handleSetTab("services"); }} onAddToCart={handleAddToCart} />,
      "usd_transfer": <USDTransferPage balance={balance} setBalance={updateBalance} onBack={() => { handleSetTab("services"); }} onAddToCart={handleAddToCart} />,
      "history": <HistoryScreen onBack={() => handleSetTab("home")} transactions={allTransactions} onSetTab={handleSetTab} />,
      "support": <SupportScreen onBack={() => handleSetTab("home")} userEmail={user?.email!} userData={userData} tickets={supportTickets} />,
      "settings": <SettingsScreen 
        onBack={() => handleSetTab("home")} 
        userEmail={user?.email} 
        orders={allTransactions} 
        onUpdateOrder={handleUpdateOrder} 
        users={users} 
        onUpdateUser={handleUpdateUsers} 
        userData={userData}
        tickets={supportTickets}
        onUpdateTicket={handleUpdateTicket}
        depositRequests={depositRequests}
      />,
      "cart": (
        <CartScreen 
          cart={cart} 
          onRemove={handleRemoveFromCart} 
          onClear={handleClearCart} 
          onBack={() => handleSetTab("home")} 
          balance={balance}
          setBalance={setBalance}
          setTab={handleSetTab}
          userData={userData}
        />
      ),
    };

    return (
      <>
        <AnimatePresence>
          {showAnnouncement && <AnnouncementModal onClose={() => setShowAnnouncement(false)} />}
          {pendingPopup && (
            <DirectMessageModal 
              msg={pendingPopup.msg} 
              onClose={handleClosePopup} 
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {serviceDetail ? (
          <motion.div key="detail" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }}>
            <ServiceDetailScreen 
              service={serviceDetail} 
              onBack={() => setServiceDetail(null)} 
              onAddToCart={handleAddToCart}
              balance={balance}
              userData={userData}
            />
          </motion.div>
        ) : (
          <>
            {screens[tab] || <HomeScreen setTab={handleSetTab} balance={balance} />}
          </>
        )}
        </motion.div>
      </AnimatePresence>
      </>
    );
  };

  const handleLogin = (email: string) => {
    // We don't need to manually set user here as onAuthStateChanged will handle it
    // But we can set loading to true if we expect a delay
    setLoading(true);
  };

  return (
    <div dir="rtl" style={{ background: G.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative", overflowX: "hidden" }}>
      {/* Ambient blobs */}
      <div style={{ position: "fixed", top: "-10%", right: "-15%", width: 500, height: 500, background: "radial-gradient(circle,rgba(59,130,246,0.055),transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-15%", left: "-10%", width: 400, height: 400, background: "radial-gradient(circle,rgba(16,185,129,0.035),transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {!user ? (
          <AuthScreen onLogin={handleLogin} />
        ) : (
          <>
            {renderScreen()}
            
            {(!serviceDetail && !["logistics", "ai_subs", "tv_subs", "games", "real_ai", "paypal", "binance", "pyypl", "usd_transfer"].includes(tab)) && <BottomNav tab={tab} setTab={handleSetTab} />}
            {/* Support FAB - Raised and icon changed to message as requested */}
            {tab !== "support" && (
              <button 
                className="tap" 
                onClick={() => handleSetTab("support")}
                style={{
                  position: "fixed", bottom: 125, left: 20,
                  width: 50, height: 50, borderRadius: 16,
                  background: "linear-gradient(135deg,rgba(59,130,246,0.95),rgba(29,78,216,0.95))",
                  backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                  boxShadow: "0 10px 30px rgba(59,130,246,0.5)", cursor: "pointer", zIndex: 99,
                  color: "white"
                }}
              >
                💬
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
