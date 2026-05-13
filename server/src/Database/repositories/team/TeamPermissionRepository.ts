import { RowDataPacket } from "mysql2";
import { ITeamPermissionRepository } from "../../../Domain/repositories/team/ITeamPermissionRepository";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class TeamPermissionRepository implements ITeamPermissionRepository {
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ) { }

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
            this.logger.error("TeamPermissionRepository", "isMember failed", err);
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
            this.logger.error("TeamPermissionRepository", "isOwner failed", err);
            return false;
        } finally { res.conn.release(); }
    }
}