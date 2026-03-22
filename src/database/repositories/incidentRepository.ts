import { getReadyDb } from '../db';
import { Incident } from '../../types/incident';

export async function getAllIncidents(): Promise<Incident[]> {
  const db = await getReadyDb();
  if (!db) return [];
  return db.getAllAsync<Incident>('SELECT * FROM incidents ORDER BY timestamp DESC');
}

export async function insertIncident(incident: Incident): Promise<void> {
  const db = await getReadyDb();
  if (!db) return;
  const { id, deviceId, message, severity, timestamp, resolved } = incident;
  await db.runAsync(
    'INSERT INTO incidents (id, deviceId, message, severity, timestamp, resolved) VALUES (?, ?, ?, ?, ?, ?)',
    id, deviceId, message, severity, timestamp, resolved ? 1 : 0
  );
}

export async function resolveIncident(id: string): Promise<void> {
  const db = await getReadyDb();
  if (!db) return;
  await db.runAsync('UPDATE incidents SET resolved = 1 WHERE id = ?', id);
}
