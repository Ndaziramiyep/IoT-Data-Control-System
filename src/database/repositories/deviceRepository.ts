import { getReadyDb } from '../db';
import { Device } from '../../types/device';

export async function getAllDevices(): Promise<Device[]> {
  const db = await getReadyDb();
  if (!db) return [];
  return db.getAllAsync<Device>('SELECT * FROM devices ORDER BY createdAt DESC');
}

export async function insertDevice(device: Device): Promise<void> {
  const db = await getReadyDb();
  if (!db) return;
  const { id, name, category, macAddress, minTemp, maxTemp, createdAt } = device;
  await db.runAsync(
    'INSERT INTO devices (id, name, category, macAddress, minTemp, maxTemp, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    id, name, category, macAddress, minTemp, maxTemp, createdAt
  );
}

export async function deleteDevice(id: string): Promise<void> {
  const db = await getReadyDb();
  if (!db) return;
  await db.runAsync('DELETE FROM devices WHERE id = ?', id);
}
