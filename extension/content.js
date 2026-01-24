// extension/content.js
// Plain JS content script to block forbidden prompts.

(() => {
  const forbiddenKeywords = {
    weapons: [/g[uü]n/i, /b[o0]mb/i, /kn[i1]fe/i, /we[a4]p[o0]n/i],
    selfHarm: [/s[uü][i1]c[i1]de/i, /s3lf[\s\-_]*h[a4]rm/i, /\bkms\b/i, /k[i1]ll[\s\-_]*m[yÿ][s5]3lf/i],
    enterpriseThreats: [/h[a4]ck/i, /ph[i1]sh/i, /r[a4]ns[o0]mw[a4]re/i, /sql[\s\-_]*[i1]nj(e|3)ct/i],
  };

  function checkForForbidden(prompt) {
    for (const [category, regexes] of Object.entries(forbiddenKeywords)) {
      if (regexes.some((re) => re.test(prompt))) {
        return { blocked: true, category };
      }
    }
    return { blocked: false };
  }

  function showWarning(message) {
    const warningDiv = document.createElement('div');
    warningDiv.textContent = message;
    warningDiv.style.cssText =
      'position:fixed;top:12px;right:12px;z-index:2147483647;background:#b91c1c;color:#fff;padding:10px 12px;border-radius:10px;font-size:13px;font-weight:600;max-width:340px;box-shadow:0 10px 30px rgba(0,0,0,.30)';
    document.body.appendChild(warningDiv);
    setTimeout(() => warningDiv.remove(), 4500);
  }

  function getInput() {
    return document.querySelector('textarea') || document.querySelector('input[type="text"]');
  }

  function clearInput(el) {
    el.value = '';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function handlePrompt(prompt, inputEl, ev) {
    const res = checkForForbidden(prompt || '');
    if (!res.blocked) return false;

    if (ev) ev.preventDefault();

    clearInput(inputEl);
    showWarning(`Blocked: Potential ${res.category} content detected. Contact admin for guidance.`);

    try {
      chrome.runtime.sendMessage({ type: 'logBlockedEvent', category: res.category, meta: { len: prompt.length } });
    } catch (e) {}

    return true;
  }

  function bind() {
    const input = getInput();
    if (!input || input.__pvBound) return;
    input.__pvBound = true;

    input.addEventListener(
      'keydown',
      (e) => {
        if (e.key !== 'Enter') return;
        if (e.shiftKey) return;

        handlePrompt(input.value || '', input, e);
      },
      true
    );
  }

  bind();
  new MutationObserver(bind).observe(document.documentElement, { childList: true, subtree: true });
})();
