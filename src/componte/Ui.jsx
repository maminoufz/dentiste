// src/components/UI.jsx
import  { useEffect, useRef } from "react";
import { getAvatarColors, getInitials, TYPE_COLORS, STATUT_STYLES } from "../Utils";

// ── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ prenom = "", nom = "", size = 40, style = {} }) {
  const [bg, col] = getAvatarColors(prenom, nom);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color: col,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 600,
      fontFamily: "var(--font-display)",
      flexShrink: 0, letterSpacing: 0.5,
      ...style,
    }}>
      {getInitials(prenom, nom)}
    </div>
  );
}

// ── TypeBadge ───────────────────────────────────────────────────────────────
export function TypeBadge({ type, small = false }) {
  const [bg, col] = TYPE_COLORS[type] || ["#f1f5f9", "#475569"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: bg, color: col,
      padding: small ? "2px 7px" : "3px 10px",
      borderRadius: "var(--radius-full)",
      fontSize: small ? 11 : 12, fontWeight: 500, whiteSpace: "nowrap",
    }}>
      {type}
    </span>
  );
}

// ── StatutBadge ─────────────────────────────────────────────────────────────
export function StatutBadge({ statut }) {
  const s = STATUT_STYLES[statut] || STATUT_STYLES["impayé"];
  return (
    <span style={{
      background: s.bg, color: s.col,
      padding: "3px 10px", borderRadius: "var(--radius-full)",
      fontSize: 12, fontWeight: 600,
    }}>
      {s.label}
    </span>
  );
}

// ── Button ──────────────────────────────────────────────────────────────────
export function Btn({ children, variant = "primary", size = "md", onClick, disabled, style = {}, type = "button", icon }) {
  const sizes = { sm: { padding: "6px 12px", fontSize: 13 }, md: { padding: "9px 18px", fontSize: 14 }, lg: { padding: "12px 24px", fontSize: 15 } };
  const variants = {
    primary:   { background: "var(--teal-600)", color: "#fff" },
    secondary: { background: "white", color: "var(--slate-700)", boxShadow: "0 0 0 1.5px var(--slate-200)" },
    danger:    { background: "var(--red-50)",   color: "var(--red-600)", boxShadow: "0 0 0 1.5px var(--red-100)" },
    ghost:     { background: "transparent",     color: "var(--slate-600)" },
  };
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        fontWeight: 500, borderRadius: "var(--radius-md)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "all 0.18s",
        fontFamily: "var(--font-body)",
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
    >
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
      {children}
    </button>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "white", borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)", border: "1px solid rgba(0,0,0,0.05)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, accent = "teal" }) {
  const accents = {
    teal:  ["#edfaf5", "#0f7a5a"],
    amber: ["#fffbeb", "#d97706"],
    red:   ["#fef2f2", "#dc2626"],
    blue:  ["#eff6ff", "#2563eb"],
  };
  const [ibg, icol] = accents[accent] || accents.teal;
  return (
    <Card style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: "var(--radius-md)", background: ibg, color: icol, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--slate-500)", fontWeight: 500, marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--slate-800)", lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: "var(--slate-400)", marginTop: 4 }}>{sub}</div>}
        </div>
      </div>
    </Card>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 560, fullScreen = false }) {
  const overlayRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      style={{ position: "fixed", inset: 0, background: fullScreen ? "var(--slate-50)" : "rgba(15,23,42,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: fullScreen ? 0 : 16 }}
    >
      <div className={fullScreen ? "fade-in" : "scale-in"} style={{ background: "white", borderRadius: fullScreen ? 0 : "var(--radius-xl)", width: "100%", height: fullScreen ? "100%" : "auto", maxWidth: fullScreen ? "100%" : width, maxHeight: fullScreen ? "100%" : "92vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: fullScreen ? "none" : "var(--shadow-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: fullScreen ? "24px 40px" : "20px 24px", borderBottom: "1px solid var(--slate-100)", background: "white" }}>
          <h3 style={{ fontSize: fullScreen ? 24 : 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ width: fullScreen ? 40 : 32, height: fullScreen ? 40 : 32, borderRadius: fullScreen ? "50%" : "var(--radius-md)", background: "var(--slate-100)", color: "var(--slate-500)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", fontSize: fullScreen ? 20 : 18, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--slate-200)"} onMouseLeave={(e) => e.currentTarget.style.background = "var(--slate-100)"}>×</button>
        </div>
        <div style={{ padding: fullScreen ? "40px" : "20px 24px", overflowY: "auto", flex: 1, background: fullScreen ? "var(--slate-50)" : "white" }}>{children}</div>
      </div>
    </div>
  );
}

// ── FormRow ───────────────────────────────────────────────────────────────────
export function FormRow({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--slate-600)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
        {label} {required && <span style={{ color: "var(--red-500)" }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: "var(--slate-400)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ message, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  const colors = { success: ["#d1fae5", "#065f46"], error: ["#fee2e2", "#991b1b"], info: ["#dbeafe", "#1e40af"] };
  const [bg, col] = colors[type] || colors.success;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, background: bg, color: col, padding: "12px 20px", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", fontSize: 14, fontWeight: 500, animation: "toastIn 0.22s ease", display: "flex", alignItems: "center", gap: 10 }}>
      <span>{type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}</span>
      {message}
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, sub, action }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center", gap: 12 }}>
      <div style={{ fontSize: 48, opacity: 0.25 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--slate-700)" }}>{title}</div>
      {sub && <div style={{ fontSize: 14, color: "var(--slate-400)", maxWidth: 280 }}>{sub}</div>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

// ── SearchInput ───────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--slate-400)", fontSize: 16, pointerEvents: "none" }}>🔍</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ paddingLeft: 38, height: 42 }} />
    </div>
  );
}

// ── Confirm ───────────────────────────────────────────────────────────────────
export function Confirm({ message, onConfirm, onCancel }) {
  return (
    <Modal title="Confirmer la suppression" onClose={onCancel} width={400}>
      <p style={{ fontSize: 14, color: "var(--slate-600)", marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
      <div className="form-actions">
        <Btn variant="secondary" onClick={onCancel}>Annuler</Btn>
        <Btn variant="danger" onClick={onConfirm}>Supprimer</Btn>
      </div>
    </Modal>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
      <div style={{ width: 36, height: 36, border: "3px solid var(--slate-200)", borderTopColor: "var(--teal-500)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );
}