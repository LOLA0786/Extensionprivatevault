const ID = 'pv-policy-banner';

type PVOverride = {
  decision: 'ALLOW' | 'WARN' | 'BLOCK';
  riskScore: number;
  prompt: string;
  signals: string[];
};

declare global {
  interface Window {
    __PV_POLICY_OVERRIDE?: PVOverride | null;
  }
}

function escapeHtml(s: string) {
  return (s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function colorFor(decision: string) {
  if (decision === 'BLOCK') return '#dc2626';
  if (decision === 'WARN') return '#f59e0b';
  return '#16a34a';
}

export function pvShowPolicyBanner(override: PVOverride) {
  window.__PV_POLICY_OVERRIDE = override;

  const existing = document.getElementById(ID);
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = ID;
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:2147483647',
    'display:flex',
    'justify-content:flex-end',
    'align-items:flex-start',
    'padding:20px',
    'pointer-events:none',
  ].join(';');

  const card = document.createElement('div');
  card.style.cssText = [
    'pointer-events:auto',
    'width:520px',
    'max-width:calc(100vw - 40px)',
    'background:#0b1220',
    'color:#e5e7eb',
    'border-radius:18px',
    'padding:18px',
    'box-shadow:0 20px 60px rgba(0,0,0,.40)',
    'border:1px solid rgba(255,255,255,.08)',
  ].join(';');

  const top = document.createElement('div');
  top.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;';

  const title = document.createElement('div');
  title.innerHTML = `<div style="font-weight:900;font-size:16px;">PrivateVault Policy</div>`;

  const pill = document.createElement('div');
  pill.textContent = override.decision;
  pill.style.cssText = [
    'background:' + colorFor(override.decision),
    'color:white',
    'border-radius:999px',
    'padding:6px 12px',
    'font-weight:900',
    'font-size:12px',
  ].join(';');

  top.appendChild(title);
  top.appendChild(pill);

  const riskLine = document.createElement('div');
  riskLine.style.cssText = 'margin-top:16px;font-size:14px;';
  riskLine.innerHTML = `<b>Risk:</b> ${(override.riskScore * 100).toFixed(0)}%`;

  const promptLine = document.createElement('div');
  promptLine.style.cssText = 'margin-top:10px;font-size:14px;';
  promptLine.innerHTML = `<b>Prompt:</b> ${escapeHtml(override.prompt).slice(0, 240)}`;

  const sigLine = document.createElement('div');
  sigLine.style.cssText = 'margin-top:14px;font-size:14px;';
  sigLine.innerHTML = `<b>Signals:</b><div style="margin-top:6px;color:#cbd5e1;">${escapeHtml(
    override.signals.join(', ') || 'none'
  )}</div>`;

  const actions = document.createElement('div');
  actions.style.cssText = 'margin-top:18px;display:flex;gap:10px;justify-content:flex-end;';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.cssText = [
    'background:rgba(255,255,255,.08)',
    'color:#e5e7eb',
    'border:1px solid rgba(255,255,255,.10)',
    'border-radius:12px',
    'padding:10px 14px',
    'font-weight:700',
    'cursor:pointer',
  ].join(';');
  closeBtn.onclick = () => overlay.remove();

  actions.appendChild(closeBtn);

  card.appendChild(top);
  card.appendChild(riskLine);
  card.appendChild(promptLine);
  card.appendChild(sigLine);
  card.appendChild(actions);

  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

console.log('[PV] policy_banner override-capable loaded');
