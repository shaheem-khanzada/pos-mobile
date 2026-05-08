import { Model } from '@nozbe/watermelondb';
import { date, json, text } from '@nozbe/watermelondb/decorators';
import { sanitizer } from '../utils';

/** Matches API period `lift`. */
export type ReportsLift = {
  orders: number | null;
  profit: number | null;
  revenue: number | null;
};

/** Matches API `last30Days`, `last7Days`, `today`. */
export type ReportsPeriodMetrics = {
  discount: number;
  orders: number;
  profit: number;
  revenue: number;
  lift: ReportsLift;
};

/** Matches API `daily[]` entries. */
export type ReportsDailyEntry = {
  date: string;
  orders: number;
  revenue: number;
  profit: number;
  discount: number;
};

/** Matches API `topProducts30d[]` entries. */
export type ReportsTopProductEntry = {
  productId: string;
  quantity: number;
  revenue: number;
  profit: number;
};

export default class Report extends Model {
  static table = 'reports';

  @json('daily', sanitizer) daily!: ReportsDailyEntry[];
  @json('last_30_days', sanitizer) last30Days!: ReportsPeriodMetrics;
  @json('last_7_days', sanitizer) last7Days!: ReportsPeriodMetrics;
  @json('today', sanitizer) today!: ReportsPeriodMetrics;
  @json('top_products_30d', sanitizer) topProducts30d!: ReportsTopProductEntry[];

  @text('tenant') tenant!: string | null;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}
