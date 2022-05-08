export default abstract class Component {}

type ComponentClass<T extends Component> = new (...args: any[]) => T;

export class ComponentContainer {
  private map = new Map<Function, Component>();

  public add(component: Component) {
    this.map.set(component.constructor, component);
  }

  public get<T extends Component>(componentClass: ComponentClass<T>): T {
    return this.map.get(componentClass) as T;
  }

  public delete<T extends Component>(componentClass: ComponentClass<T>): void {
    this.map.delete(componentClass);
  }

  public hasAll(componentClasses: Set<Function>): boolean {
    for (let componentClass of componentClasses) {
      if (!this.map.has(componentClass)) {
        return false;
      }
    }

    return true;
  }

  public count(): number {
    return this.map.size;
  }
}
