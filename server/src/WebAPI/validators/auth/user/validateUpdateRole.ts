import { ValidationResult } from "../../../../Domain/types/ValidationResult";
import { UserRole } from "../../../../Domain/enums/UserRole";

const VALID_ROLES = Object.values(UserRole) as string[];

export const validateUpdateRole = (role: string): ValidationResult => {
  if (!role || !VALID_ROLES.includes(role))
    return { valid: false, message: `The role must be one of: ${VALID_ROLES.join(", ")}` };
  return { valid: true };
};