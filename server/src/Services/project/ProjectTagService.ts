import { IProjectTagService } from "../../Domain/services/project/IProjectTagService";
import { IProjectTagRepository } from "../../Domain/repositories/project/IProjectTagRepository";
import { IProjectPermissionRepository } from "../../Domain/repositories/project/IProjectPermissionRepository";
import { Tag } from "../../Domain/models/Tag";
import { TagDto } from "../../Domain/DTOs/project/TagDto";

export class ProjectTagService implements IProjectTagService {
    public constructor(
        private readonly tagRepo: IProjectTagRepository,
        private readonly permRepo: IProjectPermissionRepository,
    ) { }

    private toDto(tag: Tag): TagDto {
        return new TagDto(tag.id, tag.name);
    }

    async getAllTags(): Promise<TagDto[]> {
        const tags = await this.tagRepo.getAllTags();
        return tags.map((t) => this.toDto(t));
    }

    async addTag(projectId: number, tagId: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(projectId, requesterId);
        if (!isOwner) return false;
        return this.tagRepo.addTag(projectId, tagId);
    }

    async removeTag(projectId: number, tagId: number, requesterId: number): Promise<boolean> {
        const isOwner = await this.permRepo.isOwnerOfTeam(projectId, requesterId);
        if (!isOwner) return false;
        return this.tagRepo.removeTag(projectId, tagId);
    }
}