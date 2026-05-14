import { ValidationResult } from "../../../../Domain/types/ValidationResult";
import { ProjectStatus } from "../../../../Domain/enums/ProjectStatus";
import { ProjectPriority } from "../../../../Domain/enums/ProjectPriority";

const VALID_STATUSES = Object.values(ProjectStatus) as string[];
const VALID_PRIORITIES = Object.values(ProjectPriority) as string[];

export const validateUpdateProject = (body: Record<string, unknown>): ValidationResult => {
  const { name, deadline, status, priority, description } = body;

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 120)
      return { valid: false, message: "Name must be between 2 and 120 characters" };
  }

  if (deadline !== undefined) {
    if (typeof deadline !== "string" || isNaN(Date.parse(deadline)))
      return { valid: false, message: "Deadline must be a valid date" };
  }

  if (status !== undefined && !VALID_STATUSES.includes(status as string))
    return { valid: false, message: `Status must be one of: ${VALID_STATUSES.join(", ")}` };

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority as string))
    return { valid: false, message: `Priority must be one of: ${VALID_PRIORITIES.join(", ")}` };

  if (description !== undefined && typeof description === "string" && description.length > 500)
    return { valid: false, message: "Description must not exceed 500 characters" };

  return { valid: true };
};