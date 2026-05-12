import { AuditLog } from "../../models/AuditLog";

export interface IAuditRepository {
    create(entry: AuditLog): Promise<boolean>;
    findAll(page: number, limit: number): Promise<{ items: AuditLog[]; total: number }>;
}