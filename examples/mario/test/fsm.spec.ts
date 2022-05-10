import { createWithContext, Actions } from "../src/util/fsm";

type ControllerContext = {
  xAxis: -1 | 0 | 1;
  yAxis: 0 | 1;
};

function createStateChart(
  actions: Actions<ControllerContext>,
  movementInitial: string,
  jumpInitial: string
) {
  return {
    parallel: {
      movement: {
        initial: movementInitial,
        states: {
          idle: {
            on: {
              MOVE_LEFT: {
                target: "left",
                actions: actions.mutateContext({
                  xAxis: (c: ControllerContext, msg: string) => -1,
                  yAxis: (c: ControllerContext, msg: string) => c.yAxis,
                }),
              },
            },
          },
          left: {
            on: {
              STOP: { target: "idle" },
              MOVE_RIGHT: {
                target: "both",
                actions: actions.mutateContext({
                  xAxis: (c, _e) => 1,
                  yAxis: (_c, _e) => 0,
                }),
              },
            },
          },
          right: {
            on: { STOP: { target: "idle" }, MOVE_LEFT: { target: "both" } },
          },
          both: {
            on: { STOP: { target: "idle" } },
          },
        },
      },
      jumping: {
        initial: jumpInitial,
        states: {
          idle: {
            on: { START_JUMPING: { target: "active" } },
          },
          active: {
            on: { STOP_JUMPING: { target: "airborne" } },
            after: { delay: { 200: { target: "airborne" } } },
          },
          airborne: {
            on: { STOP: "idle" },
          },
        },
      },
    },
  };
}

describe("fsm", () => {
  test("should run a callback when a transition occurs", (done) => {
    const fsm = createWithContext<ControllerContext>((actions) => ({
      chart: createStateChart(actions, "idle", "idle"),
      context: { xAxis: 1, yAxis: 0 },
    }));

    fsm
      .onTransition((changedState: any) => {
        expect(changedState).toStrictEqual({ movement: "left" });
        done();
      })
      .run()
      .send("MOVE_LEFT");
  });

  test("should fire a transition with a delay", (done) => {
    const fsm = createWithContext<ControllerContext>((actions) => ({
      chart: createStateChart(actions, "left", "airborne"),
      context: { xAxis: 1, yAxis: 0 },
    }));

    let transitionCount = 0;
    fsm
      .onTransition((changedState: any) => {
        ++transitionCount;
        if (transitionCount === 1) {
          expect(changedState).toStrictEqual({ movement: "idle" });
        } else if (transitionCount == 2) {
          expect(changedState).toStrictEqual({ jumping: "idle" });
          done();
        }
      })
      .run()
      .send("STOP");
  });

  test("create method creates fsm with context correctly", () => {
    const fsm = createWithContext<ControllerContext>((actions) => ({
      chart: createStateChart(actions, "idle", "idle"),
      context: { xAxis: 1, yAxis: 0 },
    }));

    fsm.run();

    fsm.send("MOVE_LEFT");
    expect(fsm.getContext().xAxis).toBe(-1);

    fsm.send("MOVE_RIGHT");
    expect(fsm.getContext().xAxis).toBe(1);
  });
});
