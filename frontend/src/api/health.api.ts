import { http } from './client';

export interface HealthResponse {
  status: string;
  service: string;
  time: string;
  database: { status: 'up' | 'down'; name: string | null; error: string | null };
}

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await http.get<HealthResponse>('/health');
  return data;
}
