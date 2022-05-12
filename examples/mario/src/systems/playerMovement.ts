import { ecs } from "dumb-game-framework";
import type { Entity } from "dumb-game-framework";
import { Controller, Vector, PlayerState, Collidable } from "../components";
import { GRAVITY_ACCELERATION } from "./physics";
import { unitify } from "../util/math";
import { createWithContext, FSM, Message } from "../util/fsm";
import { Direction } from "../util/enums";

/*
 * Magic number that closely mimics the speed of Mario in Super Mario Bros.
 */
// const MAX_RUN_VELOCITY = unitify(1.385);
const MAX_RUN_VELOCITY = unitify(1.2);

/*
 * Magic number that determines the value added to Mario's x-vector on every
 * tick while he is running, until he getes to MAX_RUN_VELOCITY.
 */
const RUN_VELOCITY_ACCELERATION = unitify(0.012);
// const RUN_VELOCITY_ACCELERATION = 4;

/*
 * Magic number that determines the value added to Mario's x-vector on every
 * tick while he is running, until he getes to MAX_RUN_VELOCITY.
 */
const RUN_VELOCITY_DECELERATION = unitify(0.03);
// const RUN_VELOCITY_DECELERATION = 10;

/*
 * Magic number that determines braking acceleration, so that Mario slows down
 * faster when he's "running" in the opposite direction he's actually traveling.
 */
const BRAKING_VELOCITY_ACCELERATION = unitify(0.04);
// const BRAKING_VELOCITY_ACCELERATION = 14;

/*
 * Magic number for jump height.
 * Largely derived from the calcuator at https://2dengine.com/?p=platformers
 */
const JUMP_HEIGHT = unitify(0.6);
// const JUMP_HEIGHT = 20;

/*
 * Determines the number of frames that a jump is cancellable
 * from the beginning of the jump.
 *
 * If the user releases the jump-button before exceeding this
 * number of frames, the jump will be terminated (throttled).
 *
 * This allows the user to jump only a little bit or to Mario's
 * maximum jump height, depending on how long the key was pressed.
 * 8 frames @ 60 FPS allows for a period of ~133ms to throttle.
 */
const JUMP_MAX_IMPULSE_FRAMES = 8;

enum PlayerAction {
  Jump,
  MoveLeft,
  MoveRight,
}

type PlayerMovementContext = {
  ready: boolean;
  jumpFrames: number;
};

/*
 * Use a state machine to track the progress of a jump and provide enforcement
 * of the player having to release the jump button in order to jump again.
 *
 * Track frames since initial impulse, which allows us to "terminate" a jump,
 * depending on when the user released the jump key.
 */
const createControllerStateChart = () => {
  return createWithContext<PlayerMovementContext>((actions) => ({
    chart: {
      parallel: {
        jumping: {
          initial: "terminated",
          states: {
            impulse: {
              on: {
                // I don't know if it's humanly possible to release
                // the key in the very next tick, but just in case.
                [`${PlayerAction.Jump}_RELEASED`]: {
                  target: "terminated",
                  actions: actions.mutateContext({ ready: (_c, _e) => true }),
                },
                TICK: [
                  {
                    target: "terminated",
                    when: actions.when(
                      (c, _e) => c.jumpFrames >= JUMP_MAX_IMPULSE_FRAMES
                    ),
                  },
                  {
                    actions: actions.mutateContext({
                      jumpFrames: (_c, _e) => _c.jumpFrames + 1,
                    }),
                  },
                ],
                TERMINATE: { target: "terminated" },
              },
            },
            terminated: {
              on: {
                [`${PlayerAction.Jump}_RELEASED`]: {
                  actions: actions.mutateContext({
                    ready: (_c, _e) => true,
                  }),
                },
                [`${PlayerAction.Jump}_PRESSED`]: {
                  target: "impulse",
                  when: actions.when((c, _e) => c.ready),
                  actions: actions.mutateContext({
                    ready: (_c, _e) => false,
                    jumpFrames: (_c, _e) => 0,
                  }),
                },
              },
            },
          },
        },
      },
    },
    context: {
      ready: true,
      jumpFrames: 0,
    },
  }));
};

export class JumpingFSMWrapper {
  private fsm: FSM<PlayerMovementContext>;

  constructor() {
    this.fsm = createControllerStateChart()
      // .onTransition((changedState) => console.log(changedState))
      .run();
  }

  public send(message: Message) {
    this.fsm.send(message);
  }

  public getJumpState(): JumpState | undefined {
    if (this.fsm.matches("jumping.impulse")) {
      const context = this.fsm.getContext();
      return { stage: "impulse", atFrame: context.jumpFrames };
    } else if (this.fsm.matches("jumping.terminated")) {
      return { stage: "terminated" };
    }
  }
}

