import { ecs, Entity } from "dumb-game-framework";
import { Physical, Vector, Collidable } from "../components";
import { CollisionSide } from "../components/collidable";
import { Line, Point } from "../util/math";

export default class CollisionDetector extends ecs.System {
  public ecs: ecs.ECS;
  requiredComponents = new Set<Function>([Physical, Collidable]);

  update(entities: Set<Entity>, _delta: number): void {
    entities.forEach((iEntity: Entity) => {
      const components = this.ecs.getComponents(iEntity);

      // Optimization: only calculate collisions for entities
      // that can move, i.e. Mario, who has a Vector component
      const iVector = components.get(Vector);
      if (!iVector) {
        return;
      }

      const iPhysical = components.get(Physical);
      const iCollidable = components.get(Collidable);
      iCollidable.clear();

      // Bottom left & right corners of the object,
      // used to cast a ray ot detect groundedness.
      const bottomLeft = new Point(iPhysical.x, iPhysical.y + iPhysical.height);
      const bottomRight = new Point(
        iPhysical.x + iPhysical.width,
        iPhysical.y + iPhysical.height
      );

      entities.forEach((jEntity: Entity) => {
        // Mario can't collide with himself
        if (iEntity === jEntity) {
          return;
        }

        const jComponents = this.ecs.getComponents(jEntity);
        const jPhysical = jComponents.get(Physical);

        const side = Collidable.getCollision(
          iVector,
          iPhysical,
          // {
          //   ...iPhysical,
          //   x: iPhysical.x + iVector.x * delta,
          //   y: iPhysical.y + iVector.y * delta,
          // },
          jPhysical
        );

        if (side !== undefined) {
          iCollidable.add(side, jEntity);

          // If Mario's top side collided, then we know he's
          // punched a word-entity, and we need to delete it.
          if (side === CollisionSide.Top) {
            this.ecs.markEntityForDeletion(jEntity);
          }
        }

        // A consequence of our collision detection depending
        // on nonzero vector values (the logic being if a vector's
        // value is zero, it cannot be colliding with anything) is
        // that we need to treat the "grounded" state as a special
        // case.
        //
        // When Mario lands on the ground, we want to set his Y-vector
        // to 0. But this in turn means no collision is detected in
        // the next frame, resulting in gravity moving him down by
        // increasing his Y-vector.
        //
        // In the frame after that, a collision is detected, moving him
        // back up onto the ground. This results in constant jitter.
        //
        // To solve for this, we don't use our collision detection to
        // determine Mario's "groundedness," but instead simply cast
        // a 1-pixel long ray from the bottom two corners of his hitbox.
        if (iVector.y === 0) {
          const floor = new Line(
            new Point(jPhysical.x, jPhysical.y),
            new Point(jPhysical.x + jPhysical.width, jPhysical.y)
          );

          if (
            bottomLeft.extendsBelow(floor, 1) ||
            bottomRight.extendsBelow(floor, 1)
          ) {
            // iCollidable.add(CollisionSide.Bottom, jEntity);
          }
        }
      });
    });
  }
}
