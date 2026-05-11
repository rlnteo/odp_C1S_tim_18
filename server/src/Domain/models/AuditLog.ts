export class AuditLog {
    constructor(
        public id: number = 0,
        public userId: number | null = null,
        public actionType: string = "",
        public entityType: string | null = null,
        public entityId: number | null = null,
        public description: string | null = null,
        public ipAddress: string | null = null,
        public createdAt: Date = new Date(),
    ) { }
}