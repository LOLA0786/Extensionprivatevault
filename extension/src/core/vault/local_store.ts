/**
 * IndexedDB local vault (MVP)
 * Stores events + payloads locally for offline-first operation.
 */

export type VaultRecord = {
  id: string;
  createdAt: string;
  synced: boolean;
  syncedAt?: string;
  event: any;
  payload: any;
};

const DB_NAME = 'privatevault';
const DB_VERSION = 1;

const STORE_EVENTS = 'events';
const STORE_KV = 'kv';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;

      if (!db.objectStoreNames.contains(STORE_EVENTS)) {
        const events = db.createObjectStore(STORE_EVENTS, { keyPath: 'id' });
        events.createIndex('createdAt', 'createdAt', { unique: false });
        events.createIndex('synced', 'synced', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_KV)) {
        db.createObjectStore(STORE_KV, { keyPath: 'key' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => void,
  getResult?: (tx: IDBTransaction) => T
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);

    try {
      fn(store);
    } catch (e) {
      reject(e);
      return;
    }

    tx.oncomplete = () => {
      try {
        resolve(getResult ? getResult(tx) : (undefined as T));
      } catch (e) {
        reject(e);
      }
    };
    tx.onerror = () => reject(tx.error);
  });
}

export const localVault = {
  async putEvent(record: VaultRecord) {
    await withStore<void>(
      STORE_EVENTS,
      'readwrite',
      (store) => {
        store.put(record);
      }
    );
  },

  async listEvents(limit = 50): Promise<VaultRecord[]> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_EVENTS, 'readonly');
      const store = tx.objectStore(STORE_EVENTS);
      const idx = store.index('createdAt');

      const items: VaultRecord[] = [];

      // reverse cursor for latest first
      const req = idx.openCursor(null, 'prev');

      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor || items.length >= limit) {
          resolve(items);
          return;
        }
        items.push(cursor.value as VaultRecord);
        cursor.continue();
      };

      req.onerror = () => reject(req.error);
    });
  },

  async getEventById(id: string): Promise<VaultRecord | null> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_EVENTS, 'readonly');
      const store = tx.objectStore(STORE_EVENTS);

      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as VaultRecord) || null);
      req.onerror = () => reject(req.error);
    });
  },

  async setKV(key: string, value: any) {
    await withStore<void>(
      STORE_KV,
      'readwrite',
      (store) => {
        store.put({ key, value });
      }
    );
  },

  async getKV<T>(key: string): Promise<T | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_KV, 'readonly');
      const store = tx.objectStore(STORE_KV);

      const req = store.get(key);
      req.onsuccess = () => resolve(req.result?.value ?? null);
      req.onerror = () => reject(req.error);
    });
  }
};
