/**
 * ChatGPT site adapter
 * Handles DOM interaction with chatgpt.com + chat.openai.com
 */

import type { SiteAdapter } from '../../core/types';

const CHATGPT_SELECTORS = {
  promptInput: 'textarea',
  submitButton: 'button[data-testid="send-button"], button[aria-label*="Send"]'
};

export const chatGPTAdapter: SiteAdapter = {
  name: 'chatgpt',

  detect(): boolean {
    return (
      window.location.hostname === 'chat.openai.com' ||
      window.location.hostname === 'chatgpt.com'
    );
  },

  getPromptText(): string | null {
    const input = document.querySelector<HTMLTextAreaElement>(CHATGPT_SELECTORS.promptInput);
    return input?.value || null;
  },

  getResponseText(): string | null {
    const nodes = document.querySelectorAll<HTMLElement>('.markdown');
    const last = nodes[nodes.length - 1];
    return last?.innerText || null;
  },

  onSubmit(callback: (prompt: string) => void): () => void {
    const input = document.querySelector<HTMLTextAreaElement>(CHATGPT_SELECTORS.promptInput);

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const prompt = input?.value;
        if (prompt && prompt.trim().length > 0) {
          setTimeout(() => callback(prompt), 50);
        }
      }
    };

    input?.addEventListener('keydown', handler);

    const btn = document.querySelector<HTMLButtonElement>(CHATGPT_SELECTORS.submitButton);
    const clickHandler = () => {
      const prompt = input?.value;
      if (prompt && prompt.trim().length > 0) setTimeout(() => callback(prompt), 50);
    };
    btn?.addEventListener('click', clickHandler);

    return () => {
      input?.removeEventListener('keydown', handler);
      btn?.removeEventListener('click', clickHandler);
    };
  },

  onResponse(callback: (response: string) => void): () => void {
    const observer = new MutationObserver(() => {
      const response = this.getResponseText();
      if (response) callback(response);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }
};
