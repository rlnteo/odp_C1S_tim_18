import { HealthStatusDto } from "../../DTOs/health/HealthStatusDto";
import { StatisticsDto }   from "../../DTOs/statistics/StatisticsDto";

export interface IHealthService {
  getDbStatus(): HealthStatusDto;
  runHealthCheck(): Promise<void>;
  getStatistics(): Promise<StatisticsDto>;
}
