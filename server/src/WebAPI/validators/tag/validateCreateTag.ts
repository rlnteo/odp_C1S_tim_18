import { ValidationResult } from "../../../Domain/types/ValidationResult";

export const validateCreateTag = (name: string): ValidationResult => {
  if (!name || name.trim().length < 1 || name.trim().length > 50)
    return { valid: false, message: "Tag name must be between 1 and 50 characters" };
  return { valid: true };
};