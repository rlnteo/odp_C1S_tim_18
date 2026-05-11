export class Team {
    constructor(
        public id: number = 0,
        public name: string = "",
        public description: string = "",
        public avatarUrl: string = "",
        public createdBy: number = 0,
        public createdAt: Date = new Date(),
    ) { }
}