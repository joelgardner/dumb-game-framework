import { ecs } from "dumb-game-framework";

export default class Meta extends ecs.Component {
  private tags = new Map<string, string>();

  constructor(tags: { [key: string]: string }) {
    super();
    Object.entries(tags).forEach(([key, value]) => this.tags.set(key, value));
  }

  public get(key: string): string {
    return this.tags.get(key);
  }
}
