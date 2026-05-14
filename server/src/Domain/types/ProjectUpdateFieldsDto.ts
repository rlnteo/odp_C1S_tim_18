import { ProjectStatus } from "../enums/ProjectStatus";
import { ProjectPriority } from "../enums/ProjectPriority";

export type ProjectUpdateFieldsDto = {
    name?: string;
    description?: string;
    deadline?: Date;
    status?: ProjectStatus;
    priority?: ProjectPriority;
};