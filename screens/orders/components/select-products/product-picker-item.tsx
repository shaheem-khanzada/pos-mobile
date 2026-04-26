import { Package, Plus } from 'lucide-react-native';
import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Image } from '@/components/ui/image';
import { Icon } from '@/components/ui/icon';
import { Badge, BadgeText } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { formatRs } from '@/lib/format-rs';
import { QtyStepper } from '@/components/orders/qty-stepper';
import { variationCardSurfaceClass } from '@/theme/ui';
import {
  catalogHasVariants,
  catalogMinPrice,
  type CatalogProduct,
} from '@/screens/orders/utils/product-catalog';

type ProductPickerItemProps = {
  product: CatalogProduct;
  selectedQty: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onOpenVariantSheet: () => void;
};

export function ProductPickerItem({
  product,
  selectedQty,
  onIncrement,
  onDecrement,
  onOpenVariantSheet,
}: ProductPickerItemProps) {
  const thumb = product.media.url;
  const hasImage = Boolean(thumb?.trim());
  const hasVariants = catalogHasVariants(product);
  const priceLabel = hasVariants
    ? `From ${formatRs(catalogMinPrice(product))}`
    : formatRs(product.priceInPKR ?? 0);

  return (
    <HStack
      className={cn(
        'items-center gap-3 px-4 py-3',
        variationCardSurfaceClass
      )}
    >
      <Box
        className={cn(
          'h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl',
          'bg-background-100 dark:bg-background-100'
        )}
      >
        {hasImage ? (
          <Image
            source={{ uri: thumb }}
            alt={product.title}
            className="h-full w-full"
            size="none"
          />
        ) : (
          <Icon
            as={Package}
            size="lg"
            className="text-secondary-400 dark:text-secondary-500"
          />
        )}
      </Box>

      <VStack className="min-w-0 flex-1 gap-1">
        <Text
          className="text-base font-bold text-typography-900 dark:text-typography-0"
          numberOfLines={2}
        >
          {product.title}
        </Text>
        <Text className="text-sm text-secondary-500 dark:text-typography-400">
          {priceLabel}
        </Text>
        {hasVariants ? (
          <Badge
            action="muted"
            variant="solid"
            size="sm"
            className="mt-0.5 self-start rounded-md bg-background-200 px-2 py-0.5 dark:bg-background-100"
          >
            <BadgeText className="text-2xs font-bold text-typography-600 dark:text-typography-400">
              {(product.variants?.length ?? 0)} VARIANTS
            </BadgeText>
          </Badge>
        ) : null}
      </VStack>

      {hasVariants ? (
        <Pressable
          onPress={onOpenVariantSheet}
          className="relative h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 active:opacity-90"
        >
          <Icon as={Plus} size="md" className="text-white" />
          {selectedQty > 0 ? (
            <Box className="absolute -right-1 -top-1 min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-primary-600 px-0.5">
              <Text className="text-[9px] font-bold leading-none text-white">
                {selectedQty > 99 ? '99+' : selectedQty}
              </Text>
            </Box>
          ) : null}
        </Pressable>
      ) : (
        <QtyStepper
          qty={selectedQty}
          onDecrement={onDecrement}
          onIncrement={onIncrement}
          disableDecrement={selectedQty <= 0}
        />
      )}
    </HStack>
  );
}

