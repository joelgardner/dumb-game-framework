import { ecs } from "dumb-game-framework";
import type { Entity } from "dumb-game-framework";
import { Controller, Physical } from "../components";
import KeyboardInputManager, { Key, TouchInputManager } from "../util/input";

export default class InputHandler extends ecs.System {
  public ecs: ecs.ECS;
  requiredComponents = new Set<Function>([Controller]);
  private inputSource = new KeyboardInputManager();
  private touchInputSource = new TouchInputManager();

  public initialize(entities: Set<Entity>): void {
    entities.forEach((entity) => {
      const components = this.ecs.getComponents(entity);
      const controller = components.get(Controller);
      this.inputSource.bind(
        [controller.left, controller.right, controller.jump],
        ({ key, state }) => {
          controller.writeState(key, state);
        }
      );

      this.touchInputSource.bind((e) => {
        const physical = components.get(Physical);
        if (!e.state) {
          controller.writeState(controller.left, 0);
          controller.writeState(controller.right, 0);
        } else if (e.position.x < physical.x) {
          controller.writeState(controller.left, 1);
        } else if (e.position.x > physical.x + physical.width) {
          controller.writeState(controller.right, 1);
        }

        controller.writeState(
          controller.jump,
          e.position.y < physical.y ? e.state : 0
        );
      });
    });

    this.inputSource.listen();
    this.touchInputSource.listen();
  }

  update(_entities: Set<Entity>, _delta: number): void {}
}
