import { QueryClient } from '@tanstack/react-query';

/**
 * Single QueryClient for the app. Tune defaults here once you know your traffic patterns.
 */
export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 60_000,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
