import { getReadyDb } from '../db';
import { Report } from '../../types/report';

export async function getAllReports(): Promise<Report[]> {
  const db = await getReadyDb();
  if (!db) return [];
  return db.getAllAsync<Report>('SELECT * FROM reports ORDER BY generatedAt DESC');
}

export async function insertReport(report: Report): Promise<void> {
  const db = await getReadyDb();
  if (!db) return;
  const { id, deviceId, period, generatedAt, filePath } = report;
  await db.runAsync(
    'INSERT INTO reports (id, deviceId, period, generatedAt, filePath) VALUES (?, ?, ?, ?, ?)',
    id, deviceId, period, generatedAt, filePath ?? null
  );
}
