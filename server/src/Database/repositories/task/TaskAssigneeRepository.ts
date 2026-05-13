import { RowDataPacket, ResultSetHeader } from "mysql2";
import { ITaskAssigneeRepository } from "../../../Domain/repositories/task/ITaskAssigneeRepository";
import { Assignee } from "../../../Domain/models/Assignee";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class TaskAssigneeRepository implements ITaskAssigneeRepository {
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ) { }

    async getAssignees(taskId: number): Promise<Assignee[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT u.id AS userId, u.username, ta.assignedAt, ta.assignedBy
         FROM task_assignees ta
         JOIN users u ON u.id = ta.userId
         WHERE ta.taskId = ?`,
                [taskId]
            );
            return rows.map((r) => new Assignee(r.userId, r.username, new Date(r.assignedAt), r.assignedBy));
        } catch (err) {
            this.logger.error("TaskAssigneeRepository", "getAssignees failed", err);
            return [];
        } finally { res.conn.release(); }
    }

    async assignUser(taskId: number, userId: number, assignedBy: number): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            await res.conn.execute(
                `INSERT IGNORE INTO task_assignees (taskId, userId, assignedBy) VALUES (?, ?, ?)`,
                [taskId, userId, assignedBy]
            );
            return true;
        } catch (err) {
            this.logger.error("TaskAssigneeRepository", "assignUser failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async unassignUser(taskId: number, userId: number): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `DELETE FROM task_assignees WHERE taskId = ? AND userId = ?`, [taskId, userId]
            );
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error("TaskAssigneeRepository", "unassignUser failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async isAssigned(taskId: number, userId: number): Promise<boolean> {
        const res = await this.db.getReadConnection();
        if (!res) return false;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT 1 FROM task_assignees WHERE taskId = ? AND userId = ?`, [taskId, userId]
            );
            return rows.length > 0;
        } catch (err) {
            this.logger.error("TaskAssigneeRepository", "isAssigned failed", err);
            return false;
        } finally { res.conn.release(); }
    }
}