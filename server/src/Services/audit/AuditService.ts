import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { IAuditRepository } from "../../Domain/repositories/audit/IAuditRepository";
import { AuditLog } from "../../Domain/models/AuditLog";
import { AuditLogDto } from "../../Domain/DTOs/audit/AuditLogDto";
import { PaginatedAuditDto } from "../../Domain/DTOs/audit/PaginatedAuditDto";

export class AuditService implements IAuditService {
    public constructor(
        private readonly auditRepo: IAuditRepository,
    ) { }

    private toDto(log: AuditLog): AuditLogDto {
        return new AuditLogDto(
            log.id,
            log.userId,
            "",
            log.actionType,
            log.entityType,
            log.entityId,
            log.description,
            log.ipAddress,
            log.createdAt,
        );
    }

    async log(params: {
        userId?: number;
        actionType: string;
        entityType?: string;
        entityId?: number;
        description?: string;
        ipAddress?: string;
    }): Promise<void> {
        const entry = new AuditLog(
            0,
            params.userId ?? 0,
            params.actionType,
            params.entityType ?? "",
            params.entityId ?? 0,
            params.description ?? "",
            params.ipAddress ?? "",
        );
        await this.auditRepo.create(entry);
    }

    async getAllLogs(page: number, limit: number): Promise<PaginatedAuditDto> {
        const result = await this.auditRepo.findAll(page, limit);
        return new PaginatedAuditDto(result.items.map((l) => this.toDto(l)), result.total, page, limit);
    }
}