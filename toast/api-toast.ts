import { setToast } from '@/toast/store';

type UnknownError = unknown;

export function extractApiErrorMessage(error: UnknownError): string {
  if (error instanceof Error && error.message?.trim()) {
    return error.message.trim();
  }

  if (typeof error === 'object' && error !== null) {
    const anyError = error as {
      message?: unknown;
      errors?: Array<{ message?: unknown }>;
    };
    if (typeof anyError.message === 'string' && anyError.message.trim()) {
      return anyError.message.trim();
    }
    const firstNested = anyError.errors?.[0]?.message;
    if (typeof firstNested === 'string' && firstNested.trim()) {
      return firstNested.trim();
    }
  }

  return 'Please try again.';
}

export function showApiErrorToast(action: string, error: UnknownError) {
  const normalizedAction = action.trim() || 'Action';
  setToast({
    variant: 'error',
    title: `${normalizedAction} failed`,
    description: extractApiErrorMessage(error),
  });
}

