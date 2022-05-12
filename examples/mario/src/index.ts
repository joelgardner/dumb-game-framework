import * as Dom from "./util/dom";
import { ecsSetup } from "./setup";
import { Game } from "dumb-game-framework";

const linkElement = document.createElement("link");
linkElement.setAttribute("rel", "stylesheet");
linkElement.setAttribute("type", "text/css");
linkElement.setAttribute("href", "dist/out.css");
linkElement.onload = function () {
  setTimeout(() => {
    const container = "#world";
    const canvas: HTMLCanvasElement = Dom.createBackingCanvas(container);

    window.addEventListener("resize", () => {
      Dom.setSizeToMatch(canvas, container);
      game.ecs.clear();
      const hitboxes = Dom.getWordHitboxes(container);
      const words = hitboxes.map(({ id, hitbox }) => ({ id, ...hitbox }));
      game.ecs.build(ecsSetup({ ...dependencies, words }));
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
      getAsset: game.getAsset,
    };
    game.ecs.build(ecsSetup(dependencies));
    game.startAsync();
  }, 100);
};
document.head.appendChild(linkElement);
