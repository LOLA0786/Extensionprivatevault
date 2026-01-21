import type { PolicyResult } from '../core/policy/policy_scan';

const ID = 'pv-policy-banner';

function color(decision: string) {
  if (decision === 'ALLOW') return '#16a34a';
  if (decision === 'WARN') return '#f59e0b';
  return '#dc2626';
}

export function showPolicyBanner(prompt: string, res: PolicyResult) {
  let root = document.getElementById(ID) as HTMLDivElement | null;
  if (root) root.remove();

  root = document.createElement('div');
  root.id = ID;
  root.style.cssText = `
    position:fixed; top:12px; right:12px; z-index:2147483647;
    width:380px; border-radius:14px; padding:12px 14px;
    background:rgba(17,24,39,0.92); color:#fff;
    font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;
    box-shadow:0 10px 25px rgba(0,0,0,.25);
    border:1px solid rgba(255,255,255,.08);
  `;

  const sigs = res.signals.slice(0, 3).map(s => `• ${s.label}`).join('\n') || 'none';

  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
      <div style="font-weight:800;font-size:14px;">PrivateVault Policy</div>
      <div style="background:${color(res.decision)};padding:4px 10px;border-radius:999px;font-weight:800;font-size:12px;">
        ${res.decision}
      </div>
    </div>

    <div style="margin-top:10px;font-size:12px;opacity:.9;white-space:pre-wrap;">
      <b>Risk:</b> ${(res.riskScore * 100).toFixed(0)}%
    </div>

    <div style="margin-top:10px;font-size:12px;opacity:.9;white-space:pre-wrap;">
      <b>Prompt:</b> ${escapeHtml(prompt.slice(0, 180))}
    </div>

    <div style="margin-top:10px;font-size:12px;opacity:.85;white-space:pre-wrap;">
      <b>Signals:</b>\n${escapeHtml(sigs)}
    </div>

    <div style="margin-top:10px;display:flex;justify-content:flex-end;">
      <button id="pv-close" style="
        background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);
        color:#fff;padding:6px 10px;border-radius:10px;cursor:pointer;font-size:12px;
      ">Close</button>
    </div>
  `;

  document.documentElement.appendChild(root);
  root.querySelector('#pv-close')?.addEventListener('click', () => root?.remove());
}

function escapeHtml(s: string) {
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}
