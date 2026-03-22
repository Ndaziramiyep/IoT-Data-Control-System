import * as SQLite from 'expo-sqlite';
import {
  CREATE_DEVICES_TABLE,
  CREATE_READINGS_TABLE,
  CREATE_INCIDENTS_TABLE,
  CREATE_REPORTS_TABLE,
} from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('iot_control.db');
  }
  return db;
}

export async function initDb(): Promise<void> {
  const database = getDb();
  await database.execAsync(CREATE_DEVICES_TABLE);
  await database.execAsync(CREATE_READINGS_TABLE);
  await database.execAsync(CREATE_INCIDENTS_TABLE);
  await database.execAsync(CREATE_REPORTS_TABLE);
}
