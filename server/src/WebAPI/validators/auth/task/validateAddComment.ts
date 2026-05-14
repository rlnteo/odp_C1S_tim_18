import { ValidationResult } from "../../../Domain/types/ValidationResult";

export const validateAddComment = (content: string): ValidationResult => {
  if (!content || content.trim().length < 1)
    return { valid: false, message: "Comment content must not be empty" };
  if (content.length > 2000)
    return { valid: false, message: "Comment must not exceed 2000 characters" };
  return { valid: true };
};