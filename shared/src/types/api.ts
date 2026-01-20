import type { IntentEvent, IntentPayload } from './events';

export interface IngestEventRequest {
  event: IntentEvent;
  payload: IntentPayload;
}

export interface BatchIngestRequest {
  events: Array<{
    event: IntentEvent;
    payload: IntentPayload;
  }>;
}

export interface BatchIngestResult {
  id: string;
  ok: boolean;
  error?: string;
  decision?: string;
  riskScore?: number;
}
