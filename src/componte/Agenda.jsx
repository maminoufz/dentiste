// src/componte/Agenda.jsx
import { isFutureDate, formatDate } from "../Utils";
import { Card, Avatar, EmptyState } from "./Ui";

export default function Agenda({ patients, onSelectPatient }) {
  // Filter patients with future appointments and sort them by date ascending
  const upcoming = patients
    .filter((p) => p.prochainRdv && isFutureDate(p.prochainRdv))
    .sort((a, b) => new Date(a.prochainRdv).getTime() - new Date(b.prochainRdv).getTime());

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Agenda des rendez-vous</h2>
        <p style={{ fontSize: 13, color: "var(--slate-400)", marginTop: 2 }}>
          {upcoming.length} rendez-vous à venir
        </p>
      </div>

      {upcoming.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Aucun rendez-vous"
          sub="Vous n'avez aucun rendez-vous futur programmé pour le moment."
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {upcoming.map((p, i) => {
            const rdvDate = new Date(p.prochainRdv);
            const isToday = rdvDate.toDateString() === new Date().toDateString();
            
            return (
              <div key={p.id} className="fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                <Card
                  onClick={() => onSelectPatient(p)}
                  style={{ cursor: "pointer", transition: "all 0.18s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = ""; }}
                >
                  <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                    <Avatar prenom={p.prenom} nom={p.nom} size={46} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.prenom} {p.nom}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--slate-400)", marginTop: 2 }}>
                        {p.telephone || "Aucun numéro"}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ borderTop: "1px solid var(--slate-100)", padding: "12px 18px", background: isToday ? "var(--teal-50)" : "var(--slate-50)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>📅</span>
                      <span style={{ fontWeight: 600, color: isToday ? "var(--teal-700)" : "var(--slate-700)" }}>
                        {formatDate(p.prochainRdv)}
                      </span>
                    </div>
                    {isToday && (
                      <span style={{ fontSize: 11, background: "var(--teal-600)", color: "white", padding: "2px 8px", borderRadius: "var(--radius-full)", fontWeight: 600 }}>
                        Aujourd'hui
                      </span>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
