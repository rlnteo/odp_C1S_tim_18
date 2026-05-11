import { ProjectStatus } from "../../enums/ProjectStatus";
import { ProjectPriority } from "../../enums/ProjectPriority";

export class CreateProjectDto {
    constructor(
        public teamId: number = 0,
        public name: string = "",
        public description: string = "",
        public deadline: Date = new Date(),
        public status: ProjectStatus = ProjectStatus.PLANNING,
        public priority: ProjectPriority = ProjectPriority.MEDIUM,
        public createdBy: number = 0,
    ) { }
}