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

export interface StatisticsDto {
    totalUsers: number;
    totalTeams: number;
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
}