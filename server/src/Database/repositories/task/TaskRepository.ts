import { RowDataPacket, ResultSetHeader } from "mysql2";
import { ITaskRepository } from "../../../Domain/repositories/task/ITaskRepository";
import { ITaskAssigneeRepository } from "../../../Domain/repositories/task/ITaskAssigneeRepository";
import { ITaskCommentRepository } from "../../../Domain/repositories/task/ITaskCommentRepository";
import { ITaskPermissionRepository } from "../../../Domain/repositories/task/ITaskPermissionRepository";

import { Task } from "../../../Domain/models/Task";
import { TaskUpdateFields } from "../../../Domain/types/TaskUpdateFields";
import { Assignee } from "../../../Domain/models/Assignee";
import { Comment } from "../../../Domain/models/Comment";
import { TaskStatus } from "../../../Domain/enums/TaskStatus";
import { ProjectPriority } from "../../../Domain/enums/ProjectPriority";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class TaskRepository implements ITaskRepository, ITaskAssigneeRepository, ITaskCommentRepository, ITaskPermissionRepository {
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ) { }

    private mapTask(r: RowDataPacket, assignees: Assignee[] = [], comments: Comment[] = []): Task {
        return new Task(
            r.id, r.projectId, r.title, r.description,
            r.priority as ProjectPriority, r.status as TaskStatus,
            Number(r.estimatedHours), r.dueDate ? new Date(r.dueDate) : null,
            r.createdBy, new Date(r.createdAt), assignees, comments,
        );
    }

    async create(task: Task): Promise<Task> {
        const res = await this.db.getWriteConnection();
        if (!res) return new Task();
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `INSERT INTO tasks (projectId, title, description, priority, status, estimatedHours, dueDate, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [task.projectId, task.title, task.description, task.priority, task.status, task.estimatedHours, task.dueDate, task.createdBy]
            );
            if (result.insertId === 0) return new Task();
            return new Task(result.insertId, task.projectId, task.title, task.description, task.priority, task.status, task.estimatedHours, task.dueDate, task.createdBy);
        } catch (err) {
            this.logger.error("TaskRepository", "create failed", err);
            return new Task();
        } finally { res.conn.release(); }
    }

    async findById(id: number): Promise<Task | null> {
        const res = await this.db.getReadConnection();
        if (!res) return null;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM tasks WHERE id = ?`, [id]
            );
            if (rows.length === 0) return null;
            const [assignees, comments] = await Promise.all([
                this.getAssignees(id),
                this.getComments(id),
            ]);
            return this.mapTask(rows[0], assignees, comments);
        } catch (err) {
            this.logger.error("TaskRepository", "findById failed", err);
            return null;
        } finally { res.conn.release(); }
    }

    async findByProjectId(projectId: number): Promise<Task[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM tasks WHERE projectId = ? ORDER BY status ASC, priority DESC`,
                [projectId]
            );
            return Promise.all(rows.map(async (r) => {
                const [assignees, comments] = await Promise.all([
                    this.getAssignees(r.id),
                    this.getComments(r.id),
                ]);
                return this.mapTask(r, assignees, comments);
            }));
        } catch (err) {
            this.logger.error("TaskRepository", "findByProjectId failed", err);
            return [];
        } finally { res.conn.release(); }
    }

    async findAssignedToUser(userId: number): Promise<Task[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT t.* FROM tasks t
         JOIN task_assignees ta ON ta.taskId = t.id
         WHERE ta.userId = ?
         ORDER BY t.dueDate ASC, t.priority DESC`,
                [userId]
            );
            return Promise.all(rows.map(async (r) => {
                const assignees = await this.getAssignees(r.id);
                return this.mapTask(r, assignees, []);
            }));
        } catch (err) {
            this.logger.error("TaskRepository", "findAssignedToUser failed", err);
            return [];
        } finally { res.conn.release(); }
    }

    async update(id: number, fields: TaskUpdateFields): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
            if (entries.length === 0) return false;
            const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
            const values = entries.map(([, v]) => v);
            const sql: string = `UPDATE tasks SET ${setClause} WHERE id = ?`;
            const [result] = await res.conn.query<ResultSetHeader>(sql, [...values, id]);
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error("TaskRepository", "update failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async updateStatus(id: number, status: TaskStatus): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `UPDATE tasks SET status = ? WHERE id = ?`, [status, id]
            );
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error("TaskRepository", "updateStatus failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async delete(id: number): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `DELETE FROM tasks WHERE id = ?`, [id]
            );
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error("TaskRepository", "delete failed", err);
            return false;
        } finally { res.conn.release(); }
    }

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
            this.logger.error("TaskRepository", "getAssignees failed", err);
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
            this.logger.error("TaskRepository", "assignUser failed", err);
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
            this.logger.error("TaskRepository", "unassignUser failed", err);
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
            this.logger.error("TaskRepository", "isAssigned failed", err);
            return false;
        } finally { res.conn.release(); }
    }

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
            this.logger.error("TaskRepository", "isOwnerOfTeam failed", err);
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
            this.logger.error("TaskRepository", "isCreator failed", err);
            return false;
        } finally { res.conn.release(); }
    }

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
            this.logger.error("TaskRepository", "getComments failed", err);
            return [];
        } finally { res.conn.release(); }
    }

    async addComment(taskId: number, userId: number, content: string): Promise<Comment | null> {
        const res = await this.db.getWriteConnection();
        if (!res) return null;
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `INSERT INTO comments (taskId, userId, content) VALUES (?, ?, ?)`,
                [taskId, userId, content]
            );
            if (result.insertId === 0) return null;
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT c.*, u.username FROM comments c
         JOIN users u ON u.id = c.userId WHERE c.id = ?`,
                [result.insertId]
            );
            const r = rows[0];
            return new Comment(r.id, r.taskId, r.userId, r.username, r.content, new Date(r.createdAt));
        } catch (err) {
            this.logger.error("TaskRepository", "addComment failed", err);
            return null;
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
            this.logger.error("TaskRepository", "deleteComment failed", err);
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
            this.logger.error("TaskRepository", "isCommentOwner failed", err);
            return false;
        } finally { res.conn.release(); }
    }
}