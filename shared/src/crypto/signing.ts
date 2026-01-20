/**
 * Digital signature utilities using Ed25519
 */

import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

// Set up SHA-512 for ed25519
ed25519.etc.sha512Sync = (...m: Uint8Array[]) => sha512(ed25519.etc.concatBytes(...m));

export interface KeyPair {
  publicKey: string; // hex
  privateKey: string; // hex
}

export interface SignedMessage {
  message: string;
  signature: string;
  publicKey: string;
}

export async function generateKeyPair(): Promise<KeyPair> {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = await ed25519.getPublicKeyAsync(privateKey);

  return {
    publicKey: bytesToHex(publicKey),
    privateKey: bytesToHex(privateKey),
  };
}

export async function sign(message: string, privateKeyHex: string): Promise<string> {
  const messageBytes = new TextEncoder().encode(message);
  const privateKey = hexToBytes(privateKeyHex);

  const signature = await ed25519.signAsync(messageBytes, privateKey);
  return bytesToHex(signature);
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
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export async function createSignedMessage(
  message: string,
  privateKeyHex: string,
  publicKeyHex: string
): Promise<SignedMessage> {
  const signature = await sign(message, privateKeyHex);

  return {
    message,
    signature,
    publicKey: publicKeyHex,
  };
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
