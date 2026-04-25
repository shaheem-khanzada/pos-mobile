import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Cart } from '@/payload/types';
import { payloadSdk } from '@/payload/sdk';
import { showApiErrorToast } from '@/toast/api-toast';

export function useCreateCartMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Cart>) =>
      payloadSdk.create({
        collection: 'carts',
        data: data as never,
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['carts'] });
    },
    onError: (error) => {
      showApiErrorToast('Create cart', error);
    },
  });
}
