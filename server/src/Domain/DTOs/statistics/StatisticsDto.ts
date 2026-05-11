export class StatisticsDto {
  public constructor(
    public totalUsers: number     = 0,
    public totalTeams: number     = 0,
    public totalProjects: number  = 0,
    public activeProjects: number = 0,
    public totalTasks: number     = 0,
    public completedTasks: number = 0,
  ) {}
}
