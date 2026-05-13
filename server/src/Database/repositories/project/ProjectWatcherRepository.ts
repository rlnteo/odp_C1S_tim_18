import { ResultSetHeader } from "mysql2";
import { IProjectWatcherRepository } from "../../../Domain/repositories/project/IProjectWatcherRepository";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class ProjectWatcherRepository implements IProjectWatcherRepository {
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ) { }

    async watchProject(projectId: number, userId: number): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            await res.conn.execute(
                `INSERT IGNORE INTO project_watchers (userId, projectId) VALUES (?, ?)`,
                [userId, projectId]
            );
            return true;
        } catch (err) {
            this.logger.error("ProjectWatcherRepository", "watchProject failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async unwatchProject(projectId: number, userId: number): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `DELETE FROM project_watchers WHERE projectId = ? AND userId = ?`, [projectId, userId]
            );
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error("ProjectWatcherRepository", "unwatchProject failed", err);
            return false;
        } finally { res.conn.release(); }
    }
}