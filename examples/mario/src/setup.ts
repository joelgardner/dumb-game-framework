import { ecs as _ecs } from "dumb-game-framework";
import type { AssetId, Asset } from "dumb-game-framework";
import {
  Vector,
  Sprite,
  Controller,
  Collidable,
  PlayerState,
  Meta,
  Physical,
} from "./components";
import {
  Physics,
  SpriteRenderer,
  Locator,
  Drawer,
  InputHandler,
  DebugRenderer,
  PlayerMovement,
  CollisionDetector,
  PlayerStateManager,
  EventEmitter,
} from "./systems";
import { Direction } from "./util/enums";
import { PhysicalProperties } from "./components/physical";

type Word = { id: string } & PhysicalProperties;
type MarioDependencies = {
  assets: { mario: AssetId };
  canvas: HTMLCanvasElement;
  debug: boolean;
  getAsset: (assetId: AssetId) => Asset;
  onWordCollision: (elementId: string) => void;
  words: Word[];
};

type MarioSprite =
  | "idle"
  | "braking"
  | "airborne"
  | "runningLongStride"
  | "runningStanding"
  | "runningSkate";

export function ecsSetup(dependencies: MarioDependencies) {
  const { getAsset, canvas, debug, assets, words, onWordCollision } =
    dependencies;
  return function (ecs: _ecs.ECS) {
    // Mario
    const mario = ecs.addEntity();
    ecs.addComponent(mario, new Vector(0, 0));
    ecs.addComponent(mario, new Physical(204, -48, 48, 64));
    ecs.addComponent(mario, new Collidable());
    ecs.addComponent(mario, new Controller());
    ecs.addComponent(mario, new PlayerState(Direction.RIGHT));
    ecs.addComponent(
      mario,
      new Sprite<MarioSprite>(assets.mario, {
        idle: { coordinates: [4, 12, 48, 64], offset: [24, 0] },
        braking: { coordinates: [4, 96, 54, 64], offset: [24, 0] },
        airborne: { coordinates: [72, 12, 64, 64], offset: [24, 0] },
        runningLongStride: { coordinates: [75, 96, 62, 64], offset: [24, 0] },
        runningStanding: { coordinates: [150, 96, 52, 64], offset: [24, 0] },
        runningSkate: { coordinates: [220, 98, 52, 64], offset: [24, 0] },
      })
    );

    // Boundary walls
    const floor = ecs.addEntity();
    ecs.addComponent(floor, new Physical(0, canvas.height, canvas.width, 0));
    ecs.addComponent(floor, new Collidable());

    const leftWall = ecs.addEntity();
    ecs.addComponent(leftWall, new Physical(0, 0, 0, canvas.height));
    ecs.addComponent(leftWall, new Collidable());

    const rightWall = ecs.addEntity();
    ecs.addComponent(
      rightWall,
      new Physical(canvas.width, 0, 0, canvas.height)
    );
    ecs.addComponent(rightWall, new Collidable());

    // Words
    words.forEach((word) => {
      const wordEntity = ecs.addEntity();
      ecs.addComponent(wordEntity, new Meta({ id: word.id }));
      ecs.addComponent(
        wordEntity,
        new Physical(word.x, word.y, word.width, word.height)
      );
      ecs.addComponent(wordEntity, new Collidable());
    });

    // Systems
    ecs.addSystem(new InputHandler());
    ecs.addSystem(new PlayerMovement());
    ecs.addSystem(new CollisionDetector());
    ecs.addSystem(new Physics());
    ecs.addSystem(new PlayerStateManager());
    ecs.addSystem(new Locator());
    ecs.addSystem(new SpriteRenderer(canvas, getAsset));
    ecs.addSystem(new Drawer(canvas));
    ecs.addSystem(new EventEmitter(onWordCollision));
    if (debug) {
      ecs.addSystem(new DebugRenderer(canvas));
    }
  };
}
