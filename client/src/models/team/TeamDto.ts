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
  email: string;
  role: "owner" | "member";
  joinedAt: string;
}