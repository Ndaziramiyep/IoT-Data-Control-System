export interface Incident {
  incident_id?: number;
  device_id: string;
  start_time: number;
  end_time?: number | null;
  max_temperature: number;
}
