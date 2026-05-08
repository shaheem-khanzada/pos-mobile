import { useCallback, useState } from 'react';
import { createLocalCategory, createLocalVariantOption } from '@/database';
import { useCatalogLookups } from '../context/catalog-lookups-context';

type UseInlineCreatorsParams = {
  tenantId?: string | null;
};

export function useInlineCreators({ tenantId }: UseInlineCreatorsParams) {
  const { categories, variantOptions } = useCatalogLookups();
  const [isCreatingVariantOption, setIsCreatingVariantOption] = useState(false);

  const createCategoryInline = useCallback(
    async (value: string, selectedIds: string[], onChange: (ids: string[]) => void) => {
      const normalizedTitle = value.trim();
      if (!normalizedTitle) return;

      const existing = categories.find(
        (category) => category.title.trim().toLowerCase() === normalizedTitle.toLowerCase()
      );
      const categoryId = existing
        ? existing.id
        : (await createLocalCategory({ title: normalizedTitle, tenant: tenantId ?? undefined })).id;

      if (!selectedIds.includes(categoryId)) {
        onChange([...selectedIds, categoryId]);
      }
    },
    [categories, tenantId]
  );

  const removeCategorySelection = useCallback(
    (selectedIds: string[], id: string) => selectedIds.filter((selectedId) => selectedId !== id),
    []
  );

  const createVariantOptionInline = useCallback(
    async (value: string, variantTypeId: string, onSelect: (id: string) => void) => {
      if (isCreatingVariantOption) return;
      const label = value.trim();
      if (!label || !variantTypeId) return;

      setIsCreatingVariantOption(true);
      try {
        const existing = variantOptions.find(
          (option) =>
            option.variantTypeId === variantTypeId &&
            option.label.trim().toLowerCase() === label.toLowerCase()
        );
        const optionId = existing
          ? existing.id
          : (
              await createLocalVariantOption({
                label,
                value: label,
                variantTypeId,
                tenant: tenantId ?? undefined,
              })
            ).id;
        onSelect(optionId);
      } finally {
        setIsCreatingVariantOption(false);
      }
    },
    [isCreatingVariantOption, tenantId, variantOptions]
  );

  return {
    createCategoryInline,
    removeCategorySelection,
    createVariantOptionInline,
    isCreatingVariantOption,
  };
}
