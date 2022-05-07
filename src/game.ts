import { IAssetLoader, ImageAssetLoader } from "./assets";
import { Engine } from "./engine";

export class Game {
  private assets = new Map<AssetId, Asset>();
  private engine = new Engine();
  private assetIdCounter: AssetId = 1;
  private assetLoads: {
    assetId: AssetId;
    load: () => Promise<Asset>;
    options?: AssetOptions;
  }[] = [];

  constructor() {
    this.engine = new Engine();
  }

  startAsync() {
    this.loadAssets().then((_assets: Asset[]) => {
      this.engine.start();
    });
  }

  stop() {
    this.engine.stop();
  }

  get ecs() {
    return this.engine.ecs;
  }

  setUp(
    callback: (game: Game, dependencies?: any) => void,
    dependencies?: any
  ) {
    callback(this, dependencies);
  }

  getAsset = (assetId: AssetId): Asset => {
    return this.assets.get(assetId);
  };

  private loadAssets(): Promise<Asset[]> {
    return Promise.all(
      this.assetLoads.map(async ({ assetId, load, options }) => {
        const asset: Asset = await load();
        asset.tags = options?.tags;
        this.assets.set(assetId, asset);
        return asset;
      })
    );
  }

  private addAsset(loader: IAssetLoader, options: AssetOptions): AssetId {
    const assetId = this.assetIdCounter++;
    this.assetLoads.push({ assetId, load: loader.load, options });
    return assetId;
  }

  addImageAsset(path: string, options: AssetOptions): AssetId {
    return this.addAsset(new ImageAssetLoader(path), options);
  }
}
