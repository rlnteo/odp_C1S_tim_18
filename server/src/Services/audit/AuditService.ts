import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { IAuditRepository } from "../../Domain/repositories/audit/IAuditRepository";
import { AuditLog } from "../../Domain/models/AuditLog";
import { PaginatedAuditDto } from "../../Domain/DTOs/audit/PaginatedAuditDto";

export class AuditService implements IAuditService {
    public constructor(
        private readonly auditRepo: IAuditRepository,
    ) { }

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
            params.userId ?? null,
            params.actionType,
            params.entityType ?? null,
            params.entityId ?? null,
            params.description ?? null,
            params.ipAddress ?? null,
        );
        await this.auditRepo.create(entry);
    }

    async getAllLogs(page: number, limit: number): Promise<PaginatedAuditDto> {
        return this.auditRepo.findAll(page, limit);
    }
}