// src/components/SeanceForm.jsx
import  { useState } from "react";
import { FormRow, Btn } from "./Ui";
import { TYPES_SEANCE, todayISO } from "../Utils";

const EMPTY = { date: todayISO(), heure: "09:00", type: "Consultation", dent: "", notes: "", prix: "", versement: "", statut: "impayé" };

export default function SeanceForm({ patientId, initial, onSave, onCancel, loading }) {
  const [f, setF] = useState(initial ? { ...EMPTY, ...initial } : { ...EMPTY, patientId });
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
      const versement = Number(f.versement || 0);
      const statut = versement >= prix && prix > 0 ? "payé" : "impayé";
      onSave({ ...f, patientId: patientId || f.patientId, statut });
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <FormRow label="Date" required>
          <input type="date" value={f.date} onChange={(e) => set("date", e.target.value)}
            style={{ borderColor: errors.date ? "var(--red-400)" : "" }} />
          {errors.date && <div style={{ fontSize: 11, color: "var(--red-500)", marginTop: 3 }}>{errors.date}</div>}
        </FormRow>
        <FormRow label="Heure">
          <input type="time" value={f.heure} onChange={(e) => set("heure", e.target.value)} />
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <FormRow label="Prix (DA)">
          <input type="number" value={f.prix} onChange={(e) => set("prix", e.target.value)} placeholder="3500" min={0} step={100} />
        </FormRow>
        <FormRow label="Versement (DA)">
          <input type="number" value={f.versement} onChange={(e) => set("versement", e.target.value)} placeholder="0" min={0} step={100} />
        </FormRow>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--slate-100)", marginTop: 8 }}>
        <Btn variant="secondary" onClick={onCancel} type="button">Annuler</Btn>
        <Btn variant="primary" type="submit" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer la séance"}</Btn>
      </div>
    </form>
  );
}