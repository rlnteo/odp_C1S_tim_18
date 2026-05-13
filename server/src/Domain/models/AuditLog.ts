export class AuditLog {
    constructor(
        public id: number = 0,
        public userId: number = 0,
        public actionType: string = "",
        public entityType: string = "",
        public entityId: number = 0,
        public description: string = "",
        public ipAddress: string = "",
        public createdAt: Date = new Date(),
    ) { }
}