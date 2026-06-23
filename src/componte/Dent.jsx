import React, { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// DENT.JSX — Schéma dentaire interactif (32 dents, adulte)
// Usage:
//   <DentChart value={dentData} onChange={setDentData} readOnly={false} />
//
// dentData format:
//   { "11": "saine", "16": "cariée", "36": "couronne", ... }
//   Clé = numéro FDI (11-18, 21-28, 31-38, 41-48)
//   Valeur = statut (voir STATUTS)
// ─────────────────────────────────────────────────────────────────────────────

// ── Statuts possibles ────────────────────────────────────────────────────────
const STATUTS = {
  saine:      { label: 'Saine',       couleur: '#ffffff', bordure: '#94a3b8', texte: '#334155', emoji: '' },
  cariée:     { label: 'Cariée',      couleur: '#fef08a', bordure: '#ca8a04', texte: '#713f12', emoji: '⚠' },
  obturée:    { label: 'Obturée',     couleur: '#bfdbfe', bordure: '#2563eb', texte: '#1e3a8a', emoji: '●' },
  couronne:   { label: 'Couronne',    couleur: '#ddd6fe', bordure: '#7c3aed', texte: '#3b0764', emoji: '♛' },
  extraite:   { label: 'Extraite',    couleur: '#fecaca', bordure: '#dc2626', texte: '#7f1d1d', emoji: '✕' },
  prothèse:   { label: 'Prothèse',   couleur: '#fed7aa', bordure: '#ea580c', texte: '#431407', emoji: '◈' },
  implant:    { label: 'Implant',     couleur: '#bbf7d0', bordure: '#15803d', texte: '#052e16', emoji: '⬛' },
  traitement: { label: 'En traitement', couleur: '#fde68a', bordure: '#d97706', texte: '#451a03', emoji: '✦' },
};

// ── Layout FDI — Quadrants ───────────────────────────────────────────────────
// Quadrant 1 (haut-droite patient = gauche écran) : 18→11
// Quadrant 2 (haut-gauche patient = droite écran) : 21→28
// Quadrant 3 (bas-gauche patient = droite écran)  : 31→38
// Quadrant 4 (bas-droite patient = gauche écran)  : 41→48

const Q1 = [18, 17, 16, 15, 14, 13, 12, 11]; // haut gauche écran
const Q2 = [21, 22, 23, 24, 25, 26, 27, 28]; // haut droite écran
const Q3 = [31, 32, 33, 34, 35, 36, 37, 38]; // bas droite écran
const Q4 = [48, 47, 46, 45, 44, 43, 42, 41]; // bas gauche écran

// Morphologie approximative par type de dent
function toothType(num) {
  const n = num % 10;
  if (n === 1 || n === 2) return 'incisive';
  if (n === 3)             return 'canine';
  if (n === 4 || n === 5) return 'prémolaire';
  return 'molaire'; // 6,7,8
}

// SVG path de la dent selon morphologie
function ToothShape({ type, w, h }) {
  const r = 4;
  if (type === 'incisive') {
    // Rectangle étroit arrondi en haut
    return (
      <path d={`M${r},0 Q${r},0 ${r},0 L${w - r},0 Q${w},0 ${w},${r} L${w},${h - r * 2} Q${w},${h} ${w - r},${h} L${r},${h} Q0,${h} 0,${h - r * 2} L0,${r} Q0,0 ${r},0`} />
    );
  }
  if (type === 'canine') {
    // Légèrement plus large, pointe en bas
    return (
      <path d={`M${r},0 L${w - r},0 Q${w},0 ${w},${r} L${w},${h - 6} Q${w / 2},${h} ${0},${h - 6} L0,${r} Q0,0 ${r},0`} />
    );
  }
  if (type === 'prémolaire') {
    // Légèrement trapézoïdal
    return (
      <path d={`M${r},0 L${w - r},0 Q${w},0 ${w},${r} L${w - 2},${h - r} Q${w - 2},${h} ${w - r - 2},${h} L${r + 2},${h} Q${2},${h} ${2},${h - r} L0,${r} Q0,0 ${r},0`} />
    );
  }
  // molaire — large, carrée
  return (
    <rect x={0} y={0} width={w} height={h} rx={r} />
  );
}

// Largeurs selon le type
const TOOTH_WIDTHS = { incisive: 18, canine: 20, prémolaire: 22, molaire: 26 };
const TOOTH_HEIGHTS_TOP = { incisive: 32, canine: 34, prémolaire: 28, molaire: 26 };
const TOOTH_HEIGHTS_BOT = { incisive: 28, canine: 30, prémolaire: 26, molaire: 24 };
const GAP = 3;

// ── Composant dent individuelle ───────────────────────────────────────────────
function Tooth({ num, statut = 'saine', isTop, onClick, readOnly, isSelected }) {
  const [hovered, setHovered] = useState(false);
  const type = toothType(num);
  const w = TOOTH_WIDTHS[type];
  const h = isTop ? TOOTH_HEIGHTS_TOP[type] : TOOTH_HEIGHTS_BOT[type];
  const s = STATUTS[statut] || STATUTS.saine;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: readOnly ? 'default' : 'pointer' }}
      onClick={() => !readOnly && onClick(num)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`Dent ${num} — ${s.label}`}
    >
      {/* Numéro (au-dessus pour dents du haut, en-dessous pour bas) */}
      {isTop && (
        <span style={{ fontSize: 9, color: isSelected ? '#0f7a5a' : '#94a3b8', fontWeight: isSelected ? 700 : 400, fontFamily: 'monospace', transition: 'color 0.15s' }}>
          {num}
        </span>
      )}

      {/* SVG dent */}
      <svg
        width={w} height={h}
        style={{
          transition: 'transform 0.15s, filter 0.15s',
          transform: hovered && !readOnly ? 'scale(1.12)' : isSelected ? 'scale(1.08)' : 'scale(1)',
          filter: isSelected ? 'drop-shadow(0 0 4px rgba(15,122,90,0.5))' : hovered && !readOnly ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))' : 'none',
        }}
      >
        <g>
          <ToothShape type={type} w={w} h={h} />
          {/* Invisible clone pour clip */}
        </g>
        {/* Background fill */}
        <ToothShape type={type} w={w} h={h} fill={s.couleur} stroke={isSelected ? '#0f7a5a' : s.bordure} strokeWidth={isSelected ? 2 : 1.5} />
        {/* Emoji / statut */}
        {s.emoji && (
          <text x={w / 2} y={h / 2 + 4} textAnchor="middle" fontSize={10} fill={s.texte} fontWeight={700}>{s.emoji}</text>
        )}
      </svg>

      {!isTop && (
        <span style={{ fontSize: 9, color: isSelected ? '#0f7a5a' : '#94a3b8', fontWeight: isSelected ? 700 : 400, fontFamily: 'monospace', transition: 'color 0.15s' }}>
          {num}
        </span>
      )}
    </div>
  );
}

