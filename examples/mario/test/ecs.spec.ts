import { ecs } from "dumb-game-framework";
import type { Entity } from "dumb-game-framework";

class TestComponent extends ecs.Component {
  foo: number = 0;
}

class TestSystem extends ecs.System {
  public requiredComponents: Set<Function> = new Set([TestComponent]);

  public update(entities: Set<Entity>) {
    entities.forEach((entity) => {
      const componentContainer = this.ecs.getComponents(entity);
      const component = componentContainer.get(TestComponent);
      component.foo++;
    });
  }

  public ecs: ecs.ECS;
}

describe("ecs", () => {
  test("should allow adding components", () => {
    const _ecs = new ecs.ECS();
    const entity = _ecs.addEntity();
    const component = new TestComponent();
    _ecs.addComponent(entity, component);
    expect(_ecs.getComponents(entity).count()).toBe(1);
  });

  test("should allow adding systems that update components", () => {
    const _ecs = new ecs.ECS();
    const entity = _ecs.addEntity();
    const component = new TestComponent();
    _ecs.addComponent(entity, component);
    _ecs.addSystem(new TestSystem());
    expect(component.foo).toBe(0);
    _ecs.update(performance.now());
    expect(component.foo).toBe(1);
  });
});
