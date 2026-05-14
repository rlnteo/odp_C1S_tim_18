import { ValidationResult } from "../../../../Domain/types/ValidationResult";

export const validateCreateTeam = (
  name: string,
  description?: string,
  avatarUrl?: string,
): ValidationResult => {
  if (!name || name.trim().length < 2 || name.trim().length > 80)
    return { valid: false, message: "Name must be between 2 and 80 characters" };

  if (description !== undefined && description.length > 500)
    return { valid: false, message: "Description must not exceed 500 characters" };

  if (avatarUrl !== undefined && avatarUrl.length > 0) {
    try { new URL(avatarUrl); } catch {
      return { valid: false, message: "AvatarUrl must be a valid URL" };
    }
  }

  return { valid: true };
};