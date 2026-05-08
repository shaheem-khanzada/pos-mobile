import { Barcode, Trash2 } from 'lucide-react-native';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { cn } from '@/lib/cn';
import type { ProductVariant } from '@/database/model';
import { variationRowCardClass, variationTrashButtonClass } from '@/theme/ui';


type VariantItemProps = {
  item: ProductVariant;
  onRemoveVariant: (variant: ProductVariant) => void;
  onPressVariant?: (variant: ProductVariant) => void;
  isInvalid?: boolean;
  invalidMessage?: string;
};

export function VariantItem({
  item,
  onRemoveVariant,
  onPressVariant,
  isInvalid = false,
  invalidMessage,
}: VariantItemProps) {
  return (
    <HStack
      className={cn(
        variationRowCardClass,
        isInvalid && 'border-error-500 bg-error-50/10 dark:border-error-500'
      )}
    >
      <Pressable
        onPress={() => onPressVariant?.(item)}
        disabled={!onPressVariant}
        className={cn(
          'min-w-0 flex-1 gap-3 pr-2',
          onPressVariant && 'active:opacity-90'
        )}
        accessibilityRole={onPressVariant ? 'button' : undefined}
        accessibilityLabel={
          onPressVariant ? `Edit variant ${item.title ?? ''}` : undefined
        }
      >
        <VStack className="gap-3">
          <Text
            className="text-sm font-bold text-typography-900 dark:text-typography-0"
            numberOfLines={2}
          >
            {item.title ?? ''}
          </Text>
          <HStack className="flex-wrap gap-2">
            <Badge
              size="md"
              variant="outline"
              action="muted"
              className="rounded-md"
            >
              <BadgeText className="font-black">Qty: {item.inventory ?? 0}</BadgeText>
            </Badge>
            {item.barcode ? (
              <Badge
                size="md"
                variant="outline"
                action="success"
                className="rounded-md gap-1.5"
              >
                <BadgeIcon as={Barcode} size="sm" />
                <BadgeText className="font-black">{item.barcode}</BadgeText>
              </Badge>
            ) : null}
            <Badge
              size="md"
              variant="outline"
              action="success"
              className="rounded-md"
            >
              <BadgeText className="font-black">Rs. {item.priceInPKR ?? 0}</BadgeText>
            </Badge>
          </HStack>
          {isInvalid && invalidMessage ? (
            <Text className="text-xs font-bold text-error-600 dark:text-error-400">
              {invalidMessage}
            </Text>
          ) : null}
        </VStack>
      </Pressable>
      <Pressable
        onPress={() => onRemoveVariant?.(item)}
        className={cn(variationTrashButtonClass, 'items-center justify-center')}
        accessibilityRole="button"
        accessibilityLabel={`Remove variant ${item.title ?? ''}`}
      >
        <Icon
          as={Trash2}
          size="md"
          className="text-typography-500 dark:text-typography-400"
        />
      </Pressable>

    </HStack>
  );
}

