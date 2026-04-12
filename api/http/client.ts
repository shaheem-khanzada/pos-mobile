import axios from 'axios';

import { API_BASE_URL } from '@/lib/config';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Shared Axios instance for Payload REST.
 *
 * Auth routes (login, forgot-password, etc.) do not need a token; everything
 * else should send the JWT. Payload REST typically expects:
 *   Authorization: JWT <token>
 * If your server expects Bearer instead, change the prefix in one place here.
 */
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Cookie-based auth is mainly a browser concern; the app uses JWT from login.
  withCredentials: false,
});

httpClient.interceptors.request.use((config) => {
  const url = config.url ?? '';
  // Password reset carries its own token in the body; do not attach an old session JWT.
  const skipAuthHeader =
    url.includes('/login') ||
    url.includes('/forgot-password') ||
    url.includes('/reset-password');
  const token = useAuthStore.getState().token;
  if (!skipAuthHeader && token) {
    config.headers.Authorization = `JWT ${token}`;
  }
  return config;
});

/**
 * Phase 2 idea (not wired yet): on 401, call refresh-token, update the store,
 * retry the original request. That needs careful queueing so you do not refresh in parallel.
 */
