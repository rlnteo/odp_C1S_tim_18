
import { Request, Response, Router } from "express";
import { IProjectService } from "../../Domain/services/project/IProjectService";
import { IProjectTagService } from "../../Domain/services/project/IProjectTagService";
import { IProjectWatcherService } from "../../Domain/services/project/IProjectWatcherService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { CreateProjectDto } from "../../Domain/DTOs/project/CreateProjectDto";
import { ProjectStatus } from "../../Domain/enums/ProjectStatus";
import { ProjectPriority } from "../../Domain/enums/ProjectPriority";
import { ValidationResult } from "../../Domain/types/ValidationResult";
import { validateCreateProject } from "../validators/auth/project/validateCreateProject";
import { validateUpdateProject } from "../validators/auth/project/validateUpdateProject";

export class ProjectController {
    private readonly router = Router();

    public constructor(
        private readonly projectService: IProjectService,
        private readonly tagService: IProjectTagService,
        private readonly watcherService: IProjectWatcherService,
    ) {
        this.router.get("/tags", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.getAllTags.bind(this));
        this.router.get("/projects/watching", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.getWatching.bind(this));
        this.router.get("/teams/:teamId/projects", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.getByTeam.bind(this));
        this.router.post("/teams/:teamId/projects", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.create.bind(this));
        this.router.get("/projects/:id", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.getById.bind(this));
        this.router.patch("/projects/:id", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.update.bind(this));
        this.router.delete("/projects/:id", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.delete.bind(this));
        this.router.post("/projects/:id/tags", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.addTag.bind(this));
        this.router.delete("/projects/:id/tags/:tagId", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.removeTag.bind(this));
        this.router.post("/projects/:id/watch", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.watch.bind(this));
        this.router.delete("/projects/:id/watch", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.unwatch.bind(this));
    }

    private async getAllTags(_req: Request, res: Response): Promise<void> {
        const tags = await this.tagService.getAllTags();
        res.status(200).json({ success: true, data: tags });
    }

    private async getWatching(req: Request, res: Response): Promise<void> {
        const projects = await this.watcherService.getWatchedProjects(req.user!.id);
        res.status(200).json({ success: true, data: projects });
    }

    private async getByTeam(req: Request, res: Response): Promise<void> {
        const teamId = parseInt(req.params.teamId as string, 10);
        if (isNaN(teamId)) { res.status(400).json({ success: false, message: "Invalid teamId" }); return; }
        const projects = await this.projectService.getProjectsByTeam(teamId, req.user!.id);
        res.status(200).json({ success: true, data: projects });
    }

    private async create(req: Request, res: Response): Promise<void> {
        const teamId = parseInt(req.params.teamId as string, 10);
        if (isNaN(teamId)) { res.status(400).json({ success: false, message: "Invalid teamId" }); return; }
        const { name, description, deadline, status, priority } = req.body;
        const v: ValidationResult = validateCreateProject(name ?? "", deadline, status, priority, description);
        if (!v.valid) { res.status(400).json({ success: false, message: v.message }); return; }
        const dto = new CreateProjectDto(
            teamId, name, description ?? "",
            new Date(deadline as string),
            (status as ProjectStatus) ?? ProjectStatus.PLANNING,
            (priority as ProjectPriority) ?? ProjectPriority.MEDIUM,
            req.user!.id,
        );
        const project = await this.projectService.createProject(dto);
        if (!project || project.id === 0) { res.status(500).json({ success: false, message: "Failed to create project" }); return; }
        res.status(201).json({ success: true, data: project });
    }

    private async getById(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const project = await this.projectService.getProjectById(id, req.user!.id);
        if (!project || project.id === 0) { res.status(404).json({ success: false, message: "Project not found" }); return; }
        res.status(200).json({ success: true, data: project });
    }

    private async update(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const v: ValidationResult = validateUpdateProject(req.body as Record<string, unknown>);
        if (!v.valid) { res.status(400).json({ success: false, message: v.message }); return; }
        const ok = await this.projectService.updateProject(id, req.body, req.user!.id);
        res.status(ok ? 200 : 403).json({ success: ok, message: ok ? undefined : "Forbidden" });
    }

    private async delete(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.projectService.deleteProject(id, req.user!.id);
        res.status(ok ? 200 : 403).json({ success: ok, message: ok ? undefined : "Forbidden" });
    }

    private async addTag(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        const tagId = parseInt(req.body.tagId as string, 10);
        if (isNaN(id) || isNaN(tagId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.tagService.addTag(id, tagId, req.user!.id);
        res.status(ok ? 200 : 403).json({ success: ok, message: ok ? undefined : "Forbidden" });
    }

    private async removeTag(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        const tagId = parseInt(req.params.tagId as string, 10);
        if (isNaN(id) || isNaN(tagId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.tagService.removeTag(id, tagId, req.user!.id);
        res.status(ok ? 200 : 403).json({ success: ok, message: ok ? undefined : "Forbidden" });
    }

    private async watch(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.watcherService.watchProject(id, req.user!.id);
        res.status(ok ? 200 : 403).json({ success: ok, message: ok ? undefined : "Must be a team member to watch" });
    }

    private async unwatch(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.watcherService.unwatchProject(id, req.user!.id);
        res.status(ok ? 200 : 400).json({ success: ok });
    }

    public getRouter(): Router { return this.router; }
}