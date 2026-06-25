// src/utils.js

export const TYPES_SEANCE = [
  "Consultation",
  "Détartrage",
  "Obturation",
  "Extraction",
  "Couronne",
  "Prothèse",
  "Blanchiment",
  "Orthodontie",
  "Radiologie",
  "Chirurgie",
  "Autre",
];

export const GROUPES_SANGUINS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const TYPE_ICON = {
  Consultation: "🩺",
  Détartrage: "🪥",
  Obturation: "🦷",
  Extraction: "⚕️",
  Couronne: "👑",
  Prothèse: "🦷",
  Blanchiment: "✨",
  Orthodontie: "📐",
  Radiologie: "📡",
  Chirurgie: "🔬",
  Autre: "📋",
};

export const TYPE_COLORS = {
  Consultation:  ["#e0f2fe", "#0369a1"],
  Détartrage:    ["#d1fae5", "#065f46"],
  Obturation:    ["#fef3c7", "#92400e"],
  Extraction:    ["#fee2e2", "#991b1b"],
  Couronne:      ["#ede9fe", "#5b21b6"],
  Prothèse:      ["#fce7f3", "#9d174d"],
  Blanchiment:   ["#ecfdf5", "#047857"],
  Orthodontie:   ["#fdf4ff", "#86198f"],
  Radiologie:    ["#f1f5f9", "#334155"],
  Chirurgie:     ["#fff1f2", "#9f1239"],
  Autre:         ["#f8fafc", "#475569"],
};

export const STATUT_STYLES = {
  payé:    { bg: "#d1fae5", col: "#065f46", label: "Payé" },
  impayé:  { bg: "#fee2e2", col: "#991b1b", label: "Impayé" },
  annulé:  { bg: "#f1f5f9", col: "#475569", label: "Annulé" },
};

export const AVATAR_PALETTES = [
  ["#d1fae5", "#065f46"],
  ["#dbeafe", "#1e40af"],
  ["#ede9fe", "#5b21b6"],
  ["#fce7f3", "#9d174d"],
  ["#fef3c7", "#92400e"],
  ["#fee2e2", "#991b1b"],
];

export function formatDA(n) {
  if (!n && n !== 0) return "—";
  return Number(n).toLocaleString("fr-DZ") + " DA";
}

export function formatDate(d) {
  if (!d) return "—";
  try {
    if (String(d).length === 4 && !isNaN(Number(d))) return String(d);
    // Handle Firestore Timestamp objects
    const dateStr = typeof d === "string" && !d.includes("T") ? d + "T00:00:00" : d;
    const date = d?.toDate ? d.toDate() : new Date(dateStr);
    return date.toLocaleDateString("fr-DZ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

export function calcAge(dob) {
  if (!dob) return null;
  if (String(dob).length === 4 && !isNaN(Number(dob))) {
    return new Date().getFullYear() - parseInt(dob, 10);
  }
  const ms = Date.now() - new Date(dob).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25));
}

export function getAvatarColors(prenom = "", nom = "") {
  const idx = ((prenom.charCodeAt(0) || 0) + (nom.charCodeAt(0) || 0)) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

export function getInitials(prenom = "", nom = "") {
  return ((prenom[0] || "") + (nom[0] || "")).toUpperCase();
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}