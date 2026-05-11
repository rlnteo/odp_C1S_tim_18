import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { IAuthService } from "../../Domain/services/auth/IAuthService";
import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { ValidationResult } from "../../Domain/types/ValidationResult";
import { validateLogin } from "../validators/auth/validateLogin";
import { validateRegister } from "../validators/auth/validateRegister";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";

export class AuthController {
  private readonly router = Router();

  public constructor(
    private readonly authService: IAuthService,
    private readonly auditService: IAuditService
  ) {
    this.router.post("/auth/login", this.login.bind(this));
    this.router.post("/auth/register", this.register.bind(this));
    this.router.post("/auth/logout", authenticate, this.logout.bind(this));
  }

  private async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body as { username?: string; password?: string };
    const v: ValidationResult = validateLogin(username ?? "", password ?? "");
    if (!v.valid) { res.status(400).json({ success: false, message: v.message }); return; }
    const result = await this.authService.login(username!, password!);
    if (result.id === 0) { res.status(401).json({ success: false, message: "Invalid username or password" }); return; }
    const token = jwt.sign(
      { id: result.id, username: result.username, role: result.role },
      process.env.JWT_SECRET ?? "",
      { expiresIn: "24h" }
    );
    await this.auditService.log({
      userId: result.id,
      actionType: "USER_LOGIN",
      entityType: "user",
      entityId: result.id,
      description: `User ${result.username} logged in`,
      ipAddress: req.ip ?? ""
    });
    res.status(200).json({ success: true, message: "Login successful", data: token });
  }

  private async register(req: Request, res: Response): Promise<void> {
    const { username, email, password, role } = req.body as { username?: string; email?: string; password?: string; role?: string };
    const v: ValidationResult = validateRegister(username ?? "", email ?? "", password ?? "");
    if (!v.valid) { res.status(400).json({ success: false, message: v.message }); return; }
    const result = await this.authService.register(username!, email!, role ?? "user", password!);
    if (result.id === 0) { res.status(409).json({ success: false, message: "Username or email already taken" }); return; }
    const token = jwt.sign(
      { id: result.id, username: result.username, role: result.role },
      process.env.JWT_SECRET ?? "",
      { expiresIn: "24h" }
    );
    await this.auditService.log({
      userId: result.id,
      actionType: "USER_REGISTER",
      entityType: "user",
      entityId: result.id,
      description: `User ${result.username} registered`,
      ipAddress: req.ip ?? ""
    });
    res.status(201).json({ success: true, message: "Registration successful", data: token });
  }

  private async logout(req: Request, res: Response): Promise<void> {
    await this.auditService.log({
      userId: req.user!.id,
      actionType: "USER_LOGOUT",
      entityType: "user",
      entityId: req.user!.id,
      description: `User ${req.user!.username} logged out`,
      ipAddress: req.ip ?? ""
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  }

  public getRouter(): Router { return this.router; }
}