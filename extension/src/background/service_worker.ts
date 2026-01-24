import { sha256Hex } from '@shared/crypto/hashing';
import { generateKeyPair, sign, createKeyId } from '@shared/crypto/signing';

type PVPromptMsg = {
  type: 'PV_PROMPT';
  source: string;
  url: string;
  pageTitle?: string;
  prompt: string;
  policy?: any;
};

async function getOrCreateDeviceIdentity() {
  const stored = await chrome.storage.local.get([
    'pv_deviceId',
    'pv_publicKey',
    'pv_privateKey',
    'pv_userId',
    'pv_apiUrl'
  ]);

  let deviceId = stored.pv_deviceId as string | undefined;
  let userId = stored.pv_userId as string | undefined;
  let publicKey = stored.pv_publicKey as string | undefined;
  let privateKey = stored.pv_privateKey as string | undefined;
  let apiUrl = (stored.pv_apiUrl as string | undefined) || 'http://localhost:3000';

  if (!deviceId) deviceId = 'local-dev-device';
  if (!userId) userId = 'local-dev-user';

  if (!publicKey || !privateKey) {
    const kp = await generateKeyPair();
    publicKey = kp.publicKey;
    privateKey = kp.privateKey;

    await chrome.storage.local.set({
      pv_publicKey: publicKey,
      pv_privateKey: privateKey
    });
  }

  await chrome.storage.local.set({ pv_deviceId: deviceId, pv_userId: userId, pv_apiUrl: apiUrl });

  return { deviceId, userId, publicKey, privateKey, apiUrl };
}

async function getParentChainHash(): Promise<string | null> {
  const stored = await chrome.storage.local.get(['pv_lastChainHash']);
  return (stored.pv_lastChainHash as string) || null;
}

async function setParentChainHash(chainHash: string) {
  await chrome.storage.local.set({ pv_lastChainHash: chainHash });
}

function canonical(obj: any): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

async function ingestToBackend(apiUrl: string, userId: string, eventObj: any) {
  const resp = await fetch(`${apiUrl}/v1/events/batch`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-dev-user-id': userId
    },
    body: JSON.stringify({ events: [eventObj] })
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`backend ingest failed: ${resp.status} ${text}`);
  }

  return resp.json().catch(() => ({}));
}

chrome.runtime.onMessage.addListener((msg: PVPromptMsg, _sender, sendResponse) => {
  (async () => {
    if (!msg || msg.type !== 'PV_PROMPT') return;

    const { deviceId, userId, publicKey, privateKey, apiUrl } = await getOrCreateDeviceIdentity();

    const ts = new Date().toISOString();

    const payload = {
      source: msg.source,
      url: msg.url,
      ts,
      prompt: msg.prompt,
      pageTitle: msg.pageTitle || '',
      policy: msg.policy || null
    };

    const intentHash = sha256Hex(canonical(payload));
    const parentHash = await getParentChainHash();

    const chainMaterial = canonical({
      parentHash,
      intentHash,
      ts,
      deviceId,
      userId
    });

    const chainHash = sha256Hex(chainMaterial);
    const signature = await sign(chainHash, privateKey);

    const event = {
      id: crypto.randomUUID(),
      source: msg.source,
      url: msg.url,
      tsClient: ts,
      deviceId,
      userId,
      intentHash,
      parentHash,
      chainHash,
      signature,
      publicKey,
      keyId: createKeyId(publicKey)
    };

    const eventObj = { event, payload };

    await ingestToBackend(apiUrl, userId, eventObj);

    await setParentChainHash(chainHash);

    sendResponse({ ok: true, eventId: event.id });
  })().catch((err) => {
    console.error('[PrivateVault] service worker error:', err);
    sendResponse({ ok: false, error: String(err?.message || err) });
  });

  return true;
});

// ===============================
// PrivateVault: Blocked Prompt Queue (bulk ingest)
// ===============================

type PVBlockedEvent = {
  category: string;
  meta?: any;
  ts: string;
};

const PV_BLOCKED_QUEUE_KEY = 'pv_blocked_queue_v1';
const PV_BLOCKED_FLUSH_INTERVAL_MS = 10_000;
const PV_BLOCKED_MAX_RETRIES = 3;

let pvBlockedFlushTimer: number | null = null;

async function pvBlockedGetQueue(): Promise<Array<{ ev: PVBlockedEvent; retries: number }>> {
  const data = await chrome.storage.local.get(PV_BLOCKED_QUEUE_KEY);
  return Array.isArray(data[PV_BLOCKED_QUEUE_KEY]) ? data[PV_BLOCKED_QUEUE_KEY] : [];
}

