export type ParallelStateChart = {
  parallel: { [key: string]: StateMachineGraph };
};

export type StateMachineGraph = {
  initial: string;
  states: { [key: string]: State };
};

type State = {
  on: TransitionTargetMap;
  entry?: any;
  after?: TransitionDelay;
};

export type Message = string | { type: string; [key: string]: any };
type TransitionTargetMap = { [key: string]: LenientTransitionTarget };
type LenientTransitionTarget = string | TransitionTarget | TransitionTarget[];
// TODO: Add TContext to this so that e.g. when can be WhenPredicateFn<TContext>
type TransitionTarget = {
  target?: string;
  meta?: any;
  actions?: any;
  when?: any;
};

type TransitionDelay = {
  delay: {
    [key: number]: LenientTransitionTarget;
  };
};

type WhenPredicateFnCallback<T> = (context: T, msg: string) => boolean;
export type WhenPredicateFn<T> = (condition: WhenPredicateFnCallback<T>) => {
  type: "when";
  condition: WhenPredicateFnCallback<T>;
};

export type MutateContextFn<T> = (assignments: {
  [Property in keyof Partial<T>]: (context: T, msg: string) => T[Property];
}) => {
  type: "mutateContext";
  assignments: { [key: string]: (context: T, msg: string) => any };
};

function mutateContext<T>(assignments: {
  [key: string]: (context: T, msg: string) => any;
}): {
  type: "mutateContext";
  assignments: { [key: string]: (context: T, msg: string) => any };
} {
  return {
    type: "mutateContext",
    assignments,
  };
}

function emit(message: any): { type: "emit"; message: any } {
  return {
    type: "emit",
    message,
  };
}

function when<T>(condition: WhenPredicateFnCallback<T>): {
  type: "when";
  condition: WhenPredicateFnCallback<T>;
} {
  return {
    type: "when",
    condition,
  };
}

export type Actions<TContext> = {
  mutateContext: MutateContextFn<TContext>;
  emit: (msg: any) => void;

  // This is definitely an odd place for this method, but it works for now.
  when: WhenPredicateFn<TContext>;
};

export function createWithContext<TContext>(
  callback: (actions: Actions<TContext>) => {
    chart: ParallelStateChart | StateMachineGraph;
    context: TContext;
  }
): FSM<TContext> {
  const { chart, context } = callback({ mutateContext, emit, when });
  return new FSM<TContext>(chart, context);
}

export class FSM<T = {}> {
  public state = {};
  private timers = {};
  private transitionCallbacks: Function[] = [];
  private emitCallbacks: Function[] = [];

  constructor(
    private chart: ParallelStateChart | StateMachineGraph,
    private context?: T
  ) {}

