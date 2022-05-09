import { ecs } from "dumb-game-framework";
import type { Entity } from "dumb-game-framework";
import { Vector, Physical, Collidable } from "../components";

export default class Locator extends ecs.System {
  public ecs: ecs.ECS;
  requiredComponents = new Set<Function>([Collidable, Vector, Physical]);

  update(entities: Set<Entity>, delta: number): void {
    entities.forEach((entity) => {
      const components = this.ecs.getComponents(entity);
      this.setPlayerPosition(components, delta);
    });
  }

  private setPlayerPosition(components: ecs.ComponentContainer, delta: number) {
    const vector = components.get(Vector);
    const player = components.get(Physical);
    const collidable = components.get(Collidable);

    // Bottom or Top collisions
    if (collidable.isBottomColliding() || collidable.isTopColliding()) {
      collidable.getBottomCollisions()?.forEach((againstEntity) => {
        const against = this.ecs.getComponents(againstEntity).get(Physical);
        player.y = Math.min(player.y, against.y - player.height);
      });

      collidable.getTopCollisions()?.forEach((againstEntity) => {
        const against = this.ecs.getComponents(againstEntity).get(Physical);
        player.y = Math.max(player.y, against.y + against.height);
      });
    } else {
      // No bottom or top collisions, continue moving
      player.y += vector.y * delta;
    }

    // Left or Right collisions
    if (collidable.isLeftColliding() || collidable.isRightColliding()) {
      collidable.getLeftCollisions()?.forEach((againstEntity) => {
        const against = this.ecs.getComponents(againstEntity).get(Physical);
        player.x = Math.max(player.x, against.x + against.width);
      });

      collidable.getRightCollisions()?.forEach((againstEntity) => {
        const against = this.ecs.getComponents(againstEntity).get(Physical);
        player.x = Math.min(player.x, against.x - player.width);
      });
    } else {
      // No left or right collisions, continue moving
      player.x += vector.x * delta;
    }
  }
}
