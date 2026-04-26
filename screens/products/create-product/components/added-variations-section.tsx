import { Barcode, Trash2 } from 'lucide-react-native';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { cn } from '@/lib/cn';
import type { Variant } from '@/payload/types';
import {
  fieldLabelClass,
  sectionActionLinkClass,
  variationRowCardClass,
  variationTrashButtonClass,
} from '@/theme/ui';

type AddedVariationsSectionProps = {
  items: Variant[];
  onPressNewVariant: () => void;
  onRemoveVariant: (id: string) => void;
  /** When set, tapping a row (not delete) opens variant editor. */
  onPressVariant?: (id: string) => void;
  canCreateNew?: boolean;
};

export function AddedVariationsSection({
  items,
  onPressNewVariant,
  onRemoveVariant,
  onPressVariant,
  canCreateNew = true,
}: AddedVariationsSectionProps) {
  console.log('items AddedVariationsSection', items);
  return (
    <VStack space="lg" className="w-full">
      <HStack className="w-full items-center justify-between">
        <Text className={cn(fieldLabelClass, 'ml-0.5')}>Added variations</Text>
        {canCreateNew ? (
          <Pressable onPress={onPressNewVariant} className="active:opacity-80">
            <Text className={sectionActionLinkClass}>+ New variant</Text>
          </Pressable>
        ) : null}
      </HStack>

      <VStack space="lg" className="w-full">
        {items.map((item) => (
          <HStack key={item.id} className={variationRowCardClass}>
            <Pressable
              onPress={() => onPressVariant?.(item.id)}
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
              </VStack>
            </Pressable>
            <Pressable
              onPress={() => onRemoveVariant(item.id)}
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
        ))}
      </VStack>
    </VStack>
  );
}
