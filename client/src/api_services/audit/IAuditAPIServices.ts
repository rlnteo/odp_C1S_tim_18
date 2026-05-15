import type { AuditDto, PaginatedAuditDto } from "../../models/audit/AuditDto";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IAuditAPIService {
    getLogs(page?: number, limit?: number): Promise<ApiResponse<PaginatedAuditDto>>;
}