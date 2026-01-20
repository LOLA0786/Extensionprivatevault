/**
 * MVP Event Service (in-memory store)
 * Later: replace with Prisma + Postgres + S3
 */

import type { IntentEvent, IntentPayload } from '@privatevault/shared';
import { verify } from '@privatevault/shared';

const memoryStore = new Map<string, { event: IntentEvent; payload: IntentPayload }>();

function nowIso() {
  return new Date().toISOString();
}

export const eventService = {
  async ingestEvent(args: {
    event: IntentEvent;
    payload: IntentPayload;
    userId: string;
  }) {
    const { event, payload, userId } = args;

    // Basic verification
    const ok = await verify(event.chainHash, event.signature, event.publicKey);
    if (!ok) throw new Error('Invalid signature');

    // save
    memoryStore.set(event.id, { event: { ...event, userId }, payload });

    return { ok: true, id: event.id, ts: nowIso() };
  },

  async batchIngestEvents(args: {
    events: Array<{ event: IntentEvent; payload: IntentPayload }>;
    userId: string;
  }) {
    const { events, userId } = args;

    const results = [];
    for (const item of events) {
      try {
        await this.ingestEvent({ ...item, userId });
        results.push({ id: item.event.id, ok: true });
      } catch (e) {
        results.push({ id: item.event.id, ok: false, error: (e as Error).message });
      }
    }
    return results;
  },

  async getEventById(id: string, _userId: string) {
    return memoryStore.get(id) || null;
  },

  async listEvents(args: { userId: string; limit: number; offset: number }) {
    const all = Array.from(memoryStore.values())
      .filter((x) => x.event.userId === args.userId)
      .sort((a, b) => a.event.tsClient.localeCompare(b.event.tsClient));

    return {
      total: all.length,
      items: all.slice(args.offset, args.offset + args.limit),
    };
  },

  // DEV
  async listAllEvents(args: { limit: number; offset: number }) {
    const all = Array.from(memoryStore.values()).sort((a, b) =>
      a.event.tsClient.localeCompare(b.event.tsClient)
    );

    return {
      total: all.length,
      items: all.slice(args.offset, args.offset + args.limit),
    };
  },

  async getAnyEventById(id: string) {
    return memoryStore.get(id) || null;
  }
};
