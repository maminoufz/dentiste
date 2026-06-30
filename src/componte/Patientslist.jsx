// src/pages/PatientsList.jsx
import  { useState } from "react";
import { Avatar, TypeBadge, Card, Btn, Modal, Confirm, EmptyState, SearchInput } from "./Ui";
import PatientForm from "./Patientform";
import { formatDate, formatDA, calcAge } from "../Utils";
import { addPatient, updatePatient, deletePatient } from "../firebase/config";

function PatientCard({ patient, seances, onClick, onEdit, onDelete }) {
  const ps   = seances.filter((s) => s.patientId === patient.id);
  const last  = ps.sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0];
  const getVersement = (s) => {
    if (s.versements && s.versements.length > 0) return s.versements.reduce((acc, v) => acc + Number(v.montant || 0), 0);
    return s.versement !== undefined && s.versement !== "" ? Number(s.versement) : (s.statut === "payé" ? Number(s.prix || 0) : 0);
  };
  const getImpaye = (s) => Math.max(0, Number(s.prix || 0) - getVersement(s));
  const impaye = ps.reduce((n, s) => n + getImpaye(s), 0);
  const age   = calcAge(patient.dateNaissance);

  return (
    <Card
      style={{ cursor: "pointer", transition: "all 0.18s", overflow: "hidden" }}
      onClick={() => onClick(patient)}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = ""; }}
    >
      {impaye > 0 && <div style={{ height: 3, background: "linear-gradient(90deg, var(--amber-400), var(--red-400))" }} />}
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar prenom={patient.prenom} nom={patient.nom} size={46} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {patient.prenom} {patient.nom}
            </div>
            <div style={{ fontSize: 13, color: "var(--slate-400)", marginTop: 1 }}>
              {patient.telephone}
              {age && <span style={{ marginLeft: 8 }}>· {age} ans</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onEdit(patient)} style={{ width: 30, height: 30, borderRadius: "var(--radius-md)", background: "var(--slate-100)", border: "none", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }} title="Modifier">✏️</button>
            <button onClick={() => onDelete(patient)} style={{ width: 30, height: 30, borderRadius: "var(--radius-md)", background: "var(--red-50)", border: "none", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }} title="Supprimer">🗑</button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 11, background: "var(--slate-100)", color: "var(--slate-600)", padding: "3px 10px", borderRadius: "var(--radius-full)", fontWeight: 500 }}>
            🗓 {ps.length} séance{ps.length > 1 ? "s" : ""}
          </span>

          {patient.allergies && (
            <span style={{ fontSize: 11, background: "var(--amber-50)", color: "var(--amber-700)", padding: "3px 10px", borderRadius: "var(--radius-full)", fontWeight: 500 }}>
              ⚠️ Allergie
            </span>
          )}
          {impaye > 0 && (
            <span style={{ fontSize: 11, background: "#fee2e2", color: "#991b1b", padding: "3px 10px", borderRadius: "var(--radius-full)", fontWeight: 600, marginLeft: "auto" }}>
              Dû : {formatDA(impaye)}
            </span>
          )}
        </div>

        {last && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--slate-100)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--slate-400)" }}>Dernière visite · {formatDate(last.date)}</span>
            <TypeBadge type={last.type} small />
          </div>
        )}
      </div>
    </Card>
  );
}

export default function PatientsList({ patients, seances, onSelectPatient, toast }) {
  const [search, setSearch]       = useState("");
  const [showAdd, setShowAdd]     = useState(false);
  const [editP, setEditP]         = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [loading, setLoading]     = useState(false);

  const filtered = patients.filter((p) =>
    `${p.prenom} ${p.nom} ${p.telephone}`.toLowerCase().includes(search.toLowerCase())
  );

  async function savePatient(data) {
    setLoading(true);
    try {
      if (editP) {
        await updatePatient(editP.id, data);
        toast("Patient modifié ✓");
      } else {
        await addPatient(data);
        toast("Patient ajouté ✓");
      }
      setShowAdd(false);
      setEditP(null);
    } catch (err) {
      toast("Erreur : " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(p) {
    setLoading(true);
    try {
      await deletePatient(p.id);
      toast("Patient supprimé", "error");
      setConfirmDel(null);
    } catch (err) {
      toast("Erreur : " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Patients</h2>
          <p style={{ fontSize: 13, color: "var(--slate-400)", marginTop: 2 }}>{patients.length} patient{patients.length > 1 ? "s" : ""} enregistré{patients.length > 1 ? "s" : ""}</p>
        </div>
        <Btn variant="primary" onClick={() => setShowAdd(true)}>+ Nouveau patient</Btn>
      </div>

      <div style={{ marginBottom: 20 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher par nom ou téléphone…" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="👤" title={search ? "Aucun résultat" : "Aucun patient"}
          sub={search ? `Aucun patient ne correspond à "${search}"` : "Ajoutez votre premier patient pour commencer."}
          action={!search && <Btn variant="primary" onClick={() => setShowAdd(true)}>+ Nouveau patient</Btn>} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
          {filtered.map((p, i) => (
            <div key={p.id} className="fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
              <PatientCard patient={p} seances={seances} onClick={onSelectPatient}
                onEdit={(p) => { setEditP(p); setShowAdd(true); }}
                onDelete={setConfirmDel} />
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal fullScreen title={editP ? "Modifier le patient" : "Nouveau patient"} onClose={() => { setShowAdd(false); setEditP(null); }}>
          <div style={{ maxWidth: 700, margin: "0 auto", background: "white", padding: 40, borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--slate-200)" }}>
            <PatientForm initial={editP} onSave={savePatient} onCancel={() => { setShowAdd(false); setEditP(null); }} loading={loading} />
          </div>
        </Modal>
      )}
      {confirmDel && (
        <Confirm message={`Supprimer "${confirmDel.prenom} ${confirmDel.nom}" ? Ses séances ne seront pas supprimées.`}
          onConfirm={() => handleDelete(confirmDel)} onCancel={() => setConfirmDel(null)} />
      )}
    </div>
  );
}