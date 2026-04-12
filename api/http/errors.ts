import { isAxiosError } from 'axios';

/**
 * Pulls a readable message out of Payload / Axios error shapes so screens
 * can show something helpful without caring about HTTP details.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: { message?: string }[] }
      | undefined;
    if (data?.message && typeof data.message === 'string') {
      return data.message;
    }
    const first = data?.errors?.[0]?.message;
    if (first) {
      return first;
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
