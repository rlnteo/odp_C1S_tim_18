import { Request, Response, Router } from "express";
import { IUserService } from "../../Domain/services/users/IUserService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { ValidationResult } from "../../Domain/types/ValidationResult";
import { validateUpdateRole } from "../validators/auth/user/validateUpdateRole";

export class UserController {
  private readonly router = Router();

  public constructor(private readonly userService: IUserService) {
    this.router.get("/users",                    authenticate, authorize(UserRole.ADMIN), this.getAll.bind(this));
    this.router.get("/users/:id",                authenticate, authorize(UserRole.ADMIN), this.getById.bind(this));
    this.router.patch("/users/:id/deactivate",   authenticate, authorize(UserRole.ADMIN), this.deactivate.bind(this));
    this.router.put("/users/:id/role",           authenticate, authorize(UserRole.ADMIN), this.updateRole.bind(this));
  }

  private async getAll(_req: Request, res: Response): Promise<void> {
    const users = await this.userService.getAll();
    res.status(200).json({ success: true, data: users });
  }

  private async getById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const user = await this.userService.getById(id);
    if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }
    res.status(200).json({ success: true, data: user });
  }

  private async deactivate(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const ok = await this.userService.deactivate(id);
    res.status(ok ? 200 : 500).json({ success: ok, message: ok ? "User deactivated" : "Failed to deactivate user" });
  }

  private async updateRole(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const { role } = req.body;
    const v: ValidationResult = validateUpdateRole(role ?? "");
    if (!v.valid) { res.status(400).json({ success: false, message: v.message }); return; }
    const ok = await this.userService.updateRole(id, role as UserRole);
    res.status(ok ? 200 : 500).json({ success: ok, message: ok ? "Role updated" : "Failed to update role" });
  }

  public getRouter(): Router { return this.router; }
}