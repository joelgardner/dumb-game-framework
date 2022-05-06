import ECS from "./ecs";
import { Entity } from "./entity";

export default abstract class System {
  public abstract ecs: ECS;
  public abstract requiredComponents: Set<Function>;
  public abstract update(entities: Set<Entity>, delta?: number): void;
  public initialize(entities: Set<Entity>): void {}
}
