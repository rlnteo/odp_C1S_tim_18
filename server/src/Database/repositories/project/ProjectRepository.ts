import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IProjectRepository } from "../../../Domain/repositories/project/IProjectRepository";
import { Project } from "../../../Domain/models/Project";
import { ProjectUpdateFieldsDto } from "../../../Domain/types/ProjectUpdateFieldsDto";
import { Tag } from "../../../Domain/models/Tag";
import { ProjectStatus } from "../../../Domain/enums/ProjectStatus";
import { ProjectPriority } from "../../../Domain/enums/ProjectPriority";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class ProjectRepository implements IProjectRepository {
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ) { }

    private mapProject(r: RowDataPacket, tags: Tag[] = [], isWatching = false): Project {
        return new Project(
            r.id, r.teamId, r.name, r.description,
            new Date(r.deadline), r.status as ProjectStatus,
            r.priority as ProjectPriority, r.createdBy,
            new Date(r.createdAt), tags, isWatching,
        );
    }

    private async getProjectTags(projectId: number): Promise<Tag[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT t.* FROM tags t JOIN project_tags pt ON pt.tagId = t.id WHERE pt.projectId = ?`,
                [projectId]
            );
            return rows.map((r) => new Tag(r.id, r.name));
        } catch (err) {
            this.logger.error("ProjectRepository", "getProjectTags failed", err);
            return [];
        } finally { res.conn.release(); }
    }

    async create(project: Project): Promise<Project> {
        const res = await this.db.getWriteConnection();
        if (!res) return new Project();
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `INSERT INTO projects (teamId, name, description, deadline, status, priority, createdBy)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [project.teamId, project.name, project.description, project.deadline, project.status, project.priority, project.createdBy]
            );
            if (result.insertId === 0) return new Project();
            return new Project(result.insertId, project.teamId, project.name, project.description, project.deadline, project.status, project.priority, project.createdBy);
        } catch (err) {
          this.logger.error("ProjectRepository", "create failed", err);
          console.log("CREATE PROJECT ERROR:", err);
          return new Project();
        } finally { res.conn.release(); }
    }

    async findById(id: number, requesterId: number): Promise<Project> {
        const res = await this.db.getReadConnection();
        if (!res) return new Project();
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT p.*,
                 EXISTS(SELECT 1 FROM project_watchers WHERE projectId = p.id AND userId = ?) AS isWatching
                 FROM projects p WHERE p.id = ?`,
                [requesterId, id]
            );
            if (rows.length === 0) return new Project();
            const tags = await this.getProjectTags(id);
            return this.mapProject(rows[0], tags, !!rows[0].isWatching);
        } catch (err) {
            this.logger.error("ProjectRepository", "findById failed", err);
            return new Project();
        } finally { res.conn.release(); }
    }

    async findByTeamId(teamId: number, requesterId: number): Promise<Project[]> {
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

    async findWatchedByUserId(userId: number): Promise<Project[]> {
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

    async update(id: number, fields: ProjectUpdateFieldsDto): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
            if (entries.length === 0) return false;
            const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
            const values = entries.map(([, v]) => v);
            const [result] = await res.conn.query<ResultSetHeader>(
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
}