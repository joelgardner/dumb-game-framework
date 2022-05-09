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
