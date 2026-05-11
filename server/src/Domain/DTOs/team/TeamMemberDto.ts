export class TeamMemberDto {
    constructor(
        public userId: number = 0,
        public username: string = "",
        public role: string = "",
        public joinedAt: Date = new Date(),
    ) { }
}