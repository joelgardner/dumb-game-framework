import { ecs } from "dumb-game-framework";
import type { Entity } from "dumb-game-framework";
import { Physical, Collidable } from "../components";

export default class DebugRenderer extends ecs.System {
  public ecs: ecs.ECS;
  requiredComponents = new Set<Function>([Physical, Collidable]);
  context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.context = canvas.getContext("2d");
  }

  update(entities: Set<Entity>): void {
    entities.forEach((entity) => {
      const components = this.ecs.getComponents(entity);
      const physical = components.get(Physical);
      const collidable = components.get(Collidable);
      const { x, y, width, height } = collidable.offsetPhysical(physical);
      this.renderHitbox(x, y, width, height);
    });
  }

  renderHitbox(cx: number, cy: number, cw: number, ch: number) {
    this.context.beginPath();
    this.context.strokeStyle = "red";
    this.context.rect(cx, cy, cw, ch);
    this.context.stroke();
    this.context.closePath();
  }
}
