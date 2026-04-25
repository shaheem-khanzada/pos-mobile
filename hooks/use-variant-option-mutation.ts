import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { payloadSdk } from '@/payload/sdk';
import { showApiErrorToast } from '@/toast/api-toast';

export function useVariantOptionsQuery() {
  return useQuery({
    queryKey: ['variantOptions'],
    queryFn: () =>
      payloadSdk.find({
        collection: 'variantOptions',
        limit: 500,
        depth: 1,
        sort: 'label',
      }),
  });
}

export function useCreateVariantOptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { variantType: string; label: string; value: string }) =>
      payloadSdk.create({
        collection: 'variantOptions',
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variantOptions'] });
      queryClient.invalidateQueries({ queryKey: ['variantTypes'] });
    },
    onError: (error) => {
      showApiErrorToast('Create variant option', error);
    },
  });
}

export function useDeleteVariantOptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      payloadSdk.delete({
        collection: 'variantOptions',
        id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variantOptions'] });
      queryClient.invalidateQueries({ queryKey: ['variantTypes'] });
    },
    onError: (error) => {
      showApiErrorToast('Delete variant option', error);
    },
  });
}
