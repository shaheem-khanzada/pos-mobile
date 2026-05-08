import { Camera } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { cn } from '@/lib/cn';
import { fieldLabelClass } from '@/theme/ui';
import { useMediaPicker } from '../context/media-picker-context';

export function ProductMediaSection() {
  const { effectiveMedia, open } = useMediaPicker();
  const mediaUrl = effectiveMedia?.url;
  const mediaAlt = effectiveMedia?.alt;

  return (
    <Box className="relative mb-10 w-full">
      <Pressable
        onPress={open}
        className={cn(
          'min-h-[200px] w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-outline-100 bg-app-surface',
          mediaUrl && 'border-0',
        )}
      >
        {mediaUrl ? (
          <Image
            source={{ uri: mediaUrl }}
            alt={mediaAlt ?? 'Product'}
            className="h-[200px] w-full"
            size="none"
          />
        ) : (
          <VStack space="md" className="items-center py-10">
            <Box className="rounded-2xl bg-background-100 p-4">
              <Icon as={Camera} size="xl" className="text-secondary-400" />
            </Box>
            <Text className={cn(fieldLabelClass, 'text-center')}>Product media</Text>
          </VStack>
        )}
      </Pressable>
    </Box>
  );
}
