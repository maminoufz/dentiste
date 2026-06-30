// src/componte/Activite.jsx
import { Card, Avatar, TypeBadge, EmptyState } from "./Ui";
import { formatDA, formatDate, TYPE_ICON } from "../Utils";

export default function Activite({ patients, seances, onSelectPatient }) {
  // Sort seances by date descending and take the top 50 for recent activity
  const recent = [...seances].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 50);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Activité récente</h2>
        <p style={{ fontSize: 14, color: "var(--slate-500)", marginTop: 4 }}>
          Historique des {recent.length} dernières séances
        </p>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          icon="📝"
          title="Aucune activité"
          sub="Vous n'avez enregistré aucune séance pour le moment."
        />
      ) : (
        <Card style={{ overflow: "hidden" }}>
          {recent.map((s, i) => {
            const p = patients.find((x) => x.id === s.patientId);
            if (!p) return null;
            return (
              <div 
                key={s.id} 
                onClick={() => onSelectPatient(p)} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 16, 
                  padding: "16px 20px", 
                  borderBottom: i < recent.length - 1 ? "1px solid var(--slate-100)" : "none", 
                  cursor: "pointer",
                  transition: "background 0.15s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--slate-50)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ fontSize: 24, background: "white", width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", flexShrink: 0 }}>
                  {TYPE_ICON[s.type] || "🦷"}
                </div>
                
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar prenom={p.prenom} nom={p.nom} size={24} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--slate-800)" }}>{p.prenom} {p.nom}</span>
                    <span style={{ fontSize: 13, color: "var(--slate-400)", marginLeft: "auto" }}>{formatDate(s.date)}</span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                    <TypeBadge type={s.type} small />
                    {s.dent && <span style={{ fontSize: 12, color: "var(--slate-500)" }}>Dent {s.dent}</span>}
                    {s.notes && (
                      <span style={{ fontSize: 13, color: "var(--slate-500)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>
                        — {s.notes}
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                  {s.prix && <span style={{ fontSize: 15, fontWeight: 700, color: "var(--teal-700)" }}>{formatDA(s.prix)}</span>}
                  {s.statut === "payé" ? (
                    <span style={{ fontSize: 11, background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: "var(--radius-full)", fontWeight: 600 }}>Payé</span>
                  ) : s.statut === "impayé" ? (
                    <span style={{ fontSize: 11, background: "#fee2e2", color: "#991b1b", padding: "2px 8px", borderRadius: "var(--radius-full)", fontWeight: 600 }}>Impayé</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
