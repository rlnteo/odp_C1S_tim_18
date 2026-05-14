import { ValidationResult } from "../../../../Domain/types/ValidationResult";
import { TaskStatus } from "../../../../Domain/enums/TaskStatus";
import { ProjectPriority } from "../../../../Domain/enums/ProjectPriority";

const VALID_STATUSES = Object.values(TaskStatus) as string[];
const VALID_PRIORITIES = Object.values(ProjectPriority) as string[];

export const validateUpdateTask = (body: Record<string, unknown>): ValidationResult => {
  const { title, estimatedHours, priority, status, description, dueDate } = body;

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length < 2 || title.trim().length > 200)
      return { valid: false, message: "Title must be between 2 and 200 characters" };
  }

  if (estimatedHours !== undefined) {
    const hours = Number(estimatedHours);
    if (isNaN(hours) || hours <= 0.5 || hours > 500)
      return { valid: false, message: "EstimatedHours must be a positive number (max 500)" };
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority as string))
    return { valid: false, message: `Priority must be one of: ${VALID_PRIORITIES.join(", ")}` };

  if (status !== undefined && !VALID_STATUSES.includes(status as string))
    return { valid: false, message: `Status must be one of: ${VALID_STATUSES.join(", ")}` };

  if (description !== undefined && typeof description === "string" && description.length > 1000)
    return { valid: false, message: "Description must not exceed 1000 characters" };

  if (dueDate !== undefined && typeof dueDate === "string" && isNaN(Date.parse(dueDate)))
    return { valid: false, message: "DueDate must be a valid date" };

  return { valid: true };
};

export const validateUpdateTaskStatus = (status: string): ValidationResult => {
  if (!status || !VALID_STATUSES.includes(status))
    return { valid: false, message: `Status must be one of: ${VALID_STATUSES.join(", ")}` };
  return { valid: true };
};