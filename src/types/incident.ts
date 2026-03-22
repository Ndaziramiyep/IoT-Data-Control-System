export type IncidentSeverity = 'low' | 'medium' | 'high';

export interface Incident {
  id: string;
  deviceId: string;
  message: string;
  severity: IncidentSeverity;
  timestamp: number;
  resolved: boolean;
}
