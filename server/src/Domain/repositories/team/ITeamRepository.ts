import { Team } from "../../models/Team";
import { TeamUpdateFields } from "../../types/TeamUpdateFields";

export interface ITeamRepository {
    create(team: Team): Promise<Team>;
    findById(id: number, requesterId: number): Promise<Team>;
    findAll(): Promise<Team[]>;
    findByUserId(userId: number): Promise<Team[]>;
    update(id: number, fields: TeamUpdateFields): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}