type JumpState =
  | { stage: "impulse"; atFrame: number }
  | { stage: "terminated" };

export default class PlayerMovement extends ecs.System {
  public ecs: ecs.ECS;
  private jumpingFSM: JumpingFSMWrapper;

  requiredComponents = new Set<Function>([
    Vector,
    Controller,
    Collidable,
    PlayerState,
  ]);

  constructor() {
    super();
    this.jumpingFSM = new JumpingFSMWrapper();
  }

  update(entities: Set<Entity>, _delta: number): void {
    entities.forEach((entity) => {
      const components = this.ecs.getComponents(entity);
      const vector = components.get(Vector);
      const collidable = components.get(Collidable);
      const controller = components.get(Controller);
      const { xAxis, yAxis } = controller.readState();

      // Movement
      if (xAxis) {
        this.accelerateMovement(xAxis, vector);
      } else if (vector.x) {
        this.decelerateMovement(vector);
      }

      // Jumping
      this.handleJump(yAxis, vector, collidable);
    });
  }

  private accelerateMovement(direction: Direction, vector: Vector) {
    const isBraking =
      (vector.x < 0 && direction === Direction.RIGHT) ||
      (vector.x > 0 && direction === Direction.LEFT);

    const acceleration = isBraking
      ? BRAKING_VELOCITY_ACCELERATION
      : RUN_VELOCITY_ACCELERATION;

    vector.setX(
      direction === Direction.LEFT
        ? Math.max(vector.x - acceleration, -MAX_RUN_VELOCITY)
        : Math.min(vector.x + acceleration, MAX_RUN_VELOCITY)
    );
  }

  private decelerateMovement(vector: Vector) {
    // Slow down until x-vector is zero
    vector.setX(
      vector.x < 0
        ? Math.min(0, vector.x + RUN_VELOCITY_DECELERATION)
        : Math.max(0, vector.x - RUN_VELOCITY_DECELERATION)
    );
  }

  private handleJump(yAxis: 0 | 1, vector: Vector, collidable: Collidable) {
    const jumpState = this.jumpingFSM.getJumpState();

    // Send a tick signal so the FSM can track frames
    this.jumpingFSM.send("TICK");

    // TODO: Use controllerState.updatedAt to skip
    // unnecessary calls to jumpingFSM.send()
    if (yAxis) {
      // Only send jump signal to the FSM if we're:
      // Continuing a jump (i.e., stage is impulse), OR
      // Initiating one, and Mario is on the ground.
      if (jumpState?.stage === "impulse" || collidable.isBottomColliding()) {
        this.jumpingFSM.send(`${PlayerAction.Jump}_PRESSED`);
      }
    } else {
      this.jumpingFSM.send(`${PlayerAction.Jump}_RELEASED`);
    }

    // Send a terminate signal if Mario's head (or hand, really) hit something
    if (collidable.isTopColliding()) {
      this.jumpingFSM.send("TERMINATE");
    } else if (jumpState.stage === "impulse") {
      const jumpV = this.getJumpVelocity(jumpState?.atFrame);
      vector.setY(jumpV);
    }
  }

  private getJumpVelocity = (frame: number) => {
    /*
     * Jumping is frame-based so that we can have precise control
     * over jump height and timing.
     *
     * Originally, I used a time-based (setTimeout) approach,
     * which put jump-height, velocity, etc. at the mercy of the
     * requestAnimationFrame's timing, which had the consequence
     * that not all jumps were equal height. E.g. most of time, a
     * jump would accelerate for 9 frames, but sometimes 8 or 10,
     * which resulted in inconsistent jump behavior.
     *
     * By counting frames, we can ensure a max-jump height and
     * easy-to-reason about termination: the user gets 9 frames
     * to terminate a jump by releasing the button. At 60 fps,
     * the user has ~150ms to terminate.
     *
     * Each subsequent frame adds velocity to the jump until
     * the 9th frame or the user releases the button, whichever
     * comes first.
     */
    const throttle = frame / JUMP_MAX_IMPULSE_FRAMES;
    const maxVelocity = Math.sqrt(2 * GRAVITY_ACCELERATION * JUMP_HEIGHT);
    const jumpVelocity = throttle * maxVelocity;

    // Always have a minimum velocity when jumping, which keeps
    // Mario from jumping only ~1 pixel high in the event of a very
    // short button press.
    const MINIMUM_JUMP_IMPULSE_VELOCITY = 600;
    return Math.min(-jumpVelocity, -MINIMUM_JUMP_IMPULSE_VELOCITY);
  };
}
