export class Comment {
    constructor(
        public id: number = 0,
        public taskId: number = 0,
        public userId: number = 0,
        public username: string = "",
        public content: string = "",
        public createdAt: Date = new Date(),
    ) { }
}