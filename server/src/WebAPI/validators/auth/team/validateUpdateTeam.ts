import { ValidationResult } from "../../../../Domain/types/ValidationResult";

export const validateUpdateTeam = (body: Record<string, unknown>): ValidationResult => {
  const { name, description, avatarUrl } = body;

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80)
      return { valid: false, message: "Name must be between 2 and 80 characters" };
  }

  if (description !== undefined && typeof description === "string" && description.length > 500)
    return { valid: false, message: "Description must not exceed 500 characters" };

  if (avatarUrl !== undefined && typeof avatarUrl === "string" && avatarUrl.length > 0) {
    try { new URL(avatarUrl); } catch {
      return { valid: false, message: "AvatarUrl must be a valid URL" };
    }
  }

  return { valid: true };
};

export const validateAddMember = (username: string): ValidationResult => {
  if (!username || username.trim().length < 3)
    return { valid: false, message: "Username must be at least 3 characters" };
  return { valid: true };
};

export const validateUpdateMemberRole = (role: string): ValidationResult => {
  const VALID_ROLES = ["owner", "member"];
  if (!role || !VALID_ROLES.includes(role))
    return { valid: false, message: `Role must be one of: ${VALID_ROLES.join(", ")}` };
  return { valid: true };
};