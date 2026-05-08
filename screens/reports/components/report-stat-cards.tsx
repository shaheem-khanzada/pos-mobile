import { DollarSign, ShoppingCart, Tag, TrendingUp } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { cn } from '@/lib/cn';
import { variationCardSurfaceClass } from '@/theme/ui';
import type { ReportStat, ReportRange } from '../reports-view-model';

const STAT_VISUAL = [
  { icon: DollarSign, surface: 'bg-blue-600' },
  { icon: TrendingUp, surface: 'bg-emerald-600' },
  { icon: ShoppingCart, surface: 'bg-indigo-600' },
  { icon: Tag, surface: 'bg-amber-500' },
] as const;

function TrendBadge({ pct }: { pct: number }) {
  const positive = pct >= 0;
  return (
    <Box
      className={cn(
        'rounded-full px-2 py-0.5',
        positive ? 'bg-emerald-500/15' : 'bg-red-500/15'
      )}
    >
      <Text
        className={cn(
          'text-[10px] font-bold',
          positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
        )}
      >
        {positive ? '↑ ' : '↓ '}
        {Math.abs(pct).toFixed(1)}%
      </Text>
    </Box>
  );
}

function comparisonPeriodLabel(range: ReportRange): string {
  switch (range) {
    case '1d':
      return 'vs yesterday';
    case '7d':
      return 'vs last week';
    case '30d':
      return 'vs last month';
  }
}

function StatCard({
  stat,
  index,
  comparisonLabel,
}: {
  stat: ReportStat;
  index: number;
  comparisonLabel: string;
}) {
  const meta = STAT_VISUAL[index % STAT_VISUAL.length];
  const IconGlyph = meta.icon;
  const surfaceClass = meta.surface;

  return (
    <VStack
      className={cn('min-w-0 flex-1 items-center gap-2 px-3 py-4', variationCardSurfaceClass)}
    >
      <Box className={cn('h-10 w-10 items-center justify-center rounded-full', surfaceClass)}>
        <Icon as={IconGlyph} size="sm" className="text-white" />
      </Box>
      <Text className="text-center text-[10px] font-bold uppercase tracking-wider text-secondary-500 dark:text-typography-400">
        {stat.label}
      </Text>
      <Text className="text-center text-lg font-black text-typography-900 dark:text-typography-0">
        {stat.valueFormatted}
      </Text>
      <HStack className="flex-wrap items-center justify-center gap-1">
        <TrendBadge pct={stat.trendPct} />
        <Text className="text-[9px] text-secondary-500 dark:text-typography-400">{comparisonLabel}</Text>
      </HStack>
    </VStack>
  );
}

export function ReportStatCards({
  stats,
  range,
}: {
  stats: ReportStat[];
  range: ReportRange;
}) {
  const list = stats.slice(0, 4);
  const row1 = list.slice(0, 2);
  const row2 = list.slice(2, 4);
  const comparisonLabel = comparisonPeriodLabel(range);

  return (
    <VStack className="gap-3">
      <HStack className="gap-3">
        {row1.map((s, i) => (
          <StatCard key={s.label} stat={s} index={i} comparisonLabel={comparisonLabel} />
        ))}
      </HStack>
      {row2.length > 0 ? (
        <HStack className="gap-3">
          {row2.map((s, i) => (
            <StatCard
              key={s.label}
              stat={s}
              index={i + 2}
              comparisonLabel={comparisonLabel}
            />
          ))}
        </HStack>
      ) : null}
    </VStack>
  );
}
