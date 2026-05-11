import { PaginatedAuditDto } from "../../DTOs/audit/PaginatedAuditDto";

export interface IAuditService {
    log(params: {
        userId?: number;
        actionType: string;
        entityType?: string;
        entityId?: number;
        description?: string;
        ipAddress?: string;
    }): Promise<void>;
    getAllLogs(page: number, limit: number): Promise<PaginatedAuditDto>;
}