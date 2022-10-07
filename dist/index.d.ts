declare module 'dumb-game-framework/assets' {
  export type AssetId = number;
  export type AssetOptions = {
      tags: string[];
  };
  export type Asset = {
      type: "IMAGE";
      resource: HTMLImageElement;
      tags?: string[];
  } | {
      type: "AUDIO";
      resource: HTMLAudioElement;
      tags?: string[];
  };
  export interface IAssetLoader {
      load(): Promise<Asset>;
  }
  export class ImageAssetLoader implements IAssetLoader {
      private path;
      isLoaded: boolean;
      constructor(path: string, isLoaded?: boolean);
      load: () => Promise<Asset>;
  }

}
declare module 'dumb-game-framework/ecs/component' {
  export default abstract class Component {
  }
  type ComponentClass<T extends Component> = new (...args: any[]) => T;
  export class ComponentContainer {
      private map;
      add(component: Component): void;
      get<T extends Component>(componentClass: ComponentClass<T>): T;
      delete<T extends Component>(componentClass: ComponentClass<T>): void;
      hasAll(componentClasses: Set<Function>): boolean;
      count(): number;
  }
  export {};

}
declare module 'dumb-game-framework/ecs/ecs' {
  import type { Entity } from "dumb-game-framework/ecs/entity";
  import Component, { ComponentContainer } from "dumb-game-framework/ecs/component";
  import System from "dumb-game-framework/ecs/system";
  export default class ECS {
      private entityIdCounter;
      private entities;
      private systems;
      private entitiesMarkedForDeletion;
      addEntity(): Entity;
      markEntityForDeletion(entity: Entity): void;
      addComponent(entity: Entity, component: Component): void;
      getComponents(entity: Entity): ComponentContainer;
      addSystem(system: System): void;
      removeSystem(system: System): void;
      removeEntitiesMarkedForDeletion(): void;
      update(delta: number): void;
      build(callback: (ecs: ECS) => void): void;
      clear(): void;
  }

}
declare module 'dumb-game-framework/ecs/entity' {
  export type Entity = number;

}
declare module 'dumb-game-framework/ecs/index' {
  export { default as ECS } from "dumb-game-framework/ecs/ecs";
  export { default as Component, ComponentContainer } from "dumb-game-framework/ecs/component";
  export { default as System } from "dumb-game-framework/ecs/system";
  export type { Entity } from "dumb-game-framework/ecs/entity";

}
declare module 'dumb-game-framework/ecs/system' {
  import ECS from "dumb-game-framework/ecs/ecs";
  import type { Entity } from "dumb-game-framework/ecs/entity";
  export default abstract class System {
      abstract ecs: ECS;
      abstract requiredComponents: Set<Function>;
      abstract update(entities: Set<Entity>, delta?: number): void;
      initialize(_entities: Set<Entity>): void;
  }

}
declare module 'dumb-game-framework/engine' {
  import ECS from "dumb-game-framework/ecs/ecs";
  export default class Engine {
      ecs: ECS;
      private loop;
      constructor();
      start(): void;
      tick: (delta: number) => void;
      stop(): void;
  }

}
declare module 'dumb-game-framework/game' {
  import type { AssetOptions, Asset, AssetId } from "dumb-game-framework/assets";
  export default class Game {
      private assets;
      private engine;
      private assetIdCounter;
      private assetLoads;
      constructor();
      startAsync(): void;
      stop(): void;
      get ecs(): import("dumb-game-framework/ecs/index").ECS;
      setUp(callback: (game: Game, dependencies?: any) => void, dependencies?: any): void;
      getAsset: (assetId: AssetId) => Asset;
      private loadAssets;
      private addAsset;
      addImageAsset(path: string, options: AssetOptions): AssetId;
  }

}
declare module 'dumb-game-framework/index' {
  export * as ecs from "dumb-game-framework/ecs/index";
  export { default as Game } from "dumb-game-framework/game";
  export type { AssetId, Asset } from "dumb-game-framework/assets";
  export type { Entity } from "dumb-game-framework/ecs/entity";

}
declare module 'dumb-game-framework/loop' {
  export interface IGameLoop {
      start(): void;
      stop(): void;
      loop(delta: number): void;
  }
  export default class RequestAnimationFrameLoop implements IGameLoop {
      running: boolean;
      private callback;
      private prevts;
      constructor(callback: (delta: number) => void);
      start(): void;
      loop: (timestamp: number) => void;
      stop(): void;
  }

}
declare module 'dumb-game-framework' {
  import main = require('dumb-game-framework/src/index');
  export = main;
}