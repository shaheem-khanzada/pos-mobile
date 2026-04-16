import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { payloadSdk } from '@/payload/sdk';
import { useAuthStore } from '@/stores/auth-store';

/** Sign in with email/password; persists JWT + user then navigates to tabs. */
export function useLoginMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const result = await payloadSdk.login({
        collection: 'users',
        data: body,
      });
      const token = result.token;
      if (!token) {
        throw new Error('Login succeeded but the server did not return a token.');
      }
      return {
        token,
        user: result.user,
        exp: result.exp ?? 0,
      };
    },
    onSuccess: (data) => {
      useAuthStore.getState().setSession(data);
      router.replace('/tabs/orders');
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
    mutationFn: (body: { email: string }) =>
      payloadSdk.forgotPassword({
        collection: 'users',
        data: body,
      }),
  });
}

/**
 * Completes reset with the one-time token (from email deep link or pasted in dev).
 * Payload returns a fresh JWT — we log the user in so they land straight in the app.
 */
export function useResetPasswordMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: { token: string; password: string }) => {
      const result = await payloadSdk.resetPassword({
        collection: 'users',
        data: {
          password: body.password,
          token: body.token,
        },
      });
      const token = result.token;
      if (!token) {
        throw new Error('Password was reset but the server did not return a token.');
      }
      return {
        token,
        user: result.user,
      };
    },
    onSuccess: (data) => {
      useAuthStore.getState().setSession({
        token: data.token,
        user: data.user,
        exp: null,
      });
      router.replace('/tabs/orders');
    },
  });
}

/** Calls CMS logout, then always clears local session (user expects to be signed out). */
export function useLogoutMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: () =>
      payloadSdk
        .request({
          method: 'POST',
          path: '/users/logout',
        })
        .then((res) => res.json() as Promise<{ message: string }>),
    onSettled: () => {
      useAuthStore.getState().clearSession();
      router.replace('/auth/login');
    },
  });
}
