import { ecs } from "dumb-game-framework";
import { FSM, createWithContext } from "../util/fsm";
import { Key } from "../util/input";

type ControllerContext = {
  xAxis: -1 | 0 | 1;
  yAxis: 0 | 1;
};

const create = (left: Key, right: Key, jump: Key) => {
  return createWithContext<ControllerContext>((actions) => {
    return {
      chart: {
        parallel: {
          movement: {
            initial: "idle",
            states: {
              idle: {
                entry: actions.mutateContext({ xAxis: (_c, _e) => 0 }),
                on: {
                  [`${left}_1`]: { target: "left" },
                  [`${right}_1`]: { target: "right" },
                },
              },
              left: {
                entry: actions.mutateContext({ xAxis: (_c, _e) => -1 }),
                on: {
                  [`${left}_0`]: { target: "idle" },
                  [`${right}_1`]: {
                    target: "both",
                    actions: actions.mutateContext({ xAxis: (_c, _e) => 1 }),
                  },
                },
              },
              right: {
                entry: actions.mutateContext({ xAxis: (_c, _e) => 1 }),
                on: {
                  [`${right}_0`]: { target: "idle" },
                  [`${left}_1`]: {
                    target: "both",
                    actions: actions.mutateContext({ xAxis: (_c, _e) => -1 }),
                  },
                },
              },
              both: {
                on: {
                  [`${left}_0`]: { target: "right" },
                  [`${right}_0`]: { target: "left" },
                },
              },
            },
          },
          jumping: {
            initial: "idle",
            states: {
              idle: {
                entry: actions.mutateContext({ yAxis: (_c, _e) => 0 }),
                on: {
                  [`${jump}_1`]: { target: "up" },
                },
              },
              up: {
                entry: actions.mutateContext({ yAxis: (_c, _e) => 1 }),
                on: {
                  [`${jump}_0`]: { target: "idle" },
                },
              },
            },
          },
        },
      },
      context: {
        xAxis: 0,
        yAxis: 0,
      },
    };
  });
};

export default class Controller extends ecs.Component {
  private fsm: FSM<ControllerContext>;
  private updatedAt: number;

  constructor(
    public left = Key.ArrowLeft,
    public right = Key.ArrowRight,
    public jump = Key.ArrowUp
  ) {
    super();
    this.fsm = create(this.left, this.right, this.jump).run();
  }

  writeState(key: Key, state: 0 | 1) {
    this.updatedAt = performance.now();
    this.fsm.send(`${key}_${state}`);
  }

  readState(): { updatedAt: number } & ControllerContext {
    return { updatedAt: this.updatedAt, ...this.fsm.getContext() };
  }
}
