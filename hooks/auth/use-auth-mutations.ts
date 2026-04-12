import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import {
  forgotPasswordRequest,
  loginRequest,
  logoutRequest,
  resetPasswordRequest,
} from '@/api/auth/auth.api';
import { useAuthStore } from '@/stores/auth-store';

/** Sign in with email/password; persists JWT + user then navigates to tabs. */
export function useLoginMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      useAuthStore.getState().setSession({
        token: data.token,
        user: data.user,
        exp: data.exp,
      });
      router.replace('/tabs/tab1');
    },
  });
}

/**
 * Triggers Payload's forgot-password email flow.
 * Payload usually returns the same generic success whether or not the email exists,
 * so we never try to "guess" if the account is real from the response.
 */
export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: forgotPasswordRequest,
  });
}

/**
 * Completes reset with the one-time token (from email deep link or pasted in dev).
 * Payload returns a fresh JWT — we log the user in so they land straight in the app.
 */
export function useResetPasswordMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: resetPasswordRequest,
    onSuccess: (data) => {
      useAuthStore.getState().setSession({
        token: data.token,
        user: data.user,
        exp: null,
      });
      router.replace('/tabs/tab1');
    },
  });
}

/** Calls CMS logout, then always clears local session (user expects to be signed out). */
export function useLogoutMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      useAuthStore.getState().clearSession();
      router.replace('/auth/login');
    },
  });
}
