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
