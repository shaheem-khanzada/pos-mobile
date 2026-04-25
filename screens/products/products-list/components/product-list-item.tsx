import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Image } from '@/components/ui/image';
import { Icon } from '@/components/ui/icon';
import { Package } from 'lucide-react-native';
import type { Product } from '@/payload/types';
import { cn } from '@/lib/cn';
import { variationRowCardClass } from '@/theme/ui';

const LOW_STOCK_THRESHOLD = 15;

type ProductListItemProps = {
  product: Product;
  categoryLabel: string;
  onPress: (product: Product) => void;
};

function formatRs(price: number) {
  const n = Number.isFinite(price) ? price : 0;
  return `Rs. ${Math.round(n).toLocaleString('en-PK')}`;
}

export function ProductListItem({
  product,
  categoryLabel,
  onPress,
}: ProductListItemProps) {
  const imageUrl = product.media.thumbnailURL;
  const hasImage = Boolean(imageUrl);
  const stock = product.inventory ?? 0;
  const price = product.priceInPKR ?? 0;
  const lowStock = stock < LOW_STOCK_THRESHOLD;

  return (
    <Pressable
      onPress={() => onPress(product)}
      className="active:opacity-90"
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formatRs(price)}`}
    >
      <HStack className={variationRowCardClass}>
        <HStack className="min-w-0 flex-1 items-start gap-3 pr-2">
          <Box
            className={cn(
              'h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl',
              'bg-background-100 dark:bg-background-100'
            )}
          >
            {hasImage ? (
              <Image
                source={{ uri: imageUrl }}
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
            <HStack className="items-start justify-between gap-3">
              <Text
                className="min-w-0 flex-1 text-base text-typography-900 dark:text-typography-0"
                numberOfLines={2}
              >
                <Text className="font-bold">{product.title}</Text>
                {categoryLabel ? (
                  <Text className="font-normal text-secondary-500 dark:text-typography-400">
                    {' '}
                    ({categoryLabel})
                  </Text>
                ) : null}
              </Text>
              <Text
                className={cn(
                  'shrink-0 text-xs font-bold',
                  lowStock
                    ? 'text-warning-600 dark:text-warning-400'
                    : 'text-typography-500 dark:text-typography-400'
                )}
              >
                Qty: {stock}
              </Text>
            </HStack>
            <Text className="text-sm font-bold text-emerald-500">
              {formatRs(price)}
            </Text>
          </VStack>
        </HStack>
      </HStack>
    </Pressable>
  );
}

