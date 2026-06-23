// src/pages/Dashboard.jsx

import { Card, StatCard, Avatar, TypeBadge } from "./Ui";
import { formatDA, formatDate, currentMonth } from "../Utils";

export default function Dashboard({ patients, seances, onSelectPatient }) {
  const thisMonth  = currentMonth();
  const getVersement = (s) => {
    if (s.versements && s.versements.length > 0) return s.versements.reduce((acc, v) => acc + Number(v.montant || 0), 0);
    return s.versement !== undefined && s.versement !== "" ? Number(s.versement) : (s.statut === "payé" ? Number(s.prix || 0) : 0);
  };
  const getImpaye = (s) => Math.max(0, Number(s.prix || 0) - getVersement(s));

  const totalPaye  = seances.reduce((n, s) => n + getVersement(s), 0);
  const totalImpaye = seances.reduce((n, s) => n + getImpaye(s), 0);
  const seancesMois = seances.filter((s) => s.date?.startsWith(thisMonth));
  const revenuMois  = seancesMois.reduce((n, s) => n + getVersement(s), 0);

  const recent = [...seances].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 7);

  // Bar chart data: séances par type
  const byType = {};
  seances.forEach((s) => { byType[s.type] = (byType[s.type] || 0) + 1; });
  const topTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCount = topTypes[0]?.[1] || 1;

  // Patients with unpaid bills
  const impayes = patients
    .map((p) => ({
      patient: p,
      montant: seances.filter((s) => s.patientId === p.id).reduce((n, s) => n + getImpaye(s), 0),
    }))
    .filter((x) => x.montant > 0)
    .sort((a, b) => b.montant - a.montant)
    .slice(0, 5);

  const today = new Date().toLocaleDateString("fr-DZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Tableau de bord</h2>
        <p style={{ fontSize: 13, color: "var(--slate-400)", marginTop: 2, textTransform: "capitalize" }}>{today}</p>
      </div>

      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon="👥" label="Patients total"   value={patients.length}       accent="teal" />
        <StatCard icon="🗓" label="Séances ce mois"  value={seancesMois.length}    sub={`${formatDA(revenuMois)} encaissés`} accent="blue" />
        <StatCard icon="💰" label="Revenu total"     value={formatDA(totalPaye)}   accent="teal" />
        <StatCard icon="⏳" label="Impayés"          value={formatDA(totalImpaye)} sub={`${impayes.length} patient(s)`} accent={totalImpaye > 0 ? "red" : "teal"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Activité récente */}
        <Card style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Activité récente</h3>
          {recent.length === 0
            ? <p style={{ fontSize: 13, color: "var(--slate-400)", textAlign: "center", padding: "20px 0" }}>Aucune séance</p>
            : recent.map((s, i) => {
                const p = patients.find((x) => x.id === s.patientId);
                if (!p) return null;
                return (
                  <div key={s.id} onClick={() => onSelectPatient(p)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < recent.length - 1 ? "1px solid var(--slate-100)" : "none", cursor: "pointer" }}>
                    <Avatar prenom={p.prenom} nom={p.nom} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.prenom} {p.nom}</div>
                      <div style={{ fontSize: 11, color: "var(--slate-400)" }}>{formatDate(s.date)}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <TypeBadge type={s.type} small />
                      {s.prix && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--slate-600)" }}>{formatDA(s.prix)}</span>}
                    </div>
                  </div>
                );
              })
          }
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Actes fréquents */}
          <Card style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Actes les plus fréquents</h3>
            {topTypes.length === 0
              ? <p style={{ fontSize: 13, color: "var(--slate-400)" }}>—</p>
              : topTypes.map(([type, count]) => (
                  <div key={type} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{type}</span>
                      <span style={{ fontSize: 12, color: "var(--slate-400)" }}>{count}</span>
                    </div>
                    <div style={{ height: 6, background: "var(--slate-100)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(count / maxCount) * 100}%`, background: "var(--teal-500)", borderRadius: "var(--radius-full)", transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                ))
            }
          </Card>

          {/* Impayés */}
          {impayes.length > 0 && (
            <Card style={{ padding: 20, borderLeft: "3px solid var(--red-400)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>⚠️ Paiements en attente</h3>
              {impayes.map(({ patient: p, montant }) => (
                <div key={p.id} onClick={() => onSelectPatient(p)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--slate-100)", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar prenom={p.prenom} nom={p.nom} size={28} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{p.prenom} {p.nom}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--red-600)" }}>{formatDA(montant)}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}