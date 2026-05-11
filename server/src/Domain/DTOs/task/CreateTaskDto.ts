import { TaskStatus } from "../../enums/TaskStatus";
import { ProjectPriority } from "../../enums/ProjectPriority";

export class CreateTaskDto {
    constructor(
        public projectId: number = 0,
        public title: string = "",
        public description: string = "",
        public priority: ProjectPriority = ProjectPriority.MEDIUM,
        public status: TaskStatus = TaskStatus.TODO,
        public estimatedHours: number = 1,
        public dueDate: Date | null = null,
        public createdBy: number = 0,
    ) { }
}