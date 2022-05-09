import { ecs } from "dumb-game-framework";
import type { Entity } from "dumb-game-framework";
import { Controller } from "../components";
import KeyboardInputManager from "../util/input";

export default class InputHandler extends ecs.System {
  public ecs: ecs.ECS;
  requiredComponents = new Set<Function>([Controller]);
  private inputSource = new KeyboardInputManager();

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
    });

    this.inputSource.listen();
  }

  update(_entities: Set<Entity>, _delta: number): void {}
}
