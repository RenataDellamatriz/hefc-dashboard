import { apiRequest } from ".";

export interface HealthStatus {
  status: string;
}

export async function checkHealthAlive(): Promise<HealthStatus> {
  const { data } = await apiRequest<HealthStatus>({
    method: "GET",
    url: "/health/alive",
  });

  return data;
}

export async function checkHealthReady(): Promise<HealthStatus> {
  const { data } = await apiRequest<HealthStatus>({
    method: "GET",
    url: "/health/ready",
  });

  return data;
}

