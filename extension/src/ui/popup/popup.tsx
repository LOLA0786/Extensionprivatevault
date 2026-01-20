import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

type VaultRecord = {
  id: string;
  createdAt: string;
  synced: boolean;
  event: any;
  payload: any;
};

function App() {
  const [items, setItems] = useState<VaultRecord[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const handler = (msg: any) => {
      if (msg.type === 'PV_LOCAL_EVENTS_RESULT') {
        setItems(msg.items || []);
      }
    };

    chrome.runtime.onMessage.addListener(handler);

    chrome.runtime.sendMessage({ type: 'PV_LIST_LOCAL_EVENTS', limit: 10 });

    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  return (
    <div style={{ padding: 12, width: 320 }}>
      <h3 style={{ marginTop: 0 }}>PrivateVault</h3>

      {err && <div style={{ color: 'red' }}>{err}</div>}

      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
        Local vault events: {items.length}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((it) => (
          <div
            key={it.id}
            style={{
              border: '1px solid #eee',
              borderRadius: 8,
              padding: 8
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              {new Date(it.createdAt).toLocaleString()}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>
              {it.payload?.source} • {it.synced ? '✅ synced' : '⏳ local'}
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {(it.payload?.prompt || '').slice(0, 80)}
              {(it.payload?.prompt || '').length > 80 ? '…' : ''}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            No events yet. Open ChatGPT/Claude and send a prompt.
          </div>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
