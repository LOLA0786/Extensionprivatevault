import { chatGPTAdapter } from './site_adapters/chatgpt';
import { claudeAdapter } from './site_adapters/claude';

function pickAdapter() {
  const adapters = [chatGPTAdapter, claudeAdapter];
  return adapters.find((a) => a.detect()) || null;
}

const adapter = pickAdapter();

if (adapter) {
  console.log(`[PrivateVault] Adapter detected: ${adapter.name}`);

  adapter.onSubmit((prompt) => {
    chrome.runtime.sendMessage({
      type: 'PV_PROMPT',
      source: adapter.name,
      url: window.location.href,
      pageTitle: document.title,
      prompt
    });
  });

  adapter.onResponse((response) => {
    chrome.runtime.sendMessage({
      type: 'PV_RESPONSE',
      source: adapter.name,
      url: window.location.href,
      pageTitle: document.title,
      response
    });
  });
}
