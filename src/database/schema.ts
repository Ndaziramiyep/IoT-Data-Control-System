export const CREATE_DEVICES_TABLE = `
  CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    macAddress TEXT NOT NULL,
    minTemp REAL NOT NULL,
    maxTemp REAL NOT NULL,
    createdAt INTEGER NOT NULL
  );
`;

export const CREATE_READINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS readings (
    id TEXT PRIMARY KEY,
    deviceId TEXT NOT NULL,
    temperature REAL NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (deviceId) REFERENCES devices(id)
  );
`;

export const CREATE_INCIDENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    deviceId TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    resolved INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (deviceId) REFERENCES devices(id)
  );
`;

export const CREATE_REPORTS_TABLE = `
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    deviceId TEXT NOT NULL,
    period TEXT NOT NULL,
    generatedAt INTEGER NOT NULL,
    filePath TEXT
  );
`;
