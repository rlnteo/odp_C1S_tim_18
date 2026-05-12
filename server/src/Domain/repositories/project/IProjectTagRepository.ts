import { Tag } from "../../models/Tag";

export interface IProjectTagRepository {
    getAllTags(): Promise<Tag[]>;
    getProjectTags(projectId: number): Promise<Tag[]>;
    addTag(projectId: number, tagId: number): Promise<boolean>;
    removeTag(projectId: number, tagId: number): Promise<boolean>;
}