  run(): FSM<T> {
    // Set initial state
    if ("parallel" in this.chart) {
      Object.entries(this.chart.parallel).forEach(
        ([key, machine]: [string, StateMachineGraph]) => {
          this.state[key] = machine.initial;
          const initialTarget = this.#chooseNextTarget(
            this.#getTransitionTarget(machine.initial),
            "__init__"
          );
          this.#enter(key, machine, initialTarget);
        }
      );
    } else {
      this.state = this.chart.initial;
      this.#enter(
        "",
        this.chart,
        this.#chooseNextTarget(
          this.#getTransitionTarget(this.chart.initial),
          "__init__"
        )
      );
    }

    return this;
  }

  send(message: Message): FSM<T> {
    this.#interpret(message);
    return this;
  }

  matches(path: string): boolean {
    const parts = path.split(".");
    let state = this.state;

    for (let part of parts) {
      if (
        (typeof state === "object" && !state[part]) ||
        (typeof state === "string" && state !== part)
      ) {
        return false;
      }
      state = state[part];
    }
    return true;
  }

  #interpret(msg: Message) {
    if ("parallel" in this.chart) {
      Object.entries(this.chart.parallel).forEach(
        ([key, machine]: [string, StateMachineGraph]) => {
          this.#interpretMachineEvent(key, machine, msg);
        }
      );
    } else {
      this.#interpretMachineEvent("", this.chart, msg);
    }
  }

  #interpretMachineEvent(
    key: string,
    machine: StateMachineGraph,
    message: Message
  ) {
    const current = key === "" ? this.state : this.state[key];
    const msg = typeof message === "string" ? message : message.type;
    const transitionTargetList = machine.states?.[current]?.on?.[msg];
    const potentialTargets = this.#getTransitionTarget(transitionTargetList);
    const target = this.#chooseNextTarget(potentialTargets, message);

    // To execute a transition, we require one of the following conditions:
    // We have a concrete target field on our transition node.
    // Or, we have a transition node without a concrete target field.
    // In this case we use the current node as the target to execute loopback.
    if (target) {
      if (!target.target) {
        target.target = current;
      }
      this.#transition(key, machine, current, target);
    }
  }

  #transition(
    key: string,
    machine: StateMachineGraph,
    from: any,
    target: TransitionTarget
  ) {
    // Clear out any unexpired timers that may exist
    clearTimeout(this.timers[key]);

    this.#exit(key, machine, from, target.actions);

    // Update our state value
    if (key === "") {
      this.state = target.target;
    } else {
      this.state[key] = target.target;
    }

    this.#enter(key, machine, target);

    // Execute any transitionCallbacks
    const result = { [key]: target.target };
    this.transitionCallbacks.forEach((callback) => callback(result));
  }

  #executeActions(_actions: any) {
    const actions = Array.isArray(_actions) ? _actions : [_actions];
    actions.forEach((action) => {
      switch (action.type) {
        case "mutateContext":
          this.#executeMutateContextAction(action.assignments);
          break;
        case "emit":
          this.#executeEmitAction(action.message);
          break;
      }
    });
  }

  #executeMutateContextAction(assignments: any) {
    for (let [key, mutateContext] of Object.entries(assignments)) {
      // @ts-ignore
      this.context[key] = mutateContext(this.context, null);
    }
  }

  #executeEmitAction(message: any) {
    this.emitCallbacks.forEach((callback) => callback(message));
  }

  public getContext() {
    return this.context;
  }

  #exit(
    _key: string,
    _machine: StateMachineGraph,
    _from: string,
    actions: any
  ) {
    if (actions) {
      this.#executeActions(actions);
    }
  }

  #enter(key: string, machine: StateMachineGraph, target: TransitionTarget) {
    // Set any timers for delayed transitions, if specified
    this.#setDelayedTransitionIfNecessary(key, machine, target.target);

    const enteredState = machine.states?.[target.target];
    if (enteredState?.entry) {
      this.#executeActions(enteredState.entry);
    }
  }

  #setDelayedTransitionIfNecessary(
    key: string,
    machine: StateMachineGraph,
    target: string
  ) {
    const from = machine.states?.[target];
    const delay = from?.after?.delay;
    if (!delay) {
      return;
    }

    const ms = parseInt(Object.keys(delay).at(0));
    const potentialTargets = this.#getTransitionTarget(delay[ms]);
    const nextTarget = this.#chooseNextTarget(potentialTargets, "delay");
    this.timers[key] = setTimeout(() => {
      this.#transition(key, machine, from, nextTarget);
    }, ms);
  }

  #chooseNextTarget(
    targets: TransitionTarget[],
    msg: Message
  ): TransitionTarget | undefined {
    if (!targets) {
      return;
    }
    for (let target of targets) {
      if (!target.when || target.when.condition(this.context, msg)) {
        return target;
      }
    }
  }

  #getTransitionTarget(
    target: LenientTransitionTarget
  ): TransitionTarget[] | undefined {
    if (!target) {
      return;
    }

    if (Array.isArray(target)) {
      return target;
    }

    if (typeof target === "string") {
      return [{ target }];
    }

    if (typeof target === "object" && target) {
      return [target];
    }
  }

  onTransition(callback: Function) {
    this.transitionCallbacks.push(callback);
    return this;
  }

  onEmit(callback: Function) {
    this.emitCallbacks.push(callback);
    return this;
  }
}
