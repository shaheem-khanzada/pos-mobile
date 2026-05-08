import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
import { ObjectId } from 'bson';

import { modelClasses } from './model';
import schema from './schema';

setGenerator(() => new ObjectId().toHexString());

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
