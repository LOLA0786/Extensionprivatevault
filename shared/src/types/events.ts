/**
 * Shared event types (extension + backend)
 */

export type Source = 'chatgpt' | 'claude' | 'gemini' | 'perplexity' | 'generic';

export type PolicyDecision = 'ALLOW' | 'WARN' | 'BLOCK' | 'REQUIRE_APPROVAL';

export interface IntentPayload {
  source: Source;
  url: string;
  ts: string; // ISO timestamp (client)

  prompt: string;
  response?: string;

  // Extra metadata for replay/debug
  sessionId?: string;
  pageTitle?: string;
}

export interface IntentEvent {
  id: string; // uuid
  source: Source;
  url: string;

  tsClient: string; // ISO
  deviceId: string;
  userId: string;

  // tamper-evident chain
  intentHash: string;  // sha256(payload)
  parentHash?: string | null;
  chainHash: string;   // sha256(parentHash + intentHash + meta)

  // signature on chainHash
  signature: string;   // ed25519 signature hex
  publicKey: string;   // hex public key
  keyId: string;       // deterministic id

  // policy response (backend-filled)
  riskScore?: number;
  decision?: PolicyDecision;
  decisionReason?: string;
}
