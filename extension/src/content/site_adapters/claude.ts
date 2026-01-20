/**
 * Claude site adapter
 * Handles DOM interaction with claude.ai
 */

import type { SiteAdapter } from '../../core/types';

const CLAUDE_SELECTORS = {
  promptInput: 'div[contenteditable="true"]',
  submitButton: 'button[aria-label="Send Message"]',
  responseContainer: '.font-claude-message',
  lastResponse: '.font-claude-message:last-of-type',
};

export const claudeAdapter: SiteAdapter = {
  name: 'claude',

  detect(): boolean {
    return window.location.hostname === 'claude.ai';
  },

  getPromptText(): string | null {
    const input = document.querySelector<HTMLElement>(
      CLAUDE_SELECTORS.promptInput
    );
    return input?.innerText || null;
  },

  getResponseText(): string | null {
    const response = document.querySelector<HTMLElement>(
      CLAUDE_SELECTORS.lastResponse
    );
    return response?.innerText || null;
  },

  onSubmit(callback: (prompt: string) => void): () => void {
    const handleSubmit = () => {
      const input = document.querySelector<HTMLElement>(
        CLAUDE_SELECTORS.promptInput
      );
      const prompt = input?.innerText;

      if (prompt) {
        setTimeout(() => callback(prompt), 100);
      }
    };

    const input = document.querySelector(CLAUDE_SELECTORS.promptInput);
    const button = document.querySelector(CLAUDE_SELECTORS.submitButton);

    const keydownHandler = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Enter' && (ke.metaKey || ke.ctrlKey)) {
        handleSubmit();
      }
    };

    input?.addEventListener('keydown', keydownHandler);
    button?.addEventListener('click', handleSubmit);

    return () => {
      input?.removeEventListener('keydown', keydownHandler);
      button?.removeEventListener('click', handleSubmit);
    };
  },

  onResponse(callback: (response: string) => void): () => void {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const response = claudeAdapter.getResponseText();
          if (response) {
            // Debounce to avoid too many callbacks during streaming
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => callback(response), 500);
          }
        }
      }
    });

    const container = document.querySelector('main');
    if (container) {
      observer.observe(container, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => observer.disconnect();
  },
};
