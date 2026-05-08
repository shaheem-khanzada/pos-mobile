import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { observeReportsForTenant } from '@/database';
import type Report from '@/database/model/Report';
import { useAuthStore } from '@/screens/auth/stores/auth-store';
import { ReportRangeTabs } from './components/report-range-tabs';
import { ReportStatCards } from './components/report-stat-cards';
import { SalesOverviewChart } from './components/sales-overview-chart';
import { TopProductsCard } from './components/top-products-card';
import {
  type ReportRange,
  EMPTY_REPORTS_DATA,
  buildReportsViewModel,
  reportsRecordToData,
} from './reports-view-model';

export function ReportsScreen() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    const sub = observeReportsForTenant(tenantId).subscribe((rows) => {
      setReport(rows[0] ?? null);
    });
    return () => sub.unsubscribe();
  }, [tenantId]);

  const [range, setRange] = useState<ReportRange>('7d');
  const data = report ? reportsRecordToData(report) : EMPTY_REPORTS_DATA;
  const slice = useMemo(() => buildReportsViewModel(data, range), [data, range]);

  return (
    <SafeAreaView className="flex-1 bg-app-page" edges={['top', 'left', 'right']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow gap-5 px-5 pb-28 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <ReportHeader range={range} onRangeChange={setRange} />

        <ReportStatCards stats={slice.stats} range={range} />

        <SalesOverviewChart points={slice.salesOverview} />

        <TopProductsCard rows={slice.topProducts} />

        <Text className="text-center text-[11px] text-secondary-500 dark:text-typography-400">
          {report
            ? `Updated ${report.updatedAt.toLocaleString()}`
            : 'No reports cached yet — pull runs with sync.'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ReportHeader({
  range,
  onRangeChange,
}: {
  range: ReportRange;
  onRangeChange: (v: ReportRange) => void;
}) {
  return (
    <HStack className="items-center justify-between gap-3">
      <Text
        className="min-w-0 flex-1 text-3xl font-bold text-typography-900 dark:text-typography-0"
        numberOfLines={1}
      >
        Reports
      </Text>
      <ReportRangeTabs value={range} onChange={onRangeChange} />
    </HStack>
  );
}
