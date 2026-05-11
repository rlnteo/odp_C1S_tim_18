import { Request, Response, Router } from "express";
import { IHealthService } from "../../Domain/services/health/IHealthService";
import { authenticate }   from "../../Middlewares/authentification/AuthMiddleware";
import { authorize }      from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole }       from "../../Domain/enums/UserRole";

export class StatisticsController {
  private readonly router = Router();

  public constructor(private readonly healthService: IHealthService) {
    this.router.get("/statistics",
      authenticate, authorize(UserRole.ADMIN),
      this.get.bind(this)
    );
  }

  private async get(_req: Request, res: Response): Promise<void> {
    const data = await this.healthService.getStatistics();
    res.status(200).json({ success: true, data });
  }

  public getRouter(): Router { return this.router; }
}
