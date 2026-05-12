// TODO: Replace Entity with your domain types
import { Entity } from "../../models/Entity";

export interface IEntityRepository {
  findById(id: number): Promise<Entity | null>;
  findAll(page?: number, limit?: number): Promise<Entity[]>;
  findByUserId(userId: number): Promise<Entity[]>;
  create(entity: Entity): Promise<Entity>;
  update(id: number, fields: Partial<Entity>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}