export class CreateTeamDto {
    constructor(
        public name: string = "",
        public description: string = "",
        public avatarUrl: string = "",
        public createdBy: number = 0,
    ) { }
}