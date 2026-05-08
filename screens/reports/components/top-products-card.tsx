import { ChevronRight, Package } from 'lucide-react-native';
import { of as of$ } from 'rxjs';
import { withObservables } from '@nozbe/watermelondb/react';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { database } from '@/database/db';
import type Media from '@/database/model/Media';
import Product from '@/database/model/Product';
import { cn } from '@/lib/cn';
import type { ReportTopProduct } from '../reports-view-model';

const productCardSurfaceClass = cn(
  'rounded-3xl border border-outline-100 bg-app-surface p-4 shadow-card-faint',
  'dark:border-white/10 dark:bg-[#1A1A1A] dark:shadow-none'
);

type TopProductRowContentProps = {
  row: ReportTopProduct;
  product: Product | null;
  media: Media | null;
};

function TopProductRowContent({ row, product, media }: TopProductRowContentProps) {
  const displayName = product?.title?.trim() || row.name;
  const imageUrl = media?.url ?? undefined;

  return (
    <HStack className={cn('items-start gap-3', productCardSurfaceClass)}>
      <Box
        className={cn(
          'h-14 w-14 items-center justify-center overflow-hidden rounded-2xl',
          'bg-background-100 dark:bg-black/35'
        )}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} alt={displayName} className="h-full w-full" size="none" />
        ) : (
          <Icon as={Package} size="xl" className="text-typography-500 dark:text-typography-400" />
        )}
      </Box>
      <VStack className="min-w-0 flex-1 gap-1">
        <Text
          className="text-base font-bold text-typography-900 dark:text-typography-0"
          numberOfLines={2}
        >
          {displayName}
        </Text>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-secondary-500 dark:text-typography-400">
          {row.unitsLabel.toUpperCase()}
        </Text>
      </VStack>
      <VStack className="max-w-[46%] items-end gap-1">
        <Text
          className="text-right text-base font-bold text-emerald-600 dark:text-emerald-400"
          numberOfLines={1}
        >
          {row.revenueFormatted}
        </Text>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-secondary-500 dark:text-typography-400">
          Gross rev
        </Text>
      </VStack>
    </HStack>
  );
}

const TopProductRowWithMedia = withObservables(
  ['product'],
  ({ product }: { row: ReportTopProduct; product: Product | null }) => ({
    media: product ? product.media.observe() : of$(null),
  })
)(TopProductRowContent);

const TopProductRow = withObservables(['row'], ({ row }: { row: ReportTopProduct }) => ({
  product: database.get<Product>('products').findAndObserve(row.id),
}))(TopProductRowWithMedia);

type TopProductsCardProps = {
  rows: ReportTopProduct[];
};

export function TopProductsCard({ rows }: TopProductsCardProps) {
  return (
    <VStack className="gap-4">
      <HStack className="items-center justify-between">
        <Text className="text-lg font-bold text-typography-900 dark:text-typography-0">
          Top products
        </Text>
        <Pressable disabled className="flex-row items-center gap-0.5 active:opacity-80">
          <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400">View all</Text>
          <Icon as={ChevronRight} size="xs" className="text-emerald-600 dark:text-emerald-400" />
        </Pressable>
      </HStack>

      <VStack className="gap-3">
        {rows.map((r) => (
          <TopProductRow key={r.id} row={r} />
        ))}
      </VStack>
    </VStack>
  );
}
