import { TagDto } from "../../DTOs/project/TagDto";

export interface IProjectTagService {
    getAllTags(): Promise<TagDto[]>;
    addTag(projectId: number, tagId: number, requesterId: number): Promise<boolean>;
    removeTag(projectId: number, tagId: number, requesterId: number): Promise<boolean>;
}