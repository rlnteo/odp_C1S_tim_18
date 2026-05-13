import { RowDataPacket, ResultSetHeader } from "mysql2";
import { ITeamMemberRepository } from "../../../Domain/repositories/team/ITeamMemberRepository";
import { TeamMember } from "../../../Domain/models/TeamMember";
import { TeamRole } from "../../../Domain/enums/TeamRole";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class TeamMemberRepository implements ITeamMemberRepository {
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ) { }

    async findMembers(teamId: number): Promise<TeamMember[]> {
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
            return rows.map((r) => new TeamMember(r.userId, r.username, r.role as TeamRole, new Date(r.joinedAt)));
        } catch (err) {
            this.logger.error("TeamMemberRepository", "findMembers failed", err);
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
            this.logger.error("TeamMemberRepository", "addMember failed", err);
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
            this.logger.error("TeamMemberRepository", "updateMemberRole failed", err);
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
            this.logger.error("TeamMemberRepository", "removeMember failed", err);
            return false;
        } finally { res.conn.release(); }
    }
}