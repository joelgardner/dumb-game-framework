import { Game } from "dumb-game-framework";
import * as Dom from "./util/dom"
import { setUpECS } from "./setup";

// const canvas: HTMLCanvasElement = document.querySelector(
//   "#canvas"
// ) as HTMLCanvasElement;
//
// window.addEventListener("resize", () => {
//   game.ecs.clear();
//   game.setUp(setUpECS, dependencies);
// });
//
// const game = new Game();
// const marioSpriteSheet = game.addImageAsset("./assets/dspritesheet.png", {
//   tags: ["mario"],
// });
//
// const dependencies = {
//   canvas,
//   assets: {
//     mario: marioSpriteSheet,
//   },
// };
//
// debugger
// game.setUp(setUpECS, dependencies);
// game.startAsync();
//

const container = "#world";
const canvas: HTMLCanvasElement = Dom.createBackingCanvas(container);

window.addEventListener("resize", () => {
  Dom.setSizeToMatch(canvas, container);
  game.ecs.clear();
  const hitboxes = Dom.getWordHitboxes(container);
  const words = hitboxes.map(({ id, hitbox }) => ({ id, ...hitbox }));
  game.setUp(setUpECS, { ...dependencies, words });
});

const hitboxes = Dom.getWordHitboxes("#world");
const game = new Game();
const marioSpriteSheet = game.addImageAsset("./assets/dspritesheet.png", {
  tags: ["mario"],
});

const dependencies = {
  canvas,
  words: hitboxes.map(({ id, hitbox }) => ({ id, ...hitbox })),
  onWordCollision: (elementId: string) => {
    Dom.animatePunch(`#${elementId}`);
  },
  assets: {
    mario: marioSpriteSheet,
  },
};
game.setUp(setUpECS, dependencies);
game.startAsync();
