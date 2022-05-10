import { ecs } from "dumb-game-framework";
import type { AssetId } from "dumb-game-framework";

type SpriteDescriptor = {
  coordinates: [number, number, number, number];
  offset?: [number, number];
};

export default class Sprite<T extends string> extends ecs.Component {
  public spriteKey: T;

  constructor(
    public asset: AssetId,
    public spriteCoordinates: { [key in T]: SpriteDescriptor }
  ) {
    super();
  }
}
