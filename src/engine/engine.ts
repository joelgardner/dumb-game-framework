import RequestAnimationFrameLoop, { IGameLoop } from "./gameLoop";
import { ECS } from "../ecs";

export default class Engine {
  public ecs = new ECS();
  private loop: IGameLoop;

  constructor() {
    this.loop = new RequestAnimationFrameLoop(this.tick);
  }

  start() {
    this.loop.start();
  }

  tick = (delta: number) => {
    this.ecs.update(delta);
  };

  stop() {
    this.loop.stop();
  }
}
