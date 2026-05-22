import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

// ── Google Fonts ──────────────────────────────────────────────────────────────
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// ── Global styles ─────────────────────────────────────────────────────────────
const globalStyle = document.createElement('style');
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #f0f4f8;
    color: #0f172a;
    -webkit-font-smoothing: antialiased;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes gridPulse {
    0%, 100% { opacity: 0.04; }
    50%       { opacity: 0.09; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-10px) rotate(1deg); }
    66%       { transform: translateY(-5px) rotate(-1deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.6; transform: scale(0.95); }
  }
  @keyframes scanLine {
    0%   { top: 0%; opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .fade-up { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-in { animation: fadeIn 0.25s ease both; }

  input, textarea, select {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #0f172a;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 9px 12px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    width: 100%;
  }
  input:focus, textarea:focus, select:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 3px rgba(56,189,248,0.12);
  }
  textarea { resize: vertical; min-height: 90px; line-height: 1.6; }
  select { appearance: none; cursor: pointer; }
  label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 6px;
    letter-spacing: 0.02em;
  }
`;
document.head.appendChild(globalStyle);

// ── Colors ────────────────────────────────────────────────────────────────────
const C = {
  navy:        '#0b1120',
  cyan:        '#38bdf8',
  cyanText:    '#7dd3fc',
  whiteAlpha2: 'rgba(255,255,255,0.12)',
  pageBg:      '#f0f4f8',
  cardBg:      '#ffffff',
  cardBorder:  '#e2e8f0',
  tblHead:     '#f8fafc',
  tblBorder:   '#f1f5f9',
  textPrimary: '#0f172a',
  textSec:     '#475569',
  textMuted:   '#94a3b8',
  blue:        '#2563eb',
  blueLighter: '#eff6ff',
  blueMid:     '#bfdbfe',
  blueText:    '#1d4ed8',
  green:       '#16a34a',
  greenBg:     '#f0fdf4',
  greenBorder: '#bbf7d0',
  amber:       '#d97706',
  amberBg:     '#fffbeb',
  amberBorder: '#fde68a',
  red:         '#dc2626',
  redBg:       '#fef2f2',
  redBorder:   '#fecaca',
  white:       '#ffffff',
  // Sidebar
  sidebarBg:   '#0f172a',
  sidebarBorder: '#1e293b',
  sidebarHover:  '#1e293b',
  sidebarActive: '#1e3a5f',
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const S = {
  card: {
    background: C.cardBg,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '16px 24px',
    borderBottom: `1px solid ${C.tblBorder}`,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: { fontSize: 14, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em' },
  cardSub:   { fontSize: 12, color: C.textMuted, marginLeft: 'auto' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  thead:     { background: C.tblHead },
  th: {
    padding: '10px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600,
    color: C.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase',
    borderBottom: `1px solid ${C.cardBorder}`,
  },
  td:     { padding: '13px 24px', borderBottom: `1px solid ${C.tblBorder}`, color: C.textSec, fontSize: 13 },
  tdMono: {
    padding: '13px 24px', borderBottom: `1px solid ${C.tblBorder}`,
    color: C.textPrimary, fontSize: 13, fontWeight: 500,
    fontFamily: 'ui-monospace, SFMono-Regular, monospace', letterSpacing: '-0.02em',
  },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  formFull: { gridColumn: '1 / -1' },
  fieldWrap: { display: 'flex', flexDirection: 'column' },
};

// ── Utility components ────────────────────────────────────────────────────────
function Badge({ active }) {
  if (active) return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: C.greenBg, color: C.green, border: `1px solid ${C.greenBorder}`,
      borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 500,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
      Active
    </span>
  );
  return <span style={{ color: C.textMuted, fontSize: 12 }}>archived</span>;
}

function StatusBadge({ status }) {
  const map = {
    running:   { bg: C.blueLighter, color: C.blueText, border: C.blueMid,     label: 'Running'   },
    completed: { bg: C.greenBg,     color: C.green,    border: C.greenBorder, label: 'Completed' },
    stopped:   { bg: C.redBg,       color: C.red,      border: C.redBorder,   label: 'Stopped'   },
  };
  const s = map[status] || map.running;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 500,
    }}>{s.label}</span>
  );
}

function ViewBtn({ onClick, active }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: active ? C.blue : (hover ? C.tblHead : C.cardBg),
        color: active ? C.white : C.textSec,
        border: `1px solid ${active ? C.blue : C.cardBorder}`,
        borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 500,
        cursor: 'pointer', transition: 'all 0.15s ease',
      }}
    >{active ? 'Viewing' : 'View Results'}</button>
  );
}

function ScoreBar({ score }) {
  const pct   = (score / 5) * 100;
  const color = score >= 4 ? C.green : score >= 3 ? C.amber : C.red;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 6, background: C.tblBorder, borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.7s ease' }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, minWidth: 32 }}>{score}/5</span>
    </div>
  );
}

function PrimaryBtn({ onClick, loading, children, disabled }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} disabled={loading || disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: loading || disabled ? C.textMuted : (hover ? '#1d4ed8' : C.blue),
        color: C.white, border: 'none', borderRadius: 8,
        padding: '9px 20px', fontSize: 13, fontWeight: 600,
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s', display: 'flex', alignItems: 'center', gap: 8,
      }}
    >
      {loading && (
        <span style={{
          width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)',
          borderTopColor: C.white, borderRadius: '50%',
          display: 'inline-block', animation: 'spin 0.7s linear infinite',
        }} />
      )}
      {children}
    </button>
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  const isErr = type === 'error';
  return (
    <div className="fade-in" style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: isErr ? C.redBg : C.greenBg,
      border: `1px solid ${isErr ? C.redBorder : C.greenBorder}`,
      color: isErr ? C.red : C.green,
      borderRadius: 10, padding: '12px 20px',
      fontSize: 13, fontWeight: 500,
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {isErr ? '❌' : '✅'} {msg}
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="fade-up" style={{
        background: C.cardBg, borderRadius: 14,
        border: `1px solid ${C.cardBorder}`,
        padding: '28px 32px', maxWidth: 380, width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ fontSize: 32, marginBottom: 12, textAlign: 'center' }}>🗑️</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, textAlign: 'center', marginBottom: 8 }}>
          Are you sure?
        </div>
        <div style={{ fontSize: 13, color: C.textSec, textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 500,
            background: C.tblHead, color: C.textSec, border: `1px solid ${C.cardBorder}`, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: C.red, color: C.white, border: 'none', cursor: 'pointer',
          }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Dots Menu (Portal) ────────────────────────────────────────────────────────
function DotsMenu({ id, openMenuId, setOpenMenuId, onDelete, isActive, deleteLabel = 'Delete' }) {
  const isOpen = openMenuId === id;
  const btnRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpen = () => {
    if (isOpen) { setOpenMenuId(null); return; }
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow < 60
        ? rect.top + window.scrollY - 48
        : rect.bottom + window.scrollY + 4;
      setMenuPos({ top, left: rect.right + window.scrollX - 160 });
    }
    setOpenMenuId(id);
  };

  const menu = isOpen ? (
    <div ref={menuRef} className="fade-in" style={{
      position: 'absolute', top: menuPos.top, left: menuPos.left,
      zIndex: 9999, background: C.cardBg,
      border: `1px solid ${C.cardBorder}`,
      borderRadius: 8, minWidth: 160, overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    }}>
      <button
        onClick={() => { setOpenMenuId(null); if (!isActive) onDelete(); }}
        disabled={isActive}
        title={isActive ? 'Activate another version first' : ''}
        style={{
          width: '100%', padding: '10px 16px', textAlign: 'left',
          background: 'none', border: 'none',
          cursor: isActive ? 'not-allowed' : 'pointer',
          fontSize: 13, fontWeight: 500,
          color: isActive ? C.textMuted : C.red,
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        🗑️ {isActive ? 'Active — cannot delete' : deleteLabel}
      </button>
    </div>
  ) : null;

  return (
    <>
      <button ref={btnRef} onClick={handleOpen} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: C.textMuted, fontSize: 18, padding: '2px 8px',
        borderRadius: 6, lineHeight: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>⋯</button>
      {menu && ReactDOM.createPortal(menu, document.body)}
    </>
  );
}

// ── AB Visual ────────────────────────────────────────────────────────────────
function AIVisual() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  // A grows while B shrinks, then swaps — smooth sine wave
  const phase = (tick * 0.04);
  const scaleA = 1 + Math.sin(phase) * 0.08;
  const scaleB = 1 - Math.sin(phase) * 0.08;
  const opacityA = 0.7 + Math.sin(phase) * 0.3;
  const opacityB = 0.7 - Math.sin(phase) * 0.3;

  return (
    <div style={{
      position: 'absolute', right: '0%', top: '50%',
      transform: 'translateY(-52%)',
      width: 500, height: 420,
      pointerEvents: 'none',
    }}>
      <svg viewBox="-10 0 520 420" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="barA1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95"/>
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.4"/>
          </linearGradient>
          <linearGradient id="barB1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.95"/>
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4"/>
          </linearGradient>
        </defs>

        {/* Background glow blobs */}
        <ellipse cx="165" cy="210" rx="120" ry="90" fill="#38bdf8" fillOpacity="0.04"/>
        <ellipse cx="345" cy="210" rx="120" ry="90" fill="#a78bfa" fillOpacity="0.04"/>

        {/* ── LEFT PANEL: Variant A ── */}
        <g transform={`translate(165, 210) scale(${scaleA}) translate(-165, -210)`}
           style={{ transition: 'none' }}>
          <rect x="20" y="44" width="195" height="310" rx="14"
            fill="#0f1a2e" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity={opacityA * 0.4}/>
          <rect x="20" y="44" width="195" height="44" rx="14" fill="#38bdf8" fillOpacity="0.1"/>
          <rect x="20" y="74" width="195" height="14" fill="#38bdf8" fillOpacity="0.1"/>

          <circle cx="54" cy="66" r="13" fill="#38bdf8" fillOpacity="0.15" stroke="#38bdf8" strokeWidth="1" strokeOpacity={opacityA * 0.6}/>
          <text x="54" y="71" textAnchor="middle" fill="#38bdf8" fillOpacity={opacityA} fontSize="14" fontWeight="700" fontFamily="ui-monospace, monospace">A</text>
          <text x="78" y="68" fill="#38bdf8" fillOpacity={opacityA * 0.9} fontSize="12" fontWeight="600" fontFamily="ui-monospace, monospace">Variant A</text>
          <text x="78" y="80" fill="#38bdf8" fillOpacity={opacityA * 0.45} fontSize="9" fontFamily="ui-monospace, monospace">v1 — original</text>

          {[
            { x: 36,  h: 90,  label: 'Q1' },
            { x: 80,  h: 125, label: 'Q2' },
            { x: 124, h: 72,  label: 'Q3' },
            { x: 168, h: 108, label: 'Q4' },
          ].map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={308 - b.h} width="28" height={b.h} rx="5"
                fill="#38bdf8" fillOpacity={0.06 + (opacityA - 0.7) * 0.1}/>
              <rect x={b.x} y={308 - b.h} width="28" height={b.h} rx="5"
                fill="url(#barA1)" fillOpacity={opacityA}/>
              <rect x={b.x} y={308 - b.h} width="28" height="5" rx="2.5"
                fill="#38bdf8" fillOpacity={opacityA}/>
              <text x={b.x + 14} y={326} textAnchor="middle"
                fill="#38bdf8" fillOpacity={opacityA * 0.45} fontSize="9"
                fontFamily="ui-monospace, monospace">{b.label}</text>
            </g>
          ))}

          <rect x="30" y="334" width="80" height="16" rx="8"
            fill="#38bdf8" fillOpacity="0.1" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity={opacityA * 0.4}/>
          <text x="70" y="345" textAnchor="middle" fill="#38bdf8" fillOpacity={opacityA}
            fontSize="9" fontWeight="600" fontFamily="ui-monospace, monospace">avg 3.8 / 5</text>
        </g>

        {/* ── RIGHT PANEL: Variant B ── */}
        <g transform={`translate(340, 210) scale(${scaleB}) translate(-340, -210)`}
           style={{ transition: 'none' }}>
          <rect x="295" y="44" width="195" height="310" rx="14"
            fill="#0f1a2e" stroke="#a78bfa" strokeWidth="0.8" strokeOpacity={opacityB * 0.4}/>
          <rect x="295" y="44" width="195" height="44" rx="14" fill="#a78bfa" fillOpacity="0.1"/>
          <rect x="295" y="74" width="195" height="14" fill="#a78bfa" fillOpacity="0.1"/>

          <circle cx="329" cy="66" r="13" fill="#a78bfa" fillOpacity="0.15" stroke="#a78bfa" strokeWidth="1" strokeOpacity={opacityB * 0.6}/>
          <text x="329" y="71" textAnchor="middle" fill="#a78bfa" fillOpacity={opacityB} fontSize="14" fontWeight="700" fontFamily="ui-monospace, monospace">B</text>
          <text x="353" y="68" fill="#a78bfa" fillOpacity={opacityB * 0.9} fontSize="12" fontWeight="600" fontFamily="ui-monospace, monospace">Variant B</text>
          <text x="353" y="80" fill="#a78bfa" fillOpacity={opacityB * 0.45} fontSize="9" fontFamily="ui-monospace, monospace">v2 — improved</text>

          {[
            { x: 311, h: 118, label: 'Q1' },
            { x: 355, h: 155, label: 'Q2' },
            { x: 399, h: 100, label: 'Q3' },
            { x: 443, h: 138, label: 'Q4' },
          ].map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={308 - b.h} width="28" height={b.h} rx="5"
                fill="#a78bfa" fillOpacity={0.06 + (opacityB - 0.7) * 0.1}/>
              <rect x={b.x} y={308 - b.h} width="28" height={b.h} rx="5"
                fill="url(#barB1)" fillOpacity={opacityB}/>
              <rect x={b.x} y={308 - b.h} width="28" height="5" rx="2.5"
                fill="#a78bfa" fillOpacity={opacityB}/>
              <text x={b.x + 14} y={326} textAnchor="middle"
                fill="#a78bfa" fillOpacity={opacityB * 0.45} fontSize="9"
                fontFamily="ui-monospace, monospace">{b.label}</text>
            </g>
          ))}

          <rect x="305" y="334" width="80" height="16" rx="8"
            fill="#a78bfa" fillOpacity="0.1" stroke="#a78bfa" strokeWidth="0.5" strokeOpacity={opacityB * 0.4}/>
          <text x="345" y="345" textAnchor="middle" fill="#a78bfa" fillOpacity={opacityB}
            fontSize="9" fontWeight="600" fontFamily="ui-monospace, monospace">avg 4.7 / 5</text>
        </g>

        {/* ── CENTER VS ── */}
        <line x1="252" y1="60" x2="252" y2="355"
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 5"/>
        <circle cx="252" cy="210" r="24" fill="#0b1120" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        <text x="252" y="206" textAnchor="middle" fill="white" fillOpacity="0.5"
          fontSize="11" fontWeight="700" fontFamily="ui-monospace, monospace">VS</text>

        {/* Corner brackets */}
        {[
          { d: 'M6,28 L6,8 L26,8'     },
          { d: 'M494,28 L494,8 L474,8' },
          { d: 'M6,392 L6,412 L26,412' },
          { d: 'M494,392 L494,412 L474,412' },
        ].map((b, i) => (
          <path key={i} d={b.d} stroke="#38bdf8" strokeWidth="1.5"
            strokeOpacity="0.2" fill="none" strokeLinecap="round"/>
        ))}

        {/* Floating labels */}
        <text x="70" y="28" fill="#38bdf8" fillOpacity="0.4" fontSize="9"
          fontFamily="ui-monospace, monospace">score: 3.8</text>
        <text x="340" y="28" fill="#a78bfa" fillOpacity="0.4" fontSize="9"
          fontFamily="ui-monospace, monospace">score: 4.7</text>

      </svg>
    </div>
  );
}

function StatPill({ icon, label, value }) { // eslint-disable-line no-unused-vars
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: C.whiteAlpha2, border: '1px solid rgba(56,189,248,0.2)',
      borderRadius: 24, padding: '6px 16px',
    }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 12, color: C.cyanText, fontWeight: 500 }}>{value}</span>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{label}</span>
    </div>
  );
}


// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const ref = React.useRef(null);

  const handleEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({
        top:  rect.top + window.scrollY - 8,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
    setShow(true);
  };

  const tooltip = show ? ReactDOM.createPortal(
    <div style={{
      position: 'absolute',
      top: pos.top,
      left: pos.left,
      transform: 'translate(-50%, -100%)',
      zIndex: 9999,
      background: '#0f172a',
      color: '#f1f5f9',
      fontSize: 11,
      fontWeight: 500,
      padding: '6px 10px',
      borderRadius: 6,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      letterSpacing: '0.01em',
    }}>
      {text}
      <div style={{
        position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
        width: 8, height: 8, background: '#0f172a',
        clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
      }} />
    </div>,
    document.body
  ) : null;

  return (
    <div ref={ref} style={{ display: 'inline-flex' }}
      onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)}>
      {children}
      {tooltip}
    </div>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: '📝',
      title: 'Write prompt versions',
      desc: 'Create multiple versions of your system prompt. Each tweak gets its own version number and commit message, just like Git.',
      circleBg: 'rgba(56,189,248,0.12)',
      circleBorder: 'rgba(56,189,248,0.3)',
    },
    {
      icon: '🧪',
      title: 'Run A/B experiments',
      desc: 'Compare two versions head-to-head. Send real test questions and let the AI respond with each variant automatically.',
      circleBg: 'rgba(168,85,247,0.12)',
      circleBorder: 'rgba(168,85,247,0.3)',
    },
    {
      icon: '🏆',
      title: 'Find the winner',
      desc: 'Every response is auto-scored 1–5 by GPT-4o. PromptLab compares averages and declares the better-performing prompt.',
      circleBg: 'rgba(34,197,94,0.12)',
      circleBorder: 'rgba(34,197,94,0.3)',
    },
  ];

  return (
    <div style={{
      background: C.navy,
      padding: '64px 24px 80px',
      borderBottom: '1px solid rgba(56,189,248,0.1)',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Section label */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            How it works
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.white, letterSpacing: '-0.03em' }}>
            From prompt idea to data-backed decision
          </div>
        </div>

        {/* 3 circles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, position: 'relative' }}>

          {/* Connector line between circles */}
          <div style={{
            position: 'absolute', top: 44, left: '20%', right: '20%', height: 1,
            background: 'rgba(255,255,255,0.08)', zIndex: 0,
          }} />

          {steps.map((s, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              textAlign: 'center', position: 'relative', zIndex: 1,
            }}>
              {/* Circle */}
              <div style={{
                width: 108, height: 108, borderRadius: '50%',
                background: s.circleBg,
                border: `1.5px solid ${s.circleBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 40, marginBottom: 24,
                transition: 'transform 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {s.icon}
              </div>

              {/* Title */}
              <div style={{ fontSize: 15, fontWeight: 600, color: C.white, marginBottom: 10, letterSpacing: '-0.01em' }}>
                {s.title}
              </div>

              {/* Desc */}
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: 260 }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ bots, selectedBot, onSelectBot, onDeleteBot, onAddBot }) {
  const [newBotName, setNewBotName] = useState('');
  const [adding, setAdding]         = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleAdd = () => {
    if (!newBotName.trim()) return;
    onAddBot(newBotName.trim());
    setNewBotName('');
    setAdding(false);
  };

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: C.sidebarBg,
      borderRight: `1px solid ${C.sidebarBorder}`,
      display: 'flex', flexDirection: 'column',
      minHeight: '100%',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 12px', borderBottom: `1px solid ${C.sidebarBorder}` }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
          My Bots
        </div>
      </div>

      {/* Bot list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
        {bots.map(bot => (
          <div key={bot} style={{
            display: 'flex', alignItems: 'center',
            borderRadius: 8, marginBottom: 2,
            background: selectedBot === bot ? C.sidebarActive : 'transparent',
            border: selectedBot === bot ? '1px solid rgba(56,189,248,0.2)' : '1px solid transparent',
            transition: 'all 0.15s',
          }}>
            <button
              onClick={() => onSelectBot(bot)}
              style={{
                flex: 1, textAlign: 'left', background: 'none', border: 'none',
                padding: '9px 12px', cursor: 'pointer',
                fontSize: 13, fontWeight: selectedBot === bot ? 600 : 400,
                color: selectedBot === bot ? C.white : 'rgba(255,255,255,0.55)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ fontSize: 14 }}>🤖</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bot}</span>
            </button>
            <DotsMenu
              id={`bot-${bot}`}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              isActive={false}
              deleteLabel="Delete bot"
              onDelete={() => setConfirmDelete(bot)}
            />
          </div>
        ))}

        {/* Add new bot */}
        {adding ? (
          <div style={{ padding: '8px 4px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              value={newBotName}
              onChange={e => setNewBotName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
              placeholder="Bot name..."
              autoFocus
              style={{ fontSize: 12, padding: '7px 10px', background: '#1e293b', border: '1px solid rgba(56,189,248,0.3)', color: C.white, borderRadius: 6 }}
            />
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={handleAdd} style={{
                flex: 1, padding: '5px 0', fontSize: 11, fontWeight: 600,
                background: C.cyan, color: C.navy, border: 'none', borderRadius: 5, cursor: 'pointer',
              }}>Add</button>
              <button onClick={() => { setAdding(false); setNewBotName(''); }} style={{
                flex: 1, padding: '5px 0', fontSize: 11,
                background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)',
                border: 'none', borderRadius: 5, cursor: 'pointer',
              }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} style={{
            width: '100%', padding: '8px 12px', marginTop: 4,
            background: 'none', border: '1px dashed rgba(255,255,255,0.15)',
            borderRadius: 8, cursor: 'pointer', fontSize: 12,
            color: 'rgba(255,255,255,0.35)', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: 14 }}>＋</span> New Bot
          </button>
        )}
      </div>

      {/* Confirm delete bot */}
      {confirmDelete && (
        <ConfirmModal
          message={`"${confirmDelete}" and ALL its versions will be permanently deleted.`}
          onConfirm={() => { onDeleteBot(confirmDelete); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </aside>
  );
}

// ── Forms ─────────────────────────────────────────────────────────────────────
function CreatePromptForm({ promptName, onSuccess }) {
  const [form, setForm] = useState({ name: promptName, system_prompt: '', commit_message: '' });

  useEffect(() => { setForm(f => ({ ...f, name: promptName })); }, [promptName]);

  const [loading, setLoading] = useState(false);
  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.system_prompt.trim() || !form.commit_message.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API}/prompts`, form);
      setForm(f => ({ ...f, system_prompt: '', commit_message: '' }));
      onSuccess('✅ New version saved!');
    } catch (err) { onSuccess('Failed to save', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={S.formGrid}>
        <div style={S.fieldWrap}>
          <label>Prompt Name</label>
          <input value={form.name} onChange={e => handle('name', e.target.value)} placeholder="e.g. AmazonBot" />
        </div>
        <div style={S.fieldWrap}>
          <label>Commit Message</label>
          <input value={form.commit_message} onChange={e => handle('commit_message', e.target.value)} placeholder="e.g. Friendlier tone" />
        </div>
        <div style={{ ...S.fieldWrap, ...S.formFull }}>
          <label>System Prompt</label>
          <textarea value={form.system_prompt} onChange={e => handle('system_prompt', e.target.value)}
            placeholder="You are a helpful customer support assistant..." style={{ minHeight: 120 }} />
        </div>
      </div>
      <PrimaryBtn onClick={submit} loading={loading}>Save Version</PrimaryBtn>
    </div>
  );
}

function CreateExperimentForm({ versions, promptName, onSuccess }) {
  const [form, setForm] = useState({ name: '', prompt_name: promptName, variant_a_version: '', variant_b_version: '', traffic_split: 0.5 });
  useEffect(() => { setForm(f => ({ ...f, prompt_name: promptName })); }, [promptName]);
  const [loading, setLoading] = useState(false);
  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim() || !form.variant_a_version || !form.variant_b_version) return;
    if (form.variant_a_version === form.variant_b_version) { onSuccess('Variant A and B must be different', 'error'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/experiments`, {
        ...form,
        variant_a_version: parseInt(form.variant_a_version),
        variant_b_version: parseInt(form.variant_b_version),
        traffic_split: parseFloat(form.traffic_split),
      });
      setForm(f => ({ ...f, name: '', variant_a_version: '', variant_b_version: '' }));
      onSuccess('✅ Experiment created!');
    } catch (err) { onSuccess('Failed to create experiment', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={S.formGrid}>
        <div style={S.fieldWrap}>
          <label>Experiment Name</label>
          <input value={form.name} onChange={e => handle('name', e.target.value)} placeholder="e.g. Tone Test" />
        </div>
        <div style={S.fieldWrap}>
          <label>Prompt Name</label>
          <input value={form.prompt_name} readOnly style={{ background: C.tblHead, color: C.textMuted }} />
        </div>
        <div style={S.fieldWrap}>
          <label>Variant A</label>
          <select value={form.variant_a_version} onChange={e => handle('variant_a_version', e.target.value)}>
            <option value="">Select version</option>
            {versions.map(v => <option key={v.version} value={v.version}>v{v.version} — {v.commit_message}</option>)}
          </select>
        </div>
        <div style={S.fieldWrap}>
          <label>Variant B</label>
          <select value={form.variant_b_version} onChange={e => handle('variant_b_version', e.target.value)}>
            <option value="">Select version</option>
            {versions.map(v => <option key={v.version} value={v.version}>v{v.version} — {v.commit_message}</option>)}
          </select>
        </div>
        <div style={S.fieldWrap}>
          <label>Traffic Split — A: {Math.round(form.traffic_split * 100)}% / B: {Math.round((1 - form.traffic_split) * 100)}%</label>
          <input type="range" min="0.1" max="0.9" step="0.1" value={form.traffic_split}
            onChange={e => handle('traffic_split', e.target.value)}
            style={{ padding: 0, border: 'none', boxShadow: 'none', cursor: 'pointer' }} />
        </div>
      </div>
      <PrimaryBtn onClick={submit} loading={loading}>Create Experiment</PrimaryBtn>
    </div>
  );
}

function RunTestForm({ experimentId, experimentName, onSuccess }) {
  const [input, setInput]     = useState('');
  const [userId, setUserId]   = useState('user_' + Math.random().toString(36).slice(2, 7));
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const submit = async () => {
    if (!input.trim()) return;
    setLoading(true); setLastResult(null);
    try {
      const res = await axios.post(`${API}/experiments/${experimentId}/test`, {
        experiment_id: experimentId, user_id: userId, input_text: input,
      });
      setLastResult({ ok: true, msg: res.data.message });
      setInput('');
      onSuccess('✅ Test complete!');
    } catch (err) { setLastResult({ ok: false, msg: 'Test failed — is the backend running?' }); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: '8px 12px', background: C.blueLighter, borderRadius: 8, fontSize: 12, color: C.blueText }}>
        🧪 Testing: <strong>{experimentName}</strong>
      </div>
      <div style={S.formGrid}>
        <div style={{ ...S.fieldWrap, ...S.formFull }}>
          <label>Test Input</label>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            placeholder="e.g. My order hasn't arrived, what should I do?" style={{ minHeight: 80 }} />
        </div>
        <div style={S.fieldWrap}>
          <label>User ID</label>
          <input value={userId} onChange={e => setUserId(e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <PrimaryBtn onClick={submit} loading={loading}>▶ Run Test</PrimaryBtn>
        {loading && <span style={{ fontSize: 12, color: C.textMuted }}>Calling OpenAI… ~5s</span>}
      </div>
      {lastResult && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
          background: lastResult.ok ? C.greenBg : C.redBg,
          color: lastResult.ok ? C.green : C.red,
          border: `1px solid ${lastResult.ok ? C.greenBorder : C.redBorder}`,
        }}>{lastResult.msg}</div>
      )}
    </div>
  );
}

// ── Main content area ─────────────────────────────────────────────────────────
function MainContent({ selectedBot, allBots }) {
  const [versions, setVersions]                     = useState([]);
  const [experiments, setExperiments]               = useState([]);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [testExperiment, setTestExperiment]         = useState(null);
  const [results, setResults]                       = useState(null);
  const [loading, setLoading]                       = useState(false);
  const [openForm, setOpenForm]                     = useState(null);
  const [openMenuId, setOpenMenuId]                 = useState(null);
  const [confirmDelete, setConfirmDelete]           = useState(null);
  const [toast, setToast]                           = useState({ msg: '', type: 'success' });

  useEffect(() => {
    if (!selectedBot) return;
    setVersions([]); setExperiments([]);
    setSelectedExperiment(null); setResults(null);
    setOpenForm(null); setTestExperiment(null);
    fetchVersions(); fetchExperiments();
  }, [selectedBot]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVersions = async () => {
    try { const res = await axios.get(`${API}/prompts/${selectedBot}/versions`); setVersions(res.data); }
    catch { setVersions([]); }
  };
  const fetchExperiments = async () => {
    try { const res = await axios.get(`${API}/experiments`); setExperiments(res.data.filter(e => e.prompt_name === selectedBot)); }
    catch { setExperiments([]); }
  };
  const fetchResults = async (id) => {
    if (selectedExperiment === id) { setSelectedExperiment(null); setResults(null); return; }
    setLoading(true);
    try { const res = await axios.get(`${API}/experiments/${id}/results`); setResults(res.data); setSelectedExperiment(id); }
    catch { }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  };

  const deletePromptVersion = async () => {
    if (!confirmDelete) return;
    try {
      await axios.delete(`${API}/prompts/${confirmDelete.name}/${confirmDelete.version}`);
      showToast(`Deleted v${confirmDelete.version}`);
      fetchVersions();
    } catch (err) { showToast(err.response?.data?.detail || 'Failed to delete', 'error'); }
    finally { setConfirmDelete(null); }
  };

  const deleteExperiment = async () => {
    if (!confirmDelete) return;
    try {
      await axios.delete(`${API}/experiments/${confirmDelete.id}`);
      showToast(`Deleted experiment #${confirmDelete.id}`);
      fetchExperiments();
      if (selectedExperiment === confirmDelete.id) { setSelectedExperiment(null); setResults(null); }
    } catch (err) { showToast(err.response?.data?.detail || 'Failed to delete', 'error'); }
    finally { setConfirmDelete(null); }
  };

  const currentExp = experiments.find(e => e.id === selectedExperiment);
  const winner = results?.winner;
  const winnerIsA = winner === 'Variant A';
  const winnerIsB = winner === 'Variant B';
  const noWinner  = !winnerIsA && !winnerIsB;

  if (!selectedBot) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 40 }}>🤖</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>Select a bot from the sidebar</div>
      <div style={{ fontSize: 13 }}>or create a new one to get started</div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px 80px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Prompt Versions */}
      <section className="fade-up">
        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={{ fontSize: 15 }}>📋</span>
            <span style={S.cardTitle}>Prompt Versions</span>
            <span style={{
              fontSize: 12, fontWeight: 500, color: C.blueText,
              background: C.blueLighter, border: `1px solid ${C.blueMid}`,
              borderRadius: 20, padding: '1px 8px', marginLeft: 4,
            }}>{selectedBot}</span>
            <span style={S.cardSub}>{versions.length} version{versions.length !== 1 ? 's' : ''}</span>
            <Tooltip text="Write a new version of your system prompt">
              <button onClick={() => setOpenForm(openForm === 'prompt' ? null : 'prompt')}
                style={{ marginLeft: 12, background: C.blue, color: C.white, border: 'none', borderRadius: 7, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {openForm === 'prompt' ? '✕ Cancel' : '+ New Version'}
              </button>
            </Tooltip>
          </div>
          {openForm === 'prompt' && (
            <div className="fade-in" style={{ padding: '20px 24px', borderBottom: `1px solid ${C.tblBorder}`, background: C.tblHead }}>
              <CreatePromptForm promptName={selectedBot} onSuccess={(msg, type) => {
                showToast(msg, type);
                if (type !== 'error') { fetchVersions(); setOpenForm(null); }
              }} />
            </div>
          )}
          <table style={S.table}>
            <thead style={S.thead}>
              <tr>
                <th style={S.th}>Version</th>
                <th style={S.th}>Commit Message</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Created At</th>
                <th style={{ ...S.th, width: 48 }}></th>
              </tr>
            </thead>
            <tbody>
              {versions.length === 0
                ? <tr><td colSpan={5} style={{ ...S.td, color: C.textMuted, textAlign: 'center', padding: 32 }}>No versions yet — create one above</td></tr>
                : versions.map(v => (
                  <tr key={v.version} style={{ background: v.is_active ? C.greenBg : 'transparent' }}>
                    <td style={S.tdMono}>v{v.version}</td>
                    <td style={S.td}>{v.commit_message}</td>
                    <td style={S.td}><Badge active={v.is_active} /></td>
                    <td style={{ ...S.td, color: C.textMuted, fontSize: 12 }}>
                      {new Date(v.created_at).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td style={{ ...S.td, width: 48, padding: '8px 12px' }}>
                      <DotsMenu
                        id={`v-${v.version}`}
                        openMenuId={openMenuId} setOpenMenuId={setOpenMenuId}
                        isActive={v.is_active}
                        deleteLabel="Delete version"
                        onDelete={() => setConfirmDelete({ type: 'prompt', name: selectedBot, version: v.version, commit_message: v.commit_message })}
                      />
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </section>

      {/* Experiments */}
      <section className="fade-up" style={{ animationDelay: '0.08s' }}>
        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={{ fontSize: 15 }}>🧪</span>
            <span style={S.cardTitle}>Experiments</span>
            <span style={S.cardSub}>{experiments.length} total</span>
            <Tooltip text="Compare two prompt versions head-to-head">
              <button onClick={() => setOpenForm(openForm === 'experiment' ? null : 'experiment')}
                style={{ marginLeft: 12, background: C.blue, color: C.white, border: 'none', borderRadius: 7, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {openForm === 'experiment' ? '✕ Cancel' : '+ New Experiment'}
              </button>
            </Tooltip>
          </div>
          {openForm === 'experiment' && (
            <div className="fade-in" style={{ padding: '20px 24px', borderBottom: `1px solid ${C.tblBorder}`, background: C.tblHead }}>
              <CreateExperimentForm versions={versions} promptName={selectedBot} onSuccess={(msg, type) => {
                showToast(msg, type);
                if (type !== 'error') { fetchExperiments(); setOpenForm(null); }
              }} />
            </div>
          )}
          <table style={S.table}>
            <thead style={S.thead}>
              <tr>
                <th style={{ ...S.th, width: 56 }}>ID</th>
                <th style={S.th}>Name</th>
                <th style={S.th}>Variant A</th>
                <th style={S.th}>Variant B</th>
                <th style={S.th}>Status</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Run Test</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Results</th>
                <th style={{ ...S.th, width: 48 }}></th>
              </tr>
            </thead>
            <tbody>
              {experiments.length === 0
                ? <tr><td colSpan={8} style={{ ...S.td, color: C.textMuted, textAlign: 'center', padding: 32 }}>No experiments yet — create one above</td></tr>
                : experiments.map(e => (
                  <React.Fragment key={e.id}>
                    <tr style={{ background: selectedExperiment === e.id ? C.blueLighter : 'transparent', transition: 'background 0.15s' }}>
                      <td style={S.tdMono}>#{e.id}</td>
                      <td style={{ ...S.td, fontWeight: 500, color: C.textPrimary }}>{e.name}</td>
                      <td style={S.tdMono}>v{e.variant_a_version}</td>
                      <td style={S.tdMono}>v{e.variant_b_version}</td>
                      <td style={S.td}><StatusBadge status={e.status} /></td>
                      <td style={{ ...S.td, textAlign: 'center' }}>
                        <Tooltip text="Send a test question → AI answers → auto-scored 1–5">
                          <button onClick={() => setTestExperiment(testExperiment === e.id ? null : e.id)}
                            style={{
                              background: testExperiment === e.id ? C.amberBg : C.tblHead,
                              color: testExperiment === e.id ? C.amber : C.textSec,
                              border: `1px solid ${testExperiment === e.id ? C.amberBorder : C.cardBorder}`,
                              borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                            }}>
                            {testExperiment === e.id ? '✕ Close' : '▶ Run Test'}
                          </button>
                        </Tooltip>
                      </td>
                      <td style={{ ...S.td, textAlign: 'right' }}>
                        <Tooltip text="See which prompt version scored higher">
                          <ViewBtn onClick={() => fetchResults(e.id)} active={selectedExperiment === e.id} />
                        </Tooltip>
                      </td>
                      <td style={{ ...S.td, width: 48, padding: '8px 12px' }}>
                        <DotsMenu
                          id={`e-${e.id}`}
                          openMenuId={openMenuId} setOpenMenuId={setOpenMenuId}
                          isActive={false}
                          deleteLabel="Delete experiment"
                          onDelete={() => setConfirmDelete({ type: 'experiment', id: e.id, name: e.name })}
                        />
                      </td>
                    </tr>
                    {testExperiment === e.id && (
                      <tr>
                        <td colSpan={8} style={{ padding: 0, borderBottom: `1px solid ${C.tblBorder}` }}>
                          <div className="fade-in" style={{ padding: '20px 24px', background: C.amberBg }}>
                            <RunTestForm experimentId={e.id} experimentName={e.name} onSuccess={(msg) => {
                              showToast(msg);
                              if (selectedExperiment === e.id) fetchResults(e.id);
                            }} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              }
            </tbody>
          </table>
        </div>
      </section>

      {/* Results */}
      {(results || loading) && currentExp && (
        <section className="fade-up">
          <div style={S.card}>
            <div style={S.cardHeader}>
              <span style={{ fontSize: 15 }}>🏆</span>
              <span style={S.cardTitle}>Results</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: C.textSec, background: C.tblHead, borderRadius: 20, padding: '1px 8px', marginLeft: 4 }}>
                Experiment #{selectedExperiment} · {currentExp.name}
              </span>
              <button onClick={() => { setSelectedExperiment(null); setResults(null); }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            {loading
              ? <div style={{ padding: 40, textAlign: 'center', color: C.textMuted, fontSize: 13 }}>Loading results…</div>
              : (
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {[
                      { label: 'Variant A', version: currentExp.variant_a_version, data: results.variant_a, isWinner: winnerIsA },
                      { label: 'Variant B', version: currentExp.variant_b_version, data: results.variant_b, isWinner: winnerIsB },
                    ].map(({ label, version, data, isWinner }) => (
                      <div key={label} style={{
                        border: `1px solid ${isWinner ? C.green : C.cardBorder}`,
                        borderRadius: 10, padding: '16px 20px',
                        background: isWinner ? C.greenBg : C.tblHead, position: 'relative',
                      }}>
                        {isWinner && (
                          <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 11, fontWeight: 600, color: C.green, background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 20, padding: '1px 8px' }}>Winner 🏆</div>
                        )}
                        <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>
                        <div style={{ fontSize: 22, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.03em', marginBottom: 12, fontFamily: 'ui-monospace, monospace' }}>v{version}</div>
                        <ScoreBar score={data.average_score} />
                        <div style={{ marginTop: 10, fontSize: 12, color: C.textMuted }}>{data.count} response{data.count !== 1 ? 's' : ''} collected</div>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    borderRadius: 10, padding: '14px 20px',
                    background: noWinner ? C.amberBg : C.greenBg,
                    border: `1px solid ${noWinner ? C.amberBorder : C.greenBorder}`,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 20 }}>{noWinner ? '⚖️' : '🏆'}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: noWinner ? C.amber : C.green }}>
                        {noWinner ? 'No clear winner yet' : `${winner} wins!`}
                      </div>
                      <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>
                        {noWinner
                          ? 'Scores are too close — run more tests.'
                          : `A = ${results.variant_a.average_score} · B = ${results.variant_b.average_score}`}
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          </div>
        </section>
      )}

      {/* Confirm modal */}
      {confirmDelete && (
        <ConfirmModal
          message={
            confirmDelete.type === 'experiment'
              ? `Experiment #${confirmDelete.id} "${confirmDelete.name}" and all its results will be deleted.`
              : `v${confirmDelete.version} "${confirmDelete.commit_message}" will be permanently deleted.`
          }
          onConfirm={confirmDelete.type === 'experiment' ? deleteExperiment : deletePromptVersion}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
function App() {
  const [bots, setBots]               = useState([]);
  const [selectedBot, setSelectedBot] = useState(null);
  const [totalVersions, setTotalVersions] = useState(0);
  const [totalExperiments, setTotalExperiments] = useState(0);

  useEffect(() => { fetchBots(); fetchStats(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBots = async () => {
    try {
      const res = await axios.get(`${API}/prompts`);
      setBots(res.data);
      if (res.data.length > 0 && !selectedBot) setSelectedBot(res.data[0]);
      // Count total versions across all bots
      let total = 0;
      for (const bot of res.data) {
        try {
          const vRes = await axios.get(`${API}/prompts/${bot}/versions`);
          total += vRes.data.length;
        } catch {}
      }
      setTotalVersions(total);
    } catch { setBots([]); }
  };

  const fetchStats = async () => {
    try {
      const expRes = await axios.get(`${API}/experiments`);
      setTotalExperiments(expRes.data.length);
    } catch {}
  };


  const handleAddBot = async (name) => {
    setBots(prev => [...prev, name]);
    setSelectedBot(name);
  };

  const handleDeleteBot = async (name) => {
    try {
      await axios.delete(`${API}/prompts/${name}`);
      const updated = bots.filter(b => b !== name);
      setBots(updated);
      if (selectedBot === name) setSelectedBot(updated[0] || null);
    } catch (err) { console.error(err); }
  };



  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>

      {/* ── HERO ── */}
      <div style={{ background: C.navy, position: 'relative', overflow: 'hidden', minHeight: '48vh', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)`,
          backgroundSize: '48px 48px', animation: 'gridPulse 6s ease-in-out infinite',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 80% at 35% 50%, rgba(14,165,233,0.08) 0%, transparent 70%)' }} />
        <nav style={{
          position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 10,
          padding: '20px 48px', borderBottom: '1px solid rgba(56,189,248,0.1)',
        }}>
          <div style={{ width: 30, height: 30, background: C.cyan, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.navy }}>PL</div>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.white, letterSpacing: '-0.02em' }}>PromptLab</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>v1.0.0</span>
        </nav>
        <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', alignItems: 'center', padding: '40px 48px 48px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <div style={{ maxWidth: 520 }} className="fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: 20, padding: '4px 14px', marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.cyan, display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: C.cyanText, letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI Prompt Management</span>
            </div>
            <h1 style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 18, color: C.white }}>
              Version control<br />for{' '}
              <span style={{ color: C.cyan }}>AI prompts</span>
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
              Track, compare, and optimize your prompts with{' '}
              <span style={{ color: C.cyanText, fontWeight: 500 }}>real-time A/B testing</span>
              {' '}and automated quality scoring.
            </p>
            <div style={{ display: 'flex', gap: 0, marginTop: 8 }}>
              {[
                { value: bots.length,        label: 'Bots',        color: C.cyan },
                { value: totalVersions,      label: 'Versions',    color: '#a78bfa' },
                { value: totalExperiments,   label: 'Experiments', color: '#34d399' },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: '16px 32px',
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  textAlign: i === 0 ? 'left' : 'center',
                }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: s.color, letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <AIVisual />
        </div>
      </div>

      <HowItWorks />

      {/* ── BODY: sidebar + content ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, background: C.pageBg }}>
        <Sidebar
          bots={bots}
          selectedBot={selectedBot}
          onSelectBot={setSelectedBot}
          onDeleteBot={handleDeleteBot}
          onAddBot={handleAddBot}
        />
        <MainContent selectedBot={selectedBot} allBots={bots} />
      </div>
    </div>
  );
}

export default App;