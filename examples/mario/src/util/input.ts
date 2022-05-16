export enum Key {
  ArrowUp = "ArrowUp",
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
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
    const handler = this.handlers.get(key);
    if (handler) {
      e.preventDefault();
      handler({ key, state: 1 });
    }
  };

  private handleOnRelease = (e: KeyboardEvent) => {
    const key = e.key as Key;
    this.handlers.get(key)?.({ key, state: 0 });
  };
}

export type MyTouchEvent = {
  position: { x: number; y: number };
  state: ButtonState;
};
type TouchEventCallback = (event: MyTouchEvent) => void;
export class TouchInputManager {
  private handlers = new Set<TouchEventCallback>();

  public bind(callback: (event: MyTouchEvent) => void) {
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
