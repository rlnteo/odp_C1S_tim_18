import { TeamRole } from "../enums/TeamRole";

export class TeamMember {
    constructor(
        public userId: number = 0,
        public username: string = "",
        public role: TeamRole = TeamRole.MEMBER,
        public joinedAt: Date = new Date(),
    ) { }
}