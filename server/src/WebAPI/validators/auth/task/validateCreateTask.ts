import { ValidationResult } from "../../../Domain/types/ValidationResult";
import { TaskStatus } from "../../../Domain/enums/TaskStatus";
import { ProjectPriority } from "../../../Domain/enums/ProjectPriority";

const VALID_STATUSES = Object.values(TaskStatus) as string[];
const VALID_PRIORITIES = Object.values(ProjectPriority) as string[];

export const validateCreateTask = (
  title: string,
  estimatedHours: unknown,
  priority?: string,
  status?: string,
  description?: string,
  dueDate?: string,
): ValidationResult => {
  if (!title || title.trim().length < 2 || title.trim().length > 150)
    return { valid: false, message: "Title must be between 2 and 150 characters" };

  const hours = Number(estimatedHours);
  if (estimatedHours === undefined || estimatedHours === null || isNaN(hours) || hours <= 0 || hours > 10000)
    return { valid: false, message: "EstimatedHours must be a positive number (max 10000)" };

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority))
    return { valid: false, message: `Priority must be one of: ${VALID_PRIORITIES.join(", ")}` };

  if (status !== undefined && !VALID_STATUSES.includes(status))
    return { valid: false, message: `Status must be one of: ${VALID_STATUSES.join(", ")}` };

  if (description !== undefined && description.length > 1000)
    return { valid: false, message: "Description must not exceed 1000 characters" };

  if (dueDate !== undefined && isNaN(Date.parse(dueDate)))
    return { valid: false, message: "DueDate must be a valid date" };

  return { valid: true };
};