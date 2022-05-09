import { ecs } from "dumb-game-framework";
import type { Entity } from "dumb-game-framework";
import { Drawable, Physical } from "../components";

export default class Locator extends ecs.System {
  public ecs: ecs.ECS;
  private context: CanvasRenderingContext2D;

  requiredComponents = new Set<Function>([Drawable, Physical]);

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.context = canvas.getContext("2d");
  }

  update(entities: Set<Entity>, _delta: number): void {
    entities.forEach((entity: Entity) => {
      const components = this.ecs.getComponents(entity);
      const drawable = components.get(Drawable);
      const physical = components.get(Physical);
      this.context.beginPath();
      this.context.strokeStyle = drawable.color;
      this.context.rect(
        physical.x,
        physical.y,
        physical.width,
        physical.height
      );
      this.context.fill();
      this.context.closePath();
    });
  }
}
