// src/componte/Revenus.jsx
import { Card, StatCard } from "./Ui";
import { formatDA } from "../Utils";

const MONTH_NAMES = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export default function Revenus({ seances }) {
  const currentYear = new Date().getFullYear();
  
  const getVersement = (s) => {
    if (s.versements && s.versements.length > 0) return s.versements.reduce((acc, v) => acc + Number(v.montant || 0), 0);
    return s.versement !== undefined && s.versement !== "" ? Number(s.versement) : (s.statut === "payé" ? Number(s.prix || 0) : 0);
  };

  const monthlyRevenue = Array(12).fill(0);
  let revenuAnnuel = 0;
  
  seances.forEach((s) => {
    if (!s.date) return;
    const [y, m] = s.date.split("-");
    if (parseInt(y, 10) === currentYear) {
      const amount = getVersement(s);
      monthlyRevenue[parseInt(m, 10) - 1] += amount;
      revenuAnnuel += amount;
    }
  });

  const maxMonth = Math.max(...monthlyRevenue, 1); // Avoid division by zero

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Revenus par mois</h2>
          <p style={{ fontSize: 14, color: "var(--slate-500)", marginTop: 4 }}>Année {currentYear}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, color: "var(--slate-500)", fontWeight: 600, textTransform: "uppercase" }}>Total encaissé</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--teal-600)" }}>{formatDA(revenuAnnuel)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {MONTH_NAMES.map((month, i) => {
          const amount = monthlyRevenue[i];
          const isCurrent = i === new Date().getMonth();
          const isFuture = i > new Date().getMonth();
          
          if (isFuture && amount === 0) return null; // Hide future empty months
          
          const percentage = (amount / maxMonth) * 100;

          return (
            <Card key={month} style={{ padding: 20, borderLeft: isCurrent ? "4px solid var(--teal-500)" : "4px solid transparent", background: isCurrent ? "var(--teal-50)" : "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: isCurrent ? 700 : 600, color: isCurrent ? "var(--teal-800)" : "var(--slate-700)" }}>
                  {month}
                </span>
                <span style={{ fontSize: 18, fontWeight: 700, color: amount > 0 ? "var(--teal-600)" : "var(--slate-400)", fontFamily: "var(--font-display)" }}>
                  {formatDA(amount)}
                </span>
              </div>
              
              {/* Visual Bar */}
              <div style={{ height: 8, background: isCurrent ? "rgba(13, 148, 136, 0.15)" : "var(--slate-100)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${percentage}%`, background: isCurrent ? "var(--teal-500)" : "var(--slate-300)", borderRadius: "var(--radius-full)", transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)" }} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
