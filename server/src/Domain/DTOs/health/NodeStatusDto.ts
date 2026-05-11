import { NodeStatus } from "../../enums/NodeStatus";

export class NodeStatusDto {
  public constructor(
    public name: string             = "",
    public host: string             = "",
    public port: number             = 3306,
    public status: NodeStatus       = NodeStatus.HEALTHY,
    public lastCheck: Date | null   = null,
    public successfulWrites: number = 0,
    public failedWrites: number     = 0,
  ) {}
}
