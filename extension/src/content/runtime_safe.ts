export function safeSendMessage(msg: any) {
  try {
    // When extension reloads/updates, runtime context becomes invalidated.
    // Accessing runtime APIs can throw: "Extension context invalidated."
    const rt = (globalThis as any)?.chrome?.runtime;
    if (!rt?.id) return;
    rt.sendMessage(msg);
  } catch {
    // never crash the content script
  }
}
