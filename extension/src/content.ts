import { checkForForbidden } from '../../shared/filters';

type LogBlockedEventMsg = { type: 'logBlockedEvent'; category: string; meta?: { len: number } };

function showWarning(message: string) {
  const warningDiv = document.createElement('div');
  warningDiv.textContent = message;
  warningDiv.style.cssText = [
    'position:fixed',
    'top:12px',
    'right:12px',
    'z-index:2147483647',
    'background:#b91c1c',
    'color:white',
    'padding:10px 12px',
    'border-radius:10px',
    'font-size:13px',
    'font-weight:600',
    'max-width:340px',
    'box-shadow:0 10px 30px rgba(0,0,0,.30)',
  ].join(';');

  document.body.appendChild(warningDiv);
  setTimeout(() => warningDiv.remove(), 4500);
}

function isEditable(el: Element | null): el is HTMLTextAreaElement | HTMLInputElement {
  if (!el) return false;
  return el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && el.type === 'text');
}

function getPromptInput(): HTMLTextAreaElement | HTMLInputElement | null {
  const candidates = [
    document.querySelector('textarea'),
    document.querySelector('textarea[placeholder]'),
    document.querySelector('input[type="text"]'),
  ].filter(Boolean) as Element[];

  for (const el of candidates) {
    if (isEditable(el)) return el;
  }
  return null;
}

function clearInput(el: HTMLTextAreaElement | HTMLInputElement) {
  el.value = '';
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

function handlePrompt(prompt: string, inputEl: HTMLTextAreaElement | HTMLInputElement, ev?: Event) {
  const result = checkForForbidden(prompt);
  if (!result.blocked) return false;

  if (ev) ev.preventDefault();

  clearInput(inputEl);
  showWarning(`Blocked: Potential ${result.category} content detected. Contact admin for guidance.`);

  const msg: LogBlockedEventMsg = {
    type: 'logBlockedEvent',
    category: result.category!,
    meta: { len: prompt.length },
  };

  try {
    chrome.runtime.sendMessage(msg);
  } catch {}

  return true;
}

function bindToInput(el: HTMLTextAreaElement | HTMLInputElement) {
  if ((el as any).__pvBound) return;
  (el as any).__pvBound = true;

  el.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'Enter') return;
      if ((e as KeyboardEvent).shiftKey) return;
      handlePrompt(el.value ?? '', el, e);
    },
    true
  );
}

function bind() {
  const el = getPromptInput();
  if (el) bindToInput(el);
}

bind();

const obs = new MutationObserver(() => bind());
obs.observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener(
  'click',
  (e) => {
    const t = e.target as HTMLElement | null;
    if (!t) return;

    const btn = t.closest('button');
    if (!btn) return;

    const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
    const txt = (btn.textContent || '').toLowerCase();

    const looksLikeSend =
      aria.includes('send') ||
      aria.includes('submit') ||
      txt.trim() === 'send' ||
      txt.includes('send');

    if (!looksLikeSend) return;

    const inputEl = getPromptInput();
    if (!inputEl) return;

    handlePrompt(inputEl.value ?? '', inputEl, e);
  },
  true
);
