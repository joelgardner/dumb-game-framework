import type { Entity } from "./entity";
import Component, { ComponentContainer } from "./component";
import System from "./system";

export default class ECS {
  private entityIdCounter: Entity = 1;
  private entities = new Map<Entity, ComponentContainer>();
  private systems = new Map<System, Set<Entity>>();
  private entitiesMarkedForDeletion = new Set<Entity>();

  addEntity(): Entity {
    const entityId = this.entityIdCounter++;
    this.entities.set(entityId, new ComponentContainer());
    return entityId;
  }

  markEntityForDeletion(entity: Entity): void {
    this.entitiesMarkedForDeletion.add(entity);
  }

  addComponent(entity: Entity, component: Component) {
    this.entities.get(entity).add(component);
  }

  getComponents(entity: Entity): ComponentContainer {
    return this.entities.get(entity);
  }

  addSystem(system: System): void {
    system.ecs = this;
    // Add entities to the system if the entity
    // has all the system's required components.
    const entities = new Set<Entity>();
    for (let [entity, componentContainer] of this.entities) {
      if (componentContainer.hasAll(system.requiredComponents)) {
        entities.add(entity);
      }
    }

    system.initialize(entities);
    this.systems.set(system, entities);
  }

  removeSystem(system: System): void {
    this.systems.delete(system);
  }

  removeEntitiesMarkedForDeletion() {
    this.entitiesMarkedForDeletion.forEach((entity) => {
      // Remove from the main entities Set
      this.entities.delete(entity);

      // Each system may also reference it,
      // so remove from there as well.
      this.systems.forEach((entities) => {
        entities.delete(entity);
      });
    });

    this.entitiesMarkedForDeletion.clear();
  }

  update(delta: number) {
    this.removeEntitiesMarkedForDeletion();
    for (let [system, entities] of this.systems) {
      system.update(entities, delta);
    }
  }

  clear() {
    this.entities.clear();
    this.systems.clear();
    this.entitiesMarkedForDeletion.clear();
    this.entityIdCounter = 1;
  }
}
