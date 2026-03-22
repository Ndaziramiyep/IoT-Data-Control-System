import { getDb } from '../db';
import { Report } from '../../types/report';

export async function getAllReports(): Promise<Report[]> {
  return getDb().getAllAsync<Report>('SELECT * FROM reports ORDER BY generatedAt DESC');
}

export async function insertReport(report: Report): Promise<void> {
  const { id, deviceId, period, generatedAt, filePath } = report;
  await getDb().runAsync(
    'INSERT INTO reports (id, deviceId, period, generatedAt, filePath) VALUES (?, ?, ?, ?, ?)',
    [id, deviceId, period, generatedAt, filePath ?? null]
  );
}
