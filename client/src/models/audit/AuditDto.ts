export interface AuditDto {
  id: number;
  userId: number;
  username: string;
  actionType: string;
  entityType: string;
  entityId: number;
  description: string;
  ipAddress: string;
  createdAt: string;
}

export interface PaginatedAuditDto {
  logs: AuditDto[];
  total: number;
  page: number;
  limit: number;
}