import { ActivityIndicator } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/cn';
import { fieldLabelClass, variationCardSurfaceClass } from '@/theme/ui';

type VariantSubmitButtonProps = {
  isEdit: boolean;
  isSaving: boolean;
  isDisabled: boolean;
  onPress: () => void;
};

export function VariantSubmitButton({
  isEdit,
  isSaving,
  isDisabled,
  onPress,
}: VariantSubmitButtonProps) {
  const blocked = isSaving || isDisabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      className={cn(
        'mt-14 h-14 w-full items-center justify-center active:opacity-90',
        blocked ? variationCardSurfaceClass : 'rounded-3xl bg-emerald-500'
      )}
    >
      {isSaving ? (
        <HStack space="xs" className="items-center">
          <ActivityIndicator size="small" color="white" />
          <Text className={cn(fieldLabelClass, 'text-white')}>Saving variant</Text>
        </HStack>
      ) : (
        <Text className={cn(fieldLabelClass, blocked ? '' : 'text-white')}>
          {isEdit ? 'Update variant' : 'Add variant'}
        </Text>
      )}
    </Pressable>
  );
}
