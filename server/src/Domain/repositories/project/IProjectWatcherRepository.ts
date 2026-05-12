export interface IProjectWatcherRepository {
    watchProject(projectId: number, userId: number): Promise<boolean>;
    unwatchProject(projectId: number, userId: number): Promise<boolean>;
}