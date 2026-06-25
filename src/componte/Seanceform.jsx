// src/components/SeanceForm.jsx
import  { useState } from "react";
import { FormRow, Btn } from "./Ui";
import { TYPES_SEANCE, todayISO } from "../Utils";

const EMPTY = { date: todayISO(), type: "Consultation", dent: "", notes: "", prix: "", versements: [], statut: "impayé" };

export default function SeanceForm({ patientId, initial, onSave, onCancel, loading }) {
  const [f, setF] = useState(() => {
    const base = initial ? { ...EMPTY, ...initial } : { ...EMPTY, patientId };
    if (!base.versements) base.versements = [];
    if (base.versement && base.versements.length === 0) {
      base.versements = [{ date: base.date || todayISO(), montant: base.versement, note: "" }];
    }
    return base;
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  function validate() {
    const e = {};
    if (!f.date) e.date = "Obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(ev) {
    ev.preventDefault();
    if (validate()) {
      const prix = Number(f.prix || 0);
      const totalVersement = f.versements.reduce((sum, v) => sum + Number(v.montant || 0), 0);
      
      if (totalVersement > prix && prix > 0) {
        setErrors((e) => ({ ...e, versements: `Le total des versements ne peut pas dépasser le prix (${prix} DA)` }));
        return;
      }

      const statut = totalVersement >= prix && prix > 0 ? "payé" : "impayé";
      onSave({ ...f, patientId: patientId || f.patientId, statut, versement: "" });
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <FormRow label="Date" required>
          <input type="date" value={f.date} onChange={(e) => set("date", e.target.value)}
            style={{ borderColor: errors.date ? "var(--red-400)" : "" }} />
          {errors.date && <div style={{ fontSize: 11, color: "var(--red-500)", marginTop: 3 }}>{errors.date}</div>}
        </FormRow>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <FormRow label="Type d'acte">
          <select value={f.type} onChange={(e) => set("type", e.target.value)}>
            {TYPES_SEANCE.map((t) => <option key={t}>{t}</option>)}
          </select>
        </FormRow>
        <FormRow label="Dent (n°)">
          <input value={f.dent} onChange={(e) => set("dent", e.target.value)} placeholder="Ex: 36" />
        </FormRow>
      </div>
      <FormRow label="Notes / Observations">
        <textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} rows={3}
          placeholder="Description de l'acte, état de la dent, suites..." style={{ resize: "vertical" }} />
      </FormRow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <FormRow label="Prix (DA)">
          <input type="number" value={f.prix} onChange={(e) => set("prix", e.target.value)} placeholder="3500" min={0} step={100} />
        </FormRow>
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "var(--slate-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--slate-100)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: "var(--slate-700)", margin: 0 }}>Versements (DA)</h4>
          <button type="button" onClick={() => setF((p) => ({ ...p, versements: [...p.versements, { date: todayISO(), montant: "", note: "" }] }))}
            style={{ fontSize: 11, background: "white", border: "1px solid var(--slate-200)", padding: "2px 8px", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>
            + Ajouter
          </button>
        </div>
        
        {f.versements.length === 0 && <div style={{ fontSize: 12, color: "var(--slate-400)", fontStyle: "italic" }}>Aucun versement</div>}
        
        {f.versements.map((v, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <input type="date" value={v.date} onChange={(e) => {
              const nv = [...f.versements];
              nv[i].date = e.target.value;
              set("versements", nv);
            }} style={{ flex: 1 }} />
            <input type="number" value={v.montant} placeholder="Montant" min={0} step={100} onChange={(e) => {
              const nv = [...f.versements];
              nv[i].montant = e.target.value;
              set("versements", nv);
            }} style={{ flex: 1 }} />
            <input type="text" value={v.note || ""} placeholder="Note" onChange={(e) => {
              const nv = [...f.versements];
              nv[i].note = e.target.value;
              set("versements", nv);
            }} style={{ flex: 2 }} />
            <button type="button" onClick={() => {
              const nv = [...f.versements];
              nv.splice(i, 1);
              set("versements", nv);
            }} style={{ background: "none", border: "none", color: "var(--red-500)", cursor: "pointer" }}>✕</button>
          </div>
        ))}
        {errors.versements && <div style={{ fontSize: 11, color: "var(--red-500)", marginTop: 4 }}>{errors.versements}</div>}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--slate-100)", marginTop: 8 }}>
        <Btn variant="secondary" onClick={onCancel} type="button">Annuler</Btn>
        <Btn variant="primary" type="submit" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer la séance"}</Btn>
      </div>
    </form>
  );
}