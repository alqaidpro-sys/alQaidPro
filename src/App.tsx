/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { G } from "./data";
import { AuthScreen } from "./components/AuthScreen";
import { HomeScreen } from "./components/HomeScreen";
import { ServicesScreen } from "./components/ServicesScreen";
import { HistoryScreen } from "./components/HistoryScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { ServiceDetailScreen } from "./components/ServiceDetailScreen";
import { BottomNav } from "./components/BottomNav";

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
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState("home");
  const [serviceDetail, setServiceDetail] = useState(null);
  const [balance, setBalance] = useState(5000);
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);

  const handleSetTab = (t: string, svcId: string | null = null) => { 
    setTab(t); 
    setServiceDetail(null); 
    setActiveServiceId(svcId);
  };

  const renderScreen = () => {
    if (serviceDetail) return (
      <motion.div key="detail" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }}>
        <ServiceDetailScreen service={serviceDetail} onBack={() => setServiceDetail(null)} />
      </motion.div>
    );

    const screens: any = {
      "home": <HomeScreen setTab={handleSetTab} balance={balance} />,
      "services": <ServicesScreen setServiceDetail={setServiceDetail} setTab={handleSetTab} />,
      "wallet": <WalletPage balance={balance} setBalance={setBalance} />,
      "logistics": <LogisticsPage balance={balance} setBalance={setBalance} onBack={() => { handleSetTab("services"); }} initialSel={activeServiceId} />,
      "ai_subs": <AISubsPage balance={balance} setBalance={setBalance} onBack={() => { handleSetTab("services"); }} initialSel={activeServiceId} />,
      "tv_subs": <TVSubsPage balance={balance} setBalance={setBalance} onBack={() => { handleSetTab("services"); }} initialSel={activeServiceId} />,
      "games": <GamesPage balance={balance} setBalance={setBalance} onBack={() => { handleSetTab("services"); }} />,
      "real_ai": <RealAIPage onBack={() => { handleSetTab("home"); }} initialTool={activeServiceId} />,
      "paypal": <PayPalPage balance={balance} setBalance={setBalance} onBack={() => { handleSetTab("services"); }} />,
      "binance": <BinancePage balance={balance} setBalance={setBalance} onBack={() => { handleSetTab("services"); }} />,
      "pyypl": <PyyplPage balance={balance} setBalance={setBalance} onBack={() => { handleSetTab("services"); }} />,
      "usd_transfer": <USDTransferPage balance={balance} setBalance={setBalance} onBack={() => { handleSetTab("services"); }} />,
      "history": <HistoryScreen />,
      "settings": <SettingsScreen />,
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {screens[tab] || <HomeScreen setTab={handleSetTab} balance={balance} />}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div dir="rtl" style={{ background: G.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative", overflowX: "hidden" }}>
      {/* Ambient blobs */}
      <div style={{ position: "fixed", top: "-10%", right: "-15%", width: 500, height: 500, background: "radial-gradient(circle,rgba(59,130,246,0.055),transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-15%", left: "-10%", width: 400, height: 400, background: "radial-gradient(circle,rgba(16,185,129,0.035),transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {!loggedIn ? (
          <AuthScreen onLogin={() => setLoggedIn(true)} />
        ) : (
          <>
            {renderScreen()}
            {(!serviceDetail && !["logistics", "ai_subs", "tv_subs", "games", "real_ai", "paypal", "binance", "pyypl", "usd_transfer"].includes(tab)) && <BottomNav tab={tab} setTab={handleSetTab} />}
            {/* Support FAB */}
            <button className="tap" style={{
              position: "fixed", bottom: 90, left: 20,
              width: 48, height: 48, borderRadius: 16,
              background: "linear-gradient(135deg,rgba(59,130,246,0.9),rgba(29,78,216,0.9))",
              backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              boxShadow: "0 8px 32px rgba(59,130,246,0.4)", cursor: "pointer", zIndex: 99,
              color: "white"
            }}>🎧</button>
          </>
        )}
      </div>
    </div>
  );
}
