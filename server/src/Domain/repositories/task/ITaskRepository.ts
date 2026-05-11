import { Task } from "../../models/Task";
import { TaskDto } from "../../DTOs/task/TaskDto";
import { CreateTaskDto } from "../../DTOs/task/CreateTaskDto";
import { AssigneeDto } from "../../DTOs/task/AssigneeDto";
import { CommentDto } from "../../DTOs/task/CommentDto";
import { TaskStatus } from "../../enums/TaskStatus";

export interface ITaskRepository {
    create(dto: CreateTaskDto): Promise<Task>;
    findById(id: number): Promise<TaskDto | null>;
    findByProjectId(projectId: number): Promise<TaskDto[]>;
    findAssignedToUser(userId: number): Promise<TaskDto[]>;
    update(id: number, fields: Partial<Task>): Promise<boolean>;
    updateStatus(id: number, status: TaskStatus): Promise<boolean>;
    delete(id: number): Promise<boolean>;
    getAssignees(taskId: number): Promise<AssigneeDto[]>;
    assignUser(taskId: number, userId: number, assignedBy: number): Promise<boolean>;
    unassignUser(taskId: number, userId: number): Promise<boolean>;
    isAssigned(taskId: number, userId: number): Promise<boolean>;
    isOwnerOfTeam(taskId: number, userId: number): Promise<boolean>;
    isCreator(taskId: number, userId: number): Promise<boolean>;
    getComments(taskId: number): Promise<CommentDto[]>;
    addComment(taskId: number, userId: number, content: string): Promise<CommentDto | null>;
    deleteComment(commentId: number): Promise<boolean>;
    isCommentOwner(commentId: number, userId: number): Promise<boolean>;
}