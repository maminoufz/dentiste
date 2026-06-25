// src/components/PatientForm.jsx
import  { useState } from "react";
import { FormRow, Btn } from "./Ui";

const EMPTY = { nom: "", prenom: "", telephone: "", dateNaissance: "", sexe: "M", allergies: "", notes: "" };

export default function PatientForm({ initial, onSave, onCancel, loading }) {
  const [f, setF] = useState(initial ? { ...EMPTY, ...initial } : EMPTY);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  function validate() {
    const e = {};
    if (!f.nom.trim())       e.nom       = "Obligatoire";
    if (!f.prenom.trim())    e.prenom    = "Obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(ev) {
    ev.preventDefault();
    if (validate()) onSave(f);
  }

  const field = (k, placeholder, type = "text") => (
    <div>
      <input
        type={type}
        value={f[k]}
        onChange={(e) => set(k, e.target.value)}
        placeholder={placeholder}
        style={{ borderColor: errors[k] ? "var(--red-400)" : "" }}
      />
      {errors[k] && <div style={{ fontSize: 11, color: "var(--red-500)", marginTop: 3 }}>{errors[k]}</div>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <FormRow label="Prénom" required>{field("prenom", "Prénom")}</FormRow>
        <FormRow label="Nom"    required>{field("nom",    "Nom")}</FormRow>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <FormRow label="Téléphone">{field("telephone", "0555 12 34 56")}</FormRow>
        <FormRow label="Année de naissance">
          <input 
            type="number" 
            min="1900" 
            max={new Date().getFullYear()} 
            placeholder="Ex: 1980" 
            value={f.dateNaissance ? String(f.dateNaissance).substring(0, 4) : ""} 
            onChange={(e) => set("dateNaissance", e.target.value)} 
          />
        </FormRow>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <FormRow label="Sexe">
          <select value={f.sexe} onChange={(e) => set("sexe", e.target.value)}>
            <option value="M">Homme</option>
            <option value="F">Femme</option>
          </select>
        </FormRow>
      </div>
      <FormRow label="Allergies / Médicaments" hint="Pénicilline, Latex, aspirine...">
        <input value={f.allergies} onChange={(e) => set("allergies", e.target.value)} placeholder="Aucune" />
      </FormRow>
      <FormRow label="Notes cliniques">
        <textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="Observations particulières..." style={{ resize: "vertical" }} />
      </FormRow>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--slate-100)", marginTop: 8 }}>
        <Btn variant="secondary" onClick={onCancel} type="button">Annuler</Btn>
        <Btn variant="primary" type="submit" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer le patient"}</Btn>
      </div>
    </form>
  );
}