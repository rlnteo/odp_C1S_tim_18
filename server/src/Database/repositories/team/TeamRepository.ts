import { RowDataPacket, ResultSetHeader } from "mysql2";
import { ITeamRepository } from "../../../Domain/repositories/team/ITeamRepository";
import { Team } from "../../../Domain/models/Team";
import { TeamUpdateFieldsDto } from "../../../Domain/types/TeamUpdateFieldsDto";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class TeamRepository implements ITeamRepository {
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ) { }

    private mapTeam(r: RowDataPacket, role = ""): Team {
        return new Team(r.id, r.name, r.description, r.avatarUrl, r.createdBy, new Date(r.createdAt), role);
    }

    async create(team: Team): Promise<Team> {
        const res = await this.db.getWriteConnection();
        if (!res) return new Team();
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `INSERT INTO teams (name, description, avatarUrl, createdBy) VALUES (?, ?, ?, ?)`,
                [team.name, team.description, team.avatarUrl, team.createdBy]
            );
            if (result.insertId === 0) return new Team();
            await res.conn.execute(
                `INSERT INTO team_members (userId, teamId, role) VALUES (?, ?, 'owner')`,
                [team.createdBy, result.insertId]
            );
            return new Team(result.insertId, team.name, team.description, team.avatarUrl, team.createdBy);
        } catch (err) {
            this.logger.error("TeamRepository", "create failed", err);
            return new Team();
        } finally { res.conn.release(); }
    }

    async findById(id: number, requesterId: number): Promise<Team> {
        const res = await this.db.getReadConnection();
        if (!res) return new Team();
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT t.*, tm.role AS myRole
                 FROM teams t
                 LEFT JOIN team_members tm ON tm.teamId = t.id AND tm.userId = ?
                 WHERE t.id = ?`,
                [requesterId, id]
            );
            if (rows.length === 0) return new Team();
            return this.mapTeam(rows[0], rows[0].myRole ?? "");
        } catch (err) {
            this.logger.error("TeamRepository", "findById failed", err);
            return new Team();
        } finally { res.conn.release(); }
    }

    async findAll(): Promise<Team[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT * FROM teams ORDER BY createdAt DESC`
            );
            return rows.map((r) => this.mapTeam(r));
        } catch (err) {
            this.logger.error("TeamRepository", "findAll failed", err);
            return [];
        } finally { res.conn.release(); }
    }

    async findByUserId(userId: number): Promise<Team[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT t.*, tm.role AS myRole
                 FROM teams t
                 JOIN team_members tm ON tm.teamId = t.id
                 WHERE tm.userId = ?
                 ORDER BY t.createdAt DESC`,
                [userId]
            );
            return rows.map((r) => this.mapTeam(r, r.myRole));
        } catch (err) {
            this.logger.error("TeamRepository", "findByUserId failed", err);
            return [];
        } finally { res.conn.release(); }
    }

    async update(id: number, fields: TeamUpdateFieldsDto): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
            if (entries.length === 0) return false;
            const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
            const values = entries.map(([, v]) => v);
            const [result] = await res.conn.execute<ResultSetHeader>(
                `UPDATE teams SET ${setClause} WHERE id = ?`, [...values, id]
            );
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error("TeamRepository", "update failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async delete(id: number): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `DELETE FROM teams WHERE id = ?`, [id]
            );
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error("TeamRepository", "delete failed", err);
            return false;
        } finally { res.conn.release(); }
    }
}