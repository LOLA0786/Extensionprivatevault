console.log('[PrivateVault] content script loaded at', window.location.href);

/**
 * Prompt capture (ChatGPT) - production-friendly:
 * - capture from textarea OR contenteditable
 * - sanitize junk
 * - debounce duplicates
 */

let lastPromptHash: string | null = null;

function shaLite(s: string): string {
  // very light hash for duplicate suppression
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return String(h);
}

function sanitizePrompt(raw: string): string | null {
  if (!raw) return null;

  const prompt = raw.trim();

  // empty
  if (!prompt) return null;

  // avoid capturing our own logs / noise / debug dumps
  const deny = [
    '[PrivateVault]',
    'rinky@',
    '% curl',
    'curl -s http',
    '{"status":"ok"',

    "Could not find the language 'env'",
    'injector.ts-',
    'VM',
    'chrome-extension://',
  ];
  for (const d of deny) {
    if (prompt.includes(d)) return null;
  }

  // too big (accidental DOM dump)
  if (prompt.length > 2000) return null;

  // strip excessive whitespace
  const cleaned = prompt.replace(/\s+\n/g, '\n').replace(/\n{4,}/g, '\n\n');

  return cleaned.trim() || null;
}

function getPromptText(): string | null {
  // 1) ChatGPT textarea (most stable)
  const t = document.querySelector('textarea') as HTMLTextAreaElement | null;
  if (t?.value && t.value.trim()) return t.value;

  // 2) contenteditable input variant
  const ce = document.querySelector('[contenteditable="true"]') as HTMLElement | null;
  const txt = ce?.innerText;
  if (txt && txt.trim()) return txt;

  return null;
}

function sendPrompt(rawPrompt: string) {
  const prompt = sanitizePrompt(rawPrompt);
  if (!prompt) return;

  // suppress duplicates
  const h = shaLite(prompt);
  if (lastPromptHash === h) return;
  lastPromptHash = h;

  console.log('[PrivateVault] prompt captured ✅', prompt.slice(0, 80));

  chrome.runtime.sendMessage({
    type: 'PV_PROMPT',
    source: 'chatgpt',
    url: window.location.href,
    pageTitle: document.title,
    prompt
  });
}

function installDomCapture() {
  console.log('[PrivateVault] installing DOM capture ✅');

  document.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      // Enter (not shift-enter)
      if (e.key === 'Enter' && !e.shiftKey) {
        const p = getPromptText();
        if (p) setTimeout(() => sendPrompt(p), 30);
      }
    },
    true
  );

  document.addEventListener(
    'click',
    (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const btn = target.closest('button');
      if (!btn) return;

      const label =
        (btn.getAttribute('aria-label') || '') +
        ' ' +
        (btn.textContent || '') +
        ' ' +
        (btn.getAttribute('data-testid') || '');

      // detect send button
      const looksLikeSend =
        /send|submit/i.test(label) ||
        btn.getAttribute('data-testid')?.includes('send') ||
        btn.querySelector('svg') !== null;

      if (!looksLikeSend) return;

      const p = getPromptText();
      if (p) setTimeout(() => sendPrompt(p), 30);
    },
    true
  );

  // debug signal only once (not noisy)
  setTimeout(() => {
    const hasTextarea = !!document.querySelector('textarea');
    const hasCE = !!document.querySelector('[contenteditable="true"]');
    console.log(`[PrivateVault] input detect: hasTextarea=${hasTextarea} hasCE=${hasCE}`);
  }, 1200);
}

if (location.hostname === 'chatgpt.com' || location.hostname === 'chat.openai.com') {
  installDomCapture();
}
