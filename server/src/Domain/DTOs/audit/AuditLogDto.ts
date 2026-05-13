export class AuditLogDto {
    constructor(
        public id: number = 0,
        public userId: number = 0,
        public username: string = "",
        public actionType: string = "",
        public entityType: string = "",
        public entityId: number = 0,
        public description: string = "",
        public ipAddress: string = "",
        public createdAt: Date = new Date(),
    ) { }
}