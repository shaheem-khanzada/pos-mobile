import type { SyncState } from './types';

/** Apply server-style fields when mutating existing rows pending push. */
export function nextSyncState(current: SyncState): SyncState {
  if (current === 'deleted' || current === 'created') return current;
  return 'updated';
}

export function isSoftDeleted(doc: { deletedAt?: string | null }) {
  return Boolean(doc.deletedAt);
}

export function asMillis(value?: string | null): number | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
}

export function asDate(value?: string | null, fallback = new Date()) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export function normalizeVariants<T extends { variants?: unknown }>(product: T) {
  const variantsValue = product.variants as any;
  if (Array.isArray(variantsValue)) {
    return variantsValue;
  }
  if (Array.isArray(variantsValue?.docs)) {
    return variantsValue.docs;
  }
  return [];
}

/**
 * Resolves a Payload-style relation: either a raw id string or an object with `id`.
 */
export function extractId(
  value: string | { id: string } | null | undefined
): string | null {
  if (value == null) return null;
  return typeof value === 'string' ? value : value.id;
}

/** Watermelon default ids are 16 alnum chars. */
const LOCAL_ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function makeLocalId() {
  let out = '';
  for (let i = 0; i < 16; i += 1) {
    out += LOCAL_ID_ALPHABET[Math.floor(Math.random() * LOCAL_ID_ALPHABET.length)];
  }
  return out;
}

export function extractRemoteCreatedId(response: any): string | null {
  const id = response?.id ?? response?.doc?.id ?? response?.data?.id;
  return typeof id === 'string' ? id : null;
}

export const sanitizer = (r: object): object => r;
