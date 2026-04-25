import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Variant } from '@/payload/types';
import { payloadSdk } from '@/payload/sdk';
import { showApiErrorToast } from '@/toast/api-toast';

export function useCreateVariantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Partial<Variant>, 'options'> & { options: string[], product: string }) =>
      payloadSdk.create({
        collection: 'variants',
        data: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['variants'] });
    },
    onError: (error) => {
      showApiErrorToast('Create variant', error);
    },
  });
}

export function useEditVariantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Partial<Variant>, 'options'> & { options: string[], product: string } }) =>
      payloadSdk.update({
        collection: 'variants',
        id,
        data: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['variants'] });
    },
    onError: (error) => {
      showApiErrorToast('Update variant', error);
    },
  });
}
