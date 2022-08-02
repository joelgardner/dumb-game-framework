export enum Key {
  ArrowUp = "ArrowUp",
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",

  // ArrowDown doesn't actually do anything,
  // but we make it a value in this enum because
  // we want to call stopPropagation() on it, but
  // not for every other key (because we don't
  // e.g. want to prevent cmd+r from refreshing.)
  ArrowDown = "ArrowDown",
  W = "W",
  A = "A",
  D = "D",
}

type ButtonState = 0 | 1;
export type KeyEvent = { key: Key; state: ButtonState };
type KeyEventCallback = (event: KeyEvent) => void;

export default class KeyboardInputManager {
  private handlers = new Map<Key, KeyEventCallback>();

  public bind(keys: Key[], callback: (event: KeyEvent) => void) {
    keys.forEach((key) => this.handlers.set(key, callback));
  }

  public listen() {
    window.addEventListener("keydown", this.handleOnPress);
    window.addEventListener("keyup", this.handleOnRelease);
  }

  public stopListening() {
    window.removeEventListener("keyup", this.handleOnPress);
    window.removeEventListener("keydown", this.handleOnRelease);
  }

  private handleOnPress = (e: KeyboardEvent) => {
    const key = e.key as Key;
    if (key in Key) {
      e.preventDefault();
    }

    const handler = this.handlers.get(key);
    if (handler) {
      handler({ key, state: 1 });
    }
  };

  private handleOnRelease = (e: KeyboardEvent) => {
    const key = e.key as Key;
    this.handlers.get(key)?.({ key, state: 0 });
  };
}

export type TouchEvent2 = {
  position: { x: number; y: number };
  state: ButtonState;
};
type TouchEventCallback = (event: TouchEvent2) => void;
export class TouchInputManager {
  private handlers = new Set<TouchEventCallback>();

  public bind(callback: (event: TouchEvent2) => void) {
    this.handlers.add(callback);
  }

  public listen() {
    window.addEventListener("touchstart", this.handleOnTouch);
    window.addEventListener("touchmove", this.handleOnTouch);
    window.addEventListener("touchend", this.handleOnTouchEnd);
    window.addEventListener("touchcancel", this.handleOnTouchEnd);
  }

  public stopListening() {
    window.removeEventListener("touchstart", this.handleOnTouch);
    window.removeEventListener("touchmove", this.handleOnTouch);
    window.removeEventListener("touchend", this.handleOnTouchEnd);
    window.removeEventListener("touchcancel", this.handleOnTouchEnd);
  }

  private handleOnTouch = (e: TouchEvent) => {
    this.handlers.forEach((handler) => {
      // @ts-ignore
      handler({ position: { x: e.layerX, y: e.layerY }, state: 1 });
    });
  };

  private handleOnTouchEnd = (e: TouchEvent) => {
    this.handlers.forEach((handler) =>
      // @ts-ignore
      handler({ position: { x: e.layerX, y: e.layerY }, state: 0 })
    );
  };
}
