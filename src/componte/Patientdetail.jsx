// src/pages/PatientDetail.jsx
import  { useState } from "react";
import { Avatar, TypeBadge, StatutBadge, Card, Btn, Modal, Confirm, EmptyState, StatCard } from "./Ui";
import SeanceForm from "./Seanceform";
import { formatDA, formatDate, calcAge, TYPE_ICON, formatDateTime, isFutureDate } from "../Utils";
import { addSeance, updateSeance, deleteSeance, updatePatient } from "../firebase/config";

function InfoChip({ label, value, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--slate-400)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: accent || "var(--slate-700)" }}>{value || "—"}</span>
    </div>
  );
}

export default function PatientDetail({ patient, seances, onBack, onEditPatient, toast }) {
  const pSeances = seances.filter((s) => s.patientId === patient.id).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const [showForm, setShowForm]   = useState(false);
  const [editSeance, setEditSeance] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [loading, setLoading]     = useState(false);

  const getVersement = (s) => {
    if (s.versements && s.versements.length > 0) return s.versements.reduce((acc, v) => acc + Number(v.montant || 0), 0);
    return s.versement !== undefined && s.versement !== "" ? Number(s.versement) : (s.statut === "payé" ? Number(s.prix || 0) : 0);
  };
  const getImpaye = (s) => Math.max(0, Number(s.prix || 0) - getVersement(s));

  const totalPaye   = pSeances.reduce((n, s) => n + getVersement(s), 0);
  const totalImpaye = pSeances.reduce((n, s) => n + getImpaye(s), 0);
  const age = calcAge(patient.dateNaissance);

  async function saveSeance(data) {
    setLoading(true);
    try {
      const { prochainRdv, ...seanceData } = data;
      
      if (editSeance) {
        await updateSeance(editSeance.id, seanceData);
        toast("Séance modifiée");
      } else {
        await addSeance(seanceData);
        toast("Séance ajoutée");
      }

      // Update the patient's next appointment if it was modified in the form
      if (prochainRdv !== patient.prochainRdv) {
        await updatePatient(patient.id, { prochainRdv: prochainRdv || "" });
      }

      setShowForm(false);
      setEditSeance(null);
    } catch (err) {
      toast("Erreur : " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setLoading(true);
    try {
      await deleteSeance(id);
      toast("Séance supprimée", "error");
      setConfirmDel(null);
    } catch (err) {
      toast("Erreur : " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in">
      {/* Back */}
      <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--slate-500)", fontSize: 13, fontWeight: 500, marginBottom: 20, padding: "6px 0", cursor: "pointer" }}>
        ← Retour aux patients
      </button>

      {/* Patient header */}
      <Card style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
          <Avatar prenom={patient.prenom} nom={patient.nom} size={64} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>{patient.prenom} {patient.nom}</h2>
              {patient.sexe && (
                <span style={{ fontSize: 11, background: patient.sexe === "F" ? "#fce7f3" : "#dbeafe", color: patient.sexe === "F" ? "#9d174d" : "#1e40af", padding: "2px 10px", borderRadius: "var(--radius-full)", fontWeight: 600 }}>
                  {patient.sexe === "F" ? "Femme" : "Homme"}
                </span>
              )}

            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <InfoChip label="Téléphone"   value={patient.telephone} />
              {age && <InfoChip label="Âge" value={`${age} ans`} />}
              {patient.dateNaissance && <InfoChip label={String(patient.dateNaissance).length === 4 ? "Né(e) en" : "Né(e) le"} value={formatDate(patient.dateNaissance)} />}
              {patient.allergies && <InfoChip label="Allergies" value={patient.allergies} accent="var(--red-600)" />}
              {isFutureDate(patient.prochainRdv) && <InfoChip label="Prochain RDV" value={formatDateTime(patient.prochainRdv)} accent="#1d4ed8" />}
            </div>
            {patient.notes && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--amber-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--amber-100)", fontSize: 13, color: "var(--amber-700)" }}>
                📌 {patient.notes}
              </div>
            )}
          </div>
          <Btn variant="secondary" size="sm" onClick={() => onEditPatient(patient)}>Modifier</Btn>
        </div>
      </Card>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard icon="🗓" label="Séances totales"   value={pSeances.length}    accent="teal" />
        <StatCard icon="✅" label="Montant payé"       value={formatDA(totalPaye)}   accent="teal" />
        <StatCard icon="⏳" label="Reste à payer"      value={formatDA(totalImpaye)} accent={totalImpaye > 0 ? "red" : "teal"} />
        {pSeances[0] && <StatCard icon="📅" label="Dernière visite" value={formatDate(pSeances[0].date)} accent="blue" />}
        <StatCard icon="⏰" label="Prochain RDV" value={isFutureDate(patient.prochainRdv) ? formatDateTime(patient.prochainRdv) : "Aucun"} accent={isFutureDate(patient.prochainRdv) ? "blue" : "teal"} />
      </div>

      {/* Header séances */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Historique des séances</h3>
        <Btn variant="primary" size="sm" onClick={() => { setEditSeance(null); setShowForm(true); }}>+ Nouvelle séance</Btn>
      </div>

      {/* Timeline */}
      {pSeances.length === 0 ? (
        <EmptyState icon="🗓" title="Aucune séance" sub="Enregistrez la première séance de ce patient."
          action={<Btn variant="primary" onClick={() => setShowForm(true)}>+ Nouvelle séance</Btn>} />
      ) : (
        <div style={{ position: "relative", paddingLeft: 28 }}>
          <div style={{ position: "absolute", left: 11, top: 14, bottom: 14, width: 2, background: "var(--slate-200)", borderRadius: 2 }} />
          {pSeances.map((s, i) => (
            <div key={s.id} className="fade-in" style={{ position: "relative", marginBottom: 12, animationDelay: `${i * 0.04}s` }}>
              <div style={{ position: "absolute", left: -17, top: 16, width: 12, height: 12, borderRadius: "50%", background: s.statut === "payé" ? "var(--teal-500)" : s.statut === "annulé" ? "var(--slate-300)" : "var(--amber-400)", border: "2px solid white", zIndex: 1 }} />
              <Card style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontSize: 16 }}>{TYPE_ICON[s.type] || "🦷"}</span>
                      <TypeBadge type={s.type} />
                      {s.dent && <span style={{ fontSize: 11, background: "var(--slate-100)", color: "var(--slate-600)", padding: "2px 8px", borderRadius: "var(--radius-sm)", fontWeight: 500 }}>Dent {s.dent}</span>}
                      <StatutBadge statut={s.statut} />
                    </div>
                    <div style={{ fontSize: 12, color: "var(--slate-400)", marginBottom: s.notes ? 6 : 0 }}>
                      {formatDate(s.date)}
                    </div>
                    {s.notes && <div style={{ fontSize: 13, color: "var(--slate-600)", lineHeight: 1.55 }}>{s.notes}</div>}
                    {s.versements && s.versements.length > 0 && (
                      <div style={{ marginTop: 8, fontSize: 12, color: "var(--slate-500)", background: "var(--slate-50)", padding: "6px 10px", borderRadius: "var(--radius-sm)" }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Versements :</div>
                        {s.versements.map((v, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 2 }}>
                            <span>{formatDate(v.date)}</span>
                            <span style={{ fontWeight: 600, color: "var(--teal-600)" }}>{formatDA(v.montant || 0)}</span>
                            {v.note && <span style={{ fontStyle: "italic", color: "var(--slate-400)" }}>- {v.note}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {s.prix && <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>{formatDA(s.prix)}</span>}
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setEditSeance(s); setShowForm(true); }}
                        style={{ width: 30, height: 30, borderRadius: "var(--radius-md)", background: "var(--slate-100)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}
                        title="Modifier">✏️</button>
                      <button onClick={() => setConfirmDel(s.id)}
                        style={{ width: 30, height: 30, borderRadius: "var(--radius-md)", background: "var(--red-50)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}
                        title="Supprimer">🗑</button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editSeance ? "Modifier la séance" : "Nouvelle séance"} onClose={() => { setShowForm(false); setEditSeance(null); }}>
          <SeanceForm patientId={patient.id} initial={editSeance} patientProchainRdv={patient.prochainRdv} onSave={saveSeance} onCancel={() => { setShowForm(false); setEditSeance(null); }} loading={loading} />
        </Modal>
      )}
      {confirmDel && (
        <Confirm message="Supprimer cette séance ? Cette action est irréversible." onConfirm={() => handleDelete(confirmDel)} onCancel={() => setConfirmDel(null)} />
      )}
    </div>
  );
}