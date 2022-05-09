import { ecs } from "dumb-game-framework";
import { Direction } from "../util/enums";

export default class PlayerState extends ecs.Component {
  public runningSpriteState = new RunningSpriteState();
  constructor(public facing: Direction) {
    super();
  }

  public resetRunningSpriteState() {
    this.runningSpriteState.frameCount = 0;
    this.runningSpriteState.spriteIndex = 0;
  }
}

class RunningSpriteState {
  constructor(public frameCount = 0, public spriteIndex = 0) {}

  public incFrameCount() {
    return this.frameCount++;
  }

  public incSpriteIndex() {
    this.spriteIndex = (this.spriteIndex + 1) % 3;
    return this.spriteIndex;
  }
}
