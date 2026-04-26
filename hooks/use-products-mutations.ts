import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { Product } from '@/payload/types';
import { payloadSdk } from '@/payload/sdk';
import { showApiErrorToast } from '@/toast/api-toast';

export function useProductsListQuery(params?: { limit?: number; sort?: string }) {
  const limit = params?.limit ?? 10;
  return useInfiniteQuery({
    queryKey: ['products', { limit, sort: params?.sort }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = await payloadSdk.find({
        collection: 'products',
        page: pageParam,
        limit,
        sort: params?.sort,
        depth: 2,
      });
      return page;
    },
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    select: (data) =>
      data.pages.flatMap((page) => page.docs?.map((doc) => ({
        ...doc,
        variants: doc.variants?.docs ?? [],
      })) ?? []) as Product[],
  });
}

export function useProductByIdQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await payloadSdk.findByID({
        collection: 'products',
        id: id!,
        depth: 2,
      });
      const doc = res;
      if (!doc) {
        showApiErrorToast('Load product', new Error('Product not found'));
        throw new Error('Product not found');
      }
      return doc;
    },
    select: (data) => ({ ...data, variants: data.variants?.docs ?? [] }) as Product,
    enabled: Boolean(id),
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: Product) =>
      payloadSdk.delete({
        collection: 'products',
        id: product.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      showApiErrorToast('Delete product', error);
    },
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { product: Partial<Product> }) => {
      const { variantTypes: _variantTypes, ...productPayload } = input.product;
      const result = await payloadSdk.create({
        collection: 'products',
        data: productPayload as never,
      });
      return result;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previous = queryClient.getQueryData(['products']);
      const optimisticProduct = {
        id: `temp-${Date.now()}`,
        title: input.product.title,
        inventory: input.product.inventory ?? 0,
        priceInPKR: input.product.priceInPKR ?? 0,
      };
      return { previous, optimisticProduct };
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['products'], ctx.previous);
      }
      showApiErrorToast('Create product', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useEditProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      product: Partial<Product>;
    }) => {
      return payloadSdk.update({
        collection: 'products',
        id: input.id,
        data: input.product as never,
      });
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previous = queryClient.getQueryData(['products']);
      return { previous, input };
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['products'], ctx.previous);
      showApiErrorToast('Update product', error);
    },
    onSettled: (_, __, vars) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', vars.id] });
    },
  });
}
