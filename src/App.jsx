// src/App.jsx
import  { useState, useEffect, useCallback } from "react";
import { listenPatients, listenSeances, updatePatient } from "./firebase/config";

import { Modal, Toast } from "./componte/Ui";
import Dashboard from "./componte/Dashboard";
import PatientDetail from "./componte/Patientdetail";
import PatientsList from "./componte/Patientslist";
import PatientForm from "./componte/Patientform";

const NAV = [
  { key: "dashboard", label: "Tableau de bord", icon: "▦" },
  { key: "patients",  label: "Patients",         icon: "👥" },
];

export default function App() {
  const [page, setPage]         = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [seances, setSeances]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [toast, setToast]       = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // ── Firebase real-time listeners ───────────────────────────────────────────
  useEffect(() => {
    const unsubP = listenPatients(
      (data) => {
        setPatients(data);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        showToast("Erreur Firebase: " + err.message, "error");
      }
    );
    const unsubS = listenSeances(
      (data) => setSeances(data),
      (err) => showToast("Erreur Seances: " + err.message, "error")
    );
    return () => { unsubP(); unsubS(); };
  }, [showToast]);

  function selectPatient(p) {
    // Refresh selected patient from latest data
    setSelected(p);
    setPage("patients");
  }

  function navClick(key) {
    setPage(key);
    if (key !== "patients") setSelected(null);
    setSidebarOpen(false); // Close sidebar on mobile after clicking nav
  }

  async function saveEditedPatient(data) {
    setSaving(true);
    try {
      await updatePatient(editModal.id, data);
      // Refresh selected if it's the same patient
      if (selected?.id === editModal.id) {
        setSelected((s) => ({ ...s, ...data }));
      }
      setEditModal(null);
      showToast("Patient modifié ✓");
    } catch (err) {
      showToast("Erreur : " + err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 48, height: 48, border: "3px solid var(--slate-200)", borderTopColor: "var(--teal-500)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <p style={{ fontSize: 14, color: "var(--slate-400)" }}>Connexion à Firebase…</p>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* ── Overlay for Mobile ── */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} 
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--slate-100)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--teal-600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🦷</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)" }}>DentaCare</div>
                <div style={{ fontSize: 10, color: "var(--slate-400)", fontWeight: 500 }}>Cabinet dentaire</div>
              </div>
            </div>
            {/* Close button for mobile */}
            <button 
              className="menu-btn" 
              style={{ width: 30, height: 30, marginBottom: 0, fontSize: 16, border: "none", boxShadow: "none" }}
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {NAV.map((n) => (
            <button key={n.key} onClick={() => navClick(n.key)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "none", textAlign: "left", fontSize: 14, fontWeight: page === n.key ? 600 : 400, background: page === n.key ? "var(--teal-50)" : "transparent", color: page === n.key ? "var(--teal-700)" : "var(--slate-500)", marginBottom: 4, cursor: "pointer", transition: "all 0.15s" }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {n.label}
              {n.key === "patients" && patients.length > 0 && (
                <span style={{ marginLeft: "auto", fontSize: 11, background: page === "patients" ? "var(--teal-100)" : "var(--slate-100)", color: page === "patients" ? "var(--teal-700)" : "var(--slate-400)", padding: "1px 8px", borderRadius: "var(--radius-full)", fontWeight: 600 }}>
                  {patients.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--slate-100)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
            <span style={{ fontSize: 11, color: "var(--slate-500)", fontWeight: 500 }}>Firebase connecté</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--slate-400)" }}>
            {patients.length} patients · {seances.length} séances
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main-content">
        <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
          ☰
        </button>
        {page === "dashboard" && (
          <Dashboard patients={patients} seances={seances} onSelectPatient={selectPatient} />
        )}
        {page === "patients" && !selected && (
          <PatientsList patients={patients} seances={seances} onSelectPatient={selectPatient} toast={showToast} />
        )}
        {page === "patients" && selected && (
          <PatientDetail
            patient={selected}
            seances={seances}
            onBack={() => setSelected(null)}
            onEditPatient={(p) => setEditModal(p)}
            toast={showToast}
          />
        )}
      </main>

      {/* Edit patient modal from detail view */}
      {editModal && (
        <Modal title="Modifier le patient" onClose={() => setEditModal(null)}>
          <PatientForm initial={editModal} onSave={saveEditedPatient} onCancel={() => setEditModal(null)} loading={saving} />
        </Modal>
      )}

      {/* Toast notification */}
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}