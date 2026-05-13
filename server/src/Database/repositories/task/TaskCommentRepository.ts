import { RowDataPacket, ResultSetHeader } from "mysql2";
import { ITaskCommentRepository } from "../../../Domain/repositories/task/ITaskCommentRepository";
import { Comment } from "../../../Domain/models/Comment";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class TaskCommentRepository implements ITaskCommentRepository {
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ) { }

    async getComments(taskId: number): Promise<Comment[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT c.*, u.username FROM comments c
         JOIN users u ON u.id = c.userId
         WHERE c.taskId = ? ORDER BY c.createdAt ASC`,
                [taskId]
            );
            return rows.map((r) => new Comment(r.id, r.taskId, r.userId, r.username, r.content, new Date(r.createdAt)));
        } catch (err) {
            this.logger.error("TaskCommentRepository", "getComments failed", err);
            return [];
        } finally { res.conn.release(); }
    }

    async addComment(taskId: number, userId: number, content: string): Promise<Comment> {
        const res = await this.db.getWriteConnection();
        if (!res) return new Comment();
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `INSERT INTO comments (taskId, userId, content) VALUES (?, ?, ?)`,
                [taskId, userId, content]
            );
            if (result.insertId === 0) return new Comment();
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT c.*, u.username FROM comments c
         JOIN users u ON u.id = c.userId WHERE c.id = ?`,
                [result.insertId]
            );
            if (rows.length === 0) return new Comment();
            const r = rows[0];
            return new Comment(r.id, r.taskId, r.userId, r.username, r.content, new Date(r.createdAt));
        } catch (err) {
            this.logger.error("TaskCommentRepository", "addComment failed", err);
            return new Comment();
        } finally { res.conn.release(); }
    }

    async deleteComment(commentId: number): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `DELETE FROM comments WHERE id = ?`, [commentId]
            );
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error("TaskCommentRepository", "deleteComment failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async isCommentOwner(commentId: number, userId: number): Promise<boolean> {
        const res = await this.db.getReadConnection();
        if (!res) return false;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT 1 FROM comments WHERE id = ? AND userId = ?`, [commentId, userId]
            );
            return rows.length > 0;
        } catch (err) {
            this.logger.error("TaskCommentRepository", "isCommentOwner failed", err);
            return false;
        } finally { res.conn.release(); }
    }
}