import { RowDataPacket } from "mysql2";
import { ITaskPermissionRepository } from "../../../Domain/repositories/task/ITaskPermissionRepository";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class TaskPermissionRepository implements ITaskPermissionRepository {
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ) { }

    async isOwnerOfTeam(taskId: number, userId: number): Promise<boolean> {
        const res = await this.db.getReadConnection();
        if (!res) return false;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT 1 FROM tasks t
         JOIN projects p ON p.id = t.projectId
         JOIN team_members tm ON tm.teamId = p.teamId
         WHERE t.id = ? AND tm.userId = ? AND tm.role = 'owner'`,
                [taskId, userId]
            );
            return rows.length > 0;
        } catch (err) {
            this.logger.error("TaskPermissionRepository", "isOwnerOfTeam failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async isCreator(taskId: number, userId: number): Promise<boolean> {
        const res = await this.db.getReadConnection();
        if (!res) return false;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT 1 FROM tasks WHERE id = ? AND createdBy = ?`, [taskId, userId]
            );
            return rows.length > 0;
        } catch (err) {
            this.logger.error("TaskPermissionRepository", "isCreator failed", err);
            return false;
        } finally { res.conn.release(); }
    }
}