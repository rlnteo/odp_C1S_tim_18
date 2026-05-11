import { AuditLog } from "../../models/AuditLog";
import { AuditLogDto } from "../../DTOs/audit/AuditLogDto";
import { PaginatedAuditDto } from "../../DTOs/audit/PaginatedAuditDto";

export interface IAuditRepository {
    create(entry: AuditLog): Promise<boolean>;
    findAll(page: number, limit: number): Promise<PaginatedAuditDto>;
}