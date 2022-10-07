export type AssetId = number;
export type AssetOptions = { tags: string[] };
export type Asset =
  | { type: "IMAGE"; resource: HTMLImageElement; tags?: string[] }
  | { type: "AUDIO"; resource: HTMLAudioElement; tags?: string[] };

export interface IAssetLoader {
  load(): Promise<Asset>;
}

export class ImageAssetLoader implements IAssetLoader {
  constructor(private path: string, public isLoaded = false) {}

  load = (): Promise<Asset> => {
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
