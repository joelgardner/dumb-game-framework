import { ecs } from "dumb-game-framework";

export type PhysicalProperties = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default class Physical extends ecs.Component {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {
    super();
  }

  getHitbox(): PhysicalProperties {
    return this;
  }

  get position() {
    return { x: this.x, y: this.y };
  }

  get size() {
    return { width: this.width, height: this.height };
  }
}
