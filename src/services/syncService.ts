import { SYNC_INTERVAL_MS } from '../utils/constants';
import { getAllCachedReadings, clearCache } from './cacheService';
import { insertReadings } from '../database/repositories/readingRepository';

let syncTimer: ReturnType<typeof setInterval> | null = null;

export function startSync(): void {
  if (syncTimer) return;
  syncTimer = setInterval(async () => {
    const readings = getAllCachedReadings();
    if (readings.length > 0) {
      await insertReadings(readings);
      clearCache();
    }
  }, SYNC_INTERVAL_MS);
}

export function stopSync(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}
