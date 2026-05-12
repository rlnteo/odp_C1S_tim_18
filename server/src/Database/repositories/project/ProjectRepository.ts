import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IProjectRepository } from "../../../Domain/repositories/project/IProjectRepository";
import { IProjectTagRepository } from "../../../Domain/repositories/project/IProjectTagRepository";
import { IProjectWatcherRepository } from "../../../Domain/repositories/project/IProjectWatcherRepository";
import { IProjectPermissionRepository } from "../../../Domain/repositories/project/IProjectPermissionRepository";
import { Project } from "../../../Domain/models/Project";
import { ProjectDto } from "../../../Domain/DTOs/project/ProjectDto";
import { CreateProjectDto } from "../../../Domain/DTOs/project/CreateProjectDto";
import { TagDto } from "../../../Domain/DTOs/project/TagDto";
import { ProjectStatus } from "../../../Domain/enums/ProjectStatus";
import { ProjectPriority } from "../../../Domain/enums/ProjectPriority";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class ProjectRepository implements IProjectRepository, IProjectTagRepository,
    IProjectWatcherRepository,
    IProjectPermissionRepository {
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ) { }

    private mapProject(r: RowDataPacket, tags: TagDto[] = [], isWatching = false): ProjectDto {
        return new ProjectDto(
            r.id, r.teamId, r.name, r.description,
            new Date(r.deadline), r.status as ProjectStatus,
            r.priority as ProjectPriority, r.createdBy,
            new Date(r.createdAt), tags, isWatching,
        );
    }

    async create(dto: CreateProjectDto): Promise<Project> {
        const res = await this.db.getWriteConnection();
        if (!res) return new Project();
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `INSERT INTO projects (teamId, name, description, deadline, status, priority, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [dto.teamId, dto.name, dto.description, dto.deadline, dto.status, dto.priority, dto.createdBy]
            );
            if (result.insertId === 0) return new Project();
            return new Project(result.insertId, dto.teamId, dto.name, dto.description, dto.deadline, dto.status, dto.priority, dto.createdBy);
        } catch (err) {
            this.logger.error("ProjectRepository", "create failed", err);
            return new Project();
        } finally { res.conn.release(); }
    }

    async findById(id: number, requesterId: number): Promise<ProjectDto | null> {
        const res = await this.db.getReadConnection();
        if (!res) return null;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT p.*,
                EXISTS(SELECT 1 FROM project_watchers WHERE projectId = p.id AND userId = ?) AS isWatching
         FROM projects p WHERE p.id = ?`,
                [requesterId, id]
            );
            if (rows.length === 0) return null;
            const tags = await this.getProjectTags(id);
            return this.mapProject(rows[0], tags, !!rows[0].isWatching);
        } catch (err) {
            this.logger.error("ProjectRepository", "findById failed", err);
            return null;
        } finally { res.conn.release(); }
    }

    async findByTeamId(teamId: number, requesterId: number): Promise<ProjectDto[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT p.*,
                EXISTS(SELECT 1 FROM project_watchers WHERE projectId = p.id AND userId = ?) AS isWatching
         FROM projects p WHERE p.teamId = ? ORDER BY p.createdAt DESC`,
                [requesterId, teamId]
            );
            return Promise.all(rows.map(async (r) => {
                const tags = await this.getProjectTags(r.id);
                return this.mapProject(r, tags, !!r.isWatching);
            }));
        } catch (err) {
            this.logger.error("ProjectRepository", "findByTeamId failed", err);
            return [];
        } finally { res.conn.release(); }
    }

    async findWatchedByUserId(userId: number): Promise<ProjectDto[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT p.* FROM projects p
         JOIN project_watchers pw ON pw.projectId = p.id
         WHERE pw.userId = ? ORDER BY pw.watchingSince DESC`,
                [userId]
            );
            return Promise.all(rows.map(async (r) => {
                const tags = await this.getProjectTags(r.id);
                return this.mapProject(r, tags, true);
            }));
        } catch (err) {
            this.logger.error("ProjectRepository", "findWatchedByUserId failed", err);
            return [];
        } finally { res.conn.release(); }
    }

    async update(id: number, fields: Partial<Project>): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
            if (entries.length === 0) return false;
            const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
            const values = entries.map(([, v]) => v);
            const [result] = await res.conn.execute<ResultSetHeader>(
                `UPDATE projects SET ${setClause} WHERE id = ?`, [...values, id]
            );
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error("ProjectRepository", "update failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async delete(id: number): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `DELETE FROM projects WHERE id = ?`, [id]
            );
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error("ProjectRepository", "delete failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async getAllTags(): Promise<TagDto[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM tags ORDER BY name ASC`);
            return rows.map((r) => new TagDto(r.id, r.name));
        } catch (err) {
            this.logger.error("ProjectRepository", "getAllTags failed", err);
            return [];
        } finally { res.conn.release(); }
    }

    async getProjectTags(projectId: number): Promise<TagDto[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT t.* FROM tags t JOIN project_tags pt ON pt.tagId = t.id WHERE pt.projectId = ?`,
                [projectId]
            );
            return rows.map((r) => new TagDto(r.id, r.name));
        } catch (err) {
            this.logger.error("ProjectRepository", "getProjectTags failed", err);
            return [];
        } finally { res.conn.release(); }
    }

    async addTag(projectId: number, tagId: number): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            await res.conn.execute(
                `INSERT IGNORE INTO project_tags (projectId, tagId) VALUES (?, ?)`,
                [projectId, tagId]
            );
            return true;
        } catch (err) {
            this.logger.error("ProjectRepository", "addTag failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async removeTag(projectId: number, tagId: number): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `DELETE FROM project_tags WHERE projectId = ? AND tagId = ?`, [projectId, tagId]
            );
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error("ProjectRepository", "removeTag failed", err);
            return false;
        } finally { res.conn.release(); }
    }

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
            this.logger.error("ProjectRepository", "watchProject failed", err);
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
            this.logger.error("ProjectRepository", "unwatchProject failed", err);
            return false;
        } finally { res.conn.release(); }
    }

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
            this.logger.error("ProjectRepository", "isOwnerOfTeam failed", err);
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
            this.logger.error("ProjectRepository", "isMemberOfTeam failed", err);
            return false;
        } finally { res.conn.release(); }
    }
}