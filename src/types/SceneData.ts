import { TCustomizationConfig } from "./Customization";
import { TDialogConfig } from "./Dialog";
import { TEventConfig } from "./Event";
import { TFeatureConfig } from "./Feature";
import { TImageMaterialConfig } from "./Image";
import { TModerationConfig } from "./Moderation";
import { TNFTConfig } from "./NFT";
import { TVideoMaterialConfig } from "./VideoScreen";

export type TSceneData = {
  images: TImageMaterialConfig[];
  videoScreens: TVideoMaterialConfig[];
  nfts: TNFTConfig[];
  moderation: TModerationConfig;
  events: TEventConfig[];
  features: TFeatureConfig[];
  dialogs: TDialogConfig[];
  customizations: TCustomizationConfig[]
};

export type TSceneFeatures = {
  [id: string]: boolean;
};
