import { getDb } from '../db';
import { Reading } from '../../types/reading';

export async function getReadingsByDevice(deviceId: string, limit = 100): Promise<Reading[]> {
  return getDb().getAllAsync<Reading>(
    'SELECT * FROM readings WHERE deviceId = ? ORDER BY timestamp DESC LIMIT ?',
    [deviceId, limit]
  );
}

export async function insertReadings(readings: Reading[]): Promise<void> {
  const db = getDb();
  for (const r of readings) {
    await db.runAsync(
      'INSERT OR IGNORE INTO readings (id, deviceId, temperature, timestamp) VALUES (?, ?, ?, ?)',
      [r.id, r.deviceId, r.temperature, r.timestamp]
    );
  }
}
