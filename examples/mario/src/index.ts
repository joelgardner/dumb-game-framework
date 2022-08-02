import * as Dom from "./util/dom";
import { ecsSetup } from "./setup";
import { Game } from "dumb-game-framework";

/*
 * Bootstrap our "game" by inserting the stylesheet for the
 * document dynamically, so that we can track its load progress.
 * Once it and its referenced font files are loaded, we load our
 * assets (Mario spritesheet), build our ECS setup (passing in
 * hitboxes for words), and setting up resize event handlers, etc.
 */
const linkElement = document.createElement("link");
linkElement.setAttribute("rel", "stylesheet");
linkElement.setAttribute("type", "text/css");
linkElement.setAttribute("href", "dist/out.css");
linkElement.onload = function () {
  document.fonts.ready.then(() => {
    const container = "#world";
    const canvas: HTMLCanvasElement = Dom.createBackingCanvas(container);

    let { innerWidth } = window;
    window.addEventListener("resize", () => {
      // We check that only the width changed because on
      // mobile devices, the height of the window can change
      // quite often, resulting in unnecessary resizes, which
      // means Mario jumps to his starting position incorrectly
      if (innerWidth === window.innerWidth) {
        return;
      }

      Dom.setSizeToMatch(canvas, container);
      game.ecs.clear();
      const hitboxes = Dom.getWordHitboxes(container);
      const words = hitboxes.map(({ id, hitbox }) => ({ id, ...hitbox }));
      game.ecs.build(ecsSetup({ ...dependencies, words }));
      innerWidth = window.innerWidth;
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
      debug: window.location.search.indexOf("debug") !== -1,
      getAsset: game.getAsset,
    };
    game.ecs.build(ecsSetup(dependencies));
    game.startAsync();
  });
};
document.head.appendChild(linkElement);

/*
 * Showing/hiding top right alert.
 */
const alert = document.querySelector("#alert");

// If user mouseovers while fading, bring it back to full opacity.
let t = setAlertHiddenTimeout(8000);
alert.addEventListener("mouseover", (_e) => {
  clearTimeout(t);
  alert.classList.remove("alert-gradual-hidden");
});

alert.addEventListener("mouseout", (_e) => {
  t = setAlertHiddenTimeout(8000);
});

function setAlertHiddenTimeout(ms: number): ReturnType<typeof setTimeout> {
  return setTimeout(() => {
    alert.classList.add("alert-gradual-hidden");
  }, ms);
}

// Remove from DOM after fade animation completes
alert.addEventListener(
  "animationend",
  (ev) => {
    if (ev.type === "animationend") {
      removeAlert();
    }
  },
  false
);

// Remove from DOM if user clicks X
const closeAlertBtn = alert.querySelector("#alert-close-btn");
closeAlertBtn.addEventListener("click", removeAlert);

function removeAlert() {
  alert.parentElement.removeChild(alert);
}
