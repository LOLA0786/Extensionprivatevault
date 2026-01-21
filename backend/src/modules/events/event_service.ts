import type { IntentEvent, IntentPayload } from "@privatevault/shared/dist/types/events";
import { verify } from "@privatevault/shared/dist/crypto/signing";

export async function verifyEventSignature(
  event: IntentEvent,
  payload: IntentPayload
): Promise<boolean> {
  // verify signature on chainHash
  return verify(event.chainHash, event.signature, event.publicKey);
}
