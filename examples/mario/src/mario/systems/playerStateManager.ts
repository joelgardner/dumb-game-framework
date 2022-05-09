import { ecs } from "dumb-game-framework";
import type { Entity } from "dumb-game-framework";
import {
  Sprite,
  Vector,
  Controller,
  PlayerState,
  Collidable,
} from "../components";

const SPRITES = ["runningStanding", "runningLongStride", "runningSkate"];

export default class PlayerStateManager extends ecs.System {
  public ecs: ecs.ECS;
  public requiredComponents = new Set<Function>([
    PlayerState,
    Sprite,
    Collidable,
  ]);

  update(entities: Set<Entity>): void {
    entities.forEach((entity) => {
      const components = this.ecs.getComponents(entity);
      const playerState = components.get(PlayerState);
      this.setFacing(playerState, components);
      this.setSpriteKey(playerState, components);
    });
  }

  /*
   * We need to track the direction Mario is facing. This is usually
   * driven by which ever movement button the user pressed last, 
   * except for when Mario is airborne, during which it is not possible
   * for Mario to change teh direction he is facing
   */
  private setFacing(
    playerState: PlayerState,
    components: ecs.ComponentContainer
  ) {
    const controller = components.get(Controller);
    const controllerState = controller.readState();
    const collidable = components.get(Collidable);
    if (collidable.isGrounded()) {
      playerState.facing = controllerState.xAxis || playerState.facing;
    }
  }

  /*
   * Depending on our state, select the correct sprite key to
   * ensure we draw Mario correctly, e.g. rotate through the running
   * sprites while Mario is running.
   */
  private setSpriteKey(
    playerState: PlayerState,
    components: ecs.ComponentContainer
  ) {
    const sprite = components.get(Sprite);
    const vector = components.get(Vector);
    const controller = components.get(Controller);
    const collidable = components.get(Collidable);

    if (!vector.x) {
      playerState.resetRunningSpriteState();
    }

    const { xAxis } = controller.readState();
    if (!collidable.isGrounded()) {
      sprite.spriteKey = "airborne";
    } else if (vector.x * xAxis < 0) {
      sprite.spriteKey = "braking";
    } else if (vector.x) {
      sprite.spriteKey = this.getRunningSprite(vector.x, playerState);
    } else {
      sprite.spriteKey = "idle";
    }
  }

  /*
   * Handle the speed at which we want Mario to run, i.e. rotate through
   * his running sprites. Based on his velocity, rotate quicker or slower.
   */
  private getRunningSprite(vx: number, playerState: PlayerState): string {
    const breakpoints = [50, 150, 300];

    let frameStride: number;
    const velocity = Math.abs(vx);
    if (velocity < breakpoints[0]) {
      frameStride = 18;
    } else if (velocity < breakpoints[1]) {
      frameStride = 15;
    } else if (velocity < breakpoints[2]) {
      frameStride = 10;
    } else {
      frameStride = 5;
    }

    if (playerState.runningSpriteState.incFrameCount() % frameStride === 0) {
      playerState.runningSpriteState.incSpriteIndex();
    }

    return SPRITES[playerState.runningSpriteState.spriteIndex];
  }
}
