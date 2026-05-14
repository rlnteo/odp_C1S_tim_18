import { Request, Response, Router } from "express";
import { IProjectTagService } from "../../Domain/services/project/IProjectTagService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { ValidationResult } from "../../Domain/types/ValidationResult";
import { validateCreateTag } from "../validators/tag/validateCreateTag";

export class TagController {
  private readonly router = Router();

  public constructor(private readonly tagService: IProjectTagService) {
    this.router.get("/tags",        authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.getAll.bind(this));
    this.router.post("/tags",       authenticate, authorize(UserRole.ADMIN),                this.create.bind(this));
    this.router.delete("/tags/:id", authenticate, authorize(UserRole.ADMIN),                this.delete.bind(this));
  }

  private async getAll(_req: Request, res: Response): Promise<void> {
    const tags = await this.tagService.getAllTags();
    res.status(200).json({ success: true, data: tags });
  }

  private async create(req: Request, res: Response): Promise<void> {
    const { name } = req.body;
    const v: ValidationResult = validateCreateTag(name ?? "");
    if (!v.valid) { res.status(400).json({ success: false, message: v.message }); return; }
    const tag = await this.tagService.createTag(name as string);
    if (tag.id === 0) { res.status(500).json({ success: false, message: "Failed to create tag" }); return; }
    res.status(201).json({ success: true, data: tag });
  }

  private async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const ok = await this.tagService.deleteTag(id);
    res.status(ok ? 200 : 404).json({ success: ok, message: ok ? undefined : "Tag not found" });
  }

  public getRouter(): Router { return this.router; }
}