import { TagDto } from "../../DTOs/project/TagDto";

export interface IProjectTagRepository {
    getAllTags(): Promise<TagDto[]>;
    getProjectTags(projectId: number): Promise<TagDto[]>;
    addTag(projectId: number, tagId: number): Promise<boolean>;
    removeTag(projectId: number, tagId: number): Promise<boolean>;
}