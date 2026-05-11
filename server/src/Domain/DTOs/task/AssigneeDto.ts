export class AssigneeDto {
    constructor(
        public userId: number = 0,
        public username: string = "",
        public assignedAt: Date = new Date(),
        public assignedBy: number = 0,
    ) { }
}