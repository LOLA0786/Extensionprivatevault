// extension/src/content/injector.ts
// Runs on ChatGPT/Claude pages as per manifest.
// Blocks harmful prompts BEFORE submit and logs blocked attempts to backend.
// IMPORTANT: This implementation logs directly from the content script (no SW messaging).

import { checkForForbidden } from '@shared/filters';
import { pvShowPolicyBanner } from "./policy_banner";

type PromptEl = HTMLTextAreaElement | HTMLInputElement | HTMLElement;

function showWarning(message: string, severity: 'critical' | 'high' | 'medium' = 'critical') {
  const warningDiv = document.createElement('div');

  // Severity-based styling
  const bgColors = {
    critical: '#dc2626', // Red
    high: '#ea580c', // Orange-red
    medium: '#f59e0b' // Orange
  };

  const icons = {
    critical: '🛑',
    high: '⚠️',
    medium: '⚡'
  };

  warningDiv.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="font-size:18px;">${icons[severity]}</span>
      <span>${message}</span>
    </div>
  `;

  warningDiv.style.cssText = [
    'position:fixed',
    'top:12px',
    'right:12px',
    'z-index:2147483647',
    `background:${bgColors[severity]}`,
    'color:white',
    'padding:12px 16px',
    'border-radius:12px',
    'font-size:14px',
    'font-weight:700',
    'max-width:400px',
    'line-height:1.4',
    'box-shadow:0 10px 40px rgba(0,0,0,.40)',
    'border:2px solid rgba(255,255,255,.2)',
    'animation:pvSlideIn 0.3s ease-out',
  ].join(';');

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pvSlideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(warningDiv);

  // Auto-dismiss after longer time for critical
  const dismissTime = severity === 'critical' ? 8000 : 5000;
  setTimeout(() => warningDiv.remove(), dismissTime);
}

function hardCancel(ev?: Event) {
  if (!ev) return;
  try {
    ev.preventDefault();
    // @ts-ignore
    ev.stopImmediatePropagation?.();
    // @ts-ignore
    ev.stopPropagation?.();
  } catch {}
}

function isPromptEl(el: Element | null): el is PromptEl {
  if (!el) return false;
  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLInputElement && el.type === 'text') return true;
  if (el instanceof HTMLElement && el.isContentEditable) return true;
  return false;
}

function getPromptInput(): PromptEl | null {
  // COMPREHENSIVE LLM selectors - ChatGPT, Claude, Gemini, Grok, Perplexity, etc.
  const selectors = [
    // ChatGPT (OpenAI)
    'textarea#prompt-textarea',
    'textarea[data-id="root"]',
    'textarea[placeholder*="Message"]',
    'textarea[placeholder*="Send a message"]',

    // Claude (Anthropic)
    'div[contenteditable="true"][data-placeholder]',
    'div.ProseMirror[contenteditable="true"]',
    'div[aria-label*="Message"]',

    // Gemini (Google)
    'textarea[aria-label*="Enter a prompt"]',
    'textarea[aria-label*="Message"]',
    'rich-textarea textarea',

    // Grok (X.AI)
    'textarea[placeholder*="Ask anything"]',
    'textarea[aria-label*="Message"]',

    // Perplexity
    'textarea[placeholder*="Ask anything"]',
    'textarea.search-input',

    // Generic fallbacks (catch-all)
    'textarea',
    'textarea[placeholder]',
    'input[type="text"]',
    'div[contenteditable="true"]',
    '[contenteditable="true"]',
    '[role="textbox"]',
    'textarea[autofocus]',
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (isPromptEl(el)) return el;
  }

  // Fallback: Find largest textarea on page
  const textareas = Array.from(document.querySelectorAll('textarea'));
  if (textareas.length > 0) {
    // Sort by size and return the largest one (likely the main input)
    textareas.sort((a, b) => {
      const aSize = a.offsetHeight * a.offsetWidth;
      const bSize = b.offsetHeight * b.offsetWidth;
      return bSize - aSize;
    });
    if (isPromptEl(textareas[0])) return textareas[0];
  }

  return null;
}

function readPrompt(el: PromptEl): string {
  if (el instanceof HTMLTextAreaElement) return el.value ?? '';
  if (el instanceof HTMLInputElement) return el.value ?? '';
  return (el.textContent ?? '').trim();
}

function clearPrompt(el: PromptEl) {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
    el.value = '';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }
  el.textContent = '';
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

async function pvLogBlocked(category: string, meta: any) {
  // Prefer bulk endpoint (matches your backend test)
  const base = 'http://localhost:3000';
  const payload = {
    events: [
      {
        category,
        meta: meta ?? {},
        ts: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(`${base}/blocked/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) return;
  } catch {
    // ignore
  }

  // fallback single endpoint
  try {
    await fetch(`${base}/blocked`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        meta: meta ?? {},
        ts: new Date().toISOString(),
      }),
    });
  } catch {
    // ignore
  }
}

