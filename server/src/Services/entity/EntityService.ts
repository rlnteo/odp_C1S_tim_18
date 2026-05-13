import { IEntityService } from "../../Domain/services/entity/IEntityService";
import { IEntityRepository } from "../../Domain/repositories/entity/IEntityRepository";
import { Entity } from "../../Domain/models/Entity";
import { EntityDto } from "../../Domain/DTOs/entity/EntityDto";
import { CreateEntityDto } from "../../Domain/DTOs/entity/CreateEntityDto";
import { PaginatedListDto } from "../../Domain/DTOs/entity/PaginatedListDto";

export class EntityService implements IEntityService {
    public constructor(private readonly entityRepo: IEntityRepository) { }

    private toDto(entity: Entity): EntityDto {
        return new EntityDto(entity.id, entity.userId, entity.status, entity.createdAt);
    }

    async getAll(page = 1, limit = 20): Promise<PaginatedListDto<EntityDto>> {
        const items = await this.entityRepo.findAll(page, limit);
        return new PaginatedListDto(items.map((e) => this.toDto(e)), items.length, page, limit);
    }

    async getById(id: number): Promise<EntityDto> {
        const entity = await this.entityRepo.findById(id);
        if (!entity) return new EntityDto();
        return this.toDto(entity);
    }

    async getByUserId(userId: number): Promise<EntityDto[]> {
        const items = await this.entityRepo.findByUserId(userId);
        return items.map((e) => this.toDto(e));
    }

    async create(dto: CreateEntityDto): Promise<EntityDto> {
        const entity = new Entity(0, dto.userId);
        const created = await this.entityRepo.create(entity);
        if (created.id === 0) return new EntityDto();
        return this.toDto(created);
    }

    async update(id: number, fields: Partial<Entity>): Promise<boolean> {
        return this.entityRepo.update(id, fields);
    }

    async delete(id: number): Promise<boolean> {
        return this.entityRepo.delete(id);
    }
}