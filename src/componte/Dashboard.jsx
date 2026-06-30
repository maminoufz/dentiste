// src/pages/Dashboard.jsx

import { Card, StatCard, Avatar, TypeBadge } from "./Ui";
import { formatDA, formatDate, currentMonth } from "../Utils";

const MONTH_NAMES = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export default function Dashboard({ patients, seances, onSelectPatient }) {
  const thisMonth  = currentMonth();
  const getVersement = (s) => {
    if (s.versements && s.versements.length > 0) return s.versements.reduce((acc, v) => acc + Number(v.montant || 0), 0);
    return s.versement !== undefined && s.versement !== "" ? Number(s.versement) : (s.statut === "payé" ? Number(s.prix || 0) : 0);
  };
  const getImpaye = (s) => Math.max(0, Number(s.prix || 0) - getVersement(s));

  const totalImpaye = seances.reduce((n, s) => n + getImpaye(s), 0);
  const seancesMois = seances.filter((s) => s.date?.startsWith(thisMonth));
  const revenuMois  = seancesMois.reduce((n, s) => n + getVersement(s), 0);

  const recent = [...seances].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 7);

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
  const currentYear = new Date().getFullYear();

  // Calculate monthly revenue
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
        <StatCard icon="💰" label={`Revenus ${currentYear}`} value={formatDA(revenuAnnuel)} accent="teal" />
        <StatCard icon="⏳" label="Impayés"          value={formatDA(totalImpaye)} sub={`${impayes.length} patient(s)`} accent={totalImpaye > 0 ? "red" : "teal"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Revenus par mois */}
          <Card style={{ padding: 20, borderLeft: "3px solid var(--teal-500)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>📊 Revenus par mois ({currentYear})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {MONTH_NAMES.map((month, i) => {
                const amount = monthlyRevenue[i];
                // Hide future months that have 0 revenue to keep it clean
                if (amount === 0 && i > new Date().getMonth()) return null;
                const isCurrent = i === new Date().getMonth();
                return (
                  <div key={month} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: isCurrent ? "var(--teal-50)" : "transparent", borderRadius: "var(--radius-sm)" }}>
                    <span style={{ fontSize: 14, fontWeight: isCurrent ? 600 : 500, color: isCurrent ? "var(--teal-800)" : "var(--slate-600)" }}>
                      {month}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: amount > 0 ? 700 : 500, color: amount > 0 ? "var(--teal-600)" : "var(--slate-400)" }}>
                      {amount > 0 ? formatDA(amount) : "0 DA"}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
        </div>
      </div>
    </div>
  );
}