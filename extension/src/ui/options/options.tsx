import React from 'react';
import { createRoot } from 'react-dom/client';

function Options() {
  return (
    <div style={{ padding: 12 }}>
      <h2>PrivateVault Options</h2>
      <p>Options UI coming soon.</p>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Options />);
