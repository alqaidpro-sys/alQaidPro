import React from "react";
import { G } from "../data";

export function PageHeader({ title, subtitle, onBack }: { title: string, subtitle?: string, onBack?: () => void }) {
  return (
    <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 12 }}>
      {onBack && (
        <button className="btn" onClick={onBack} style={{
          width: 38, height: 38, borderRadius: 12,
          background: G.card, border: `1px solid ${G.cardBorder}`,
          color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
        }}>←</button>
      )}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: G.text, fontFamily: G.font }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 11, color: G.sub, letterSpacing: 1, fontFamily: G.font, marginTop: 2 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

export function BalanceBadge({ compact }: { compact?: boolean }) {
  return (
    <div style={{
      background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)",
      borderRadius: compact ? 12 : 18, padding: compact ? "10px 16px" : "16px 20px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div>
        <div style={{ fontSize: 10, color: G.sub, marginBottom: 3 }}>الرصيد المتاح</div>
        <div style={{ fontSize: compact ? 22 : 28, fontWeight: 900, color: G.text, fontFamily: G.font, letterSpacing: -1 }}>
          £<span style={{ color: G.blue }}>5,000</span>
        </div>
      </div>
      <div style={{
        width: compact ? 36 : 46, height: compact ? 36 : 46, borderRadius: 12,
        background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: compact ? 18 : 22,
      }}>💼</div>
    </div>
  );
}

export function InfoBanner({ icon, title, text, color }: { icon: string, title: string, text: string, color: string }) {
  return (
    <div style={{
      background: `linear-gradient(135deg,${color}18,${color}08)`,
      border: `1px solid ${color}30`, borderRadius: 16, padding: "14px 16px",
      display: "flex", gap: 12, alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 4, fontFamily: G.font }}>{title}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, fontFamily: G.font }}>{text}</div>
      </div>
    </div>
  );
}

export function PrimaryBtn({ label, onClick, color = G.blue, icon }: { label: string, onClick: () => void, color?: string, icon?: React.ReactNode }) {
  return (
    <button className="btn" onClick={onClick} style={{
      width: "100%", padding: "15px",
      background: `linear-gradient(135deg,${color},${color}cc)`,
      borderRadius: 16, color: "#fff",
      fontSize: 15, fontWeight: 700, fontFamily: G.font,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      boxShadow: `0 4px 20px ${color}40`,
    }}>
      {icon && <span>{icon}</span>}{label}
    </button>
  );
}
