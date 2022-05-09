import { ECS, Entity, System, Component } from "dumb-game-framework";

class TestComponent extends Component {
  foo: number = 0;
}

class TestSystem extends System {
  public requiredComponents: Set<Function> = new Set([TestComponent]);

  public update(entities: Set<Entity>) {
    entities.forEach((entity) => {
      const componentContainer = this.ecs.getComponents(entity);
      const component = componentContainer.get(TestComponent);
      component.foo++;
    });
  }

  public ecs: ECS;
}

describe("ecs", () => {
  test("should allow adding components", () => {
    const ecs = new ECS();
    const entity = ecs.addEntity();
    const component = new TestComponent();
    ecs.addComponent(entity, component);
    expect(ecs.getComponents(entity).count()).toBe(1);
  });

  test("should allow adding systems that update components", () => {
    const ecs = new ECS();
    const entity = ecs.addEntity();
    const component = new TestComponent();
    ecs.addComponent(entity, component);
    ecs.addSystem(new TestSystem());
    expect(component.foo).toBe(0);
    ecs.update(performance.now());
    expect(component.foo).toBe(1);
  });
});
