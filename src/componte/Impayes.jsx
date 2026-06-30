// src/componte/Impayes.jsx
import { Card, Avatar, EmptyState } from "./Ui";
import { formatDA } from "../Utils";

export default function Impayes({ patients, seances, onSelectPatient }) {
  const getVersement = (s) => {
    if (s.versements && s.versements.length > 0) return s.versements.reduce((acc, v) => acc + Number(v.montant || 0), 0);
    return s.versement !== undefined && s.versement !== "" ? Number(s.versement) : (s.statut === "payé" ? Number(s.prix || 0) : 0);
  };
  const getImpaye = (s) => Math.max(0, Number(s.prix || 0) - getVersement(s));

  // Calculate unpaid balances per patient
  const impayes = patients
    .map((p) => {
      const patientSeances = seances.filter((s) => s.patientId === p.id);
      const montant = patientSeances.reduce((n, s) => n + getImpaye(s), 0);
      const lastVisit = patientSeances.sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0]?.date;
      return { patient: p, montant, lastVisit };
    })
    .filter((x) => x.montant > 0)
    .sort((a, b) => b.montant - a.montant);

  const totalImpaye = impayes.reduce((sum, item) => sum + item.montant, 0);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Paiements en attente</h2>
          <p style={{ fontSize: 14, color: "var(--slate-500)", marginTop: 4 }}>
            {impayes.length} patient(s) avec un solde débiteur
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, color: "var(--slate-500)", fontWeight: 600, textTransform: "uppercase" }}>Total des impayés</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--red-600)" }}>{formatDA(totalImpaye)}</div>
        </div>
      </div>

      {impayes.length === 0 ? (
        <EmptyState
          icon="🎉"
          title="Aucun impayé !"
          sub="Tous vos patients sont à jour dans leurs paiements."
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {impayes.map(({ patient: p, montant, lastVisit }, i) => (
            <div key={p.id} className="fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
              <Card
                onClick={() => onSelectPatient(p)}
                style={{ cursor: "pointer", transition: "all 0.18s", borderLeft: "4px solid var(--red-400)" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = ""; }}
              >
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar prenom={p.prenom} nom={p.nom} size={42} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{p.prenom} {p.nom}</div>
                        <div style={{ fontSize: 12, color: "var(--slate-400)", marginTop: 2 }}>{p.telephone || "Aucun numéro"}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ background: "var(--red-50)", padding: "10px 14px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--red-700)" }}>Reste à payer</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "var(--red-700)" }}>{formatDA(montant)}</span>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
