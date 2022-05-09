import { ecs } from "dumb-game-framework";
import type { Entity } from "dumb-game-framework";
import { Collidable, Vector } from "../components";
import { unitify } from "../util/math";

/*
 * Magic number chosen for gravity that most resembles
 * the feel of gravity in the original Mario game.
 */
export const GRAVITY_ACCELERATION = unitify(7.6);

/*
 * In the original game, Mario doesn't accelerate downwards
 * for very long, which creates a kind of floating effect.
 * To mimic this, cap gravity at a magic number that feels right.
 */
export const MAX_GRAVITY = unitify(2.75);

export default class Physics extends ecs.System {
  public ecs: ecs.ECS;

  public requiredComponents = new Set<Function>([Collidable, Vector]);

  update(entities: Set<Entity>, delta?: number): void {
    entities.forEach((entity) => {
      const components = this.ecs.getComponents(entity);
      const vector = components.get(Vector);
      const collisions = components.get(Collidable);

      // Stop x-momentum if Mario has run into a wall
      if (collisions.isLeftColliding() || collisions.isRightColliding()) {
        vector.setX(0);
      }

      // If Mario is standing/grounded, set y-vector to 1 in order
      // to maintain grounded-ness. Otherwise, apply gravity as normal.
      if (collisions.isGrounded()) {
        vector.setY(1);
      } else {
        // If we just jumped up into another object, set y-vector to 0,
        if (collisions.isTopColliding()) {
          vector.setY(0);
        }

        vector.setY(
          Math.min(MAX_GRAVITY, vector.y + GRAVITY_ACCELERATION * delta)
        );
      }
    });
  }
}
