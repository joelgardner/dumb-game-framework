import { ecs } from "dumb-game-framework";
import type { Entity } from "dumb-game-framework";
import { canProjectHorizontally, canProjectVertically } from "../util/math";
import { PhysicalProperties } from "./physical";
import Vector from "./vector";

// type HitboxOptions = {
//   offset?: {
//     widthPercentage: number;
//     heightPercentage: number;
//   };
// };

export enum CollisionSide {
  Top,
  Bottom,
  Left,
  Right,
}

export default class Collidable extends ecs.Component {
  private collisions: Map<CollisionSide, Entity[]> = new Map();

  constructor(/*private hitboxOptions?: HitboxOptions*/) {
    super();
  }

  public add(side: CollisionSide, against: Entity): void {
    if (!this.collisions.has(side)) {
      this.collisions.set(side, []);
    }
    this.collisions.get(side).push(against);
  }

  public addBottomCollision(against: Entity): void {
    this.add(CollisionSide.Bottom, against);
  }

  //   public addTopCollision(entity: Entity, against: Entity): void {
  //     this.add(against, CollisionSide.Top);
  //   }
  //
  //   public addLeftCollision(entity: Entity, against: Entity): void {
  //     this.add(against, CollisionSide.Left);
  //   }
  //
  //   public addRightCollision(entity: Entity, against: Entity): void {
  //     this.add(against, CollisionSide.Right);
  //   }

  public clear() {
    this.collisions.clear();
  }

  public getEntitiesCollidingOn(
    collisionSide: CollisionSide
  ): Entity[] | undefined {
    return this.collisions.get(collisionSide);
  }

  public getAllCollisions(): Map<CollisionSide, Entity[]> {
    return this.collisions;
  }

  public getTopCollisions(): Entity[] {
    return this.collisions.get(CollisionSide.Top);
  }

  public getBottomCollisions(): Entity[] {
    return this.collisions.get(CollisionSide.Bottom);
  }

  public getLeftCollisions(): Entity[] {
    return this.collisions.get(CollisionSide.Left);
  }

  public getRightCollisions(): Entity[] {
    return this.collisions.get(CollisionSide.Right);
  }

  public isTopColliding(): boolean {
    return this.collisions.has(CollisionSide.Top);
  }

  public isLeftColliding(): boolean {
    return this.collisions.has(CollisionSide.Left);
  }

  public isRightColliding(): boolean {
    return this.collisions.has(CollisionSide.Right);
  }

  public isBottomColliding(): boolean {
    return this.collisions.has(CollisionSide.Bottom);
  }

  public isGrounded() {
    return this.isBottomColliding();
  }

  public offsetPhysical(physical: PhysicalProperties): PhysicalProperties {
    // if (this.hitboxOptions?.offset) {
    //   return {
    //     x:
    //       physical.x +
    //       physical.width * this.hitboxOptions.offset.widthPercentage,
    //     y:
    //       physical.y +
    //       physical.width * this.hitboxOptions.offset.heightPercentage,
    //     height: physical.height,
    //     width: physical.width,
    //   };
    // }

    return physical;
  }

  public static getCollision(
    aVector: Vector,
    aPhysical: PhysicalProperties,
    bPhysical: PhysicalProperties
  ): CollisionSide | undefined {
    const { x: x1, y: y1, width: w1, height: h1 } = aPhysical;
    const { x: x2, y: y2, width: w2, height: h2 } = bPhysical;

    // Do a quick heuristic check that rules out any
    // non-collision scenarios before we crunch some more
    // numbers to detect which side actually colilided
    if (x1 > x2 + w2 || x1 + w1 < x2 || y1 > y2 + h2 || y1 + h1 < y2) {
      return;
    }

    // return this.detectCollisionOfPlacedObject(aPhysical, bPhysical);
    return this.detectCollisionOfMovingObject(
      aVector.x,
      aVector.y,
      x1,
      y1,
      w1,
      h1,
      x2,
      y2,
      w2,
      h2
    );
  }

  private static detectCollisionOfPlacedObject(
    a: PhysicalProperties,
    b: PhysicalProperties
  ) {
    const halfA = { w: a.width / 2, h: a.height / 2 };
    const halfB = { w: b.width / 2, h: b.height / 2 };
    const centerA = { x: a.x + halfA.w, y: a.y + halfA.h };
    const centerB = { x: b.x + halfB.w, y: b.y + halfB.h };
    const diff = { x: centerA.x - centerB.x, y: centerA.y - centerB.y };
    const min = { x: halfA.w + halfB.w, y: halfA.h + halfB.h };
    const depth = {
      x: diff.x > 0 ? min.x - diff.x : -min.x - diff.x,
      y: diff.y > 0 ? min.y - diff.y : -min.y - diff.y,
    };

    if (depth.x === 0 || depth.y === 0) {
      return;
    }

    if (Math.abs(depth.x) < Math.abs(depth.y)) {
      if (depth.x > 0) {
        return CollisionSide.Left;
      } else {
        return CollisionSide.Right;
      }
    } else {
      if (depth.y > 0) {
        return CollisionSide.Top;
      } else {
        return CollisionSide.Bottom;
      }
    }
  }

  private static detectCollisionOfMovingObject(
    vx1: number,
    vy1: number,
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number
  ) {
    // If the bottom of our player's hitbox collided,
    // with the top of the object's hitbox, that would
    // mean y1 + h1 was equal to y2 at some time, t.
    // Calculate the value of x1 at time t, x1prime.
    // Player-bottom truly collided if-and-only-if
    // the x1prime hitbox can be projected vertically
    // onto the object's hitbox. In other words,
    // both of these statements must be false:
    // (a) x1prime is greater than or equal to x2 + w2
    // (b) x1prime + w1 is less than or equal to x2
    // Note that the "or equal to" part of this
    // is subtle, but important. Without it, we risk
    // detecting collisions on e.g. the left side when
    // the player actually fell straight down onto the floor.

    // Bottom
    if (
      vy1 > 0 &&
      y1 + h1 >= y2 &&
      y1 < y2 &&
      x1 + w1 > x2 &&
      x1 < x2 + w2 &&
      canProjectVertically(y2 - h1, x1, w1, vx1, y1, vy1, x2, w2)
    ) {
      return CollisionSide.Bottom;
    }

    // Top
    else if (
      vy1 < 0 &&
      y1 <= y2 + h2 &&
      y1 + h1 > y2 &&
      x1 + w1 > x2 &&
      x1 < x2 + w2 &&
      canProjectVertically(y2 + h2, x1, w1, vx1, y1, vy1, x2, w2)
    ) {
      return CollisionSide.Top;
    }

    // Left
    if (
      vx1 < 0 &&
      x1 <= x2 + w2 &&
      x1 + w1 > x2 &&
      y1 + h1 > y2 &&
      y1 < y2 + h2 &&
      canProjectHorizontally(x2 + w2, x1, vx1, y1, h1, vy1, y2, h2)
    ) {
      return CollisionSide.Left;
    }

    // Right
    else if (
      vx1 > 0 &&
      x1 + w1 >= x2 &&
      x1 < x2 &&
      y1 + h1 > y2 &&
      y1 < y2 + h2 &&
      canProjectHorizontally(x2 - w1, x1, vx1, y1, h1, vy1, y2, h2)
    ) {
      return CollisionSide.Right;
    }
  }
}
