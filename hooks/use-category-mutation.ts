import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { payloadSdk } from '@/payload/sdk';
import type { Category } from '@/payload/types';
import { showApiErrorToast } from '@/toast/api-toast';

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      payloadSdk.find({
        collection: 'categories',
        limit: 200,
        sort: 'title',
      }),
    select: (data) =>
      (data.docs ?? []).map((category) => ({
        id: category.id,
        label: category.title,
      })),
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) =>
      payloadSdk.create({
        collection: 'categories',
        data: { title } as Category,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      showApiErrorToast('Create category', error);
    },
  });
}
