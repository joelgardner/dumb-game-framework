import { Game } from "dumb-game-framework";
import { setUpECS } from "./setup";

const canvas: HTMLCanvasElement = document.querySelector(
  "#canvas"
) as HTMLCanvasElement;

window.addEventListener("resize", () => {
  game.ecs.clear();
  game.setUp(setUpECS, dependencies);
});

const game = new Game();
const marioSpriteSheet = game.addImageAsset("./assets/dspritesheet.png", {
  tags: ["mario"],
});

const dependencies = {
  canvas,
  assets: {
    mario: marioSpriteSheet,
  },
};

game.setUp(setUpECS, dependencies);
game.startAsync();
