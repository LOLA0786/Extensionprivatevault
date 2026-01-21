import { generateKeyPair, createKeyId, sign } from '@privatevault/shared';
import { hashObject, sha256Hex } from '@privatevault/shared';
import type { BatchIngestRequest } from '@privatevault/shared';
import { postJSON } from '../transport/api_client';
import { localVault } from '../core/vault/local_store';

// --- Config (MVP) ---
const API_URL = 'http://localhost:3000';
const DEV_USER_ID = 'local-dev-user';
const DEVICE_ID = 'local-dev-device';

let keypair: { publicKey: string; privateKey: string } | null = null;

async function getOrCreateKeys() {
  if (keypair) return keypair;

  const stored = await chrome.storage.local.get(['pv_keys']);
  if (stored.pv_keys?.publicKey && stored.pv_keys?.privateKey) {
    keypair = stored.pv_keys;
    return keypair;
  }

  const kp = await generateKeyPair();
  keypair = kp;
  await chrome.storage.local.set({ pv_keys: kp });
  return kp;
}

function uuid() {
  return crypto.randomUUID();
}

async function ingestEventToBackend(event: any, payload: any) {
  const req: BatchIngestRequest = {
    events: [{ event, payload }]
  };

  return await postJSON(`${API_URL}/v1/events/batch`, req, {
    'x-dev-user-id': DEV_USER_ID
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  console.log("[PrivateVault] SW got message:", msg);
  (async () => {
    const kp = await getOrCreateKeys();

    if (msg.type === 'PV_PROMPT') {
      const createdAt = new Date().toISOString();

      const payload = {
        source: msg.source,
        url: msg.url,
        ts: createdAt,
        prompt: msg.prompt,
        pageTitle: msg.pageTitle || ''
      };

      const intentHash = hashObject(payload);

      // Hash chain
      const lastChainHash = await localVault.getKV<string>('lastChainHash');
      const parentHash = lastChainHash || null;

      const chainHash = sha256Hex(`${parentHash || 'genesis'}|${intentHash}|${payload.ts}`);
      const signature = await sign(chainHash, kp.privateKey);
      const keyId = createKeyId(kp.publicKey);

      const event = {
        id: uuid(),
        source: msg.source,
        url: msg.url,
        tsClient: payload.ts,
        deviceId: DEVICE_ID,
        userId: DEV_USER_ID,
        intentHash,
        parentHash,
        chainHash,
        signature,
        publicKey: kp.publicKey,
        keyId
      };

      // Save locally FIRST (local-first)
      await localVault.putEvent({
        id: event.id,
        createdAt,
        synced: false,
        event,
        payload
      });

      // Update chain head
      await localVault.setKV('lastChainHash', chainHash);

      console.log('[PrivateVault] Vault saved event:', event.id);

      // Sync (best-effort)
      try {
        const resp = await ingestEventToBackend(event, payload);
        console.log('[PrivateVault] Backend ingest response:', resp);

        // Mark as synced
        await localVault.putEvent({
          id: event.id,
          createdAt,
          synced: true,
          syncedAt: new Date().toISOString(),
          event,
          payload
        });
      } catch (e) {
        console.warn('[PrivateVault] ingest failed (will remain local):', e);
      }
    }

    if (msg.type === 'PV_LIST_LOCAL_EVENTS') {
      const events = await localVault.listEvents(msg.limit || 25);
      chrome.runtime.sendMessage({
        type: 'PV_LOCAL_EVENTS_RESULT',
        items: events
      });
    }
  })();

  return true;
});
