import { RowDataPacket } from "mysql2";
import { IProjectPermissionRepository } from "../../../Domain/repositories/project/IProjectPermissionRepository";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class ProjectPermissionRepository implements IProjectPermissionRepository {
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ) { }

    async isOwnerOfTeam(projectId: number, userId: number): Promise<boolean> {
        const res = await this.db.getReadConnection();
        if (!res) return false;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT 1 FROM projects p
         JOIN team_members tm ON tm.teamId = p.teamId
         WHERE p.id = ? AND tm.userId = ? AND tm.role = 'owner'`,
                [projectId, userId]
            );
            return rows.length > 0;
        } catch (err) {
            this.logger.error("ProjectPermissionRepository", "isOwnerOfTeam failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async isMemberOfTeam(projectId: number, userId: number): Promise<boolean> {
        const res = await this.db.getReadConnection();
        if (!res) return false;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT 1 FROM projects p
         JOIN team_members tm ON tm.teamId = p.teamId
         WHERE p.id = ? AND tm.userId = ?`,
                [projectId, userId]
            );
            return rows.length > 0;
        } catch (err) {
            this.logger.error("ProjectPermissionRepository", "isMemberOfTeam failed", err);
            return false;
        } finally { res.conn.release(); }
    }
}