import { Request, Response, Router } from "express";
import { ITaskService } from "../../Domain/services/task/ITaskService";
import { ITaskAssigneeService } from "../../Domain/services/task/ITaskAssigneeService";
import { ITaskCommentService } from "../../Domain/services/task/ITaskCommentService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { CreateTaskDto } from "../../Domain/DTOs/task/CreateTaskDto";
import { TaskStatus } from "../../Domain/enums/TaskStatus";
import { ProjectPriority } from "../../Domain/enums/ProjectPriority";
import { ValidationResult } from "../../Domain/types/ValidationResult";
import { validateCreateTask } from "../validators/auth/task/validateCreateTask";
import { validateUpdateTask, validateUpdateTaskStatus } from "../validators/auth/task/validateUpdateTask";
import { validateAddComment } from "../validators/auth/task/validateAddComment";

export class TaskController {
    private readonly router = Router();

    public constructor(
        private readonly taskService: ITaskService,
        private readonly assigneeService: ITaskAssigneeService,
        private readonly commentService: ITaskCommentService,
    ) {
        this.router.get("/tasks/my", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.getMyTasks.bind(this));
        this.router.get("/projects/:projectId/tasks", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.getByProject.bind(this));
        this.router.post("/projects/:projectId/tasks", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.create.bind(this));
        this.router.get("/tasks/:id", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.getById.bind(this));
        this.router.patch("/tasks/:id", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.update.bind(this));
        this.router.patch("/tasks/:id/status", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.updateStatus.bind(this));
        this.router.delete("/tasks/:id", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.delete.bind(this));
        this.router.post("/tasks/:id/assignees", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.assign.bind(this));
        this.router.delete("/tasks/:id/assignees/:userId", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.unassign.bind(this));
        this.router.post("/tasks/:id/comments", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.addComment.bind(this));
        this.router.delete("/tasks/:id/comments/:commentId", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.deleteComment.bind(this));
    }

    private async getMyTasks(req: Request, res: Response): Promise<void> {
        const tasks = await this.taskService.getMyTasks(req.user!.id);
        res.status(200).json({ success: true, data: tasks });
    }

    private async getByProject(req: Request, res: Response): Promise<void> {
        const projectId = parseInt(req.params.projectId as string, 10);
        if (isNaN(projectId)) { res.status(400).json({ success: false, message: "Invalid projectId" }); return; }
        const tasks = await this.taskService.getTasksByProject(projectId);
        res.status(200).json({ success: true, data: tasks });
    }

    private async create(req: Request, res: Response): Promise<void> {
        console.log("TASK CREATE HIT"); 
        const projectId = parseInt(req.params.projectId as string, 10);
        if (isNaN(projectId)) { res.status(400).json({ success: false, message: "Invalid projectId" }); return; }
        const { title, description, priority, status, estimatedHours, dueDate } = req.body;
        console.log("CREATE TASK BODY:", req.body); 
        const v: ValidationResult = validateCreateTask(title ?? "", estimatedHours, priority, status, description, dueDate);
        console.log("VALIDATION:", v);
        if (!v.valid) { res.status(400).json({ success: false, message: v.message }); return; }
        const dto = new CreateTaskDto(
            projectId, title, description ?? "",
            (priority as ProjectPriority) ?? ProjectPriority.MEDIUM,
            (status as TaskStatus) ?? TaskStatus.TODO,
            Number(estimatedHours),
            dueDate ? new Date(dueDate as string) : new Date(0),
            req.user!.id,
        );
        const task = await this.taskService.createTask(dto);
        if (!task || task.id === 0) { res.status(500).json({ success: false, message: "Failed to create task" }); return; }
        res.status(201).json({ success: true, data: task });
    }

    private async getById(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const task = await this.taskService.getTaskById(id);
        if (!task || task.id === 0) { res.status(404).json({ success: false, message: "Task not found" }); return; }
        res.status(200).json({ success: true, data: task });
    }

    private async update(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const v: ValidationResult = validateUpdateTask(req.body as Record<string, unknown>);
        if (!v.valid) { res.status(400).json({ success: false, message: v.message }); return; }
        const ok = await this.taskService.updateTask(id, req.body, req.user!.id);
        res.status(ok ? 200 : 403).json({ success: ok, message: ok ? undefined : "Forbidden" });
    }

    private async updateStatus(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const { status } = req.body;
        const vs: ValidationResult = validateUpdateTaskStatus(status as string ?? "");
        if (!vs.valid) { res.status(400).json({ success: false, message: vs.message }); return; }
        const ok = await this.taskService.updateStatus(id, status as TaskStatus, req.user!.id);
        res.status(ok ? 200 : 403).json({ success: ok, message: ok ? undefined : "Forbidden" });
    }

    private async delete(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.taskService.deleteTask(id, req.user!.id);
        res.status(ok ? 200 : 403).json({ success: ok, message: ok ? undefined : "Forbidden" });
    }

    private async assign(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        const userId = parseInt(req.body.userId as string, 10);
        if (isNaN(id) || isNaN(userId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.assigneeService.assignUser(id, userId, req.user!.id);
        res.status(ok ? 200 : 403).json({ success: ok, message: ok ? undefined : "Forbidden" });
    }

    private async unassign(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        const userId = parseInt(req.params.userId as string, 10);
        if (isNaN(id) || isNaN(userId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.assigneeService.unassignUser(id, userId, req.user!.id);
        res.status(ok ? 200 : 403).json({ success: ok, message: ok ? undefined : "Forbidden" });
    }

    private async addComment(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const { content } = req.body;
        const vc: ValidationResult = validateAddComment(content as string ?? "");
        if (!vc.valid) { res.status(400).json({ success: false, message: vc.message }); return; }
        const comment = await this.commentService.addComment(id, req.user!.id, content as string);
        if (!comment || comment.id === 0) { res.status(403).json({ success: false, message: "Must be assigned to comment" }); return; }
        res.status(201).json({ success: true, data: comment });
    }

    private async deleteComment(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        const commentId = parseInt(req.params.commentId as string, 10);
        if (isNaN(id) || isNaN(commentId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.commentService.deleteComment(commentId, id, req.user!.id);
        res.status(ok ? 200 : 403).json({ success: ok, message: ok ? undefined : "Forbidden" });
    }

    public getRouter(): Router { return this.router; }
}