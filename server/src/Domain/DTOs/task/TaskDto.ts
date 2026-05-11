import { TaskStatus } from "../../enums/TaskStatus";
import { ProjectPriority } from "../../enums/ProjectPriority";
import { AssigneeDto } from "./AssigneeDto";
import { CommentDto } from "./CommentDto";

export class TaskDto {
    constructor(
        public id: number = 0,
        public projectId: number = 0,
        public title: string = "",
        public description: string = "",
        public priority: ProjectPriority = ProjectPriority.MEDIUM,
        public status: TaskStatus = TaskStatus.TODO,
        public estimatedHours: number = 1,
        public dueDate: Date | null = null,
        public createdBy: number = 0,
        public createdAt: Date = new Date(),
        public assignees: AssigneeDto[] = [],
        public comments: CommentDto[] = [],
    ) { }
}