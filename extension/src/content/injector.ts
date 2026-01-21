import { scanPrompt } from '../core/policy/policy_scan';
import { showPolicyBanner } from './policy_banner';

console.log('[PrivateVault] content script loaded at', window.location.href);

function sanitizePrompt(raw: string): string | null {
  if (!raw) return null;
  const p = raw.trim();
  if (!p) return null;

  const deny = [
    '[PrivateVault]',
    'injector.ts-',
    "Could not find the language 'env'",
    'chrome-extension://',
    'rinky@',
    '% curl',
    'curl -s http',
    '{"status":"ok"',
  ];
  for (const d of deny) if (p.includes(d)) return null;

  if (p.length > 2000) return null;
  return p;
}

function detectPrompt(): string | null {
  const ta = document.querySelector('form textarea') as HTMLTextAreaElement | null;
  if (ta?.value?.trim()) return ta.value;

  const ces = Array.from(document.querySelectorAll('[contenteditable="true"]')) as HTMLElement[];
  const ce = ces[ces.length - 1];
  if (ce?.innerText?.trim()) return ce.innerText;

  return null;
}

function emitPrompt(raw: string) {
  const prompt = sanitizePrompt(raw);
  if (!prompt) return;

  const policy = scanPrompt(prompt);
  showPolicyBanner(prompt, policy);

  chrome.runtime.sendMessage({
    type: 'PV_PROMPT',
    source: 'chatgpt',
    url: window.location.href,
    pageTitle: document.title,
    prompt,
    policy,
  });
}

function installCapture() {
  console.log('[PrivateVault] installing DOM capture ✅');

  document.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const p = detectPrompt();
        if (p) setTimeout(() => emitPrompt(p), 30);
      }
    },
    true
  );

  document.addEventListener(
    'click',
    () => {
      const p = detectPrompt();
      if (p) setTimeout(() => emitPrompt(p), 30);
    },
    true
  );
}

if (location.hostname.includes('chatgpt.com') || location.hostname.includes('chat.openai.com')) {
  installCapture();
}
