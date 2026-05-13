import { ITaskAssigneeService } from "../../Domain/services/task/ITaskAssigneeService";
import { ITaskAssigneeRepository } from "../../Domain/repositories/task/ITaskAssigneeRepository";
import { ITaskPermissionRepository } from "../../Domain/repositories/task/ITaskPermissionRepository";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";

export class TaskAssigneeService implements ITaskAssigneeService {
    public constructor(
        private readonly assigneeRepo: ITaskAssigneeRepository,
        private readonly permRepo: ITaskPermissionRepository,
        private readonly userRepo: IUserRepository,
    ) { }

    async assignUser(taskId: number, userId: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(taskId, requesterId);
        if (!isOwner) return false;
        const user = await this.userRepo.findById(userId);
        if (user.id === 0) return false;
        return this.assigneeRepo.assignUser(taskId, userId, requesterId);
    }

    async unassignUser(taskId: number, userId: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(taskId, requesterId);
        if (!isOwner) return false;
        return this.assigneeRepo.unassignUser(taskId, userId);
    }
}