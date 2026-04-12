import { PayloadSDK } from '@payloadcms/sdk';

import { PAYLOAD_API_BASE_URL } from '@/lib/config';
import type { Config } from '@/payload/payload-types';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Payload's own requests should not send an expired session JWT on the handful
 * of routes that carry auth in the body or create a new session.
 */
function shouldSkipSessionJwt(url: string): boolean {
  return (
    url.includes('/login') ||
    url.includes('/forgot-password') ||
    url.includes('/reset-password')
  );
}

function resolveRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
}

/**
 * Wraps global fetch so every SDK call can attach `Authorization: JWT …` from
 * Zustand, mirroring the old Axios interceptor.
 */
export const payloadFetch: typeof fetch = async (input, init) => {
  const url = resolveRequestUrl(input);
  const headers = new Headers(init?.headers ?? undefined);
  const token = useAuthStore.getState().token;
  if (token && !shouldSkipSessionJwt(url)) {
    headers.set('Authorization', `JWT ${token}`);
  }
  return fetch(input, {
    ...init,
    headers,
  });
};

/** Typed against `payload/payload-types.ts` — regenerate from admin (`payload generate:types`) and replace this file. */
export const payloadSdk = new PayloadSDK<Config>({
  baseURL: PAYLOAD_API_BASE_URL,
  fetch: payloadFetch,
});
