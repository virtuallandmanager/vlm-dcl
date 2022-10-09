import { TEventConfig } from "./Event";
import { TFeatureConfig } from "./Feature";
import { TImageMaterialConfig } from "./Image";
import { TModerationConfig } from "./Moderation";
import { TNFTConfig } from "./NFT";
import { TVideoMaterialConfig } from "./VideoScreen";

export type TSceneData = {
  images?: TImageMaterialConfig[];
  imageTextures?: TImageMaterialConfig[];
  videoScreens?: TVideoMaterialConfig[];
  videoSystems?: TVideoMaterialConfig[];
  nfts?: TNFTConfig[];
  moderation?: TModerationConfig;
  events?: TEventConfig[];
  features?: TFeatureConfig[];
};
