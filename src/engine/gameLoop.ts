export interface IGameLoop {
  start(): void;
  stop(): void;
  loop(delta: number): void;
}

export default class RequestAnimationFrameLoop implements IGameLoop {
  public running = false;
  private callback: (delta: number) => void;
  private prevts: number;

  constructor(callback: (delta: number) => void) {
    this.callback = callback;
  }

  start() {
    this.running = true;
    this.prevts = performance.now();
    window.requestAnimationFrame(this.loop);
  }

  loop = (timestamp: number) => {
    if (this.running) {
      const diff = (timestamp - this.prevts) / 1000;
      this.prevts = timestamp;
      this.callback(diff);
      window.requestAnimationFrame(this.loop);
    }
  };

  stop() {
    this.running = false;
  }
}
