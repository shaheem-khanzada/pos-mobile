import { useQuery } from '@tanstack/react-query';

import type { VariantType } from '@/payload/types';
import { payloadSdk } from '@/payload/sdk';

export function useVariantTypesQuery() {
  return useQuery({
    queryKey: ['variantTypes'],
    queryFn: () =>
      payloadSdk.find({
        collection: 'variantTypes',
        limit: 200,
        depth: 1,
        sort: 'label',
      }),
    select: (data) => (data.docs ?? []) as VariantType[],
  });
}
