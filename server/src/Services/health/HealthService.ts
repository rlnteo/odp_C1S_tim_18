import { RowDataPacket }   from "mysql2";
import { IHealthService }  from "../../Domain/services/health/IHealthService";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { HealthStatusDto } from "../../Domain/DTOs/health/HealthStatusDto";
import { NodeStatusDto }   from "../../Domain/DTOs/health/NodeStatusDto";
import { StatisticsDto }   from "../../Domain/DTOs/statistics/StatisticsDto";
import { DbManager }       from "../../Database/connection/DbConnectionPool";

interface StatsRow extends RowDataPacket {
  totalUsers: number;
  totalTeams: number;
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
}

export class HealthService implements IHealthService {
  public constructor(
    private readonly db:       DbManager,
    private readonly userRepo: IUserRepository,
  ) {}

  getDbStatus(): HealthStatusDto {
    const nodes = this.db.getNodes().map(
      (n) => new NodeStatusDto(n.name, n.host, n.port, n.status, n.lastCheck, n.successfulWrites, n.failedWrites)
    );
    return new HealthStatusDto(nodes, this.db.getSlaveRrIndex());
  }

  async runHealthCheck(): Promise<void> {
    await this.db.runHealthCheck();
  }

  async getStatistics(): Promise<StatisticsDto> {
    const res = await this.db.getReadConnection();
    if (!res) return new StatisticsDto();

    try {
      const [rows] = await res.conn.execute<StatsRow[]>(`
        SELECT
          (SELECT COUNT(*) FROM users)                             AS totalUsers,
          (SELECT COUNT(*) FROM teams)                             AS totalTeams,
          (SELECT COUNT(*) FROM projects)                          AS totalProjects,
          (SELECT COUNT(*) FROM projects WHERE status = 'active')  AS activeProjects,
          (SELECT COUNT(*) FROM tasks)                             AS totalTasks,
          (SELECT COUNT(*) FROM tasks   WHERE status = 'done')     AS completedTasks
      `);

      const r = rows[0];
      return new StatisticsDto(
        Number(r.totalUsers),
        Number(r.totalTeams),
        Number(r.totalProjects),
        Number(r.activeProjects),
        Number(r.totalTasks),
        Number(r.completedTasks),
      );
    } catch {
      return new StatisticsDto();
    } finally {
      res.conn.release();
    }
  }

    public async promoteSlaveToMaster(slaveIndex: number): Promise<boolean> {
      try {
        this.db.promoteSlaveToMaster(slaveIndex);
        return true;
      } catch {
        return false;
      }
    }

}
