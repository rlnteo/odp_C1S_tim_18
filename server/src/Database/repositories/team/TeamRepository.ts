import { RowDataPacket, ResultSetHeader } from "mysql2";
import { ITeamRepository } from "../../../Domain/repositories/team/ITeamRepository";
import { Team } from "../../../Domain/models/Team";
import { TeamDto } from "../../../Domain/DTOs/team/TeamDto";
import { CreateTeamDto } from "../../../Domain/DTOs/team/CreateTeamDto";
import { TeamMemberDto } from "../../../Domain/DTOs/team/TeamMemberDto";
import { TeamRole } from "../../../Domain/enums/TeamRole";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class TeamRepository implements ITeamRepository {
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ) { }

    private mapTeam(r: RowDataPacket, role = ""): TeamDto {
        return new TeamDto(r.id, r.name, r.description, r.avatarUrl, r.createdBy, new Date(r.createdAt), role);
    }

    async create(dto: CreateTeamDto): Promise<Team> {
        const res = await this.db.getWriteConnection();
        if (!res) return new Team();
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `INSERT INTO teams (name, description, avatarUrl, createdBy) VALUES (?, ?, ?, ?)`,
                [dto.name, dto.description, dto.avatarUrl, dto.createdBy]
            );
            if (result.insertId === 0) return new Team();

            // Kreiraj u team_members odmah kao owner
            await res.conn.execute(
                `INSERT INTO team_members (userId, teamId, role) VALUES (?, ?, 'owner')`,
                [dto.createdBy, result.insertId]
            );

            return new Team(result.insertId, dto.name, dto.description, dto.avatarUrl, dto.createdBy);
        } catch (err) {
            this.logger.error("TeamRepository", "create failed", err);
            return new Team();
        } finally { res.conn.release(); }
    }

    async findById(id: number, requesterId: number): Promise<TeamDto | null> {
        const res = await this.db.getReadConnection();
        if (!res) return null;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT t.*, tm.role AS myRole
         FROM teams t
         LEFT JOIN team_members tm ON tm.teamId = t.id AND tm.userId = ?
         WHERE t.id = ?`,
                [requesterId, id]
            );
            if (rows.length === 0) return null;
            return this.mapTeam(rows[0], rows[0].myRole ?? "");
        } catch (err) {
            this.logger.error("TeamRepository", "findById failed", err);
            return null;
        } finally { res.conn.release(); }
    }

    async findAll(): Promise<TeamDto[]> {
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

    async findByUserId(userId: number): Promise<TeamDto[]> {
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

    async update(id: number, fields: Partial<Team>): Promise<boolean> {
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

    async findMembers(teamId: number): Promise<TeamMemberDto[]> {
        const res = await this.db.getReadConnection();
        if (!res) return [];
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT u.id AS userId, u.username, tm.role, tm.joinedAt
         FROM team_members tm
         JOIN users u ON u.id = tm.userId
         WHERE tm.teamId = ?
         ORDER BY tm.role DESC, tm.joinedAt ASC`,
                [teamId]
            );
            return rows.map((r) => new TeamMemberDto(r.userId, r.username, r.role, new Date(r.joinedAt)));
        } catch (err) {
            this.logger.error("TeamRepository", "findMembers failed", err);
            return [];
        } finally { res.conn.release(); }
    }

    async addMember(teamId: number, userId: number, role: TeamRole): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            await res.conn.execute(
                `INSERT INTO team_members (userId, teamId, role) VALUES (?, ?, ?)`,
                [userId, teamId, role]
            );
            return true;
        } catch (err) {
            this.logger.error("TeamRepository", "addMember failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async updateMemberRole(teamId: number, userId: number, role: TeamRole): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `UPDATE team_members SET role = ? WHERE teamId = ? AND userId = ?`,
                [role, teamId, userId]
            );
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error("TeamRepository", "updateMemberRole failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async removeMember(teamId: number, userId: number): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            const [result] = await res.conn.execute<ResultSetHeader>(
                `DELETE FROM team_members WHERE teamId = ? AND userId = ?`,
                [teamId, userId]
            );
            return result.affectedRows > 0;
        } catch (err) {
            this.logger.error("TeamRepository", "removeMember failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async isMember(teamId: number, userId: number): Promise<boolean> {
        const res = await this.db.getReadConnection();
        if (!res) return false;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT 1 FROM team_members WHERE teamId = ? AND userId = ?`,
                [teamId, userId]
            );
            return rows.length > 0;
        } catch (err) {
            this.logger.error("TeamRepository", "isMember failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async isOwner(teamId: number, userId: number): Promise<boolean> {
        const res = await this.db.getReadConnection();
        if (!res) return false;
        try {
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT 1 FROM team_members WHERE teamId = ? AND userId = ? AND role = 'owner'`,
                [teamId, userId]
            );
            return rows.length > 0;
        } catch (err) {
            this.logger.error("TeamRepository", "isOwner failed", err);
            return false;
        } finally { res.conn.release(); }
    }
}