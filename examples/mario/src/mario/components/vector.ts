import { ecs } from "dumb-game-framework";

export default class Vector extends ecs.Component {
  constructor(private _x: number, private _y: number) {
    super();
  }

  public set(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  public setY(y: number) {
    this._y = y;
  }

  public setX(x: number) {
    this._x = x;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }
}
