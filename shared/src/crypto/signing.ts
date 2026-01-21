/**
 * Digital signature utilities using Ed25519
 *
 * Compatible with modern @noble/ed25519 versions where:
 * - ed25519.utils.randomPrivateKey() may not exist
 * - use ed25519.utils.randomSecretKey()
 * - ed25519.etc.sha512Sync may not exist / is not required
 */

import * as ed25519 from "@noble/ed25519";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";

export interface KeyPair {
  publicKey: string;  // hex
  privateKey: string; // hex
}

export interface SignedMessage {
  message: string;
  signature: string;
  publicKey: string;
}

export async function generateKeyPair(): Promise<KeyPair> {
  // newer noble uses randomSecretKey()
  const privateKey = ed25519.utils.randomSecretKey();
  const publicKey = await ed25519.getPublicKeyAsync(privateKey);

  return {
    publicKey: bytesToHex(publicKey),
    privateKey: bytesToHex(privateKey),
  };
}

export async function sign(message: string, privateKeyHex: string): Promise<string> {
  const messageBytes = new TextEncoder().encode(message);
  const privateKey = hexToBytes(privateKeyHex);

  const sig = await ed25519.signAsync(messageBytes, privateKey);
  return bytesToHex(sig);
}

export async function verify(
  message: string,
  signatureHex: string,
  publicKeyHex: string
): Promise<boolean> {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signature = hexToBytes(signatureHex);
    const publicKey = hexToBytes(publicKeyHex);
    return await ed25519.verifyAsync(signature, messageBytes, publicKey);
  } catch {
    return false;
  }
}

export async function createSignedMessage(
  message: string,
  privateKeyHex: string,
  publicKeyHex: string
): Promise<SignedMessage> {
  const signature = await sign(message, privateKeyHex);
  return { message, signature, publicKey: publicKeyHex };
}

export async function verifySignedMessage(signedMessage: SignedMessage): Promise<boolean> {
  return verify(signedMessage.message, signedMessage.signature, signedMessage.publicKey);
}

export async function getPublicKey(privateKeyHex: string): Promise<string> {
  const privateKey = hexToBytes(privateKeyHex);
  const publicKey = await ed25519.getPublicKeyAsync(privateKey);
  return bytesToHex(publicKey);
}

export function createKeyId(publicKeyHex: string): string {
  return publicKeyHex.substring(0, 16);
}
