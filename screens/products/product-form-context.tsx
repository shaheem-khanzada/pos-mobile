import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { createStore, type StoreApi } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { UploadableFile } from '@/hooks/use-media-mutation';
import type { Product, Variant } from '@/payload/types';

/** Form slice: relation fields are ids/strings until submit (see `@/hooks/form-payload`). */
export type FormProduct = Omit<
  Partial<Product>,
  'categories' | 'variantTypes' | 'media' | 'variants'
> & {
  categories?: (string | Product['categories'][number])[];
  variantTypes?: string[];
  media?: string | Product['media'];
  variants?: Variant[];
};

export type FormState = {
  product: FormProduct;
  selectedImage: UploadableFile | null;
  imagePreviewUri: string | null;
};

type FormActions = {
  setProduct: (patch: Partial<FormProduct>) => void;
  setVariants: (variants: Variant[]) => void;
  setSelectedImage: (file: UploadableFile | null) => void;
  setImagePreviewUri: (uri: string | null) => void;
  clearImage: () => void;
  removeVariant: (id: string) => void;
  reset: (initial?: Partial<FormState>) => void;
};

type FormStore = FormState & FormActions;

const PRODUCT_FORM_DEFAULTS: FormState = {
  product: {
    title: '',
    categories: [],
    variantTypes: [],
    variants: [],
  },
  selectedImage: null,
  imagePreviewUri: null,
};

const ProductFormStoreContext = createContext<StoreApi<FormStore> | null>(null);

function buildState(initial?: Partial<FormState>): FormState {
  return {
    product: {
      ...PRODUCT_FORM_DEFAULTS.product,
      ...(initial?.product ?? {}),
      title: initial?.product?.title ?? '',
      categories: initial?.product?.categories ?? [],
      variantTypes: initial?.product?.variantTypes ?? [],
      media: initial?.product?.media,
      variants: initial?.product?.variants ?? PRODUCT_FORM_DEFAULTS.product.variants,
    },
    selectedImage: initial?.selectedImage ?? null,
    imagePreviewUri: initial?.imagePreviewUri ?? null,
  };
}

function createProductFormStore(initial?: Partial<FormState>) {
  return createStore<FormStore>()((set) => ({
    ...buildState(initial),
    setProduct: (patch) =>
      set((state) => ({
        product: { ...state.product, ...patch },
      })),
    setVariants: (variants) =>
      set((state) => ({
        product: {
          ...state.product,
          variants,
        },
      })),
    setSelectedImage: (selectedImage) => set({ selectedImage }),
    setImagePreviewUri: (imagePreviewUri) => set({ imagePreviewUri }),
    clearImage: () => set({ selectedImage: null, imagePreviewUri: null }),
    removeVariant: (id) =>
      set((state) => ({
        product: {
          ...state.product,
          variants: (state.product.variants ?? []).filter((variant) => variant.id !== id),
        },
      })),
    reset: (nextInitial) => set(buildState(nextInitial)),
  }));
}

export function ProductFormProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: Partial<FormState>;
}) {
  const storeRef = useRef<StoreApi<FormStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createProductFormStore(initial);
  }

  useEffect(() => {
    storeRef.current?.getState().reset(initial);
  }, [initial]);

  return <ProductFormStoreContext.Provider value={storeRef.current}>{children}</ProductFormStoreContext.Provider>;
}

export function useProductFormContext() {
  const store = useContext(ProductFormStoreContext);
  if (!store) {
    throw new Error('useProductFormContext must be used within ProductFormProvider');
  }
  const product = useStore(store, (state) => state.product);
  const variants = useStore(store, (state) => state.product.variants ?? []);
  const selectedImage = useStore(store, (state) => state.selectedImage);
  const imagePreviewUri = useStore(store, (state) => state.imagePreviewUri);
  const setProduct = useStore(store, (state) => state.setProduct);
  const setVariants = useStore(store, (state) => state.setVariants);
  const setSelectedImage = useStore(store, (state) => state.setSelectedImage);
  const setImagePreviewUri = useStore(store, (state) => state.setImagePreviewUri);
  const clearImage = useStore(store, (state) => state.clearImage);
  const removeVariant = useStore(store, (state) => state.removeVariant);

  return {
    product,
    variants,
    selectedImage,
    imagePreviewUri,
    setProduct,
    setVariants,
    setSelectedImage,
    setImagePreviewUri,
    clearImage,
    removeVariant,
  };
}
