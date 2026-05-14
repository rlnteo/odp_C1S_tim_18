export interface NodeStatusDto {
  name: string;
  host: string;
  port: number;
  status: "healthy" | "degraded" | "offline";
  lastCheck: string;
  successfulWrites: number;
  failedWrites: number;
}

export interface HealthStatusDto {
  nodes: NodeStatusDto[];
  slaveRrIndex: number;
}