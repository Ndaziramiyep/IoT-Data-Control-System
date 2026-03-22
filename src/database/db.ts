import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import {
  CREATE_DEVICES_TABLE,
  CREATE_READINGS_TABLE,
  CREATE_INCIDENTS_TABLE,
  CREATE_REPORTS_TABLE,
  CREATE_REMINDERS_TABLE,
} from './schema';

let db: SQLite.SQLiteDatabase | null = null;
let readyPromise: Promise<SQLite.SQLiteDatabase | null> | null = null;

function getDb(): SQLite.SQLiteDatabase {
  if (!db) db = SQLite.openDatabaseSync('kumva_insights.db');
  return db;
}

export async function getReadyDb(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === 'web') return null;
  if (!readyPromise) {
    readyPromise = (async () => {
      const database = getDb();
      // Enable foreign keys
      await database.execAsync('PRAGMA foreign_keys = ON;');
      await database.execAsync(CREATE_DEVICES_TABLE);
      await database.execAsync(CREATE_READINGS_TABLE);
      await database.execAsync(CREATE_INCIDENTS_TABLE);
      await database.execAsync(CREATE_REPORTS_TABLE);
      await database.execAsync(CREATE_REMINDERS_TABLE);
      return database;
    })();
  }
  return readyPromise;
}

export async function initDb(): Promise<void> {
  if (Platform.OS === 'web') return;
  await getReadyDb();
}

// ── Web localStorage persistence ─────────────────────────────────────────────
// On web, SQLite is unavailable. We use localStorage as a simple key-value
// store so data survives page refreshes.

const WEB_DEVICES_KEY = 'kumva_devices';

export function webSaveDevices(devices: any[]): void {
  if (Platform.OS !== 'web') return;
  try {
    localStorage.setItem(WEB_DEVICES_KEY, JSON.stringify(devices));
  } catch {}
}

export function webLoadDevices(): any[] {
  if (Platform.OS !== 'web') return [];
  try {
    const raw = localStorage.getItem(WEB_DEVICES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
