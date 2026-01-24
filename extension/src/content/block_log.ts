export async function pvLogBlocked(category: string, meta: any) {
  try {
    await fetch('http://localhost:3000/blocked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, meta, ts: new Date().toISOString() }),
    });
  } catch {
    // ignore
  }
}