async function pvBlockedSetQueue(q: Array<{ ev: PVBlockedEvent; retries: number }>) {
  await chrome.storage.local.set({ [PV_BLOCKED_QUEUE_KEY]: q });
}

function pvBlockedScheduleFlush() {
  if (pvBlockedFlushTimer !== null) return;
  pvBlockedFlushTimer = setTimeout(() => pvBlockedFlush(), PV_BLOCKED_FLUSH_INTERVAL_MS) as unknown as number;
}

async function pvBlockedEnqueue(ev: PVBlockedEvent) {
  const q = await pvBlockedGetQueue();
  q.push({ ev, retries: 0 });
  await pvBlockedSetQueue(q);
  pvBlockedScheduleFlush();
}

async function pvBlockedFlush() {
  pvBlockedFlushTimer = null;

  const q = await pvBlockedGetQueue();
  if (q.length === 0) return;

  const events = q.map((x) => x.ev);

  try {
    const base = 'http://localhost:3000';

    const res = await fetch(`${base}/blocked/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    });

    if (!res.ok) throw new Error('blocked bulk failed');

    // success
    await pvBlockedSetQueue([]);
  } catch {
    // retry
    const updated = q
      .map((x) => ({ ...x, retries: (x.retries ?? 0) + 1 }))
      .filter((x) => (x.retries ?? 0) < PV_BLOCKED_MAX_RETRIES);

    await pvBlockedSetQueue(updated);
    if (updated.length > 0) pvBlockedScheduleFlush();
  }
}

// Single handler for blocked prompts coming from content scripts
chrome.runtime.onMessage.addListener((message: any, _sender, sendResponse) => {
  if (!message || typeof message !== 'object') return;

  if (message.type === 'logBlockedEvent') {
    pvBlockedEnqueue({
      category: String(message.category || ''),
      meta: message.meta ?? {},
      ts: new Date().toISOString(),
    })
      .then(() => sendResponse?.({ queued: true }))
      .catch((e) => sendResponse?.({ queued: false, error: e?.message }));
    return true;
  }

  // debug helpers
  if (message.type === 'pvDebugBlockedQueueGet') {
    pvBlockedGetQueue()
      .then((q) => sendResponse?.({ ok: true, size: q.length, q }))
      .catch((e) => sendResponse?.({ ok: false, error: e?.message }));
    return true;
  }

  if (message.type === 'pvDebugBlockedQueueFlush') {
    pvBlockedFlush()
      .then(() => sendResponse?.({ ok: true }))
      .catch((e) => sendResponse?.({ ok: false, error: e?.message }));
    return true;
  }
});

// Flush scheduling
chrome.runtime.onStartup.addListener(() => pvBlockedScheduleFlush());
chrome.runtime.onInstalled.addListener(() => pvBlockedScheduleFlush());

// --- PV DEBUG: log all runtime messages ---
chrome.runtime.onMessage.addListener((m: any) => {
  try {
    console.log('[PV][SW] onMessage', m);
  } catch {}
});

// --- PV DEBUG: prove SW receives blocked events ---
chrome.runtime.onMessage.addListener((m: any, _sender, sendResponse) => {
  if (m?.type === 'logBlockedEvent') {
    console.log('[PV][SW] RECEIVED logBlockedEvent', m);
    sendResponse?.({ ok: true });
    return true;
  }
});

// ===============================
// PV: Port receiver for blocked events (reliable MV3)
// ===============================
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'pv_blocked_port') return;

  port.onMessage.addListener(async (m: any) => {
    if (!m || m.type !== 'logBlockedEvent') return;

    // immediate write so you can verify in storage
    const key = 'pv_blocked_queue_v1';
    const data = await chrome.storage.local.get(key);
    const q = Array.isArray(data[key]) ? data[key] : [];

    q.push({
      ev: { category: String(m.category || ''), meta: m.meta ?? {}, ts: new Date().toISOString() },
      retries: 0,
    });

    await chrome.storage.local.set({ [key]: q });
    console.log('[PV][SW] queued blocked via port', q.length);
  });
});

// ===============================
// PV: Port receiver for blocked events (reliable MV3)
// ===============================
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'pv_blocked_port') return;

  port.onMessage.addListener(async (m: any) => {
    if (!m || m.type !== 'logBlockedEvent') return;

    const key = 'pv_blocked_queue_v1';
    const data = await chrome.storage.local.get(key);
    const q = Array.isArray(data[key]) ? data[key] : [];

    q.push({
      ev: { category: String(m.category || ''), meta: m.meta ?? {}, ts: new Date().toISOString() },
      retries: 0,
    });

    await chrome.storage.local.set({ [key]: q });
    console.log('[PV][SW] queued blocked via port', q.length);
  });
});
