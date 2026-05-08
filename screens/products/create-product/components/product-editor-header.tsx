import { ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';

type ProductEditorHeaderProps = {
  headerTitle: string;
  isSavingProduct: boolean;
  isSaveDisabled?: boolean;
  onBack: () => void;
  onSave: () => void;
};

export function ProductEditorHeader({
  headerTitle,
  isSavingProduct,
  isSaveDisabled = false,
  onBack,
  onSave,
}: ProductEditorHeaderProps) {
  return (
    <HStack className="items-center justify-between pb-6">
      <Pressable
        onPress={onBack}
        className="h-11 w-11 items-center justify-center rounded-full bg-app-surface active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Icon as={ArrowLeft} size="lg" className="text-typography-900" />
      </Pressable>
      <Text className="text-xl font-bold text-typography-900">{headerTitle}</Text>
      <Pressable
        onPress={onSave}
        className="h-11 min-w-[52px] items-center justify-center rounded-full bg-app-surface px-3 active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel="Save product"
        disabled={isSavingProduct || isSaveDisabled}
      >
        {isSavingProduct ? (
          <HStack space="xs" className="items-center">
            <ActivityIndicator size="small" color="rgb(16, 185, 129)" />
            <Text className="text-sm font-bold text-emerald-500">Saving</Text>
          </HStack>
        ) : (
          <Text className="text-sm font-bold text-emerald-500">Save</Text>
        )}
      </Pressable>
    </HStack>
  );
}
