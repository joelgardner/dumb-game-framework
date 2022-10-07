import ECS from "./ecs";
import type { Entity } from "./entity";

export default abstract class System {
  public abstract ecs: ECS;
  public abstract requiredComponents: Set<Function>;
  public abstract update(entities: Set<Entity>, delta?: number): void;
  public initialize(_entities: Set<Entity>): void {}
}
