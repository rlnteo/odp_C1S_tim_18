import { Request, Response, Router } from "express";
import { IHealthService } from "../../Domain/services/health/IHealthService";
import { authenticate }   from "../../Middlewares/authentification/AuthMiddleware";
import { authorize }      from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole }       from "../../Domain/enums/UserRole";

export class HealthController {
  private readonly router = Router();

  public constructor(private readonly healthService: IHealthService) {
    // Public ping — proverava da li server radi
    this.router.get("/health", this.ping.bind(this));

    // Admin — status svih DB čvorova
    this.router.get("/health/db",
      authenticate, authorize(UserRole.ADMIN),
      this.dbStatus.bind(this)
    );

    // Admin — ručno pokretanje health checka (failover trigger)
    this.router.post("/health/db/check",
      authenticate, authorize(UserRole.ADMIN),
      this.runCheck.bind(this)
    );
  }

  private ping(_req: Request, res: Response): void {
    res.status(200).json({ success: true, message: "Server is running", data: new Date() });
  }

  private dbStatus(_req: Request, res: Response): void {
    res.status(200).json({ success: true, data: this.healthService.getDbStatus() });
  }

  private async runCheck(_req: Request, res: Response): Promise<void> {
    await this.healthService.runHealthCheck();
    res.status(200).json({
      success: true,
      message: "Health check completed",
      data: this.healthService.getDbStatus(),
    });
  }

  public getRouter(): Router { return this.router; }
}
