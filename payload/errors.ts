import { PayloadSDKError } from '@payloadcms/sdk';

/**
 * Pulls a readable message out of Payload SDK errors, fetch failures, or plain Errors
 * so screens can show something helpful without caring about the HTTP client.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong'
): string {
  if (error instanceof PayloadSDKError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
