import { Q } from '@nozbe/watermelondb';

import { database } from '../db';
import Report from '../model/Report';
import { fetchAnalytics } from './apis';
import { getSelectedTenantId } from '@/screens/auth/stores/auth-store';

/**
 * Pull latest analytics into a single `Report` row per tenant (no pagination, no cursor).
 */
export async function syncReportsFromApi() {
  const tenantId = getSelectedTenantId();
  const reportsCollection = database.get<Report>('reports');

  console.info('[db-sync][reports] start', { tenantId });

  const { data } = await fetchAnalytics();
  if (!data) {
    throw new Error('[db-sync][reports] response missing data');
  }

  const existing = await reportsCollection.query(Q.where('tenant', tenantId)).fetch();
  const now = new Date();

  const patchPayload = (row: Report) => {
    row.daily = data.daily as Report['daily'];
    row.last30Days = data.last30Days as Report['last30Days'];
    row.last7Days = data.last7Days as Report['last7Days'];
    row.today = data.today as Report['today'];
    row.topProducts30d = data.topProducts30d as Report['topProducts30d'];
    row.updatedAt = now;
  };

  await database.write(async () => {
    const batchOps: Parameters<typeof database.batch>[0][] = [];

    if (existing.length > 0) {
      const primary = existing[0];
      batchOps.push(
        primary.prepareUpdate((row) => {
          patchPayload(row);
        })
      );
      for (let i = 1; i < existing.length; i += 1) {
        batchOps.push(existing[i].prepareDestroyPermanently());
      }
    } else {
      batchOps.push(
        reportsCollection.prepareCreate((row) => {
          row.tenant = tenantId;
          row.createdAt = now;
          patchPayload(row);
        })
      );
    }

    await database.batch(...batchOps);
  });

  console.info('[db-sync][reports] done');

  return { ok: true as const };
}
