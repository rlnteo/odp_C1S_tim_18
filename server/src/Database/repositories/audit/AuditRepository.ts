import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IAuditRepository } from "../../../Domain/repositories/audit/IAuditRepository";
import { AuditLog } from "../../../Domain/models/AuditLog";
import { AuditLogDto } from "../../../Domain/DTOs/audit/AuditLogDto";
import { PaginatedAuditDto } from "../../../Domain/DTOs/audit/PaginatedAuditDto";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

interface CountRow extends RowDataPacket { total: number; }

export class AuditRepository implements IAuditRepository {
    public constructor(
        private readonly db: DbManager,
        private readonly logger: ILoggerService,
    ) { }

    private map(r: RowDataPacket): AuditLogDto {
        return new AuditLogDto(
            r.id, r.userId, r.username ?? null,
            r.actionType, r.entityType ?? null,
            r.entityId ?? null, r.description ?? null,
            r.ipAddress ?? null, new Date(r.createdAt),
        );
    }

    async create(entry: AuditLog): Promise<boolean> {
        const res = await this.db.getWriteConnection();
        if (!res) return false;
        try {
            await res.conn.execute<ResultSetHeader>(
                `INSERT INTO audit_log (userId, actionType, entityType, entityId, description, ipAddress)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [entry.userId, entry.actionType, entry.entityType, entry.entityId, entry.description, entry.ipAddress]
            );
            return true;
        } catch (err) {
            this.logger.error("AuditRepository", "create failed", err);
            return false;
        } finally { res.conn.release(); }
    }

    async findAll(page = 1, limit = 20): Promise<PaginatedAuditDto> {
        const res = await this.db.getReadConnection();
        if (!res) return new PaginatedAuditDto();
        const offset = (page - 1) * limit;
        try {
            const [[countRow]] = await res.conn.execute<CountRow[]>(
                `SELECT COUNT(*) AS total FROM audit_log`
            );
            const [rows] = await res.conn.execute<RowDataPacket[]>(
                `SELECT al.*, u.username
         FROM audit_log al
         LEFT JOIN users u ON u.id = al.userId
         ORDER BY al.createdAt DESC
         LIMIT ? OFFSET ?`,
                [limit, offset]
            );
            return new PaginatedAuditDto(rows.map((r) => this.map(r)), countRow.total, page, limit);
        } catch (err) {
            this.logger.error("AuditRepository", "findAll failed", err);
            return new PaginatedAuditDto();
        } finally { res.conn.release(); }
    }
}