// ── Rangée de dents ──────────────────────────────────────────────────────────
function TeethRow({ nums, isTop, value, onToothClick, readOnly, selected }) {
  return (
    <div style={{ display: 'flex', alignItems: isTop ? 'flex-end' : 'flex-start', gap: GAP }}>
      {nums.map(num => (
        <Tooth
          key={num}
          num={num}
          statut={value[String(num)] || 'saine'}
          isTop={isTop}
          onClick={onToothClick}
          readOnly={readOnly}
          isSelected={selected === num}
        />
      ))}
    </div>
  );
}

// ── Panneau de sélection de statut ────────────────────────────────────────────
function StatutPanel({ dentNum, currentStatut, onSelect, onClose }) {
  return (
    <div style={{
      position: 'absolute', zIndex: 50,
      background: 'white',
      borderRadius: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      padding: '14px 16px',
      minWidth: 200,
      animation: 'scaleIn 0.15s ease both',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Dent {dentNum}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16, padding: '0 4px', lineHeight: 1 }}>×</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {Object.entries(STATUTS).map(([key, s]) => (
          <button
            key={key}
            onClick={() => { onSelect(key); onClose(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 10px', borderRadius: 8,
              border: currentStatut === key ? '2px solid #0f7a5a' : '1.5px solid #e2e8f0',
              background: currentStatut === key ? '#edfaf5' : 'white',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
            }}
            onMouseEnter={e => { if (currentStatut !== key) e.currentTarget.style.background = '#f8fafc'; }}
            onMouseLeave={e => { if (currentStatut !== key) e.currentTarget.style.background = 'white'; }}
          >
            <div style={{ width: 18, height: 18, borderRadius: 4, background: s.couleur, border: `1.5px solid ${s.bordure}`, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#334155', fontWeight: currentStatut === key ? 600 : 400 }}>{s.label}</span>
            {currentStatut === key && <span style={{ marginLeft: 'auto', color: '#0f7a5a', fontSize: 14 }}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Légende ──────────────────────────────────────────────────────────────────
function Legende() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 16 }}>
      {Object.entries(STATUTS).filter(([k]) => k !== 'saine').map(([key, s]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: s.couleur, border: `1.5px solid ${s.bordure}`, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#64748b' }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Résumé des dents affectées ────────────────────────────────────────────────
function Resume({ value }) {
  const affectees = Object.entries(value).filter(([, s]) => s !== 'saine');
  if (affectees.length === 0) return null;
  return (
    <div style={{ marginTop: 14, padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>Dents notées</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {affectees.map(([num, statut]) => {
          const s = STATUTS[statut] || STATUTS.saine;
          return (
            <span key={num} style={{ background: s.couleur, border: `1px solid ${s.bordure}`, color: s.texte, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--radius-full, 9999px)' }}>
              {num} · {s.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Composant principal DentChart ─────────────────────────────────────────────
export default function DentChart({ value = {}, onChange, readOnly = false }) {
  const [selected, setSelected] = useState(null); // numéro de dent sélectionnée
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const containerRef = React.useRef(null);

  function handleToothClick(num) {
    if (readOnly) return;
    if (selected === num) { setSelected(null); return; }
    setSelected(num);
    // Positionnement du panneau sous/sur la dent
    if (containerRef.current) {
      // Calcul approximatif — centre horizontal + décalage vertical
      setPanelPos({ top: 180, left: 40 });
    }
  }

  function handleStatutSelect(statut) {
    if (!selected) return;
    const next = { ...value, [String(selected)]: statut };
    // Nettoyer les dents "saines" pour garder l'objet léger
    if (statut === 'saine') delete next[String(selected)];
    onChange && onChange(next);
    setSelected(null);
  }

  function handleReset() {
    onChange && onChange({});
    setSelected(null);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Schéma dentaire</span>
          {!readOnly && <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>Cliquez sur une dent pour noter son état</span>}
        </div>
        {!readOnly && Object.keys(value).length > 0 && (
          <button onClick={handleReset} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px', borderRadius: 6 }}>
            Réinitialiser
          </button>
        )}
      </div>

      {/* Schéma */}
      <div ref={containerRef} style={{ position: 'relative', userSelect: 'none' }}>
        <div style={{
          background: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: 16,
          padding: '16px 20px',
          display: 'inline-flex',
          flexDirection: 'column',
          gap: 0,
          width: '100%',
          overflowX: 'auto',
        }}>
          {/* Labels quadrants */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>Q1 — Haut droit</span>
            <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>Q2 — Haut gauche</span>
          </div>

          {/* Rangée supérieure */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <TeethRow nums={Q1} isTop value={value} onToothClick={handleToothClick} readOnly={readOnly} selected={selected} />
            {/* Séparateur milieu */}
            <div style={{ width: 12, display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
              <div style={{ width: 1, height: 28, background: '#cbd5e1', margin: 'auto' }} />
            </div>
            <TeethRow nums={Q2} isTop value={value} onToothClick={handleToothClick} readOnly={readOnly} selected={selected} />
          </div>

          {/* Ligne médiane */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '6px 0', gap: 6 }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: 9, color: '#cbd5e1', fontWeight: 500, whiteSpace: 'nowrap' }}>— ligne médiane —</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Rangée inférieure */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <TeethRow nums={Q4} isTop={false} value={value} onToothClick={handleToothClick} readOnly={readOnly} selected={selected} />
            <div style={{ width: 12, display: 'flex', alignItems: 'flex-start', paddingTop: 4 }}>
              <div style={{ width: 1, height: 28, background: '#cbd5e1', margin: 'auto' }} />
            </div>
            <TeethRow nums={Q3} isTop={false} value={value} onToothClick={handleToothClick} readOnly={readOnly} selected={selected} />
          </div>

          {/* Labels quadrants bas */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>Q4 — Bas droit</span>
            <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>Q3 — Bas gauche</span>
          </div>
        </div>

        {/* Panneau de sélection de statut */}
        {selected && !readOnly && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setSelected(null)} />
            <div style={{ position: 'absolute', top: panelPos.top, left: panelPos.left, zIndex: 50 }}>
              <StatutPanel
                dentNum={selected}
                currentStatut={value[String(selected)] || 'saine'}
                onSelect={handleStatutSelect}
                onClose={() => setSelected(null)}
              />
            </div>
          </>
        )}
      </div>

      {/* Légende */}
      <Legende />

      {/* Résumé */}
      <Resume value={value} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXEMPLE D'UTILISATION dans PatientDetail.jsx :
//
// import DentChart from './Dent.jsx';
//
// const [dentData, setDentData] = useState(patient.dentData || {});
//
// function saveDentData(data) {
//   setDentData(data);
//   // Mettre à jour le patient dans le store :
//   onUpdatePatient({ ...patient, dentData: data });
// }
//
// <DentChart value={dentData} onChange={saveDentData} />
//
// Pour lecture seule :
// <DentChart value={dentData} readOnly />
// ─────────────────────────────────────────────────────────────────────────────