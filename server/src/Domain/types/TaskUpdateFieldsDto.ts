import { TaskStatus } from "../enums/TaskStatus";
import { ProjectPriority } from "../enums/ProjectPriority";

export type TaskUpdateFieldsDto = {
    title?: string;
    description?: string;
    priority?: ProjectPriority;
    status?: TaskStatus;
    estimatedHours?: number;
    dueDate?: Date | null;
};