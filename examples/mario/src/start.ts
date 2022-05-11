import { Game } from "dumb-game-framework";
import * as Dom from "./util/dom";
import { setUpECS } from "./setup";

export default function start() {
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
}
