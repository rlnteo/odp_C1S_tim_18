import { Team } from "../../models/Team";
import { TeamUpdateFieldsDto } from "../../types/TeamUpdateFieldsDto";

export interface ITeamRepository {
    create(team: Team): Promise<Team>;
    findById(id: number, requesterId: number): Promise<Team>;
    findAll(): Promise<Team[]>;
    findByUserId(userId: number): Promise<Team[]>;
    update(id: number, fields: TeamUpdateFieldsDto): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}