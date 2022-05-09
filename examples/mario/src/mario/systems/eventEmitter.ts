import { ecs } from "dumb-game-framework";
 import type { Entity } from "dumb-game-framework";
import { PlayerState, Collidable, Meta } from "../components";
import { CollisionSide } from "../components/collidable";

export default class EventEmitter extends ecs.System {
  public ecs: ecs.ECS;

  public requiredComponents = new Set<Function>([Collidable, PlayerState]);

  constructor(private onWordCollision: (elementId: string) => void) {
    super();
  }

  update(entities: Set<Entity>, _delta?: number): void {
    entities.forEach((entity) => {
      const components = this.ecs.getComponents(entity);
      const collidable = components.get(Collidable);
      const entities = collidable.getEntitiesCollidingOn(CollisionSide.Top);

      if (entities) {
        entities.forEach((entity) => {
          const meta = this.ecs.getComponents(entity).get(Meta);
          if (meta) {
            this.onWordCollision(meta.get("id"));
          }
        });
      }
    });
  }
}
