import type { HealthStatusDto } from "../../models/health/HealthDto";
import type { StatisticsDto } from "../../models/health/HealthDto";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IHealthAPIService {
    getHealth(): Promise<ApiResponse<HealthStatusDto>>;
    getStatistics(): Promise<ApiResponse<StatisticsDto>>;
}