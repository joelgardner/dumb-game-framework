import { ecs } from "dumb-game-framework";

export enum Color {
  Black = "#000000",
}

export default class Drawable extends ecs.Component {
  constructor(public color: Color) {
    super();
  }
}
