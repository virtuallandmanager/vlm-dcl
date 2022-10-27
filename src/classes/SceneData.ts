import { TImageMaterialConfig, TNFTConfig, TVideoMaterialConfig } from "../types";
import { TEventConfig } from "../types/Event";
import { TFeatureConfig } from "../types/Feature";
import { TModerationConfig } from "../types/Moderation";

export class SceneData {
  images: TImageMaterialConfig[] = [];
  imageTextures: TImageMaterialConfig[] = [];
  videoScreens: TVideoMaterialConfig[] = [];
  videoSystems: TVideoMaterialConfig[] = [];
  nfts: TNFTConfig[] = [];
  moderation: TModerationConfig = {};
  events: TEventConfig[] = [];
  features: TFeatureConfig[] = [];
}
