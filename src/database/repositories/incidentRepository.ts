import { getDb } from '../db';
import { Incident } from '../../types/incident';

export async function getAllIncidents(): Promise<Incident[]> {
  return getDb().getAllAsync<Incident>('SELECT * FROM incidents ORDER BY timestamp DESC');
}

export async function insertIncident(incident: Incident): Promise<void> {
  const { id, deviceId, message, severity, timestamp, resolved } = incident;
  await getDb().runAsync(
    'INSERT INTO incidents (id, deviceId, message, severity, timestamp, resolved) VALUES (?, ?, ?, ?, ?, ?)',
    [id, deviceId, message, severity, timestamp, resolved ? 1 : 0]
  );
}

export async function resolveIncident(id: string): Promise<void> {
  await getDb().runAsync('UPDATE incidents SET resolved = 1 WHERE id = ?', [id]);
}
