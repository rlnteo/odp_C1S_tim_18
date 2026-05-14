import { ValidationResult } from "../../../../Domain/types/ValidationResult";
import { ProjectStatus } from "../../../../Domain/enums/ProjectStatus";
import { ProjectPriority } from "../../../../Domain/enums/ProjectPriority";

const VALID_STATUSES = Object.values(ProjectStatus) as string[];
const VALID_PRIORITIES = Object.values(ProjectPriority) as string[];

export const validateCreateProject = (
  name: string,
  deadline: string,
  status?: string,
  priority?: string,
  description?: string,
): ValidationResult => {
  if (!name || name.trim().length < 2 || name.trim().length > 120)
    return { valid: false, message: "Name must be between 2 and 120 characters" };

  if (!deadline || isNaN(Date.parse(deadline)))
    return { valid: false, message: "Deadline must be a valid date" };

  if (new Date(deadline) < new Date())
    return { valid: false, message: "Deadline must be in the future" };

  if (status !== undefined && !VALID_STATUSES.includes(status))
    return { valid: false, message: `Status must be one of: ${VALID_STATUSES.join(", ")}` };

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority))
    return { valid: false, message: `Priority must be one of: ${VALID_PRIORITIES.join(", ")}` };

  if (description !== undefined && description.length > 500)
    return { valid: false, message: "Description must not exceed 500 characters" };

  return { valid: true };
};