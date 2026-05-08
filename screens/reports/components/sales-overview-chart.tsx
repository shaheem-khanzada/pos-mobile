import { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import {
  runOnJS,
  useAnimatedReaction,
  type SharedValue,
} from 'react-native-reanimated';
import { Circle } from '@shopify/react-native-skia';
import { useColorScheme } from 'nativewind';
import { CartesianChart, Line, Area, useChartPressState } from 'victory-native';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { cn } from '@/lib/cn';
import { variationCardSurfaceClass } from '@/theme/ui';
import { formatReportsRevenueCompact, type SalesPoint } from '../reports-view-model';

/** Matches gluestack `--color-primary-500` (emerald). */
const PRIMARY = '#10B981';
const PRIMARY_AREA = 'rgba(16, 185, 129, 0.22)';

function formatPeakRupeesFromChartValues(values: number[]): string {
  if (!values.length) return 'Rs. —';
  const max = Math.max(...values);
  return `Rs. ${Math.round(max).toLocaleString('en-US')}`;
}

function PressDot({
  x,
  y,
}: {
  x: SharedValue<number>;
  y: SharedValue<number>;
}) {
  return <Circle cx={x} cy={y} r={8} color={PRIMARY} />;
}

type ChartRow = { idx: number; sales: number };

type SalesOverviewChartProps = {
  title?: string;
  points: SalesPoint[];
};

export function SalesOverviewChart({ title = 'Sales overview', points }: SalesOverviewChartProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: screenW } = useWindowDimensions();
  const chartW = Math.min(screenW - 40, 400);
  const chartH = 172;

  const peakFormatted = useMemo(
    () => formatPeakRupeesFromChartValues(points.map((p) => p.value)),
    [points]
  );

  const chartData = useMemo<ChartRow[]>(
    () =>
      points.map((p, i) => ({
        idx: i,
        sales: p.value,
      })),
    [points]
  );

  const { state, isActive } = useChartPressState({
    x: 0,
    y: { sales: 0 },
  });

  const [floatingTip, setFloatingTip] = useState<{
    px: number;
    py: number;
    value: string;
  } | null>(null);

  const clearTip = useCallback(() => setFloatingTip(null), []);

  const chartDataRef = useRef(chartData);
  chartDataRef.current = chartData;

  const applyTip = useCallback((idx: number, px: number, py: number) => {
    const row = chartDataRef.current[idx];
    if (!row) {
      setFloatingTip(null);
      return;
    }
    setFloatingTip({
      px,
      py,
      value: formatReportsRevenueCompact(row.sales),
    });
  }, []);

  useAnimatedReaction(
    () => ({
      active: state.isActive.value,
      idx: state.matchedIndex.value,
      px: state.x.position.value,
      py: state.y.sales.position.value,
    }),
    (cur) => {
      if (!cur.active || cur.idx < 0) {
        runOnJS(clearTip)();
        return;
      }
      runOnJS(applyTip)(cur.idx, cur.px, cur.py);
    },
    [applyTip, clearTip, state]
  );

  if (Platform.OS === 'web') {
    return (
      <VStack className={cn('gap-3 px-5 py-4', variationCardSurfaceClass)}>
        <HStack className="items-start justify-between gap-3">
          <Text className="min-w-0 flex-1 text-lg font-bold text-typography-900 dark:text-typography-0">
            {title}
          </Text>
          <VStack className="items-end gap-0.5">
            <Text className="text-right text-xl font-black tabular-nums text-typography-900 dark:text-typography-0">
              {peakFormatted}
            </Text>
            <Text className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 dark:text-typography-400">
              Peak
            </Text>
          </VStack>
        </HStack>
        <Text className="py-8 text-center text-sm text-secondary-500 dark:text-typography-400">
          Interactive chart runs on iOS/Android (Skia).
        </Text>
      </VStack>
    );
  }

  return (
    <VStack className={cn('gap-3 px-5 py-4', variationCardSurfaceClass)}>
      <HStack className="items-start justify-between gap-3">
        <Text className="min-w-0 flex-1 text-lg font-bold text-typography-900 dark:text-typography-0">
          {title}
        </Text>
        <VStack className="items-end gap-0.5">
          <Text className="text-right text-xl font-black tabular-nums text-typography-900 dark:text-typography-0">
            {peakFormatted}
          </Text>
          <Text className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 dark:text-typography-400">
            Peak
          </Text>
        </VStack>
      </HStack>

      <View
        className="relative self-center overflow-visible"
        style={{ width: chartW, height: chartH }}
      >
        <CartesianChart
          key={chartData.length}
          data={chartData}
          xKey="idx"
          yKeys={['sales']}
          chartPressState={state}
          padding={{ left: 4, right: 8, top: 8, bottom: 4 }}
          domainPadding={{ left: 24, right: 24, top: 12 }}
          frame={{
            lineWidth: 0,
            lineColor: 'transparent',
          }}
        >
          {({ points: pt, chartBounds }) => {
            const series = pt.sales;
            const last = series[series.length - 1];
            return (
              <>
                <Area
                  points={series}
                  y0={chartBounds.bottom}
                  curveType="natural"
                  color={PRIMARY_AREA}
                />
                <Line
                  points={series}
                  curveType="natural"
                  color={PRIMARY}
                  strokeWidth={3}
                  strokeCap="round"
                />
                {!isActive && last?.y != null ? (
                  <Circle cx={last.x} cy={last.y} r={7} color={PRIMARY} />
                ) : null}
                {isActive ? (
                  <PressDot x={state.x.position} y={state.y.sales.position} />
                ) : null}
              </>
            );
          }}
        </CartesianChart>

        {floatingTip ? (
          <View
            pointerEvents="none"
            className={cn(
              'absolute min-w-[88px] rounded-2xl border px-3 py-2 shadow-lg',
              isDark
                ? 'border-outline-700 bg-background-100'
                : 'border-outline-200 bg-background-0'
            )}
            style={{
              left: Math.min(
                Math.max(floatingTip.px - 44, 4),
                chartW - 100
              ),
              top: Math.max(floatingTip.py - 52, 4),
            }}
          >
            <Text className="text-center text-sm font-bold text-primary-600 dark:text-primary-400">
              {floatingTip.value}
            </Text>
          </View>
        ) : null}
      </View>
    </VStack>
  );
}
