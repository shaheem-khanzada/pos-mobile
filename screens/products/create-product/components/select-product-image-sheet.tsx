import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Images, Upload, X } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import {
  BottomSheetItem,
  BottomSheetScrollView,
} from '@/components/ui/bottomsheet';
import { cn } from '@/lib/cn';
import { useMediaListQuery } from '@/hooks/use-media-mutation';
import type { Media } from '@/payload/types';
import { fieldLabelClass } from '@/theme/ui';
import { setToast } from '@/toast/store';

export { BottomSheetTrigger } from '@/components/ui/bottomsheet';

export type PickedImage = {
  uri: string;
  name: string;
  type: string;
};

type SelectProductImageSheetProps = {
  onImageSelected: (image: PickedImage) => void;
  onRecentMediaSelected?: (media: Media) => void;
  /** When the sheet uses {@link BottomSheetWrapper} without a UI {@link BottomSheet} provider. */
  onRequestClose?: () => void;
};

export function SelectProductImageSheet({
  onImageSelected,
  onRecentMediaSelected,
  onRequestClose,
}: SelectProductImageSheetProps) {
  const [instanceKey, setInstanceKey] = useState(0);
  const mediaListQuery = useMediaListQuery({ limit: 24 });

  const remountSheet = useCallback(() => {
    setInstanceKey((k) => k + 1);
  }, []);

  const finishWithAsset = useCallback(
    (asset: PickedImage) => {
      onImageSelected(asset);
      remountSheet();
    },
    [onImageSelected, remountSheet]
  );

  const selectExistingMedia = useCallback(
    (media: Media) => {
      onRecentMediaSelected?.(media);
      remountSheet();
    },
    [onRecentMediaSelected, remountSheet],
  );

  const pickFromLibrary = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setToast({
        variant: 'warning',
        title: 'Photos permission needed',
        description: 'Allow Photos access in Android settings to upload an image.',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      finishWithAsset({
        uri: asset.uri,
        name: asset.fileName ?? `product-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      });
    }
  }, [finishWithAsset]);

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setToast({
        variant: 'warning',
        title: 'Camera permission needed',
        description: 'Allow Camera access in Android settings to capture a photo.',
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      finishWithAsset({
        uri: asset.uri,
        name: asset.fileName ?? `camera-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      });
    }
  }, [finishWithAsset]);

  return (
        <BottomSheetScrollView
          className="flex-1 bg-app-surface"
          contentContainerClassName="pb-8 pt-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <VStack space="lg" className="px-5">
            <HStack className="items-start justify-between gap-3">
              <VStack space="xs" className="min-w-0 flex-1 pr-2">
                <Text className="text-xl font-bold text-typography-900 dark:text-typography-0">
                  Select Product Image
                </Text>
                <Text className="text-sm leading-snug text-secondary-500 dark:text-typography-400">
                  Choose an existing image or upload a new one
                </Text>
              </VStack>
              {onRequestClose ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  onPress={onRequestClose}
                  className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-100 p-0 active:opacity-60"
                  hitSlop={12}
                >
                  <Icon
                    as={X}
                    size="md"
                    className="text-typography-900 dark:text-typography-0"
                  />
                </Pressable>
              ) : (
                <BottomSheetItem
                  className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-100 p-0 active:opacity-60"
                  hitSlop={12}
                >
                  <Icon
                    as={X}
                    size="md"
                    className="text-typography-900 dark:text-typography-0"
                  />
                </BottomSheetItem>
              )}
            </HStack>

            <HStack className="gap-3">
              <BottomSheetItem
                closeOnSelect={false}
                onPress={pickFromLibrary}
                className={cn(
                  'min-h-[132px] flex-1 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-500 bg-transparent px-3 py-5 active:opacity-90'
                )}
              >
                <VStack space="sm" className="items-center">
                  <Box className="rounded-2xl bg-emerald-500/15 p-3 dark:bg-emerald-500/20">
                    <Icon as={Upload} size="xl" className="text-emerald-500" />
                  </Box>
                  <Text className="text-center text-label font-bold uppercase tracking-wide text-typography-900 dark:text-typography-0">
                    Upload new
                  </Text>
                </VStack>
              </BottomSheetItem>

              <BottomSheetItem
                closeOnSelect={false}
                onPress={takePhoto}
                className="min-h-[132px] flex-1 flex-col items-center justify-center rounded-3xl bg-background-100 px-3 py-5 active:opacity-90 dark:bg-[#1b1b1c]"
              >
                <VStack space="sm" className="items-center">
                  <Box className="rounded-2xl bg-blue-500/10 p-3">
                    <Icon as={Camera} size="xl" className="text-blue-500" />
                  </Box>
                  <Text className="text-center text-label font-bold uppercase tracking-wide text-typography-900 dark:text-typography-0">
                    Take photo
                  </Text>
                </VStack>
              </BottomSheetItem>
            </HStack>

            <HStack className="items-center justify-between">
              <Text className={fieldLabelClass}>Recent uploads</Text>
              <Icon as={Images} size="sm" className="text-secondary-400" />
            </HStack>

            <HStack className="flex-wrap justify-between gap-y-3">
              {(mediaListQuery.data ?? []).map((media) => {
                if (typeof media === 'string') return null;
                const imageUrl = media.url;
                return (
                  <BottomSheetItem
                    key={media.id}
                    closeOnSelect={false}
                    onPress={() => selectExistingMedia(media)}
                    className="aspect-square w-[31%] items-center justify-center overflow-hidden rounded-2xl bg-background-100 p-0 active:opacity-90 dark:bg-[#1b1b1c]"
                  >
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        alt={media.alt || 'Media'}
                        size="xl"
                      />
                    ) : (
                      <VStack space="xs" className="items-center px-1">
                        <Icon as={Images} size="md" className="text-secondary-400" />
                        <Text className="text-2xs font-bold uppercase text-secondary-500">
                          Media
                        </Text>
                      </VStack>
                    )}
                  </BottomSheetItem>
                );
              })}
            </HStack>
            {!mediaListQuery.isLoading &&
            (mediaListQuery.data ?? []).length === 0 ? (
              <Text className="text-sm text-secondary-500">No recent uploads yet.</Text>
            ) : null}
          </VStack>
        </BottomSheetScrollView>
  );
}
