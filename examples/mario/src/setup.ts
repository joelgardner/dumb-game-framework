import { Game } from "dumb-game-framework";
import type { AssetId } from "dumb-game-framework";
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
  CollisionDetector,
  PlayerStateManager,
  EventEmitter,
} from "./systems";
import { Direction } from "./util/enums";
import { PlayerMovement } from "./systems/playerMovement";
import { Color } from "./components/drawable";
import { PhysicalProperties } from "./components/physical";

type Word = { id: string } & PhysicalProperties;
type MarioDependencies = {
  canvas: HTMLCanvasElement;
  words: Word[];
  onWordCollision: (elementId: string) => void;
  assets: { mario: AssetId };
};

type MarioSprite =
  | "idle"
  | "braking"
  | "airborne"
  | "runningLongStride"
  | "runningStanding"
  | "runningSkate";

export function setUpECS(game: Game, dependencies: MarioDependencies) {
  // Mario
  const mario = game.ecs.addEntity();
  game.ecs.addComponent(mario, new Vector(0, 0));
  game.ecs.addComponent(mario, new Physical(80, 80, 48, 64));
  game.ecs.addComponent(mario, new Collidable());
  game.ecs.addComponent(mario, new Controller());
  game.ecs.addComponent(mario, new PlayerState(Direction.RIGHT));
  game.ecs.addComponent(
    mario,
    new Sprite<MarioSprite>(dependencies.assets.mario, {
      idle: { coordinates: [4, 12, 48, 64], offset: [24, 0] },
      braking: { coordinates: [4, 96, 54, 64], offset: [24, 0] },
      airborne: { coordinates: [72, 12, 64, 64], offset: [24, 0] },
      runningLongStride: { coordinates: [75, 96, 62, 64], offset: [24, 0] },
      runningStanding: { coordinates: [150, 96, 52, 64], offset: [24, 0] },
      runningSkate: { coordinates: [220, 98, 52, 64], offset: [24, 0] },
    })
  );

  // Boundary walls
  const floor = game.ecs.addEntity();
  game.ecs.addComponent(
    floor,
    new Physical(0, dependencies.canvas.height, dependencies.canvas.width, 0)
  );
  game.ecs.addComponent(floor, new Collidable());

  const leftWall = game.ecs.addEntity();
  game.ecs.addComponent(
    leftWall,
    new Physical(0, 0, 0, dependencies.canvas.height)
  );
  game.ecs.addComponent(leftWall, new Collidable());

  const rightWall = game.ecs.addEntity();
  game.ecs.addComponent(
    rightWall,
    new Physical(dependencies.canvas.width, 0, 0, dependencies.canvas.height)
  );
  game.ecs.addComponent(rightWall, new Collidable());

  // Words
  dependencies.words.forEach((word) => {
    const wordEntity = game.ecs.addEntity();
    game.ecs.addComponent(wordEntity, new Meta({ id: word.id }));
    game.ecs.addComponent(
      wordEntity,
      new Physical(word.x, word.y, word.width, word.height)
    );
    game.ecs.addComponent(wordEntity, new Collidable());
  });

  //   // Boundary walls
  //   const floor = game.ecs.addEntity();
  //   game.ecs.addComponent(
  //     floor,
  //     new Physical(
  //       0,
  //       dependencies.canvas.height - 10,
  //       dependencies.canvas.width,
  //       10
  //     )
  //   );
  //   game.ecs.addComponent(floor, new Collidable());
  //   game.ecs.addComponent(floor, new Drawable(Color.Black));
  //
  //   const ceiling = game.ecs.addEntity();
  //   game.ecs.addComponent(
  //     ceiling,
  //     new Physical(0, 0, dependencies.canvas.width, 10)
  //   );
  //   game.ecs.addComponent(ceiling, new Collidable());
  //   game.ecs.addComponent(ceiling, new Drawable(Color.Black));
  //
  //   const leftWall = game.ecs.addEntity();
  //   game.ecs.addComponent(
  //     leftWall,
  //     new Physical(0, 0, 10, dependencies.canvas.height)
  //   );
  //   game.ecs.addComponent(leftWall, new Collidable());
  //   game.ecs.addComponent(leftWall, new Drawable(Color.Black));
  //
  //   const rightWall = game.ecs.addEntity();
  //   game.ecs.addComponent(
  //     rightWall,
  //     new Physical(
  //       dependencies.canvas.width - 10,
  //       0,
  //       10,
  //       dependencies.canvas.height
  //     )
  //   );
  //   game.ecs.addComponent(rightWall, new Collidable());
  //   game.ecs.addComponent(rightWall, new Drawable(Color.Black));
  //
  //   // Middle block
  //   const block = game.ecs.addEntity();
  //   game.ecs.addComponent(
  //     block,
  //     new Physical(
  //       dependencies.canvas.width / 2 - 25,
  //       dependencies.canvas.height / 2 - 25,
  //       50,
  //       50
  //     )
  //   );
  //   game.ecs.addComponent(block, new Collidable());
  //   game.ecs.addComponent(block, new Drawable(Color.Black));

  // Systems
  game.ecs.addSystem(new InputHandler());
  game.ecs.addSystem(new PlayerMovement());
  game.ecs.addSystem(new CollisionDetector());
  game.ecs.addSystem(new Physics());
  game.ecs.addSystem(new PlayerStateManager());
  game.ecs.addSystem(new Locator());
  game.ecs.addSystem(new SpriteRenderer(dependencies.canvas, game.getAsset));
  game.ecs.addSystem(new Drawer(dependencies.canvas));
  game.ecs.addSystem(new EventEmitter(dependencies.onWordCollision));

  // game.ecs.addSystem(new DebugRenderer(dependencies.canvas));
}
