import { httpClient } from '@/api/http/client';
import { USERS_SLUG } from '@/lib/config';

import type {
  ForgotPasswordResponse,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  ResetPasswordResponse,
} from './types';

const base = (path: string) => `/api/${USERS_SLUG}${path}`;

export async function loginRequest(body: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const { data } = await httpClient.post<LoginResponse>(base('/login'), body);
  return data;
}

export async function logoutRequest(): Promise<LogoutResponse> {
  const { data } = await httpClient.post<LogoutResponse>(base('/logout'));
  return data;
}

export async function refreshTokenRequest(): Promise<RefreshTokenResponse> {
  const { data } = await httpClient.post<RefreshTokenResponse>(
    base('/refresh-token')
  );
  return data;
}

export async function forgotPasswordRequest(body: {
  email: string;
}): Promise<ForgotPasswordResponse> {
  const { data } = await httpClient.post<ForgotPasswordResponse>(
    base('/forgot-password'),
    body
  );
  return data;
}

export async function resetPasswordRequest(body: {
  token: string;
  password: string;
}): Promise<ResetPasswordResponse> {
  const { data } = await httpClient.post<ResetPasswordResponse>(
    base('/reset-password'),
    body
  );
  return data;
}
