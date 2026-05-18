export interface TeamDto {
  id: number;
  name: string;
  description: string;
  avatarUrl: string;
  createdBy: number;
  createdAt: string;
}

export interface TeamMemberDto {
  userId: number;
  username: string;
  role: "owner" | "member";
  joinedAt: string;
}