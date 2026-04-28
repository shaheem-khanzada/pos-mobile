import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { modelClasses } from './model';
import schema from './schema';

const adapter = new SQLiteAdapter({
  schema,
  jsi: true,
  onSetUpError: (error) => {
    console.error('[WatermelonDB] setup error', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses,
});

export default database;
