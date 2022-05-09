import { ecs } from "dumb-game-framework";
import type { Asset, AssetId, Entity } from "dumb-game-framework";
import { Sprite, PlayerState, Physical } from "../components";

export default class SpriteRenderer extends ecs.System {
  public ecs: ecs.ECS;
  requiredComponents = new Set<Function>([PlayerState, Sprite, Physical]);
  #context: CanvasRenderingContext2D;

  constructor(
    private canvas: HTMLCanvasElement,
    private getAsset: (assetId: AssetId) => Asset
  ) {
    super();
    this.#context = canvas.getContext("2d");
  }

  update(entities: Set<Entity>): void {
    this.#context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    entities.forEach((entity) => {
      const components = this.ecs.getComponents(entity);
      // const [sprite, position] = components.getAll(this.requiredComponents)
      const sprite = components.get(Sprite);
      const { position } = components.get(Physical);
      const playerState = components.get(PlayerState);
      const asset = this.getAsset(sprite.asset);
      this.#checkAssetType(asset);
      const spriteDescriptor = sprite.spriteCoordinates[sprite.spriteKey];
      const [x, y, w, h] = spriteDescriptor.coordinates;
      const offsetX = spriteDescriptor.offset?.[0] ?? 0;
      // const offsetY = spriteDescriptor.offset?.[1] ?? 0;
      if (asset.resource instanceof HTMLImageElement) {
        this.#renderSprite(
          asset.resource,
          playerState.facing,
          offsetX,
          x,
          y,
          w,
          h,
          position.x * playerState.facing,
          position.y,
          w,
          h
        );
      }
    });
  }

  #renderSprite(
    resource: HTMLImageElement,
    facing: -1 | 1,
    offset: number,
    // Sprite values
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    // Canvas values
    cx: number,
    cy: number,
    cw: number,
    ch: number
  ) {
    this.#context.setTransform(1 * facing, 0, 0, 1, 0, 0);
    // if (facing === -1) {
    this.#context.translate(offset * facing, 0);
    // }

    this.#context.drawImage(resource, sx, sy, sw, sh, cx - sw / 2, cy, cw, ch);
    this.#context.setTransform(1, 0, 0, 1, 0, 0);
  }

  #renderHitbox(cx: number, cy: number, cw: number, ch: number) {
    this.#context.beginPath();
    this.#context.strokeStyle = "red";
    this.#context.rect(cx, cy, cw, ch);
    this.#context.stroke();
    this.#context.closePath();
  }

  #checkAssetType(asset: Asset) {
    if (asset.type !== "IMAGE") {
      throw new Error(
        `SpriteRenderer given invalid asset type: ${asset.type}.`
      );
    }
  }
}
