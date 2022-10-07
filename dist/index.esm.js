var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/ecs/index.ts
var ecs_exports = {};
__export(ecs_exports, {
  Component: () => Component,
  ComponentContainer: () => ComponentContainer,
  ECS: () => ECS,
  System: () => System
});

// src/ecs/component.ts
var Component = class {
};
var ComponentContainer = class {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  add(component) {
    this.map.set(component.constructor, component);
  }
  get(componentClass) {
    return this.map.get(componentClass);
  }
  delete(componentClass) {
    this.map.delete(componentClass);
  }
  hasAll(componentClasses) {
    for (let componentClass of componentClasses) {
      if (!this.map.has(componentClass)) {
        return false;
      }
    }
    return true;
  }
  count() {
    return this.map.size;
  }
};

// src/ecs/ecs.ts
var ECS = class {
  constructor() {
    this.entityIdCounter = 1;
    this.entities = /* @__PURE__ */ new Map();
    this.systems = /* @__PURE__ */ new Map();
    this.entitiesMarkedForDeletion = /* @__PURE__ */ new Set();
  }
  addEntity() {
    const entityId = this.entityIdCounter++;
    this.entities.set(entityId, new ComponentContainer());
    return entityId;
  }
  markEntityForDeletion(entity) {
    this.entitiesMarkedForDeletion.add(entity);
  }
  addComponent(entity, component) {
    this.entities.get(entity).add(component);
  }
  getComponents(entity) {
    return this.entities.get(entity);
  }
  addSystem(system) {
    system.ecs = this;
    const entities = /* @__PURE__ */ new Set();
    for (let [entity, componentContainer] of this.entities) {
      if (componentContainer.hasAll(system.requiredComponents)) {
        entities.add(entity);
      }
    }
    system.initialize(entities);
    this.systems.set(system, entities);
  }
  removeSystem(system) {
    this.systems.delete(system);
  }
  removeEntitiesMarkedForDeletion() {
    this.entitiesMarkedForDeletion.forEach((entity) => {
      this.entities.delete(entity);
      this.systems.forEach((entities) => {
        entities.delete(entity);
      });
    });
    this.entitiesMarkedForDeletion.clear();
  }
  update(delta) {
    this.removeEntitiesMarkedForDeletion();
    for (let [system, entities] of this.systems) {
      system.update(entities, delta);
    }
  }
  build(callback) {
    this.clear();
    callback(this);
  }
  clear() {
    this.entities.clear();
    this.systems.clear();
    this.entitiesMarkedForDeletion.clear();
    this.entityIdCounter = 1;
  }
};

// src/ecs/system.ts
var System = class {
  initialize(_entities) {
  }
};

// src/assets.ts
var ImageAssetLoader = class {
  constructor(path, isLoaded = false) {
    this.path = path;
    this.isLoaded = isLoaded;
    this.load = () => {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = this.path;
        image.onload = () => {
          this.isLoaded = true;
          resolve({ type: "IMAGE", resource: image });
        };
        image.onerror = reject;
      });
    };
  }
};

// src/loop.ts
var RequestAnimationFrameLoop = class {
  constructor(callback) {
    this.running = false;
    this.loop = (timestamp) => {
      if (this.running) {
        const diff = (timestamp - this.prevts) / 1e3;
        this.prevts = timestamp;
        this.callback(diff);
        window.requestAnimationFrame(this.loop);
      }
    };
    this.callback = callback;
  }
  start() {
    this.running = true;
    this.prevts = performance.now();
    window.requestAnimationFrame(this.loop);
  }
  stop() {
    this.running = false;
  }
};

// src/engine.ts
var Engine = class {
  constructor() {
    this.ecs = new ECS();
    this.tick = (delta) => {
      this.ecs.update(delta);
    };
    this.loop = new RequestAnimationFrameLoop(this.tick);
  }
  start() {
    this.loop.start();
  }
  stop() {
    this.loop.stop();
  }
};

// src/game.ts
var Game = class {
  constructor() {
    this.assets = /* @__PURE__ */ new Map();
    this.engine = new Engine();
    this.assetIdCounter = 1;
    this.assetLoads = [];
    this.getAsset = (assetId) => {
      return this.assets.get(assetId);
    };
    this.engine = new Engine();
  }
  startAsync() {
    this.loadAssets().then((_assets) => {
      this.engine.start();
    });
  }
  stop() {
    this.engine.stop();
  }
  get ecs() {
    return this.engine.ecs;
  }
  setUp(callback, dependencies) {
    callback(this, dependencies);
  }
  loadAssets() {
    return Promise.all(this.assetLoads.map((_0) => __async(this, [_0], function* ({ assetId, load, options }) {
      const asset = yield load();
      asset.tags = options == null ? void 0 : options.tags;
      this.assets.set(assetId, asset);
      return asset;
    })));
  }
  addAsset(loader, options) {
    const assetId = this.assetIdCounter++;
    this.assetLoads.push({ assetId, load: loader.load, options });
    return assetId;
  }
  addImageAsset(path, options) {
    return this.addAsset(new ImageAssetLoader(path), options);
  }
};
export {
  Game,
  ecs_exports as ecs
};
