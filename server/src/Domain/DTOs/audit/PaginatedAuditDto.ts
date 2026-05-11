import { AuditLogDto } from "./AuditLogDto";

export class PaginatedAuditDto {
    constructor(
        public items: AuditLogDto[] = [],
        public total: number = 0,
        public page: number = 1,
        public limit: number = 20,
    ) { }
}