import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { createLocalMedia } from '@/database';
import type Media from '@/database/model/Media';
import type { Media as PayloadMedia } from '@/payload/types';
import type { PickedImage } from '../components/select-product-image-sheet';

type MediaSnapshot = { id: string; url: string; alt: string };

type MediaPickerValue = {
  effectiveMedia: MediaSnapshot | null;
  isMediaDirty: boolean;
  resetDirty: () => void;
  pickFromFile: (file: PickedImage, opts?: { fallbackAlt?: string }) => Promise<void>;
  pickExisting: (media: PayloadMedia) => void;
  sheetRef: RefObject<BottomSheet | null>;
  open: () => void;
  close: () => void;
};

const MediaPickerContext = createContext<MediaPickerValue | null>(null);

type MediaPickerProviderProps = {
  initialMedia?: Media | null;
  productId?: string | null;
  tenantId?: string | null;
  children: ReactNode;
};

export function MediaPickerProvider({
  initialMedia,
  productId,
  tenantId,
  children,
}: MediaPickerProviderProps) {
  const [draftMedia, setDraftMedia] = useState<MediaSnapshot | null>(null);
  const [isMediaDirty, setIsMediaDirty] = useState(false);
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    setDraftMedia(
      initialMedia ? { id: initialMedia.id, url: initialMedia.url, alt: initialMedia.alt } : null
    );
    setIsMediaDirty(false);
  }, [initialMedia?.id, initialMedia?.url, initialMedia?.alt, productId]);

  const open = useCallback(() => {
    sheetRef.current?.expand();
  }, []);

  const close = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const resetDirty = useCallback(() => {
    setIsMediaDirty(false);
  }, []);

  const pickFromFile = useCallback(
    async (file: PickedImage, opts?: { fallbackAlt?: string }) => {
      const created = await createLocalMedia({
        alt: opts?.fallbackAlt?.trim() || 'Product image',
        url: file.uri,
        fileName: file.name,
        mimeType: file.type,
        tenant: tenantId ?? undefined,
      });
      setDraftMedia({ id: created.id, url: created.url, alt: created.alt });
      setIsMediaDirty(true);
    },
    [tenantId]
  );

  const pickExisting = useCallback((selected: PayloadMedia) => {
    setDraftMedia({
      id: selected.id,
      url: selected.url ?? '',
      alt: selected.alt ?? 'Product image',
    });
    setIsMediaDirty(true);
  }, []);

  const value = useMemo<MediaPickerValue>(
    () => ({
      effectiveMedia: draftMedia,
      isMediaDirty,
      resetDirty,
      pickFromFile,
      pickExisting,
      sheetRef,
      open,
      close,
    }),
    [draftMedia, isMediaDirty, resetDirty, pickFromFile, pickExisting, open, close]
  );

  return <MediaPickerContext.Provider value={value}>{children}</MediaPickerContext.Provider>;
}

export function useMediaPicker(): MediaPickerValue {
  const ctx = useContext(MediaPickerContext);
  if (!ctx) {
    throw new Error('useMediaPicker must be used inside <MediaPickerProvider>');
  }
  return ctx;
}
