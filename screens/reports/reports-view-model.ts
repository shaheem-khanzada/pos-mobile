import type Report from '@/database/model/Report';
import type {
  ReportsDailyEntry,
  ReportsPeriodMetrics,
  ReportsTopProductEntry,
} from '@/database/model/Report';

/** Same keys as API `data` / Watermelon `Report` row. */
export type ReportsData = {
  daily: ReportsDailyEntry[];
  last30Days: ReportsPeriodMetrics;
  last7Days: ReportsPeriodMetrics;
  today: ReportsPeriodMetrics;
  topProducts30d: ReportsTopProductEntry[];
};

export type ReportsApiEnvelope = {
  data: ReportsData;
};

export type ReportRange = '1d' | '7d' | '30d';

export type SalesPoint = {
  value: number;
};

export type ReportStat = {
  label: string;
  valueFormatted: string;
  trendPct: number;
};

export type ReportTopProduct = {
  id: string;
  quantity: number;
  name: string;
  unitsLabel: string;
  revenueFormatted: string;
  sharePct: number;
};

export type ReportsViewModel = {
  stats: ReportStat[];
  topProducts: ReportTopProduct[];
  salesOverview: SalesPoint[];
};

function nullLift() {
  return { orders: null, profit: null, revenue: null } as const;
}

function emptyPeriod(): ReportsPeriodMetrics {
  return {
    discount: 0,
    orders: 0,
    profit: 0,
    revenue: 0,
    lift: nullLift(),
  };
}

export const EMPTY_REPORTS_DATA: ReportsData = {
  daily: [],
  last30Days: emptyPeriod(),
  last7Days: emptyPeriod(),
  today: emptyPeriod(),
  topProducts30d: [],
};

export function reportsRecordToData(record: Report): ReportsData {
  return {
    daily: record.daily,
    last30Days: record.last30Days,
    last7Days: record.last7Days,
    today: record.today,
    topProducts30d: record.topProducts30d,
  };
}

export function formatRs(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatReportsRevenueCompact(rupees: number): string {
  if (rupees >= 1_000_000) return `Rs. ${(rupees / 1_000_000).toFixed(1)}M`;
  if (rupees >= 10_000) return `Rs. ${Math.round(rupees / 1000)}K`;
  return `Rs. ${Math.round(rupees).toLocaleString('en-US')}`;
}

function reportStatsFromPeriod(t: ReportsPeriodMetrics): ReportStat[] {
  return [
    {
      label: 'Total sales',
      valueFormatted: formatRs(t.revenue),
      trendPct: t.lift.revenue ?? 0,
    },
    {
      label: 'Total profit',
      valueFormatted: formatRs(t.profit),
      trendPct: t.lift.profit ?? 0,
    },
    {
      label: 'Total orders',
      valueFormatted: t.orders.toLocaleString('en-US'),
      trendPct: t.lift.orders ?? 0,
    },
    { label: 'Total discount', valueFormatted: formatRs(t.discount), trendPct: 0 },
  ];
}

/** Full `daily` series (sorted by date) for the sales chart; peak = max of `value`. */
export function salesOverviewFromDaily(daily: ReportsDailyEntry[]): SalesPoint[] {
  const sorted = [...daily].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((d) => ({ value: d.revenue }));
}

export function topProductsToViewRows(items: ReportsTopProductEntry[]): ReportTopProduct[] {
  const totalRev = items.reduce((s, p) => s + p.revenue, 0) || 1;

  return items.map((p, i) => ({
    id: p.productId,
    quantity: p.quantity,
    name: `Product ${i + 1}`,
    unitsLabel: `${p.quantity} units sold`,
    revenueFormatted: formatRs(p.revenue),
    sharePct: (p.revenue / totalRev) * 100,
  }));
}

export function buildReportsViewModel(data: ReportsData, range: ReportRange): ReportsViewModel {
  const period =
    range === '1d' ? data.today : range === '7d' ? data.last7Days : data.last30Days;

  return {
    stats: reportStatsFromPeriod(period),
    salesOverview: salesOverviewFromDaily(data.daily),
    topProducts: topProductsToViewRows(data.topProducts30d),
  };
}
