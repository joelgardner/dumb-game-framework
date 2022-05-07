type AssetId = number;
type AssetOptions = { tags: string[] };
type Asset =
  | { type: "IMAGE"; resource: HTMLImageElement; tags?: string[] }
  | { type: "AUDIO"; resource: HTMLAudioElement; tags?: string[] };