function handlePrompt(prompt: string, inputEl: PromptEl, ev?: Event) {
  const res = checkForForbidden(prompt);
  if (!res.blocked) return false;

  // CRITICAL: Stop submission immediately
  hardCancel(ev);

  // CRITICAL: Wipe prompt completely
  clearPrompt(inputEl);

  // Determine severity
  const severityMap: Record<string, 'critical' | 'high' | 'medium'> = {
    selfHarm: 'critical',
    chemicalHarm: 'critical',
    biologicalHarm: 'critical',
    physicalHarm: 'critical',
    databaseManipulation: 'critical',
    weapons: 'high',
    promptInjection: 'high',
    enterpriseThreats: 'high',
  };
  const severity = severityMap[res.category || ''] || 'critical';

  // Severity-based messages
  const messages = {
    critical: `🚨 BLOCKED: ${res.category} content detected. This content violates safety policies. If you need support, please contact appropriate resources.`,
    high: `⚠️ BLOCKED: ${res.category} content detected. Contact admin for guidance.`,
    medium: `⚡ BLOCKED: ${res.category} content detected.`
  };

  // Show warning with appropriate severity
  showWarning(messages[severity], severity);

  // Log blocked attempt (NO prompt content stored, only metadata)
  void pvLogBlocked(res.category!, {
    len: (prompt ?? '').length,
    severity,
    timestamp: new Date().toISOString(),
    url: window.location.hostname
  });

  return true;
}

console.log('[PV] injector loaded:', location.href);

// ENTER submit (capture)
document.addEventListener(
  'keydown',
  (e) => {
    const ke = e as KeyboardEvent;
    if (ke.key !== 'Enter') return;
    if (ke.shiftKey) return;

    const inputEl = getPromptInput();
    if (!inputEl) return;

    const prompt = readPrompt(inputEl);
    handlePrompt(prompt, inputEl, e);
  },
  true
);

// SEND button click (capture) - Enhanced for all LLMs
document.addEventListener(
  'click',
  (e) => {
    const t = e.target as HTMLElement | null;
    if (!t) return;

    // Try to find button (could be clicked on child element like SVG icon)
    const btn = t.closest('button');
    if (!btn) return;

    const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
    const txt = (btn.textContent || '').toLowerCase().trim();
    const dataTestId = (btn.getAttribute('data-testid') || '').toLowerCase();
    const className = (btn.className || '').toLowerCase();

    // Comprehensive send button detection for all LLMs
    const looksLikeSend =
      // Text-based
      txt === 'send' ||
      txt.includes('send message') ||
      txt === 'submit' ||
      txt.includes('ask') ||

      // Aria labels
      aria.includes('send') ||
      aria.includes('submit') ||
      aria.includes('send message') ||
      aria.includes('submit message') ||

      // Data attributes
      dataTestId.includes('send') ||
      dataTestId.includes('submit') ||

      // Class names
      className.includes('send') ||
      className.includes('submit') ||

      // Icon-only buttons (common in modern UIs)
      (btn.querySelector('svg') && btn.offsetWidth < 60 && btn.offsetWidth > 20) ||

      // Button near textarea (positional heuristic)
      (txt === '' && btn.type === 'submit');

    if (!looksLikeSend) return;

    const inputEl = getPromptInput();
    if (!inputEl) return;

    const prompt = readPrompt(inputEl);
    handlePrompt(prompt, inputEl, e);
  },
  true
);

// FORM submit (backup capture for direct form submissions)
document.addEventListener(
  'submit',
  (e) => {
    const inputEl = getPromptInput();
    if (!inputEl) return;

    const prompt = readPrompt(inputEl);
    handlePrompt(prompt, inputEl, e);
  },
  true
);
