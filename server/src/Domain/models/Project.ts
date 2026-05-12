import { ProjectStatus } from "../enums/ProjectStatus";
import { ProjectPriority } from "../enums/ProjectPriority";
import { Tag } from "./Tag";

export class Project {
    constructor(
        public id: number = 0,
        public teamId: number = 0,
        public name: string = "",
        public description: string = "",
        public deadline: Date = new Date(),
        public status: ProjectStatus = ProjectStatus.PLANNING,
        public priority: ProjectPriority = ProjectPriority.MEDIUM,
        public createdBy: number = 0,
        public createdAt: Date = new Date(),
        public tags: Tag[] = [],
        public isWatching: boolean = false,
    ) { }
}