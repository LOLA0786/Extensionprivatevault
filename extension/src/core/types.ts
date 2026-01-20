/**
 * Extension-specific types
 */

import type { Source, IntentEvent, IntentPayload } from '@shared/types/events';

export interface SiteAdapter {
  name: Source;
  detect: () => boolean;
  getPromptText: () => string | null;
  getResponseText: () => string | null;
  onSubmit: (callback: (prompt: string) => void) => () => void;
  onResponse: (callback: (response: string) => void) => () => void;
}

export interface LocalEvent {
  event: IntentEvent;
  payload: IntentPayload;
  synced: boolean;
  syncedAt?: string;
}

export interface ExtensionConfig {
  apiUrl: string;
  deviceId: string;
  userId: string;
  publicKey: string;
  privateKey: string; // Encrypted at rest

  // Feature flags
  localOnly: boolean;
  autoSync: boolean;
  realTimePolicy: boolean;

  // UI preferences
  sidebarEnabled: boolean;
  sidebarPosition: 'left' | 'right';
}

export interface SyncQueue {
  pending: LocalEvent[];
  failed: Array<{
    event: LocalEvent;
    error: string;
    retryCount: number;
  }>;
}

export interface PolicyCache {
  rules: Map<string, any>;
  lastUpdated: string;
}
