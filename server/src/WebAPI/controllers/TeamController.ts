import { Request, Response, Router } from "express";
import { ITeamService } from "../../Domain/services/team/ITeamService";
import { ITeamMemberService } from "../../Domain/services/team/ITeamMemberService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { CreateTeamDto } from "../../Domain/DTOs/team/CreateTeamDto";

export class TeamController {
    private readonly router = Router();

    public constructor(
        private readonly teamService: ITeamService,
        private readonly memberService: ITeamMemberService,
    ) {
        this.router.get("/teams/my", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.getMyTeams.bind(this));
        this.router.get("/teams", authenticate, authorize(UserRole.ADMIN), this.getAll.bind(this));
        this.router.get("/teams/:id", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.getById.bind(this));
        this.router.post("/teams", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.create.bind(this));
        this.router.patch("/teams/:id", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.update.bind(this));
        this.router.delete("/teams/:id", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.delete.bind(this));

        this.router.get("/teams/:id/members", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.getMembers.bind(this));
        this.router.post("/teams/:id/members", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.addMember.bind(this));
        this.router.patch("/teams/:id/members/:userId", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.updateMemberRole.bind(this));
        this.router.delete("/teams/:id/members/:userId", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.removeMember.bind(this));
        this.router.delete("/teams/:id/leave", authenticate, authorize(UserRole.USER, UserRole.ADMIN), this.leaveTeam.bind(this));
    }

    private async getMyTeams(req: Request, res: Response): Promise<void> {
        const teams = await this.teamService.getMyTeams(req.user!.id);
        res.status(200).json({ success: true, data: teams });
    }

    private async getAll(_req: Request, res: Response): Promise<void> {
        const teams = await this.teamService.getAllTeams();
        res.status(200).json({ success: true, data: teams });
    }

    private async getById(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const team = await this.teamService.getTeamById(id, req.user!.id);
        if (!team || team.id === 0) { res.status(404).json({ success: false, message: "Team not found" }); return; }
        res.status(200).json({ success: true, data: team });
    }

    private async create(req: Request, res: Response): Promise<void> {
        const { name, description, avatarUrl } = req.body;
        if (!name) { res.status(400).json({ success: false, message: "Name is required" }); return; }
        const dto = new CreateTeamDto(name, description ?? "", avatarUrl ?? "", req.user!.id);
        const team = await this.teamService.createTeam(dto);
        if (!team || team.id === 0) { res.status(500).json({ success: false, message: "Failed to create team" }); return; }
        res.status(201).json({ success: true, data: team });
    }

    private async update(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.teamService.updateTeam(id, req.body, req.user!.id);
        res.status(ok ? 200 : 403).json({ success: ok, message: ok ? undefined : "Forbidden" });
    }

    private async delete(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.teamService.deleteTeam(id, req.user!.id);
        res.status(ok ? 200 : 403).json({ success: ok, message: ok ? undefined : "Forbidden" });
    }

    private async getMembers(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const members = await this.memberService.getMembers(id);
        res.status(200).json({ success: true, data: members });
    }

    private async addMember(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const { username } = req.body;
        if (!username) { res.status(400).json({ success: false, message: "Username is required" }); return; }
        const ok = await this.memberService.addMember(id, username, req.user!.id);
        res.status(ok ? 200 : 400).json({ success: ok, message: ok ? undefined : "Cannot add member" });
    }

    private async updateMemberRole(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        const userId = parseInt(req.params.userId as string, 10);
        if (isNaN(id) || isNaN(userId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const { role } = req.body;
        if (!role) { res.status(400).json({ success: false, message: "Role is required" }); return; }
        const ok = await this.memberService.updateMemberRole(id, userId, role, req.user!.id);
        res.status(ok ? 200 : 403).json({ success: ok, message: ok ? undefined : "Forbidden" });
    }

    private async removeMember(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        const userId = parseInt(req.params.userId as string, 10);
        if (isNaN(id) || isNaN(userId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.memberService.removeMember(id, userId, req.user!.id);
        res.status(ok ? 200 : 403).json({ success: ok, message: ok ? undefined : "Forbidden" });
    }

    private async leaveTeam(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
        const ok = await this.memberService.leaveTeam(id, req.user!.id);
        res.status(ok ? 200 : 400).json({ success: ok, message: ok ? undefined : "Owner cannot leave — transfer ownership first" });
    }

    public getRouter(): Router { return this.router; }
}