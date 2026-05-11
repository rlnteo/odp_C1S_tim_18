import { NodeStatusDto } from "./NodeStatusDto";

export class HealthStatusDto {
  public constructor(
    public nodes: NodeStatusDto[] = [],
    public rrIndex: number        = 0,
  ) {}
}
