// src/components/PatientForm.jsx
import { useState } from "react";
import "./PatientForm.css";

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
    if (!f.nom.trim()) e.nom = "Obligatoire";
    if (!f.prenom.trim()) e.prenom = "Obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(ev) {
    ev.preventDefault();
    if (validate()) onSave(f);
  }

  const field = (k, placeholder, type = "text", extraProps = {}) => (
    <>
      <input
        type={type}
        value={f[k]}
        onChange={(e) => set(k, e.target.value)}
        placeholder={placeholder}
        className={`pf-input${errors[k] ? " pf-input-error" : ""}`}
        {...extraProps}
      />
      {errors[k] && <span className="pf-error">{errors[k]}</span>}
    </>
  );

  return (
    // pf-shell: flex column that owns its own height. pf-body is the part
    // that scrolls internally (flex:1 + min-height:0), so the form never
    // gets clipped by a parent modal/page with overflow:hidden, and the
    // footer with the Save button stays pinned and reachable on mobile.
    <div className="pf-shell">
      <form id="patient-form" onSubmit={submit} noValidate className="pf-body">
        <div className="pf-grid pf-grid-2">
          <div className="pf-field">
            <label className="pf-label">
              Prénom <span className="pf-required">*</span>
            </label>
            {field("prenom", "Prénom")}
          </div>
          <div className="pf-field">
            <label className="pf-label">
              Nom <span className="pf-required">*</span>
            </label>
            {field("nom", "Nom")}
          </div>
        </div>

        <div className="pf-grid pf-grid-2">
          <div className="pf-field">
            <label className="pf-label">Téléphone</label>
            {field("telephone", "0555 12 34 56", "tel", { inputMode: "tel" })}
          </div>
          <div className="pf-field">
            <label className="pf-label">Année de naissance</label>
            <input
              type="number"
              inputMode="numeric"
              min="1900"
              max={new Date().getFullYear()}
              placeholder="Ex: 1980"
              value={f.dateNaissance ? String(f.dateNaissance).substring(0, 4) : ""}
              onChange={(e) => set("dateNaissance", e.target.value)}
              className="pf-input"
            />
          </div>
        </div>

        <div className="pf-grid pf-grid-half">
          <div className="pf-field">
            <label className="pf-label">Sexe</label>
            <select value={f.sexe} onChange={(e) => set("sexe", e.target.value)} className="pf-select">
              <option value="M">Homme</option>
              <option value="F">Femme</option>
            </select>
          </div>
        </div>

        <div className="pf-field">
          <label className="pf-label">Allergies / Médicaments</label>
          <input
            value={f.allergies}
            onChange={(e) => set("allergies", e.target.value)}
            placeholder="Aucune"
            className="pf-input"
          />
          <span className="pf-hint">Pénicilline, Latex, aspirine...</span>
        </div>



        {/* spacer so the last field clears the sticky footer */}
        <div className="pf-spacer" />
      </form>

      <div className="pf-footer">
        <button type="button" onClick={onCancel} className="pf-btn pf-btn-secondary">
          Annuler
        </button>
        <button type="submit" form="patient-form" disabled={loading} className="pf-btn pf-btn-primary">
          {loading ? "Enregistrement..." : "Enregistrer le patient"}
        </button>
      </div>
    </div>
  );
}