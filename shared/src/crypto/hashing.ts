/**
 * Hashing utilities (SHA-256) + canonical JSON
 */

import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';

export function canonicalStringify(obj: any): string {
  if (obj === null || obj === undefined) return String(obj);

  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalStringify).join(',')}]`;
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj).sort();
    const parts = keys.map((k) => `"${k}":${canonicalStringify(obj[k])}`);
    return `{${parts.join(',')}}`;
  }

  return JSON.stringify(obj);
}

export function sha256Hex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  return bytesToHex(sha256(bytes));
}

export function hashObject(obj: any): string {
  return sha256Hex(canonicalStringify(obj));
}
