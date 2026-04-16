import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Product } from '@/payload/payload-types';
import { payloadSdk } from '@/payload/sdk';

type ProductListParams = {
  limit: number;
  search?: string;
  sort?: string;
};

type CreateProductInput = {
  data: Omit<Product, 'id' | 'image' | 'createdAt' | 'updatedAt'>;
  file: {
    uri: string;
    name: string;
    type: string;
  };
  alt: string;
};

type UpdateProductInput = {
  id: string;
  data: Omit<Product, 'id' | 'image' | 'createdAt' | 'updatedAt'>;
  file?: {
    uri: string;
    name: string;
    type: string;
  } | null;
  alt: string;
};

async function uploadMediaFile(file: CreateProductInput['file'], alt: string): Promise<string> {
  const formData = new FormData();
  formData.append('_payload', JSON.stringify({ alt }));
  formData.append('alt', alt);
  formData.append(
    'file',
    {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob
  );

  const uploadResponse = await payloadSdk.request({
    method: 'POST',
    path: '/media',
    init: {
      body: formData,
    },
  });

  const mediaResponse = await uploadResponse.json();
  return mediaResponse.doc.id;
}

/** Infinite paginated products list using Payload SDK `find`. */
export function useProductsListQuery(params?: Partial<ProductListParams>) {
  const limit = params?.limit ?? 10;

  return useInfiniteQuery({
    queryKey: ['products', { limit, sort: params?.sort }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      try {
        const result = await payloadSdk.find({
          collection: 'products',
          page: pageParam,
          limit,
          sort: params?.sort,
        });
        return result;
      } catch (error) {
        console.error('Failed to fetch products list:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: Product) => {
      return payloadSdk.delete({
        collection: 'products',
        id: product.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      const mediaId = await uploadMediaFile(input.file, input.alt);

      return payloadSdk.create({
        collection: 'products',
        data: {
          ...input.data,
          image: mediaId,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useEditProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProductInput) => {
      let imageId: string | undefined;
      if (input.file) {
        imageId = await uploadMediaFile(input.file, input.alt);
      }

      return payloadSdk.update({
        collection: 'products',
        id: input.id,
        data: {
          ...input.data,
          ...(imageId ? { image: imageId } : {}),
        },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
}
