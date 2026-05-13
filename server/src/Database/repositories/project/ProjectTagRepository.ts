import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IProjectTagRepository } from "../../../Domain/repositories/project/IProjectTagRepository";
import { Tag } from "../../../Domain/models/Tag";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class ProjectTagRepository implements IProjectTagRepository {
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ) { }

    async getAllTags(): Promise<Tag[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM tags ORDER BY name ASC`);
            return rows.map((r) => new Tag(r.id, r.name));
        } catch (err) {
            this.logger.error("ProjectTagRepository", "getAllTags failed", err);
            return [];
        } finally { res.conn.release(); }
    }

    async getProjectTags(projectId: number): Promise<Tag[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT t.* FROM tags t JOIN project_tags pt ON pt.tagId = t.id WHERE pt.projectId = ?`,
                [projectId]
            );
            return rows.map((r) => new Tag(r.id, r.name));
        } catch (err) {
            this.logger.error("ProjectTagRepository", "getProjectTags failed", err);
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
            this.logger.error("ProjectTagRepository", "addTag failed", err);
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
            this.logger.error("ProjectTagRepository", "removeTag failed", err);
            return false;
        } finally { res.conn.release(); }
    }
}